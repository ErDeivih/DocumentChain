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

test.describe('Public document publishing', () => {
  test('owner can publish a document and access it through the public page', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');
    test.setTimeout(180000);

    const ownerSession = await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });
    await installHardhatWallet(page, seedUsers.owner.walletIndex);

    const documentName = `public-e2e-${Date.now()}.txt`;
    const documentContent = `Documento publico ${Date.now()}`;

    await page.goto('/app/documents');
    await page.getByRole('button', { name: 'Subir Documento' }).click();

    const prepareCreateResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/documents/prepare') && response.request().method() === 'POST'
    );

    const confirmCreateResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/documents/confirm') && response.request().method() === 'POST'
    );

    await page.locator('input[type="file"]').setInputFiles({
      name: documentName,
      mimeType: 'text/plain',
      buffer: Buffer.from(documentContent),
    });

    await page.getByRole('switch').click();
    const submitButton = page.getByRole('button', { name: 'Subir y Firmar' });
    await submitButton.scrollIntoViewIfNeeded();
    await expect(submitButton).toBeVisible();
    await submitButton.click();
    await selectFirstSavedWallet(page, getHardhatAddress(seedUsers.owner.walletIndex));

    await expect(page.getByText('¡Documento subido exitosamente!')).toBeVisible({ timeout: 45000 });

    const prepareCreateResponse = await prepareCreateResponsePromise;
    expect(prepareCreateResponse.ok()).toBeTruthy();
    const prepareCreateBody = await prepareCreateResponse.json();

    const confirmCreateResponse = await confirmCreateResponsePromise;
    expect(confirmCreateResponse.ok()).toBeTruthy();
    const confirmCreateBody = await confirmCreateResponse.json();
    const documentId = confirmCreateBody.document.id as string;
    await waitForDocumentStatus(request, ownerSession.accessToken, documentId, 'SYNCED', {
      timeoutMs: 120000,
    });

    const documentResponse = await request.get(`${API_BASE_URL}/documents/${documentId}`, {
      headers: {
        Authorization: `Bearer ${ownerSession.accessToken}`,
      },
    });
    expect(documentResponse.ok()).toBeTruthy();
    const documentBody = await documentResponse.json();
    const publicId = (documentBody.document.publicId ?? confirmCreateBody.document.publicId ?? prepareCreateBody.publicId) as
      | string
      | undefined;

    expect(documentBody.document.visibility).toBe('PUBLIC');
    expect(publicId).toBeTruthy();

    await page.goto(`/public/d/${publicId}`);

    await expect(page.getByRole('heading', { name: documentName })).toBeVisible();
    await expect(page.getByText(documentContent)).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(/Documento público publicado sin cifrado/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Descargar' })).toBeVisible();
    await expect(page.getByText('Versión 1')).toBeVisible();
  });
});