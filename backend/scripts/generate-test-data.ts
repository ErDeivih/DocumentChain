import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient, BlockchainStatus } from '@prisma/client';
import { ethers } from 'ethers';
import { Argon2Service } from '../src/services/argon2Service';
import { KeyManager } from '../src/lib/crypto/KeyManager';
import { resolveDocumentRegistryAddressOrDefault } from '../src/config/contractAddress';
import { ipfsClient, uploadToIPFS } from '../src/config/ipfs';

dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

type ProfileName = 'qa-fast' | 'qa-max';

interface ProfileConfig {
  users: number;
  docsPerUser: number;
  maxVersionsPerDoc: number;
  signaturesPerDoc: number;
  walletsPerUser: number;
}

const MAX_WALLETS_PER_USER = 5;

interface CliOptions {
  profile: ProfileName;
  reset: boolean;
  includeSeed: boolean;
}

interface GeneratedUser {
  id: string;
  username: string;
  email: string;
  password: string;
  walletIds: string[];
  walletAddresses: string[];
  /** Hardhat account index (0-based, funded range 0..19). */
  ethWalletIndex: number;
}

interface DemoIdentity {
  username: string;
  email: string;
  fullName: string;
}

const QA_SEED_LOCK_ID = 90421421;
let seedIpfsAvailable = false;
let seedIpfsWarningShown = false;

interface SeedWalletRecord {
  id: string;
  walletAddress: string;
  isPrimary: boolean;
}

// ── Blockchain setup ────────────────────────────────────────────────────────

const HARDHAT_RPC_URL = process.env.BLOCKCHAIN_RPC_URL ?? 'http://localhost:8545';
const HARDHAT_DEPLOYER_KEY =
  process.env.BLOCKCHAIN_PRIVATE_KEY ??
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const CONTRACT_ADDRESS = resolveDocumentRegistryAddressOrDefault();
// Standard Hardhat / Anvil deterministic mnemonic
const HARDHAT_MNEMONIC = 'test test test test test test test test test test test junk';
const HARDHAT_FUNDED_ACCOUNT_COUNT = 20;

interface BlockchainContext {
  provider: ethers.JsonRpcProvider;
  contract: ethers.Contract;
  /** Return the Hardhat funded wallet at derivation-path index `i`. Index 0 = deployer. */
  getWallet: (i: number) => ethers.HDNodeWallet;
  /** Return a nonce-managed signer for index `i` to avoid nonce race conditions. */
  getSigner: (i: number) => ethers.NonceManager;
}

function isNonceError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /nonce (too high|too low)|nonce has already been used|replacement fee too low/i.test(message);
}

async function waitForBlockchainTx(
  label: string,
  signer: ethers.NonceManager,
  send: () => Promise<ethers.ContractTransactionResponse>,
): Promise<ethers.TransactionReceipt> {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const tx = await send();
      return await tx.wait(1) as ethers.TransactionReceipt;
    } catch (err) {
      if (!isNonceError(err) || attempt === maxAttempts) {
        throw err;
      }

      signer.reset();
      console.warn(`    [bc] ${label}: nonce desincronizado, reintento ${attempt + 1}/${maxAttempts}`);
    }
  }

  throw new Error(`${label}: reintentos agotados`);
}

async function setupBlockchain(): Promise<BlockchainContext | null> {
  try {
    const provider = new ethers.JsonRpcProvider(HARDHAT_RPC_URL);
    // Will throw if the node is unreachable
    await provider.getNetwork();

    const abiPath = path.resolve(
      __dirname,
      '../../smart-contracts/artifacts/contracts/DocumentRegistry.sol/DocumentRegistry.json',
    );
    const { abi } = JSON.parse(fs.readFileSync(abiPath, 'utf8')) as { abi: ethers.InterfaceAbi };

    const deployer = new ethers.Wallet(HARDHAT_DEPLOYER_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, deployer);

    const walletCache = new Map<number, ethers.HDNodeWallet>();
    const signerCache = new Map<number, ethers.NonceManager>();

    const getWallet = (i: number) => {
      const cached = walletCache.get(i);
      if (cached) return cached;
      const wallet = ethers.HDNodeWallet.fromPhrase(
        HARDHAT_MNEMONIC,
        undefined,
        `m/44'/60'/0'/0/${i}`,
      ).connect(provider) as ethers.HDNodeWallet;
      walletCache.set(i, wallet);
      return wallet;
    };

    const getSigner = (i: number) => {
      const cached = signerCache.get(i);
      if (cached) return cached;
      const signer = new ethers.NonceManager(getWallet(i));
      signerCache.set(i, signer);
      return signer;
    };

    console.log(
      `[blockchain] Conectado a Hardhat ${HARDHAT_RPC_URL} — contrato ${CONTRACT_ADDRESS}`,
    );
    return { provider, contract, getWallet, getSigner };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[blockchain] Nodo no disponible (${msg}). Se usarán hashes sintéticos.`);
    return null;
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────
let prisma = new PrismaClient();
const DEMO_PASSWORD = 'Demo123!';
const DEFAULT_ADMIN_PASSWORD = 'Admin123!';

const DEFAULT_ADMIN_IDENTITY: DemoIdentity = {
  username: 'admin',
  email: 'admin@documentchain.local',
  fullName: 'System Administrator',
};

const DEMO_IDENTITIES: DemoIdentity[] = [
  { username: 'laura_garcia', email: 'laura.garcia@documentchain.local', fullName: 'Laura Garcia' },
  { username: 'carmen_martin', email: 'carmen.martin@documentchain.local', fullName: 'Carmen Martin' },
  { username: 'alberto_ruiz', email: 'alberto.ruiz@documentchain.local', fullName: 'Alberto Ruiz' },
  { username: 'diego_ortega', email: 'diego.ortega@documentchain.local', fullName: 'Diego Ortega' },
  { username: 'nuria_sanz', email: 'nuria.sanz@documentchain.local', fullName: 'Nuria Sanz' },
  { username: 'sergio_pascual', email: 'sergio.pascual@documentchain.local', fullName: 'Sergio Pascual' },
  { username: 'marta_herrera', email: 'marta.herrera@documentchain.local', fullName: 'Marta Herrera' },
  { username: 'pablo_navarro', email: 'pablo.navarro@documentchain.local', fullName: 'Pablo Navarro' },
  { username: 'elena_castro', email: 'elena.castro@documentchain.local', fullName: 'Elena Castro' },
  { username: 'jorge_benito', email: 'jorge.benito@documentchain.local', fullName: 'Jorge Benito' },
  { username: 'irene_molina', email: 'irene.molina@documentchain.local', fullName: 'Irene Molina' },
  { username: 'raul_soto', email: 'raul.soto@documentchain.local', fullName: 'Raul Soto' },
  { username: 'beatriz_lozano', email: 'beatriz.lozano@documentchain.local', fullName: 'Beatriz Lozano' },
  { username: 'adrian_calvo', email: 'adrian.calvo@documentchain.local', fullName: 'Adrian Calvo' },
  { username: 'lucia_prieto', email: 'lucia.prieto@documentchain.local', fullName: 'Lucia Prieto' },
  { username: 'daniel_marin', email: 'daniel.marin@documentchain.local', fullName: 'Daniel Marin' },
  { username: 'clara_rey', email: 'clara.rey@documentchain.local', fullName: 'Clara Rey' },
  { username: 'alvaro_robles', email: 'alvaro.robles@documentchain.local', fullName: 'Alvaro Robles' },
  { username: 'patricia_diaz', email: 'patricia.diaz@documentchain.local', fullName: 'Patricia Diaz' },
  { username: 'miguel_pena', email: 'miguel.pena@documentchain.local', fullName: 'Miguel Pena' },
];

const QA_ADMIN_IDENTITIES: DemoIdentity[] = [
  {
    username: 'admin_operaciones',
    email: 'admin.operaciones@documentchain.local',
    fullName: 'Admin Operaciones',
  },
];

const DOCUMENT_TITLE_PARTS = {
  prefixes: ['contrato', 'expediente', 'informe', 'propuesta', 'acta', 'resumen', 'memoria', 'plan'],
  subjects: ['clientes', 'licitacion', 'seguridad', 'implantacion', 'facturacion', 'auditoria', 'obra', 'cumplimiento'],
  suffixes: ['2026', 'revision', 'definitivo', 'firmado', 'interno', 'publicable', 'operativo', 'anexo'],
};

function getDemoIdentity(index: number): DemoIdentity {
  const predefined = DEMO_IDENTITIES[index];
  if (predefined) {
    return predefined;
  }

  const suffix = String(index + 1).padStart(2, '0');
  return {
    username: `usuario_demo_${suffix}`,
    email: `usuario.demo.${suffix}@documentchain.local`,
    fullName: `Usuario Demo ${suffix}`,
  };
}

const PROFILES: Record<ProfileName, ProfileConfig> = {
  'qa-fast': {
    users: 2,
    docsPerUser: 2,
    maxVersionsPerDoc: 2,
    signaturesPerDoc: 1,
    walletsPerUser: 1,
  },
  'qa-max': {
    users: 20,
    docsPerUser: 12,
    maxVersionsPerDoc: 5,
    signaturesPerDoc: 4,
    walletsPerUser: 3,
  },
};

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const requestedProfile =
    args.find((arg) => arg.startsWith('--profile='))?.split('=')[1] ??
    process.env.SEED_PROFILE ??
    'qa-fast';
  const profile = requestedProfile === 'qa-max' ? 'qa-max' : 'qa-fast';

  return {
    profile,
    reset: true,
    includeSeed: args.includes('--include-minimal-seed'),
  };
}

async function reconnectPrismaClient(): Promise<void> {
  await prisma.$disconnect();
  prisma = new PrismaClient();
  await prisma.$connect();
  await prisma.$queryRaw`SELECT 1`;
}

async function acquireSeedLock(): Promise<void> {
  const rows = await prisma.$queryRaw<Array<{ locked: boolean }>>`
    SELECT pg_try_advisory_lock(${QA_SEED_LOCK_ID}) AS locked
  `;

  if (!rows[0]?.locked) {
    throw new Error('Ya hay otra seed QA en ejecución sobre esta base de datos. Espera a que termine antes de relanzar reseed-dev.ps1.');
  }
}

async function releaseSeedLock(): Promise<void> {
  try {
    await prisma.$queryRaw`
      SELECT pg_advisory_unlock(${QA_SEED_LOCK_ID})
    `;
  } catch {
  }
}

async function runReset(includeSeed: boolean): Promise<void> {
  console.log('\n[1/6] Reseteando base de datos...');
  const seedFlag = includeSeed ? '' : ' --skip-seed';
  execSync(`npx prisma migrate reset --force${seedFlag}`, {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  await reconnectPrismaClient();
}

function randomHash(prefix: string, n: number): string {
  return ethers.keccak256(ethers.toUtf8Bytes(`${prefix}-${n}-${Date.now()}-${Math.random()}`));
}

function txHash(n: number): string {
  return ethers.keccak256(ethers.toUtf8Bytes(`tx-${n}-${Date.now()}-${Math.random()}`));
}

function syntheticCid(seed: string): string {
  return `Qm${ethers.keccak256(ethers.toUtf8Bytes(seed)).slice(2, 34)}`;
}

async function cleanupConfiguredIPFS(): Promise<boolean> {
  try {
    console.log('[ipfs] Limpiando pins existentes del proveedor configurado...');
    const pins = await ipfsClient.listPins();
    let removed = 0;

    for (const pin of pins) {
      const cid = typeof pin?.cid === 'string' ? pin.cid : null;
      if (!cid) continue;

      try {
        await ipfsClient.unpin(cid);
        removed++;
      } catch (error) {
        console.warn(`[ipfs] No se pudo desanclar ${cid}: ${error instanceof Error ? error.message : error}`);
      }
    }

    console.log(`[ipfs] Limpieza completada: ${removed}/${pins.length} CIDs desanclados`);
    return true;
  } catch (error) {
    console.warn(`[ipfs] Proveedor no disponible para seed real (${error instanceof Error ? error.message : error}). Se usaran CIDs sinteticos.`);
    return false;
  }
}

function buildSeedPayload(kind: { ext: string; mime: string; name: string }, owner: GeneratedUser, docIndex: number, versionIndex: number): Buffer {
  const payload = {
    generatedBy: 'DocumentChain QA seed',
    owner: owner.username,
    document: buildDocumentName(owner, docIndex, kind.ext),
    version: versionIndex + 1,
    mimeType: kind.mime,
    createdAt: new Date().toISOString(),
    note: 'Contenido ficticio para demostracion local; el flujo de usuario real cifra y sube archivos desde la aplicacion.',
  };

  return Buffer.from(JSON.stringify(payload, null, 2), 'utf8');
}

async function createSeedIpfsCid(seed: string, payload: Buffer): Promise<string> {
  if (!seedIpfsAvailable) {
    return syntheticCid(seed);
  }

  try {
    return await uploadToIPFS(payload);
  } catch (error) {
    if (!seedIpfsWarningShown) {
      console.warn(`[ipfs] Fallo la subida de datos demo (${error instanceof Error ? error.message : error}). Se continuara con CIDs sinteticos.`);
      seedIpfsWarningShown = true;
    }
    seedIpfsAvailable = false;
    return syntheticCid(seed);
  }
}

function getWalletCountForUser(index: number, config: ProfileConfig): number {
  if (index === 1) {
    return MAX_WALLETS_PER_USER;
  }

  return config.walletsPerUser;
}

function buildDocumentName(owner: GeneratedUser, docIndex: number, extension: string): string {
  const prefix = DOCUMENT_TITLE_PARTS.prefixes[docIndex % DOCUMENT_TITLE_PARTS.prefixes.length];
  const subject = DOCUMENT_TITLE_PARTS.subjects[(docIndex + owner.username.length) % DOCUMENT_TITLE_PARTS.subjects.length];
  const suffix = DOCUMENT_TITLE_PARTS.suffixes[(docIndex + Math.max(owner.ethWalletIndex, 0)) % DOCUMENT_TITLE_PARTS.suffixes.length];

  return `${prefix}_${subject}_${suffix}_${owner.username}.${extension}`;
}

async function createUser(
  index: number,
  walletCount: number,
  bc: BlockchainContext | null,
): Promise<GeneratedUser> {
  const identity = getDemoIdentity(index);
  const { username, email, fullName } = identity;

  const { publicKey, privateKey } = KeyManager.generateKeyPair();
  const recoveryKey = KeyManager.generateRecoveryKey();
  const recoveryKeyHash = KeyManager.hashRecoveryKey(recoveryKey);
  const encryptedPrivateKey = KeyManager.encryptPrivateKey(privateKey, DEMO_PASSWORD);
  const encryptedPrivateKeyRecovery = KeyManager.encryptPrivateKeyWithRecovery(privateKey, recoveryKey);
  const passwordHash = await Argon2Service.hash(DEMO_PASSWORD);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      fullName,
      passwordHash,
      publicKey,
      encryptedPrivateKey,
      recoveryKeyHash,
      encryptedPrivateKeyRecovery,
      emailVerified: true,
    },
  });

  await prisma.notificationPreference.create({
    data: {
      userId: user.id,
      emailEnabled: true,
      pushEnabled: index % 2 === 0,
      typePreferences: {
        FILE_SHARED: true,
        FILE_SIGNED: true,
        NEW_VERSION: true,
        BLOCKCHAIN_CONFIRMED: true,
      },
    },
  });

  await prisma.emailVerification.create({
    data: {
      userId: user.id,
      token: `email-token-${index}-${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      verified: true,
      verifiedAt: new Date(),
    },
  });

  if (index % 2 === 1) {
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: `reset-token-${index}-${Date.now()}`,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        used: false,
      },
    });
  }

  const walletIds: string[] = [];
  const walletAddresses: string[] = [];
  // Hardhat funded accounts are 0..19; recycle indexes if user count exceeds that.
  const ethWalletIndex = index % HARDHAT_FUNDED_ACCOUNT_COUNT;

  for (let i = 0; i < walletCount; i += 1) {
    // Primary wallet uses the corresponding Hardhat funded account so the seed
    // can sign real blockchain transactions. Extra wallets remain random.
    const wallet =
      i === 0 && bc
        ? bc.getWallet(ethWalletIndex)
        : ethers.Wallet.createRandom();
    const created = await prisma.wallet.create({
      data: {
        userId: user.id,
        walletAddress: wallet.address.toLowerCase(),
        nickname: i === 0 ? 'Principal' : `Secundaria ${i}`,
        isPrimary: i === 0,
        isConnected: true,
      },
    });

    walletIds.push(created.id);
    walletAddresses.push(created.walletAddress);
  }

  return {
    id: user.id,
    username,
    email,
    password: DEMO_PASSWORD,
    walletIds,
    walletAddresses,
    ethWalletIndex,
  };
}

async function ensureDefaultAdmin(bc: BlockchainContext | null): Promise<GeneratedUser> {
  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { username: DEFAULT_ADMIN_IDENTITY.username },
        { email: DEFAULT_ADMIN_IDENTITY.email },
      ],
    },
    include: {
      wallets: {
        select: {
          id: true,
          walletAddress: true,
          isPrimary: true,
        },
      },
    },
  });

  const buildAdminWallet = () =>
    bc ? bc.getWallet(0).address.toLowerCase() : ethers.Wallet.createRandom().address.toLowerCase();

  if (!existingAdmin) {
    const { publicKey, privateKey } = KeyManager.generateKeyPair();
    const recoveryKey = KeyManager.generateRecoveryKey();
    const recoveryKeyHash = KeyManager.hashRecoveryKey(recoveryKey);
    const encryptedPrivateKey = KeyManager.encryptPrivateKey(privateKey, DEFAULT_ADMIN_PASSWORD);
    const encryptedPrivateKeyRecovery = KeyManager.encryptPrivateKeyWithRecovery(privateKey, recoveryKey);
    const passwordHash = await Argon2Service.hash(DEFAULT_ADMIN_PASSWORD);

    const admin = await prisma.user.create({
      data: {
        username: DEFAULT_ADMIN_IDENTITY.username,
        email: DEFAULT_ADMIN_IDENTITY.email,
        fullName: DEFAULT_ADMIN_IDENTITY.fullName,
        role: 'ADMIN',
        passwordHash,
        publicKey,
        encryptedPrivateKey,
        recoveryKeyHash,
        encryptedPrivateKeyRecovery,
        emailVerified: true,
      },
    });

    await prisma.notificationPreference.create({
      data: {
        userId: admin.id,
        emailEnabled: true,
        pushEnabled: true,
        typePreferences: {
          FILE_SHARED: true,
          FILE_SIGNED: true,
          NEW_VERSION: true,
          BLOCKCHAIN_CONFIRMED: true,
        },
      },
    });

    await prisma.emailVerification.create({
      data: {
        userId: admin.id,
        token: `seed-admin-email-token-${Date.now()}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        verified: true,
        verifiedAt: new Date(),
      },
    });

    const walletAddress = buildAdminWallet();
    const wallet = await prisma.wallet.create({
      data: {
        userId: admin.id,
        walletAddress,
        nickname: 'Principal',
        isPrimary: true,
        isConnected: true,
      },
    });

    return {
      id: admin.id,
      username: DEFAULT_ADMIN_IDENTITY.username,
      email: DEFAULT_ADMIN_IDENTITY.email,
      password: DEFAULT_ADMIN_PASSWORD,
      walletIds: [wallet.id],
      walletAddresses: [wallet.walletAddress],
      ethWalletIndex: -1,
    };
  }

  await prisma.user.update({
    where: { id: existingAdmin.id },
    data: {
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  await prisma.notificationPreference.upsert({
    where: { userId: existingAdmin.id },
    create: {
      userId: existingAdmin.id,
      emailEnabled: true,
      pushEnabled: true,
      typePreferences: {
        FILE_SHARED: true,
        FILE_SIGNED: true,
        NEW_VERSION: true,
        BLOCKCHAIN_CONFIRMED: true,
      },
    },
    update: {
      emailEnabled: true,
      pushEnabled: true,
    },
  });

  const existingVerification = await prisma.emailVerification.findFirst({
    where: { userId: existingAdmin.id },
    select: { id: true },
  });

  if (existingVerification) {
    await prisma.emailVerification.updateMany({
      where: { userId: existingAdmin.id },
      data: {
        verified: true,
        verifiedAt: new Date(),
      },
    });
  } else {
    await prisma.emailVerification.create({
      data: {
        userId: existingAdmin.id,
        token: `seed-admin-email-token-${Date.now()}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        verified: true,
        verifiedAt: new Date(),
      },
    });
  }

  const existingWallets = existingAdmin.wallets as SeedWalletRecord[];
  let primaryWallet = existingWallets.find((wallet) => wallet.isPrimary) ?? null;

  if (!primaryWallet) {
    if (existingWallets.length > 0) {
      primaryWallet = await prisma.wallet.update({
        where: { id: existingWallets[0].id },
        data: { isPrimary: true },
        select: {
          id: true,
          walletAddress: true,
          isPrimary: true,
        },
      });
    } else {
      const walletAddress = buildAdminWallet();
      primaryWallet = await prisma.wallet.create({
        data: {
          userId: existingAdmin.id,
          walletAddress,
          nickname: 'Principal',
          isPrimary: true,
          isConnected: true,
        },
        select: {
          id: true,
          walletAddress: true,
          isPrimary: true,
        },
      });
    }
  }

  const walletAddresses = primaryWallet
    ? [primaryWallet.walletAddress, ...existingWallets.filter((wallet) => wallet.id !== primaryWallet?.id).map((wallet) => wallet.walletAddress)]
    : existingWallets.map((wallet) => wallet.walletAddress);
  const walletIds = primaryWallet
    ? [primaryWallet.id, ...existingWallets.filter((wallet) => wallet.id !== primaryWallet?.id).map((wallet) => wallet.id)]
    : existingWallets.map((wallet) => wallet.id);

  return {
    id: existingAdmin.id,
    username: DEFAULT_ADMIN_IDENTITY.username,
    email: DEFAULT_ADMIN_IDENTITY.email,
    password: DEFAULT_ADMIN_PASSWORD,
    walletIds,
    walletAddresses,
    ethWalletIndex: -1,
  };
}

async function createAdminUser(index: number): Promise<GeneratedUser> {
  const identity = QA_ADMIN_IDENTITIES[index];
  const { username, email, fullName } = identity;

  const { publicKey, privateKey } = KeyManager.generateKeyPair();
  const recoveryKey = KeyManager.generateRecoveryKey();
  const recoveryKeyHash = KeyManager.hashRecoveryKey(recoveryKey);
  const encryptedPrivateKey = KeyManager.encryptPrivateKey(privateKey, DEMO_PASSWORD);
  const encryptedPrivateKeyRecovery = KeyManager.encryptPrivateKeyWithRecovery(privateKey, recoveryKey);
  const passwordHash = await Argon2Service.hash(DEMO_PASSWORD);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      fullName,
      role: 'ADMIN',
      passwordHash,
      publicKey,
      encryptedPrivateKey,
      recoveryKeyHash,
      encryptedPrivateKeyRecovery,
      emailVerified: true,
    },
  });

  await prisma.notificationPreference.create({
    data: {
      userId: user.id,
      emailEnabled: true,
      pushEnabled: true,
      typePreferences: {
        FILE_SHARED: true,
        FILE_SIGNED: true,
        NEW_VERSION: true,
      },
    },
  });

  await prisma.emailVerification.create({
    data: {
      userId: user.id,
      token: `admin-email-token-${index}-${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      verified: true,
      verifiedAt: new Date(),
    },
  });

  const walletIds: string[] = [];
  const walletAddresses: string[] = [];

  for (let i = 0; i < 2; i += 1) {
    const wallet = ethers.Wallet.createRandom();
    const created = await prisma.wallet.create({
      data: {
        userId: user.id,
        walletAddress: wallet.address.toLowerCase(),
        nickname: i === 0 ? 'Principal' : `Secundaria ${i}`,
        isPrimary: i === 0,
        isConnected: true,
      },
    });

    walletIds.push(created.id);
    walletAddresses.push(created.walletAddress);
  }

  return {
    id: user.id,
    username,
    email,
    password: DEMO_PASSWORD,
    walletIds,
    walletAddresses,
    ethWalletIndex: -1,
  };
}

async function createDocumentsAndEvents(
  users: GeneratedUser[],
  config: ProfileConfig,
  bc: BlockchainContext | null,
): Promise<void> {
  console.log('[3/6] Generando documentos, versiones, firmas, comparticiones y auditoria...');
  if (bc) {
    console.log('      [blockchain] Transacciones reales activadas');
  } else {
    console.log('      [blockchain] Modo sintético (nodo no disponible)');
  }

  let blockchainCounter = 1;
  const baseDate = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const docKinds = [
    { ext: 'pdf', mime: 'application/pdf', name: 'contrato_arrendamiento' },
    { ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', name: 'informe_trimestral' },
    { ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', name: 'balance_contable' },
    { ext: 'png', mime: 'image/png', name: 'plano_instalacion' },
    { ext: 'zip', mime: 'application/zip', name: 'expediente_firmas' },
  ];
  const folderNames = ['Expedientes', 'Facturacion', 'Firmas', 'Proyectos', 'Archivo', 'Seguimiento'];

  for (let u = 0; u < users.length; u += 1) {
    const owner = users[u];

    const rootFolder = await prisma.folder.create({
      data: {
        userId: owner.id,
        name: `${folderNames[u % folderNames.length]} ${u + 1}`,
        description: 'Carpeta principal de demo',
        color: '#0B7285',
        icon: 'archive',
      },
    });

    const childFolders = await Promise.all([
      prisma.folder.create({
        data: {
          userId: owner.id,
          parentId: rootFolder.id,
          name: `Contratos ${u + 1}`,
          description: 'Versiones contractuales y anexos',
          color: '#1D4ED8',
          icon: 'folder-open',
        },
      }),
      prisma.folder.create({
        data: {
          userId: owner.id,
          parentId: rootFolder.id,
          name: `Evidencias ${u + 1}`,
          description: 'Soportes, capturas y documentos complementarios',
          color: '#0F766E',
          icon: 'images',
        },
      }),
    ]);
    const availableFolders = [rootFolder, ...childFolders];

    for (let d = 0; d < config.docsPerUser; d += 1) {
      const docCreatedAt = new Date(baseDate + (u * 100 + d) * 60 * 60 * 1000);
      const docKind = docKinds[(u + d) % docKinds.length];
      const targetFolder = availableFolders[d % availableFolders.length];

      // Build a deterministic docId bytes32 so the seed is repeatable
      const docSeedKey = `doc-user${u}-doc${d}-${Date.now()}`;
      const docBytes32 = ethers.id(docSeedKey);
      const ipfsCid = await createSeedIpfsCid(
        `cid-${docSeedKey}`,
        buildSeedPayload(docKind, owner, d, 0),
      );
      const encKeyHash = ethers.keccak256(ethers.toUtf8Bytes(`enckey-${docSeedKey}`)) as `0x${string}`;

      // ── Send real createDocument transaction ────────────────────────────
      let docTxHash = txHash(blockchainCounter);
      let docBlockNumber = 9000 + blockchainCounter;
      let docStatus: BlockchainStatus = BlockchainStatus.SYNCED;
      let docError: string | null = null;

      if (bc) {
        try {
          const ownerSigner = bc.getSigner(owner.ethWalletIndex);
          const receipt = await waitForBlockchainTx(
            `createDocument u=${u} d=${d}`,
            ownerSigner,
            () => (bc.contract.connect(ownerSigner) as ethers.Contract).createDocument(
              docBytes32,
              ipfsCid,
              encKeyHash,
            ) as Promise<ethers.ContractTransactionResponse>,
          );
          docTxHash = receipt.hash;
          docBlockNumber = receipt.blockNumber;
          docStatus = BlockchainStatus.SYNCED;
        } catch (err) {
          const reason = err instanceof Error ? err.message : String(err);
          console.warn(`    [bc] createDocument u=${u} d=${d} falló: ${reason}`);
          docStatus = BlockchainStatus.FAILED;
          docError = reason;
        }
      }

      const document = await prisma.document.create({
        data: {
          name: buildDocumentName(owner, d, docKind.ext),
          description: `Documento de prueba para ${targetFolder.name.toLowerCase()} con historial de versiones y firmas cruzadas.`,
          mimeType: docKind.mime,
          size: BigInt(60000 + d * 1500),
          contentHash: randomHash('content', blockchainCounter),
          metadataHash: randomHash('metadata', blockchainCounter),
          fileExtension: docKind.ext,
          ownerId: owner.id,
          folderId: targetFolder.id,
          tags: ['demo', 'qa', targetFolder.name.toLowerCase(), d % 2 === 0 ? 'legal' : 'finanzas', docKind.ext],
          encryptedSymmetricKey: randomHash('sym', blockchainCounter),
          encryptionIV: Buffer.from(`iv-${blockchainCounter}`).toString('base64'),
          encryptionAuthTag: Buffer.from(`tag-${blockchainCounter}`).toString('base64'),
          blockchainStatus: docStatus,
          blockchainError: docError,
          blockchainId: docBytes32,
          blockchainTxHash: docTxHash,
          creatorWalletId: owner.walletIds[0],
          createdAt: docCreatedAt,
        },
      });

      await prisma.event.create({
        data: {
          eventType: 'DocumentCreated',
          userId: owner.id,
          documentId: document.id,
          metadata: {
            blockchainId: docBytes32,
            source: 'automated-generator',
          },
          transactionHash: document.blockchainTxHash,
          blockNumber: docBlockNumber,
          blockTimestamp: new Date(docCreatedAt.getTime() + 2 * 60 * 1000),
          createdAt: new Date(docCreatedAt.getTime() + 2 * 60 * 1000),
        },
      });

      const versionCount = 1 + (d % config.maxVersionsPerDoc);
  const versionEntries: Array<{ id: string; versionNumber: number }> = [];
      // Version 1 was created inside createDocument on-chain; extra versions need createVersion txs
      let latestOnchainVersionNum = 1;

      for (let v = 0; v < versionCount; v += 1) {
        const versionIpfsCid = v === 0
          ? ipfsCid
          : await createSeedIpfsCid(
            `cid-v${v}-${docSeedKey}`,
            buildSeedPayload(docKind, owner, d, v),
          );
        const versionEncKeyHash = ethers.keccak256(ethers.toUtf8Bytes(`enckey-v${v}-${docSeedKey}`)) as `0x${string}`;

        let verTxHash = txHash(blockchainCounter + v);
        let verBlockNumber = 9500 + blockchainCounter + v;

        // v=0: version already created on-chain by createDocument; only send tx for v>0
        if (v > 0 && bc && docStatus === BlockchainStatus.SYNCED) {
          try {
            const ownerSigner = bc.getSigner(owner.ethWalletIndex);
            const receipt = await waitForBlockchainTx(
              `createVersion u=${u} d=${d} v=${v}`,
              ownerSigner,
              () => (bc.contract.connect(ownerSigner) as ethers.Contract).createVersion(
                docBytes32,
                versionIpfsCid,
                versionEncKeyHash,
              ) as Promise<ethers.ContractTransactionResponse>,
            );
            verTxHash = receipt.hash;
            verBlockNumber = receipt.blockNumber;
            latestOnchainVersionNum = v + 1;
          } catch (err) {
            console.warn(`    [bc] createVersion u=${u} d=${d} v=${v} falló: ${err instanceof Error ? err.message : err}`);
          }
        }

        const version = await prisma.version.create({
          data: {
            documentId: document.id,
            userId: owner.id,
            encryptedSymmetricKey: randomHash('version-sym', blockchainCounter + v),
            encryptionIV: Buffer.from(`version-iv-${blockchainCounter}-${v}`).toString('base64'),
            encryptionAuthTag: Buffer.from(`version-tag-${blockchainCounter}-${v}`).toString('base64'),
            comment: v === 0 ? 'Version inicial' : `Revision ${v + 1}`,
            blockchainStatus: BlockchainStatus.SYNCED,
            blockchainTxHash: verTxHash,
            versionNumber: v + 1,
            ipfsCid: versionIpfsCid,
            createdAt: new Date(docCreatedAt.getTime() + (v + 1) * 20 * 60 * 1000),
          },
        });
        versionEntries.push({
          id: version.id,
          versionNumber: v + 1,
        });

        await prisma.event.create({
          data: {
            eventType: 'VersionCreated',
            userId: owner.id,
            documentId: document.id,
            metadata: {
              versionNumber: v + 1,
            },
            transactionHash: version.blockchainTxHash,
            blockNumber: verBlockNumber,
            blockTimestamp: new Date(docCreatedAt.getTime() + (v + 1) * 20 * 60 * 1000),
            createdAt: new Date(docCreatedAt.getTime() + (v + 1) * 20 * 60 * 1000),
          },
        });
      }

      const signers = users.filter((candidate) => candidate.id !== owner.id).slice(0, config.signaturesPerDoc);
      for (let s = 0; s < signers.length; s += 1) {
        const signer = signers[s];
        const selectedVersion = versionEntries[(s + d) % versionEntries.length] ?? versionEntries[versionEntries.length - 1];
        const versionNumberToSign = Math.max(1, Math.min(selectedVersion.versionNumber, latestOnchainVersionNum));
        const signedAt = new Date(docCreatedAt.getTime() + (s + 1) * 50 * 60 * 1000);

        let sigTxHash = txHash(blockchainCounter + s + 99);
        let sigBlockNumber = 9800 + blockchainCounter + s;

        if (bc && docStatus === BlockchainStatus.SYNCED) {
          try {
            const ownerSigner = bc.getSigner(owner.ethWalletIndex);
            const signerSigner = bc.getSigner(signer.ethWalletIndex);
            const signerAddress = await signerSigner.getAddress();
            // First share the document with the signer so they can sign
            const shareRole = s % 2 === 0 ? 1 : 2; // 1=VIEWER, 2=EDITOR
            await waitForBlockchainTx(
              `shareDocument u=${u} d=${d} s=${s}`,
              ownerSigner,
              () => (bc.contract.connect(ownerSigner) as ethers.Contract).shareDocument(
                docBytes32,
                signerAddress,
                shareRole,
              ) as Promise<ethers.ContractTransactionResponse>,
            );

            const onchainDoc = await (bc.contract.connect(ownerSigner) as ethers.Contract).getDocument(docBytes32);
            const versionToSign = Math.min(Number(onchainDoc.latestVersion ?? 0n), versionNumberToSign);
            if (versionToSign <= 0) {
              throw new Error('No valid on-chain version to sign');
            }

            const signatureMessage = `Firmado documento ${document.name}`;
            const payloadHash = await (bc.contract.connect(signerSigner) as ethers.Contract).getSignaturePayloadHash(
              docBytes32,
              versionToSign,
              signatureMessage,
            );
            const ethSig = await signerSigner.signMessage(ethers.getBytes(payloadHash));
            const receipt = await waitForBlockchainTx(
              `signDocument u=${u} d=${d} s=${s}`,
              signerSigner,
              () => (bc.contract.connect(signerSigner) as ethers.Contract).signDocument(
                docBytes32,
                versionToSign,
                ethSig,
                signatureMessage,
                '',
              ) as Promise<ethers.ContractTransactionResponse>,
            );
            sigTxHash = receipt.hash;
            sigBlockNumber = receipt.blockNumber;
          } catch (err) {
            console.warn(`    [bc] signDocument u=${u} d=${d} s=${s} falló: ${err instanceof Error ? err.message : err}`);
          }
        }

        const signature = await prisma.documentSignature.create({
          data: {
            documentId: document.id,
            versionId: selectedVersion.id,
            userId: signer.id,
            signerWalletId: signer.walletIds[0],
            blockchainStatus: BlockchainStatus.SYNCED,
            blockchainTxHash: sigTxHash,
            signedAt,
          },
        });

        await prisma.event.create({
          data: {
            eventType: 'DocumentSigned',
            userId: signer.id,
            documentId: document.id,
            metadata: {
              signatureId: signature.id,
              signerWallet: signer.walletAddresses[0],
              versionNumber: selectedVersion.versionNumber,
            },
            transactionHash: signature.blockchainTxHash,
            blockNumber: sigBlockNumber,
            blockTimestamp: signedAt,
            createdAt: signedAt,
          },
        });

        await prisma.notification.create({
          data: {
            userId: owner.id,
            type: 'FILE_SIGNED',
            title: 'Documento firmado',
            message: `${signer.username} firmo la version ${selectedVersion.versionNumber} de ${document.name}`,
            link: `/app/documents/${document.id}`,
            data: {
              documentId: document.id,
              signerId: signer.id,
              versionId: selectedVersion.id,
              versionNumber: selectedVersion.versionNumber,
            },
            isRead: s === 0 && d % 2 === 0,
            readAt: s === 0 && d % 2 === 0 ? new Date(signedAt.getTime() + 10 * 60 * 1000) : null,
          },
        });
      }

      if (d % 3 === 0) {
        const recipient = users[(u + 1) % users.length];
        await prisma.event.create({
          data: {
            eventType: 'DocumentTransferred',
            userId: owner.id,
            documentId: document.id,
            metadata: {
              fromUserId: owner.id,
              toUserId: recipient.id,
            },
            transactionHash: txHash(blockchainCounter + 300),
            blockNumber: 10000 + blockchainCounter,
            blockTimestamp: new Date(docCreatedAt.getTime() + 90 * 60 * 1000),
            createdAt: new Date(docCreatedAt.getTime() + 90 * 60 * 1000),
          },
        });
      }

      if (d % 2 === 0) {
        await prisma.event.create({
          data: {
            eventType: 'VersionRestored',
            userId: owner.id,
            documentId: document.id,
            metadata: {
              reason: 'Validacion de historial de restauracion',
            },
            transactionHash: txHash(blockchainCounter + 400),
            blockNumber: 10100 + blockchainCounter,
            blockTimestamp: new Date(docCreatedAt.getTime() + 100 * 60 * 1000),
            createdAt: new Date(docCreatedAt.getTime() + 100 * 60 * 1000),
          },
        });
      }

      if (false) { // isArchived now from blockchain, not BD
        await prisma.event.create({
          data: {
            eventType: 'DocumentArchived',
            userId: owner.id,
            documentId: document.id,
            metadata: {
              reason: 'Archivado automatico de dataset QA',
            },
            transactionHash: txHash(blockchainCounter + 500),
            blockNumber: 10200 + blockchainCounter,
            blockTimestamp: new Date(docCreatedAt.getTime() + 110 * 60 * 1000),
            createdAt: new Date(docCreatedAt.getTime() + 110 * 60 * 1000),
          },
        });
      }

      blockchainCounter += 1;
    }
  }
}

async function recomputeStats(users: GeneratedUser[]): Promise<void> {
  console.log('[4/6] Recalculando estadisticas de usuario y documento...');

  await prisma.systemStats.create({
    data: {
      statType: 'DAILY',
      periodStart: new Date(Date.now() - 24 * 60 * 60 * 1000),
      periodEnd: new Date(),
      lastSyncedBlock: 11000,
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'verification.mode' },
    create: { key: 'verification.mode', value: 'strict' },
    update: { value: 'strict' },
  });

  // Fin de la configuracion del sistema

  await prisma.systemConfig.upsert({
    where: { key: 'notifications.digest' },
    create: { key: 'notifications.digest', value: 'daily' },
    update: { value: 'daily' },
  });
}

async function printSummary(profile: ProfileName, generatedUsers: GeneratedUser[]): Promise<void> {
  console.log('[6/6] Resumen de datos generados');

  const totals = {
    users: await prisma.user.count(),
    wallets: await prisma.wallet.count(),
    documents: await prisma.document.count(),
    versions: await prisma.version.count(),
    signatures: await prisma.documentSignature.count(),
    events: await prisma.event.count(),
    notifications: await prisma.notification.count(),
    failedDocuments: await prisma.document.count({ where: { blockchainStatus: BlockchainStatus.FAILED } }),
  };

  const demo = generatedUsers[0];
  const captureUser = generatedUsers[1];

  console.log('\n============================================');
  console.log(`Perfil ejecutado: ${profile}`);
  console.log('============================================');
  console.log(`Usuarios totales: ${totals.users}`);
  console.log(`Wallets totales: ${totals.wallets}`);
  console.log(`Documentos: ${totals.documents}`);
  console.log(`Versiones: ${totals.versions}`);
  console.log(`Firmas: ${totals.signatures}`);
  console.log(`Eventos de auditoria: ${totals.events}`);
  console.log(`Notificaciones: ${totals.notifications}`);
  console.log(`Documentos en FAILED: ${totals.failedDocuments}`);
  console.log('--------------------------------------------');
  console.log('Credenciales demo para validacion manual:');
  console.log(`Usuario: ${demo.username}`);
  console.log(`Email:   ${demo.email}`);
  console.log(`Clave:   ${demo.password}`);
  console.log(`Wallet principal: ${demo.walletAddresses[0]}`);
  if (captureUser) {
    console.log('--------------------------------------------');
    console.log('Usuario preparado para capturas/manual QA:');
    console.log(`Usuario: ${captureUser.username}`);
    console.log(`Email:   ${captureUser.email}`);
    console.log(`Wallets creadas: ${captureUser.walletAddresses.length}/${MAX_WALLETS_PER_USER}`);
  }
  console.log('============================================\n');

  console.log('Credenciales admin por seed: admin / Admin123!');
  QA_ADMIN_IDENTITIES.forEach((admin) => {
    console.log(`Admin adicional QA: ${admin.username} / ${DEMO_PASSWORD}`);
  });
}

async function main(): Promise<void> {
  const options = parseArgs();
  const profileConfig = PROFILES[options.profile];

  console.log('Generador de datos DocumentChain');
  console.log(`Perfil: ${options.profile}`);
  console.log(`Reset DB: ${options.reset ? 'si' : 'no'}`);
  console.log(`Incluye seed: ${options.includeSeed ? 'si' : 'no'}`);

  if (options.reset) {
    await runReset(options.includeSeed);
  }

  seedIpfsAvailable = await cleanupConfiguredIPFS();

  await acquireSeedLock();

  console.log('[2/6] Creando usuarios demo, wallets y preferencias...');

  const generatedUsers: GeneratedUser[] = [];
  const bc = await setupBlockchain();
  const defaultAdmin = await ensureDefaultAdmin(bc);
  generatedUsers.push(defaultAdmin);

  for (let i = 0; i < profileConfig.users; i += 1) {
    const generated = await createUser(i, getWalletCountForUser(i, profileConfig), bc);
    generatedUsers.push(generated);
  }

  for (let i = 0; i < QA_ADMIN_IDENTITIES.length; i += 1) {
    const admin = await createAdminUser(i);
    generatedUsers.push(admin);
  }

  await createDocumentsAndEvents(
    generatedUsers.filter((user) => user.ethWalletIndex >= 0),
    profileConfig,
    bc,
  );
  await recomputeStats(generatedUsers);

  console.log('[5/6] Generando sesiones de login de prueba...');
  for (const [index, user] of generatedUsers.entries()) {
    await prisma.session.create({
      data: {
        userId: user.id,
        accessToken: `access-${user.id}-${Date.now()}`,
        refreshToken: `refresh-${user.id}-${Date.now()}-${index}`,
        accessTokenExpiresAt: index % 5 === 0 ? new Date(Date.now() - 10 * 60 * 1000) : new Date(Date.now() + 60 * 60 * 1000),
        refreshTokenExpiresAt: index % 7 === 0 ? new Date(Date.now() - 24 * 60 * 60 * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  await printSummary(options.profile, generatedUsers);
}

main()
  .catch((error) => {
    console.error('Error al generar datos de prueba:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await releaseSeedLock();
    await prisma.$disconnect();
  });
