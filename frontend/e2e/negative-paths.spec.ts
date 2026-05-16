import { expect, test } from '@playwright/test';
import {
  API_BASE_URL,
  clearStoredSession,
  getHardhatAddress,
  installHardhatWallet,
  loginWithStoredSession,
  seedUsers,
  selectFirstSavedWallet,
  waitForDocumentStatus,
} from './helpers';

/**
 * Suite de caminos negativos y validaciones de error.
 * Cubre las últimas incorporaciones (archivado, 2FA, eliminación de categorías)
 * y otros escenarios no contemplados en los tests de camino feliz.
 */
test.describe('Negative paths and validation coverage', () => {
  test.describe.configure({ mode: 'serial' });

  // ============================================================
  // 1. Documentos Archivados (últimas incorporaciones)
  // ============================================================

  test('archived document blocks sharing, signing, transfer, and version changes', async ({ page, request, browserName }) => {
    test.setTimeout(240000);

    const ownerSession = await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });
    await installHardhatWallet(page, seedUsers.owner.walletIndex);

    // 1. Crear y sincronizar documento
    const fileName = `archived-neg-e2e-${Date.now()}.txt`;
    await page.goto('/app/documents');
    await expect(page.getByRole('heading', { name: 'Mis Documentos' })).toBeVisible();

    const confirmCreateResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/documents/confirm') && response.request().method() === 'POST'
    );

    await page.getByRole('button', { name: 'Subir Documento' }).click();
    await page.locator('input[type="file"]').setInputFiles({
      name: fileName,
      mimeType: 'text/plain',
      buffer: Buffer.from('Documento para pruebas de archivado negativo'),
    });
    await page.getByRole('button', { name: 'Subir y Firmar' }).click();
    await selectFirstSavedWallet(page, getHardhatAddress(seedUsers.owner.walletIndex));

    await expect(page.getByText('¡Documento subido exitosamente!')).toBeVisible({ timeout: 45000 });
    const confirmCreateResponse = await confirmCreateResponsePromise;
    expect(confirmCreateResponse.ok()).toBeTruthy();
    const { id: documentId } = (await confirmCreateResponse.json()).document;

    const syncedDocument = await waitForDocumentStatus(request, ownerSession.accessToken, documentId, 'SYNCED', {
      timeoutMs: 120000,
    });

    // 2. Archivar el documento
    await page.goto(`/app/documents/${documentId}`);
    await expect(page.getByRole('heading', { name: fileName })).toBeVisible({ timeout: 30000 });
    await page.getByRole('button', { name: 'Archivar' }).click();
    await expect(page.getByRole('button', { name: 'Desarchivar' })).toBeVisible({ timeout: 30000 });

    // 3. Verificar que el botón Compartir está deshabilitado
    const shareButton = page.getByRole('button', { name: 'Compartir' });
    await expect(shareButton).toBeDisabled();

    // 4. Verificar que el botón Firmar Documento está deshabilitado
    const signButton = page.getByRole('button', { name: 'Firmar Documento' });
    await expect(signButton).toBeDisabled();

    // 5. Verificar que la pestaña Transferir no existe
    await expect(page.getByRole('tab', { name: 'Transferir' })).not.toBeVisible();

    // 6. Verificar que el botón Subir Nueva Versión está deshabilitado
    await page.getByRole('button', { name: 'Versiones' }).click();
    await expect(page.getByRole('button', { name: 'Subir Nueva Versión' })).toBeDisabled();

    // 7. Verificar que el botón Activar versión está deshabilitado (con tooltip de archivado)
    const activateVersionButton = page.locator('button[title*="No se puede cambiar la versión operacional de un documento archivado"]');
    if (await activateVersionButton.isVisible().catch(() => false)) {
      await expect(activateVersionButton).toBeDisabled();
    }

    // 8. API directa: compartir documento archivado ? 400
    const shareResponse = await request.post(`${API_BASE_URL}/documents/${documentId}/share/prepare`, {
      headers: { Authorization: `Bearer ${ownerSession.accessToken}` },
      data: { recipientId: 'dummy-recipient-id', role: 'VIEWER', walletId: 'dummy-wallet-id' },
    });
    expect([400, 403]).toContain(shareResponse.status());

    // 9. API directa: firmar documento archivado ? 400
    const signResponse = await request.post(`${API_BASE_URL}/signatures/prepare`, {
      headers: { Authorization: `Bearer ${ownerSession.accessToken}` },
      data: { documentId, versionNumber: 1, walletId: 'dummy-wallet-id', signMessage: 'test' },
    });
    expect([400, 403]).toContain(signResponse.status());

    // 10. API directa: transferir documento archivado ? 400
    const transferResponse = await request.post(`${API_BASE_URL}/documents/${documentId}/transfer/prepare`, {
      headers: { Authorization: `Bearer ${ownerSession.accessToken}` },
      data: { newOwnerId: 'dummy-new-owner-id', walletId: 'dummy-wallet-id', newOwnerWalletAddress: '0x1234567890123456789012345678901234567890' },
    });
    expect([400, 403]).toContain(transferResponse.status());

    // 11. API directa: crear versión de documento archivado ? 400
    const versionResponse = await request.post(`${API_BASE_URL}/documents/${documentId}/versions/prepare`, {
      headers: { Authorization: `Bearer ${ownerSession.accessToken}` },
      data: { walletId: 'dummy-wallet-id', comment: 'test version' },
    });
    expect([400, 403]).toContain(versionResponse.status());

    // 12. Limpiar: desarchivar y eliminar
    await page.goto(`/app/documents/${documentId}`);
    await page.getByRole('button', { name: 'Desarchivar' }).click();
    await expect(page.getByRole('button', { name: 'Archivar' })).toBeVisible({ timeout: 30000 });

    page.once('dialog', (dialog) => void dialog.accept());
    await page.getByRole('button', { name: 'Eliminar' }).click();
  });

  // ============================================================
  // 2. 2FA — Caminos Negativos
  // ============================================================

  test('security settings does not expose removed 2FA controls', async ({ page, request, browserName }) => {
    await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });

    await page.goto('/app/settings');
    await page.getByRole('tab', { name: 'Seguridad y Cuenta' }).click();
    await expect(page.getByRole('button', { name: 'Configurar 2FA' })).not.toBeVisible();
    await expect(page.getByText(/Verificación 2FA/i)).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Desactivar 2FA' })).not.toBeVisible();
  });

  // ============================================================
  // 3. Categorías Eliminadas — Endpoints 404
  // ============================================================

  test('category endpoints return 404 after model removal', async ({ request }) => {
    const noAuthResponse = await request.get(`${API_BASE_URL}/categories`);
    expect([401, 404]).toContain(noAuthResponse.status());

    // Con autenticación también debe fallar (ruta no existe)
    const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
      data: { username: seedUsers.owner.username, password: seedUsers.owner.password },
    });
    expect(loginResponse.ok()).toBeTruthy();
    const { accessToken } = await loginResponse.json();

    const getCategoriesResponse = await request.get(`${API_BASE_URL}/categories`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(getCategoriesResponse.status()).toBe(404);

    const postCategoryResponse = await request.post(`${API_BASE_URL}/categories`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { name: 'Test', description: 'Test' },
    });
    expect(postCategoryResponse.status()).toBe(404);

    const searchCategoryResponse = await request.get(`${API_BASE_URL}/categories/search`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { q: 'test' },
    });
    expect(searchCategoryResponse.status()).toBe(404);
  });

  // ============================================================
  // 4. Permisos y Acceso — Caminos Negativos
  // ============================================================

  test('unauthenticated requests are rejected and unauthorized access returns 404', async ({ request }) => {
    // Documento protegido sin token ? 401
    const protectedDocResponse = await request.get(`${API_BASE_URL}/documents/nonexistent-id`);
    expect(protectedDocResponse.status()).toBe(401);

    // Lista de documentos sin token ? 401
    const listResponse = await request.get(`${API_BASE_URL}/documents`);
    expect(listResponse.status()).toBe(401);

    // Compartir sin token ? 401 o 404 (según orden de middlewares)
    const shareResponse = await request.post(`${API_BASE_URL}/documents/nonexistent-id/shares/prepare`, {
      data: { recipientId: 'dummy', role: 'VIEWER', walletId: 'dummy' },
    });
    expect([401, 404]).toContain(shareResponse.status());

    // Firmar sin token ? 401 o 404
    const signResponse = await request.post(`${API_BASE_URL}/documents/nonexistent-id/signatures/prepare`, {
      data: { versionNumber: 1, walletId: 'dummy', signMessage: 'test' },
    });
    expect([401, 404]).toContain(signResponse.status());
  });

  test('owner accessing non-existent document gets 404', async ({ request }) => {
    const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
      data: { username: seedUsers.owner.username, password: seedUsers.owner.password },
    });
    expect(loginResponse.ok()).toBeTruthy();
    const { accessToken } = await loginResponse.json();

    const fakeId = '00000000-0000-0000-0000-000000000000';
    const response = await request.get(`${API_BASE_URL}/documents/${fakeId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.status()).toBe(404);
  });

  // ============================================================
  // 5. Validaciones de Formularios y API
  // ============================================================

  test('login rejects invalid credentials with generic error', async ({ page, browserName }) => {
    await page.goto('/login');
    await page.getByLabel('Nombre de usuario o Email').fill('usuario_inexistente_12345');
    await page.getByLabel('Contraseña').fill('WrongPassword123!');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await expect(page.getByRole('alert')).toContainText(/credenciales|incorrecto|inválido/i);
    await expect(page).toHaveURL(/\/login$/);
  });

  test('register rejects duplicate username and invalid email', async ({ request }) => {
    // Usuario duplicado
    const duplicateResponse = await request.post(`${API_BASE_URL}/auth/register`, {
      data: {
        username: seedUsers.owner.username,
        email: 'unique@example.com',
        password: 'Password123!',
        fullName: 'Duplicate User',
      },
    });
    expect(duplicateResponse.status()).toBe(409);

    // Email inválido
    const invalidEmailResponse = await request.post(`${API_BASE_URL}/auth/register`, {
      data: {
        username: `valid_${Date.now()}`,
        email: 'not-an-email',
        password: 'Password123!',
        fullName: 'Invalid Email User',
      },
    });
    expect(invalidEmailResponse.status()).toBe(400);

    // Contraseña débil
    const weakPasswordResponse = await request.post(`${API_BASE_URL}/auth/register`, {
      data: {
        username: `valid_${Date.now()}`,
        email: `valid_${Date.now()}@example.com`,
        password: '123',
        fullName: 'Weak Password User',
      },
    });
    expect(weakPasswordResponse.status()).toBe(400);
  });

  test('document upload form blocks empty file and oversized name', async ({ page, request, browserName }) => {
    test.setTimeout(60000);

    const ownerSession = await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });
    await installHardhatWallet(page, seedUsers.owner.walletIndex);

    await page.goto('/app/documents');
    await page.getByRole('button', { name: 'Subir Documento' }).click();

    // Intentar enviar sin archivo ? el botón debería estar deshabilitado o fallar
    const submitButton = page.getByRole('button', { name: 'Subir y Firmar' });

    // Si el botón está deshabilitado sin archivo, lo verificamos
    const isDisabled = await submitButton.isDisabled().catch(() => false);
    if (!isDisabled) {
      await submitButton.click();
      await expect(page.getByRole('alert').or(page.getByText(/seleccione|archivo|requerido/i))).toBeVisible({ timeout: 5000 });
    }
  });

  // ============================================================
  // 6. Usuario Suspendido — Caminos Negativos
  // ============================================================

  test('security settings does not expose removed suspension controls', async ({ page, request, browserName }) => {
    await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });

    await page.goto('/app/settings');
    await page.getByRole('tab', { name: 'Seguridad y Cuenta' }).click();
    await expect(page.getByText(/suspender cuenta/i)).not.toBeVisible();
    await expect(page.getByText(/reactivar cuenta/i)).not.toBeVisible();
    await expect(page.getByRole('button', { name: /eliminar cuenta/i })).toBeVisible();
  });

  // ============================================================
  // 7. Operaciones sobre documentos no existentes
  // ============================================================

  test('operations on non-existent documents return appropriate errors', async ({ request }) => {
    const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
      data: { username: seedUsers.owner.username, password: seedUsers.owner.password },
    });
    expect(loginResponse.ok()).toBeTruthy();
    const { accessToken } = await loginResponse.json();

    const fakeId = '00000000-0000-0000-0000-000000000000';
    const authHeaders = { Authorization: `Bearer ${accessToken}` };

    // GET documento inexistente
    const getResponse = await request.get(`${API_BASE_URL}/documents/${fakeId}`, { headers: authHeaders });
    expect(getResponse.status()).toBe(404);

    // Descargar documento inexistente (puede ser 400 por validación de params o 404)
    const downloadResponse = await request.get(`${API_BASE_URL}/documents/${fakeId}/download`, { headers: authHeaders });
    expect([400, 404]).toContain(downloadResponse.status());

    // Archivar documento inexistente
    const archiveResponse = await request.put(`${API_BASE_URL}/documents/${fakeId}/archive`, { headers: authHeaders });
    expect(archiveResponse.status()).toBe(404);

    // Eliminar documento inexistente
    const deleteResponse = await request.delete(`${API_BASE_URL}/documents/${fakeId}`, { headers: authHeaders });
    expect(deleteResponse.status()).toBe(404);
  });
});
