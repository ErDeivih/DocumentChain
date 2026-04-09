import { expect, test } from '@playwright/test';
import {
  API_BASE_URL,
  getHardhatAddress,
  installHardhatWallet,
  loginWithStoredSession,
} from './helpers';

test.describe('Wallet management flows', () => {
  test('fresh user can connect, rename, prioritize, and remove wallets from profile', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');
    test.setTimeout(180000);

    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const walletUser = {
      username: `ines_wallet_${uniqueSuffix}`,
      email: `ines.wallet.${uniqueSuffix}@documentchain.local`,
      password: 'Wallet123!',
      fullName: 'Ines Garrido',
    };

    const firstWalletIndex = 7;
    const secondWalletIndex = 8;
    const firstWalletAddress = getHardhatAddress(firstWalletIndex);
    const secondWalletAddress = getHardhatAddress(secondWalletIndex);
    const secondWalletLabel = 'Wallet secundaria E2E';

    const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
      data: walletUser,
    });
    expect(registerResponse.ok()).toBeTruthy();

    const session = await loginWithStoredSession(page, request, {
      username: walletUser.username,
      password: walletUser.password,
    });

    await installHardhatWallet(page, firstWalletIndex);
    await page.goto('/app/profile');

    await expect(page.getByRole('heading', { name: 'Perfil', exact: true })).toBeVisible();
    await expect(page.getByText('Gestión de Wallets')).toBeVisible();

    await page.getByRole('button', { name: 'Conectar Wallet' }).click();
    await page.getByRole('button', { name: 'Navegador' }).click();
    await expect(page.getByText('Wallet conectada exitosamente')).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(new RegExp(firstWalletAddress, 'i'))).toBeVisible({ timeout: 30000 });

    await installHardhatWallet(page, secondWalletIndex);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Perfil', exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Conectar Wallet' }).click();
    await page.getByRole('button', { name: 'Navegador' }).click();
    await expect(page.getByText('Wallet conectada exitosamente')).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(new RegExp(secondWalletAddress, 'i'))).toBeVisible({ timeout: 30000 });

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Perfil', exact: true })).toBeVisible();
    await page.getByText('Gestión de Wallets').scrollIntoViewIfNeeded();
    await expect(page.getByText(new RegExp(secondWalletAddress, 'i'))).toBeVisible({ timeout: 30000 });

    const walletRowSelector = 'div.flex.items-center.justify-between.p-3.border.rounded-lg';

    const secondWalletCard = page.locator(walletRowSelector).filter({
      hasText: secondWalletAddress,
    }).first();
    await secondWalletCard.locator('button').first().click({ force: true });

    await expect(page.getByPlaceholder('Etiqueta de wallet')).toBeVisible({ timeout: 10000 });

    const editingWalletCard = page.locator(walletRowSelector, {
      has: page.getByPlaceholder('Etiqueta de wallet'),
    }).first();
    await editingWalletCard.getByPlaceholder('Etiqueta de wallet').fill(secondWalletLabel);
    await editingWalletCard.locator('button').first().click({ force: true });
    await expect(page.getByText('Etiqueta de wallet actualizada')).toBeVisible({ timeout: 30000 });
    const renamedWalletCard = page.locator(walletRowSelector).filter({
      hasText: secondWalletLabel,
    }).first();
    await expect(renamedWalletCard).toBeVisible({ timeout: 30000 });

    const walletsBeforePrimaryResponse = await request.get(`${API_BASE_URL}/wallets`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    expect(walletsBeforePrimaryResponse.ok()).toBeTruthy();

    const walletsBeforePrimaryBody = await walletsBeforePrimaryResponse.json();
    const secondSavedWallet = (walletsBeforePrimaryBody.wallets || []).find(
      (wallet: { id: string; address: string; label?: string | null }) =>
        wallet.address.toLowerCase() === secondWalletAddress.toLowerCase() && wallet.label === secondWalletLabel
    );
    const firstSavedWallet = (walletsBeforePrimaryBody.wallets || []).find(
      (wallet: { id: string; address: string }) => wallet.address.toLowerCase() === firstWalletAddress.toLowerCase()
    );

    expect(secondSavedWallet).toBeTruthy();
    expect(firstSavedWallet).toBeTruthy();

    const setPrimaryResponse = await request.put(`${API_BASE_URL}/wallets/${secondSavedWallet.id}/primary`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    expect(setPrimaryResponse.ok()).toBeTruthy();

    await page.reload();
    await page.getByText('Gestión de Wallets').scrollIntoViewIfNeeded();

    const renamedPrimaryWalletCard = page.locator(walletRowSelector).filter({
      hasText: secondWalletLabel,
    }).first();
    const firstNonPrimaryWalletCard = page.locator(walletRowSelector).filter({
      hasText: firstWalletAddress,
    }).first();

    await expect(renamedPrimaryWalletCard.getByText('Principal')).toBeVisible({ timeout: 30000 });
    await expect(firstNonPrimaryWalletCard.getByText('Principal')).toHaveCount(0);

    const deleteResponse = await request.delete(`${API_BASE_URL}/wallets/${firstSavedWallet.id}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    expect(deleteResponse.ok()).toBeTruthy();

    await page.reload();
    await page.getByText('Gestión de Wallets').scrollIntoViewIfNeeded();
    const renamedWalletAfterDelete = page.locator(walletRowSelector).filter({
      hasText: secondWalletLabel,
    }).first();
    await expect(renamedWalletAfterDelete.getByText('Principal')).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(new RegExp(firstWalletAddress, 'i'))).toHaveCount(0);

    const walletsResponse = await request.get(`${API_BASE_URL}/wallets`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    expect(walletsResponse.ok()).toBeTruthy();

    const walletsBody = await walletsResponse.json();
    expect(walletsBody.wallets).toHaveLength(1);
    expect(walletsBody.wallets[0].address.toLowerCase()).toBe(secondWalletAddress.toLowerCase());
    expect(walletsBody.wallets[0].label).toBe(secondWalletLabel);
    expect(walletsBody.wallets[0].isPrimary).toBe(true);
  });
});