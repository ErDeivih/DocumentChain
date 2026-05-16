import { expect, test } from '@playwright/test';
import { API_BASE_URL, loginWithStoredSession, seedUsers } from './helpers';

test.describe('Document downloads', () => {
  test('owner can download a document from the detail page', async ({ page, request, browserName }) => {
    test.setTimeout(120000);

    await page.addInitScript(() => {
      (window as Window & { __lastDownload?: { filename: string; href: string } | null }).__lastDownload = null;
      const originalClick = HTMLAnchorElement.prototype.click;

      HTMLAnchorElement.prototype.click = function patchedClick(this: HTMLAnchorElement) {
        if (this.download) {
          (window as Window & { __lastDownload?: { filename: string; href: string } | null }).__lastDownload = {
            filename: this.download,
            href: this.href,
          };
        }

        return originalClick.call(this);
      };
    });

    const session = await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });

    const documentsResponse = await request.get(`${API_BASE_URL}/documents`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    expect(documentsResponse.ok()).toBeTruthy();

    const documentsBody = await documentsResponse.json();
    const syncedDocuments = (documentsBody.documents || []).filter((document: { id: string; name: string; blockchainStatus: string }) => document.blockchainStatus === 'SYNCED');

    let downloadableDocument: { id: string; name: string; blockchainStatus: string } | undefined;
    for (const candidate of syncedDocuments) {
      // Verificar que el documento realmente se puede descargar (tiene versión operacional con IPFS)
      const downloadResponse = await request.get(`${API_BASE_URL}/documents/${candidate.id}/download`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (downloadResponse.ok()) {
        downloadableDocument = candidate;
        break;
      }
    }

    expect(downloadableDocument).toBeTruthy();

    await page.goto(`/app/documents/${downloadableDocument.id}`);
    await expect(page.getByRole('button', { name: 'Descargar' })).toBeVisible();

    await page.getByRole('button', { name: 'Descargar' }).first().click();
    const passwordInput = page.getByPlaceholder('Ingrese su contraseña de cuenta');
    if (await passwordInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await passwordInput.fill(seedUsers.owner.password);
      await expect(passwordInput).toHaveValue(seedUsers.owner.password);
    }
    await page.getByRole('button', { name: 'Descargar' }).last().click();

    // Wait for either an API response or the download anchor to be triggered
    const downloadResponse = await page.waitForResponse(
      (response) =>
        response.url().includes(`/documents/${downloadableDocument.id}/download`) &&
        response.request().method() === 'GET',
      { timeout: 30000 }
    ).catch(() => null);

    if (downloadResponse) {
      expect(downloadResponse.status()).toBe(200);
    }

    await page.waitForFunction(() => Boolean((window as Window & { __lastDownload?: { filename: string } | null }).__lastDownload?.filename));
    const filename = await page.evaluate(
      () => (window as Window & { __lastDownload?: { filename: string } | null }).__lastDownload?.filename ?? ''
    );

    expect(filename).toBeTruthy();
  });
});