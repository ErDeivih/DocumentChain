import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import {
  API_BASE_URL,
  getHardhatAddress,
  installHardhatWallet,
  loginWithStoredSession,
  seedUsers,
  selectFirstSavedWallet,
  waitForDocumentStatus,
} from './helpers';

async function createSyncedDocument(
  page: Page,
  request: APIRequestContext,
  accessToken: string,
  fileName: string,
  fileContents: Buffer,
) {
  await page.goto('/app/documents');
  await expect(page.getByRole('heading', { name: 'Mis Documentos' })).toBeVisible();

  const confirmCreateResponsePromise = page.waitForResponse(
    (response) => response.url().includes('/api/documents/confirm') && response.request().method() === 'POST'
  );

  await page.getByRole('button', { name: 'Subir Documento' }).click();
  await page.locator('input[type="file"]').setInputFiles({
    name: fileName,
    mimeType: 'text/plain',
    buffer: fileContents,
  });
  await page.getByRole('button', { name: 'Subir y Firmar' }).click();
  await selectFirstSavedWallet(page, getHardhatAddress(seedUsers.owner.walletIndex));

  await expect(page.getByText('¡Documento subido exitosamente!')).toBeVisible({ timeout: 45000 });

  const confirmCreateResponse = await confirmCreateResponsePromise;
  expect(confirmCreateResponse.ok()).toBeTruthy();

  const confirmCreateBody = await confirmCreateResponse.json();
  const documentId = confirmCreateBody.document.id as string;
  const syncedDocument = await waitForDocumentStatus(request, accessToken, documentId, 'SYNCED', {
    timeoutMs: 120000,
  });

  return {
    documentId,
    syncedDocument,
  };
}

test.describe('Verification and document lifecycle coverage', () => {
  test('owner can verify a synced document by file and blockchain id from the verify page', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');
    test.setTimeout(180000);

    const ownerSession = await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });
    await installHardhatWallet(page, seedUsers.owner.walletIndex);

    const fileName = `verify-e2e-${Date.now()}.txt`;
    const fileContents = Buffer.from(`Documento para verificacion E2E ${Date.now()}`);

    const { syncedDocument } = await createSyncedDocument(
      page,
      request,
      ownerSession.accessToken,
      fileName,
      fileContents,
    );

    await page.goto('/app/verify');
    await expect(page.getByRole('heading', { name: 'Verificar Documento' })).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles({
      name: fileName,
      mimeType: 'text/plain',
      buffer: fileContents,
    });
    await page.getByRole('button', { name: 'Verificar Documento' }).click();

    await expect(page.getByText('Document Verified ✓')).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(fileName, { exact: true })).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(new RegExp(`Creado por ${seedUsers.owner.username}`, 'i'))).toBeVisible({ timeout: 30000 });

    await page.getByText('ID Blockchain').click();
    await page.getByPlaceholder('0x...').fill(syncedDocument.blockchainId);
    await page.getByRole('button', { name: 'Verificar Documento' }).click();

    await expect(page.getByText('Información del Documento')).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(fileName, { exact: true })).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('Historial de Versiones')).toBeVisible({ timeout: 30000 });
  });

  test('owner can archive, unarchive, and delete a document from the detail page', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');
    test.setTimeout(180000);

    const ownerSession = await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });
    await installHardhatWallet(page, seedUsers.owner.walletIndex);

    const fileName = `lifecycle-e2e-${Date.now()}.txt`;
    const fileContents = Buffer.from(`Documento para ciclo de vida E2E ${Date.now()}`);

    const { documentId } = await createSyncedDocument(
      page,
      request,
      ownerSession.accessToken,
      fileName,
      fileContents,
    );

    await page.goto(`/app/documents/${documentId}`);
    await expect(page.getByRole('heading', { name: fileName })).toBeVisible({ timeout: 30000 });

    await page.getByRole('button', { name: 'Archivar' }).click();
    await expect(page.getByText('Archivado')).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('button', { name: 'Desarchivar' })).toBeVisible({ timeout: 30000 });

    await page.getByRole('button', { name: 'Volver' }).click();
    await expect(page).toHaveURL(/\/app\/documents$/, { timeout: 30000 });

    await page.getByText('Archivados').click();
    await page.getByPlaceholder('Buscar por nombre...').fill(fileName);
    await expect(page.getByText(fileName)).toBeVisible({ timeout: 30000 });

    await page.getByText(fileName).click();
    await expect(page).toHaveURL(new RegExp(`/app/documents/${documentId}$`), { timeout: 30000 });

    await page.getByRole('button', { name: 'Desarchivar' }).click();
    await expect(page.getByRole('button', { name: 'Archivar' })).toBeVisible({ timeout: 30000 });

    page.once('dialog', (dialog) => {
      void dialog.accept();
    });
    await page.getByRole('button', { name: 'Eliminar' }).click();
    await expect(page).toHaveURL(/\/app\/documents$/, { timeout: 30000 });

    const documentsResponse = await request.get(`${API_BASE_URL}/documents`, {
      headers: {
        Authorization: `Bearer ${ownerSession.accessToken}`,
      },
      params: {
        search: fileName,
        limit: 20,
      },
    });

    expect(documentsResponse.ok()).toBeTruthy();
    const documentsBody = await documentsResponse.json();
    expect((documentsBody.documents || []).some((document: { id: string }) => document.id === documentId)).toBeFalsy();
  });
});