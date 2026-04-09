import { expect, test } from '@playwright/test';
import {
  API_BASE_URL,
  getHardhatAddress,
  installHardhatWallet,
  loginWithStoredSession,
  seedUsers,
  selectFirstSavedWallet,
  waitForDocumentStatus,
} from './helpers';

test.describe('Document version flow', () => {
  test('owner can upload a document and create a second version from the frontend', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');
    test.setTimeout(180000);

    const ownerSession = await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });
    await installHardhatWallet(page, seedUsers.owner.walletIndex);

    const uploadedDocumentName = `frontend-e2e-version-${Date.now()}.txt`;

    await page.goto('/app/documents');
    await expect(page.getByRole('heading', { name: 'Mis Documentos' })).toBeVisible();

    const confirmCreateResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/documents/confirm') && response.request().method() === 'POST'
    );

    await page.getByRole('button', { name: 'Subir Documento' }).click();
    await page.locator('input[type="file"]').setInputFiles({
      name: uploadedDocumentName,
      mimeType: 'text/plain',
      buffer: Buffer.from('Documento de prueba para versionado E2E'),
    });
    await page.getByRole('button', { name: 'Subir y Firmar' }).click();
    await selectFirstSavedWallet(page, getHardhatAddress(seedUsers.owner.walletIndex));

    await expect(page.getByText('¡Documento subido exitosamente!')).toBeVisible({ timeout: 45000 });

    const confirmCreateResponse = await confirmCreateResponsePromise;
    expect(confirmCreateResponse.ok()).toBeTruthy();
    const confirmCreateBody = await confirmCreateResponse.json();
    const uploadedDocumentId = confirmCreateBody.document.id as string;

    await waitForDocumentStatus(
      request,
      ownerSession.accessToken,
      uploadedDocumentId,
      'SYNCED',
      { timeoutMs: 120000 }
    );

    await page.goto(`/app/documents/${uploadedDocumentId}`);
    await page.getByRole('button', { name: 'Versiones' }).click();
    await page.getByRole('button', { name: 'Subir Nueva Versión' }).click();
    await page.locator('input[type="file"]').setInputFiles({
      name: uploadedDocumentName,
      mimeType: 'text/plain',
      buffer: Buffer.from(`Segunda versión independiente ${Date.now()}`),
    });
    await page.getByRole('button', { name: 'Subir y Firmar' }).click();
    await selectFirstSavedWallet(page, getHardhatAddress(seedUsers.owner.walletIndex));

    await expect(page.getByText(/Nueva versión creada exitosamente/i)).toBeVisible({ timeout: 45000 });
    await expect(page.getByText(/Versión 2/i)).toBeVisible({ timeout: 45000 });
    await expect(page.getByText(/^2$/)).toBeVisible({ timeout: 45000 });

    await expect
      .poll(async () => {
        const response = await request.get(`${API_BASE_URL}/documents/${uploadedDocumentId}/versions`, {
          headers: {
            Authorization: `Bearer ${ownerSession.accessToken}`,
          },
        });

        if (!response.ok()) {
          return false;
        }

        const body = await response.json();
        const secondVersion = (body.versions || []).find((version: { versionNumber: number; blockchainStatus?: string }) => version.versionNumber === 2);
        return secondVersion?.blockchainStatus === 'TX_SUBMITTED' || secondVersion?.blockchainStatus === 'SYNCED';
      }, {
        timeout: 60000,
        intervals: [1000, 2000, 3000],
      })
      .toBeTruthy();

    await page.getByRole('button', { name: /^Activar$/ }).first().click();
    await expect(page.getByText(/Versión 2 establecida como operacional/i)).toBeVisible({ timeout: 30000 });

    const versionsResponse = await request.get(`${API_BASE_URL}/documents/${uploadedDocumentId}/versions`, {
      headers: {
        Authorization: `Bearer ${ownerSession.accessToken}`,
      },
    });
    expect(versionsResponse.ok()).toBeTruthy();
    const versionsBody = await versionsResponse.json();
    expect(versionsBody.versions?.length).toBeGreaterThanOrEqual(2);
    const operationalVersion = (versionsBody.versions || []).find((version: { isOperational?: boolean }) => version.isOperational);
    expect(operationalVersion?.versionNumber).toBe(2);

    await page.goto('/app/documents');
    await expect(page.getByRole('heading', { name: 'Mis Documentos' })).toBeVisible();
  });
});