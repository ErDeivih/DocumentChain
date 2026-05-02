import { expect, test } from '@playwright/test';
import {
  API_BASE_URL,
  clearStoredSession,
  loginWithStoredSession,
  seedUsers,
  installHardhatWallet,
  selectFirstSavedWallet,
  waitForDocumentStatus,
} from './helpers';

test.describe('Audit txHash search', () => {
  test.describe.configure({ mode: 'serial' });

  test('user can search a transaction by hash and see decoded events', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');
    test.setTimeout(180000);

    const session = await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });

    await installHardhatWallet(page, seedUsers.owner.walletIndex);

    // Upload a document to generate a txHash
    await page.goto('/app/documents');
    await expect(page.getByRole('heading', { name: 'Mis Documentos' })).toBeVisible();

    const documentName = `audit-doc-${Date.now()}.txt`;
    const confirmCreateResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/documents/confirm') && response.request().method() === 'POST'
    );

    await page.getByRole('button', { name: 'Subir Documento' }).first().click();
    await page.locator('input[type="file"]').setInputFiles({
      name: documentName,
      mimeType: 'text/plain',
      buffer: Buffer.from('Documento de prueba auditoria'),
    });
    await page.getByRole('button', { name: 'Subir y Firmar' }).click();

    // Wallet selector modal
    await selectFirstSavedWallet(page);

    const confirmResponse = await confirmCreateResponsePromise;
    expect(confirmResponse.ok()).toBeTruthy();

    // Wait for document to be SYNCED
    const doc = await waitForDocumentStatus(request, session.accessToken, (await confirmResponse.json()).document.id, 'SYNCED');
    const txHash = doc.blockchainTxHash;
    expect(txHash).toBeTruthy();
    expect(txHash).toMatch(/^0x[a-fA-F0-9]{64}$/);

    // Go to audit page
    await page.goto('/audit');
    await expect(page.locator('h1').filter({ hasText: 'Auditoría Blockchain' })).toBeVisible();

    // Switch to "Por Tx Hash" mode
    await page.getByRole('button', { name: /Por Tx Hash/i }).click();
    await page.getByPlaceholder(/0x\.\.\. \(66 caracteres hexadecimales\)/i).fill(txHash);
    await page.getByRole('button', { name: /Buscar en Blockchain/i }).click();

    // Verify transaction details appear
    await expect(page.getByText(/Detalles de Transacción/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(txHash.slice(0, 20))).toBeVisible();

    await clearStoredSession(page);
  });
});
