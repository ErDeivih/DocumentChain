import { APIRequestContext, expect, Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ethers } from 'ethers';

export const API_BASE_URL = process.env.E2E_API_BASE_URL ?? 'http://localhost:3000/api';
const HARDHAT_RPC_URL = process.env.E2E_RPC_URL ?? 'http://127.0.0.1:8545';
const E2E_DATABASE_URL = process.env.E2E_DATABASE_URL ?? 'postgresql://documentchain:documentchain@localhost:5433/documentchain?schema=public';
const HARDHAT_MNEMONIC = 'test test test test test test test test test test test junk';
const SUSPENSION_ABI = ['function suspendMyself()', 'function unsuspendMyself()'];

export const seedUsers = {
  admin: {
    username: 'admin',
    email: 'admin@documentchain.local',
    password: 'Admin123!',
  },
  owner: {
    username: 'carmen_martin',
    email: 'carmen.martin@documentchain.local',
    password: 'Demo123!',
    walletIndex: 1,
  },
  recipient: {
    username: 'diego_ortega',
    email: 'diego.ortega@documentchain.local',
    password: 'Demo123!',
    walletIndex: 3,
  },
} as const;

const passwordLoginSeedUsers = [
  seedUsers.admin,
  seedUsers.owner,
  seedUsers.recipient,
  {
    username: 'admin_operaciones',
    email: 'admin.operaciones@documentchain.local',
    password: 'Demo123!',
  },
] as const;

function normalizeSeedIdentifier(identifier: string): string {
  return identifier.trim().toLowerCase();
}

function isKnownPasswordLoginSeed(identifier: string): boolean {
  const normalizedIdentifier = normalizeSeedIdentifier(identifier);
  return passwordLoginSeedUsers.some((user) => {
    return user.username === normalizedIdentifier || user.email === normalizedIdentifier;
  });
}

function repairSeedUserForPasswordLogin(identifier: string): void {
  const normalizedIdentifier = normalizeSeedIdentifier(identifier);
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const backendDir = path.resolve(currentDir, '../../backend');

  const script = `
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    (async () => {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { username: ${JSON.stringify(normalizedIdentifier)} },
            { email: ${JSON.stringify(normalizedIdentifier)} },
          ],
        },
      });

      if (!user) {
        throw new Error('Seed user not found for password-login repair');
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          twoFactorEnabled: false,
          twoFactorSecret: null,
          twoFactorBackupCodes: null,
        },
      });

      await prisma.emailVerification.updateMany({
        where: { userId: user.id },
        data: {
          verified: true,
          verifiedAt: new Date(),
        },
      });

      await prisma.$disconnect();
    })().catch(async (error) => {
      console.error(error);
      await prisma.$disconnect();
      process.exit(1);
    });
  `;

  execFileSync('node', ['-e', script], {
    cwd: backendDir,
    env: {
      ...process.env,
      DATABASE_URL: E2E_DATABASE_URL,
    },
    stdio: 'pipe',
  });
}

function deriveHardhatWallet(index: number): ethers.HDNodeWallet {
  return ethers.HDNodeWallet.fromPhrase(
    HARDHAT_MNEMONIC,
    undefined,
    `m/44'/60'/0'/0/${index}`
  );
}

export function getHardhatAddress(index: number): string {
  return deriveHardhatWallet(index).address;
}

async function createApiSession(
  request: APIRequestContext,
  credentials: { username: string; password: string }
) {
  const payload = credentials.username.includes('@')
    ? { email: credentials.username, password: credentials.password }
    : { username: credentials.username, password: credentials.password };

  let response = await request.post(`${API_BASE_URL}/auth/login`, {
    data: payload,
  });

  if (!response.ok() && isKnownPasswordLoginSeed(credentials.username)) {
    repairSeedUserForPasswordLogin(credentials.username);
    response = await request.post(`${API_BASE_URL}/auth/login`, {
      data: payload,
    });
  }

  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  if (body.requires2FA) {
    throw new Error(`The user ${credentials.username} requires interactive 2FA.`);
  }

  return body as {
    accessToken: string;
    refreshToken: string;
    user: Record<string, unknown>;
  };
}

export async function ensureUserSuspensionState(
  request: APIRequestContext,
  userConfig: { username: string; password: string; walletIndex: number },
  expectedState: 'active' | 'suspended'
): Promise<void> {
  const session = await createApiSession(request, userConfig);
  const authHeaders = {
    Authorization: `Bearer ${session.accessToken}`,
  };

  const meResponse = await request.get(`${API_BASE_URL}/auth/me`, {
    headers: authHeaders,
  });
  expect(meResponse.ok()).toBeTruthy();

  const meBody = await meResponse.json();
  const isSuspended = Boolean(meBody.user?.isSuspended);
  const shouldBeSuspended = expectedState === 'suspended';
  const expectedPrimaryAddress = getHardhatAddress(userConfig.walletIndex).toLowerCase();

  if (!isSuspended) {
    const walletsResponse = await request.get(`${API_BASE_URL}/wallets`, {
      headers: authHeaders,
    });
    expect(walletsResponse.ok()).toBeTruthy();

    const walletsBody = await walletsResponse.json();
    const targetWallet = (walletsBody.wallets || []).find(
      (wallet: { id: string; address: string; isPrimary: boolean }) => wallet.address.toLowerCase() === expectedPrimaryAddress
    );

    if (!targetWallet) {
      throw new Error(`The expected Hardhat wallet ${expectedPrimaryAddress} is not saved for ${userConfig.username}.`);
    }

    if (!targetWallet.isPrimary) {
      const setPrimaryResponse = await request.put(`${API_BASE_URL}/wallets/${targetWallet.id}/primary`, {
        headers: authHeaders,
      });
      expect(setPrimaryResponse.ok()).toBeTruthy();
    }
  }

  if (isSuspended === shouldBeSuspended) {
    return;
  }

  const wallet = deriveHardhatWallet(userConfig.walletIndex).connect(
    new ethers.JsonRpcProvider(HARDHAT_RPC_URL)
  );

  const preparePath = shouldBeSuspended ? '/users/me/suspend/prepare' : '/users/me/unsuspend/prepare';
  const confirmPath = shouldBeSuspended ? '/users/me/suspend/confirm' : '/users/me/unsuspend/confirm';
  const preparePayload = shouldBeSuspended ? { reason: 'E2E setup reset' } : undefined;

  const preparationResponse = await request.post(`${API_BASE_URL}${preparePath}`, {
    headers: authHeaders,
    data: preparePayload,
  });
  expect(preparationResponse.ok()).toBeTruthy();

  const preparation = await preparationResponse.json();
  const expectedWalletAddress = String(preparation.wallet?.address || '').toLowerCase();
  if (wallet.address.toLowerCase() !== expectedWalletAddress) {
    throw new Error('The configured Hardhat wallet does not match the primary wallet required for suspension flow.');
  }

  const contract = new ethers.Contract(preparation.contractAddress, SUSPENSION_ABI, wallet);
  const tx = shouldBeSuspended
    ? await contract.suspendMyself()
    : await contract.unsuspendMyself();
  await tx.wait();

  const confirmationResponse = await request.post(`${API_BASE_URL}${confirmPath}`, {
    headers: authHeaders,
    data: shouldBeSuspended
      ? { txHash: tx.hash, reason: 'E2E setup reset' }
      : { txHash: tx.hash },
  });
  expect(confirmationResponse.ok()).toBeTruthy();

  const finalMeResponse = await request.get(`${API_BASE_URL}/auth/me`, {
    headers: authHeaders,
  });
  expect(finalMeResponse.ok()).toBeTruthy();

  const finalMe = await finalMeResponse.json();
  if (Boolean(finalMe.user?.isSuspended) !== shouldBeSuspended) {
    throw new Error(`Failed to force suspension state to ${expectedState}.`);
  }
}

export async function installHardhatWallet(page: Page, walletIndex: number): Promise<string> {
  const address = getHardhatAddress(walletIndex);

  await page.addInitScript(
    ({ rpcUrl, selectedAddress }) => {
      class MockEthereumProvider {
        selectedAddress: string;
        chainId: string;
        isMetaMask: boolean;
        providers: unknown[];
        listeners: Record<string, Array<(...args: unknown[]) => void>>;
        requestId: number;

        constructor() {
          this.selectedAddress = selectedAddress;
          this.chainId = '0x7a69';
          this.isMetaMask = true;
          this.providers = [this];
          this.listeners = {};
          this.requestId = 0;
        }

        on(event: string, callback: (...args: unknown[]) => void) {
          this.listeners[event] = this.listeners[event] || [];
          this.listeners[event].push(callback);
        }

        removeListener(event: string, callback: (...args: unknown[]) => void) {
          this.listeners[event] = (this.listeners[event] || []).filter((listener) => listener !== callback);
        }

        emit(event: string, ...args: unknown[]) {
          for (const listener of this.listeners[event] || []) {
            listener(...args);
          }
        }

        async rpcRequest(method: string, params: unknown[] = []) {
          const payload = {
            jsonrpc: '2.0',
            id: ++this.requestId,
            method,
            params,
          };

          const response = await fetch(rpcUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          const json = await response.json();
          if (json.error) {
            throw new Error(json.error.message || `RPC error calling ${method}`);
          }

          return json.result;
        }

        async request({ method, params = [] }: { method: string; params?: unknown[] }) {
          const normalizedParams = JSON.parse(JSON.stringify(params));

          switch (method) {
            case 'eth_requestAccounts':
            case 'eth_accounts':
              return [this.selectedAddress];
            case 'eth_chainId':
              return this.chainId;
            case 'net_version':
              return '31337';
            case 'wallet_switchEthereumChain': {
              const nextChain = (normalizedParams[0] as { chainId?: string } | undefined)?.chainId;
              if (nextChain) {
                this.chainId = nextChain;
                this.emit('chainChanged', this.chainId);
              }
              return null;
            }
            case 'wallet_addEthereumChain':
              return null;
            default: {
              if (method === 'eth_sendTransaction' && normalizedParams[0] && typeof normalizedParams[0] === 'object') {
                const transaction = normalizedParams[0] as { from?: string };
                if (!transaction.from) {
                  transaction.from = this.selectedAddress;
                }
              }

              return this.rpcRequest(method, normalizedParams);
            }
          }
        }
      }

      Object.defineProperty(window, 'ethereum', {
        configurable: true,
        value: new MockEthereumProvider(),
      });
    },
    { rpcUrl: HARDHAT_RPC_URL, selectedAddress: address }
  );

  return address;
}

export async function loginWithStoredSession(
  page: Page,
  request: APIRequestContext,
  credentials: { username: string; password: string }
) {
  const body = await createApiSession(request, credentials);

  const storedUser = {
    ...body.user,
    isAdmin: body.user.role === 'ADMIN',
  };

  await page.goto('/');
  await page.evaluate(
    ({ accessToken, refreshToken, user }) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      sessionStorage.removeItem('activeWalletId');
    },
    {
      accessToken: body.accessToken,
      refreshToken: body.refreshToken,
      user: storedUser,
    }
  );

  return {
    accessToken: body.accessToken as string,
    refreshToken: body.refreshToken as string,
    user: storedUser,
  };
}

export async function clearStoredSession(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    if ('indexedDB' in window) {
      indexedDB.databases?.().then((databases) => {
        for (const database of databases) {
          if (database.name) {
            indexedDB.deleteDatabase(database.name);
          }
        }
      }).catch(() => undefined);
    }
    sessionStorage.clear();
  });
}

export function provisionPasswordResetToken(email: string): string {
  const rawToken = randomBytes(32).toString('hex');
  const hashedToken = createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const normalizedEmail = email.toLowerCase().trim();
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const backendDir = path.resolve(currentDir, '../../backend');

  const script = `
    const { PrismaClient } = require('@prisma/client');
    const crypto = require('crypto');
    const prisma = new PrismaClient();
    (async () => {
      const user = await prisma.user.findUnique({ where: { email: ${JSON.stringify(normalizedEmail)} } });
      if (!user) {
        throw new Error('User not found for password reset token provisioning');
      }
      await prisma.session.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          accessToken: ${JSON.stringify(hashedToken)},
          refreshToken: ${JSON.stringify(hashedToken)},
          accessTokenExpiresAt: new Date(${JSON.stringify(expiresAt)}),
          refreshTokenExpiresAt: new Date(${JSON.stringify(expiresAt)})
        }
      });
      await prisma.$disconnect();
    })().catch(async (error) => {
      console.error(error);
      await prisma.$disconnect();
      process.exit(1);
    });
  `;

  execFileSync('node', ['-e', script], {
    cwd: backendDir,
    env: {
      ...process.env,
      DATABASE_URL: E2E_DATABASE_URL,
    },
    stdio: 'pipe',
  });

  return rawToken;
}

export function setUserEmailVerified(email: string, emailVerified = true): void {
  const normalizedEmail = email.toLowerCase().trim();
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const backendDir = path.resolve(currentDir, '../../backend');

  const script = `
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    (async () => {
      const user = await prisma.user.findUnique({ where: { email: ${JSON.stringify(normalizedEmail)} } });
      if (!user) {
        throw new Error('User not found for email verification update');
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: ${emailVerified ? 'true' : 'false'} }
      });
      if (${emailVerified ? 'true' : 'false'}) {
        await prisma.emailVerification.updateMany({
          where: { userId: user.id, verified: false },
          data: { verified: true, verifiedAt: new Date() }
        });
      }
      await prisma.$disconnect();
    })().catch(async (error) => {
      console.error(error);
      await prisma.$disconnect();
      process.exit(1);
    });
  `;

  execFileSync('node', ['-e', script], {
    cwd: backendDir,
    env: {
      ...process.env,
      DATABASE_URL: E2E_DATABASE_URL,
    },
    stdio: 'pipe',
  });
}

function abbreviateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function selectFirstSavedWallet(page: Page, preferredAddress?: string): Promise<void> {
  await expect(page.getByTestId('wallet-selector-modal')).toBeVisible();

  const useConnectedWalletButton = page.getByRole('button', { name: 'Usar esta wallet' });
  const connectedWalletCard = page.locator('div.p-3.bg-green-50.border.border-green-200.rounded-lg').first();

  if (preferredAddress) {
    const abbreviatedPreferredAddress = abbreviateAddress(preferredAddress);
    const preferredWalletPattern = new RegExp(escapeRegex(abbreviatedPreferredAddress), 'i');

    const preferredWalletEntry = page
      .locator('[data-testid^="saved-wallet-"]')
      .filter({ hasText: preferredWalletPattern })
      .first();

    if (await preferredWalletEntry.isVisible({ timeout: 10000 }).catch(() => false)) {
      await preferredWalletEntry.click();
      return;
    }

    if (await useConnectedWalletButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      const connectedWalletText = (await connectedWalletCard.textContent().catch(() => '')) || '';
      if (preferredWalletPattern.test(connectedWalletText)) {
        await useConnectedWalletButton.click({ force: true });
        return;
      }
    }

    const connectedWalletAction = connectedWalletCard.getByRole('button', { name: 'Usar esta wallet' });
    if (await connectedWalletAction.isVisible({ timeout: 3000 }).catch(() => false)) {
      await connectedWalletAction.click({ force: true });
      return;
    }
  }

  if (await useConnectedWalletButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await useConnectedWalletButton.click({ force: true });
    return;
  }

  const walletEntry = page.locator('[data-testid^="saved-wallet-"]').first();
  await expect(walletEntry).toBeVisible();
  await walletEntry.click();
}

export async function fetchDocumentByName(
  request: APIRequestContext,
  accessToken: string,
  documentName: string,
  options?: {
    timeoutMs?: number;
    intervalMs?: number;
    requiredBlockchainStatus?: string;
  }
) {
  const timeoutMs = options?.timeoutMs ?? 45000;
  const intervalMs = options?.intervalMs ?? 1500;
  const requiredBlockchainStatus = options?.requiredBlockchainStatus;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const response = await request.get(`${API_BASE_URL}/documents`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        search: documentName,
        limit: 20,
      },
    });

    if (!response.ok()) {
      if (response.status() === 429 || response.status() >= 500) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
        continue;
      }

      expect(response.ok()).toBeTruthy();
    }

    const data = await response.json();
    const document = (data.documents || []).find((candidate: { name: string }) => candidate.name === documentName);

    if (document && (!requiredBlockchainStatus || document.blockchainStatus === requiredBlockchainStatus)) {
      return document;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Document ${documentName} was not found through the API within ${timeoutMs}ms.`);
}

export async function waitForDocumentStatus(
  request: APIRequestContext,
  accessToken: string,
  documentId: string,
  requiredBlockchainStatus: string,
  options?: {
    timeoutMs?: number;
    intervalMs?: number;
  }
) {
  const timeoutMs = options?.timeoutMs ?? 90000;
  const intervalMs = options?.intervalMs ?? 1500;
  const deadline = Date.now() + timeoutMs;
  let lastStatus: string | undefined;

  while (Date.now() < deadline) {
    const response = await request.get(`${API_BASE_URL}/documents/${documentId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok()) {
      if (response.status() === 429 || response.status() >= 500) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
        continue;
      }

      expect(response.ok()).toBeTruthy();
    }

    const data = await response.json();
    const document = data.document;
    lastStatus = document?.blockchainStatus;

    if (document?.blockchainStatus === requiredBlockchainStatus) {
      return document;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(
    `Document ${documentId} did not reach ${requiredBlockchainStatus} within ${timeoutMs}ms. Last status: ${lastStatus ?? 'unknown'}.`
  );
}