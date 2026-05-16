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

test.describe('Additional App Features', () => {
  test('seed user can create a folder from the documents page and it persists in the API', async ({ page, request, browserName }) => {
    const session = await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });

    const folderName = `e2e-folder-${Date.now()}`;
    const folderDescription = 'Carpeta creada desde Playwright para ampliar cobertura';

    await page.goto('/app/documents');
    await expect(page.getByRole('heading', { name: 'Mis Documentos' })).toBeVisible();

    await page.getByRole('button', { name: 'Nueva Carpeta' }).click();
    await expect(page.getByText('Crear Nueva Carpeta')).toBeVisible();

    await page.getByPlaceholder('Ingrese nombre de la carpeta').fill(folderName);
    await page.getByPlaceholder('Ingrese descripción de la carpeta').fill(folderDescription);
    await page.getByRole('button', { name: 'Crear Carpeta' }).click();

    await expect(page.getByText('Crear Nueva Carpeta')).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText(folderName)).toBeVisible({ timeout: 15000 });

    const foldersResponse = await request.get(`${API_BASE_URL}/folders`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    expect(foldersResponse.ok()).toBeTruthy();

    const foldersBody = await foldersResponse.json();
    const createdFolder = (foldersBody.folders || []).find((folder: { id: string; name: string; description?: string | null }) => folder.name === folderName);

    expect(createdFolder).toBeTruthy();
    expect(createdFolder.description).toBe(folderDescription);

    const deleteResponse = await request.delete(`${API_BASE_URL}/folders/${createdFolder.id}?deleteContents=false`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    expect(deleteResponse.ok()).toBeTruthy();
  });

  test('seed user can persist notification preferences from settings', async ({ page, request, browserName }) => {
    const session = await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });

    await page.goto('/app/settings');
    await page.getByRole('tab', { name: 'Seguridad y Cuenta' }).click();

    const emailSwitch = page.getByRole('switch', { name: 'Recibir correos de notificación' });
    const sharedSwitch = page.getByRole('switch', { name: 'Notificaciones de documentos compartidos' });
    const versionSwitch = page.getByRole('switch', { name: 'Notificaciones de nuevas versiones' });
    const pushSwitch = page.getByRole('switch', { name: 'Notificaciones push en la aplicación' });

    await expect(emailSwitch).toBeVisible();

    const initialEmailState = await emailSwitch.getAttribute('aria-checked');
    const initialSharedState = await sharedSwitch.getAttribute('aria-checked');
    const initialVersionState = await versionSwitch.getAttribute('aria-checked');
    const initialPushState = await pushSwitch.getAttribute('aria-checked');

    const toggleAndWait = async (toggle: typeof sharedSwitch) => {
      const currentState = await toggle.getAttribute('aria-checked');
      const nextState = currentState === 'true' ? 'false' : 'true';

      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-checked', nextState);
      await expect(page.getByText('Preferencias de notificación actualizadas.')).toBeVisible({ timeout: 15000 });
    };

    await toggleAndWait(sharedSwitch);
    await toggleAndWait(versionSwitch);
    await toggleAndWait(pushSwitch);

    const preferencesResponse = await request.get(`${API_BASE_URL}/notifications/preferences`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    expect(preferencesResponse.ok()).toBeTruthy();
    const preferencesBody = await preferencesResponse.json();
    expect(preferencesBody.data.typePreferences.FILE_SHARED).toBe(initialSharedState !== 'true');
    expect(preferencesBody.data.typePreferences.NEW_VERSION).toBe(initialVersionState !== 'true');
    expect(preferencesBody.data.pushEnabled).toBe(initialPushState !== 'true');
    expect(preferencesBody.data.emailEnabled).toBe(initialEmailState === 'true');

    await page.reload();
    await page.getByRole('tab', { name: 'Seguridad y Cuenta' }).click();

    await expect(sharedSwitch).toHaveAttribute('aria-checked', initialSharedState === 'true' ? 'false' : 'true');
    await expect(versionSwitch).toHaveAttribute('aria-checked', initialVersionState === 'true' ? 'false' : 'true');
    await expect(pushSwitch).toHaveAttribute('aria-checked', initialPushState === 'true' ? 'false' : 'true');

    await toggleAndWait(sharedSwitch);
    await toggleAndWait(versionSwitch);
    await toggleAndWait(pushSwitch);
  });

  test('seed wallet user can view timeline events for a freshly uploaded document', async ({ page, request, browserName }) => {
    test.setTimeout(150000);

    const session = await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });
    await installHardhatWallet(page, seedUsers.owner.walletIndex);

    const documentName = `timeline-e2e-${Date.now()}.txt`;

    await page.goto('/app/documents');

    const confirmCreateResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/documents/confirm') && response.request().method() === 'POST'
    );

    await page.getByRole('button', { name: 'Subir Documento' }).click();
    await page.locator('input[type="file"]').setInputFiles({
      name: documentName,
      mimeType: 'text/plain',
      buffer: Buffer.from('Documento de prueba para timeline E2E'),
    });
    await page.getByRole('button', { name: 'Subir y Firmar' }).click();
    await selectFirstSavedWallet(page, getHardhatAddress(seedUsers.owner.walletIndex));

    const confirmCreateResponse = await confirmCreateResponsePromise;
    expect(confirmCreateResponse.ok()).toBeTruthy();
    const confirmCreateBody = await confirmCreateResponse.json();
    const documentId = confirmCreateBody.document.id;

    await waitForDocumentStatus(request, session.accessToken, documentId, 'SYNCED', {
      timeoutMs: 120000,
    });

    await page.goto(`/app/documents/${documentId}`);
    await page.getByRole('button', { name: 'Historial' }).click();

    await expect(page.getByText('Historial del Documento')).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('Nueva versión')).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(/Versión 1 creada por/i)).toBeVisible({ timeout: 30000 });
  });
});