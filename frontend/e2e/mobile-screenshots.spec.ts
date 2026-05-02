import { expect, test } from '@playwright/test';
import {
  API_BASE_URL,
  installHardhatWallet,
  loginWithStoredSession,
  seedUsers,
  selectFirstSavedWallet,
  setUserEmailVerified,
  waitForDocumentStatus,
} from './helpers';

/**
 * Capturas de pantalla de vistas clave en formato móvil
 * para inclusión en anexos de documentación.
 */
test.describe('Mobile viewport screenshots', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test.describe.configure({ mode: 'serial' });

  test('capture mobile landing page', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium');

    await page.goto('/');
    await expect(page.getByTestId('landing-hero-heading')).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'test-results/mobile-landing.png', fullPage: true });
  });

  test('capture mobile login page', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium');

    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Iniciar Sesión/i })).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'test-results/mobile-login.png', fullPage: true });
  });

  test('capture mobile documents list', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');

    await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });

    await page.goto('/app/documents');
    await expect(page.getByRole('heading', { name: 'Mis Documentos' })).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/mobile-documents-list.png', fullPage: true });
  });

  test('capture mobile document detail', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');

    const session = await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });

    const documentsResponse = await request.get(`${API_BASE_URL}/documents`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    expect(documentsResponse.ok()).toBeTruthy();
    const documentsBody = await documentsResponse.json();
    const document = (documentsBody.documents || [])[0];
    expect(document).toBeTruthy();

    await page.goto(`/app/documents/${document.id}`);
    await expect(page.getByRole('heading', { name: document.name })).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/mobile-document-detail.png', fullPage: true });
  });

  test('capture mobile shared documents', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');

    await loginWithStoredSession(page, request, {
      username: seedUsers.recipient.username,
      password: seedUsers.recipient.password,
    });

    await page.goto('/app/shared');
    await expect(page.getByRole('heading', { name: /Compartidos Conmigo/i })).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/mobile-shared-documents.png', fullPage: true });
  });

  test('capture mobile notifications', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');

    await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });

    await page.goto('/app/notifications');
    await expect(page.getByRole('heading', { name: 'Notificaciones', exact: true })).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/mobile-notifications.png', fullPage: true });
  });

  test('capture mobile settings', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');

    await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });

    await page.goto('/app/settings');
    await expect(page.getByRole('heading', { name: /Configuración|Ajustes/i })).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/mobile-settings.png', fullPage: true });
  });

  test('capture mobile verify page', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium');

    await page.goto('/verify');
    await expect(page.getByRole('heading', { name: 'Verificar Documento' })).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/mobile-verify.png', fullPage: true });
  });

  test('capture mobile admin dashboard', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');

    await loginWithStoredSession(page, request, {
      username: seedUsers.admin.username,
      password: seedUsers.admin.password,
    });

    await page.goto('/app/dashboard');
    await expect(page.getByRole('heading', { name: /Panel de Administración|Dashboard/i })).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/mobile-admin-dashboard.png', fullPage: true });
  });

  test('capture mobile sidebar menu open', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');

    await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });

    await page.goto('/app/documents');
    await expect(page.getByRole('heading', { name: 'Mis Documentos' })).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(1000);

    // Abrir el menú sidebar
    await page.locator('button[aria-label="Abrir menú de navegación"]').click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/mobile-sidebar-open.png', fullPage: false });
  });

  test('capture mobile upload modal', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');
    test.setTimeout(120000);

    await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });
    await installHardhatWallet(page, seedUsers.owner.walletIndex);

    await page.goto('/app/documents');
    await expect(page.getByRole('heading', { name: 'Mis Documentos' })).toBeVisible({ timeout: 20000 });

    await page.getByRole('button', { name: 'Subir Documento' }).click();
    await expect(page.getByRole('heading', { name: /Subir Documento|Nuevo Documento/i })).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/mobile-upload-modal.png', fullPage: false });
  });

  test('capture mobile wallet selector', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');
    test.setTimeout(120000);

    await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });
    await installHardhatWallet(page, seedUsers.owner.walletIndex);

    await page.goto('/app/documents');
    await expect(page.getByRole('heading', { name: 'Mis Documentos' })).toBeVisible({ timeout: 20000 });

    await page.getByRole('button', { name: 'Subir Documento' }).click();
    await expect(page.getByRole('heading', { name: /Subir Documento|Nuevo Documento/i })).toBeVisible({ timeout: 15000 });

    // Seleccionar archivo
    await page.locator('input[type="file"]').setInputFiles({
      name: 'mobile-test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Documento de prueba movil'),
    });
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Subir y Firmar' }).click();
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'test-results/mobile-wallet-selector.png', fullPage: false });
  });

  test('capture mobile 2FA setup', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');
    test.setTimeout(120000);

    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const twoFactorUser = {
      username: `mob_2fa_${uniqueSuffix}`,
      email: `mob.2fa.${uniqueSuffix}@documentchain.local`,
      password: 'Admin123!',
      fullName: 'Mob 2FA User',
    };

    const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
      data: twoFactorUser,
    });
    expect(registerResponse.ok()).toBeTruthy();
    setUserEmailVerified(twoFactorUser.email);

    await page.goto('/login');
    await page.getByLabel('Nombre de usuario o Email').fill(twoFactorUser.username);
    await page.getByLabel('Contraseña').fill(twoFactorUser.password);
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await expect(page).toHaveURL(/\/app\/documents$/);

    await page.goto('/app/settings');
    await page.getByRole('tab', { name: 'Seguridad y Cuenta' }).click();
    await page.getByRole('button', { name: 'Configurar 2FA' }).click();
    await expect(page.getByAltText('QR Code')).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/mobile-2fa-setup.png', fullPage: false });
  });

  test('capture mobile blockchain auditor', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');

    await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });

    await page.goto('/app/blockchain');
    await expect(page.getByRole('heading', { name: /Auditoría Blockchain|Blockchain Auditor/i })).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/mobile-blockchain-auditor.png', fullPage: true });
  });

  test('capture mobile register page', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium');

    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /Registro|Crear Cuenta/i })).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/mobile-register.png', fullPage: true });
  });
});
