import { expect, test, type Locator, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import speakeasy from 'speakeasy';
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

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const screenshotDir = path.resolve(currentDir, '../../anexos/capturas-ui');

async function capture(target: Page | Locator, fileName: string) {
  fs.mkdirSync(screenshotDir, { recursive: true });
  await target.screenshot({
    path: path.join(screenshotDir, fileName),
    animations: 'disabled',
  });
}

async function captureModalByTitle(page: Page, title: string, fileName: string) {
  const titleLocator = page.getByRole('heading', { name: title, exact: true });
  await expect(titleLocator).toBeVisible({ timeout: 15000 });
  const modal = titleLocator.locator(
    'xpath=ancestor::div[contains(@class,"relative") and contains(@class,"w-full")][1]'
  );
  await capture(modal, fileName);
}

test.describe('Annex UI screenshots', () => {
  test.describe.configure({ mode: 'serial' });

  test('capture current UI for annex V', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');
    test.setTimeout(240000);

    await page.setViewportSize({ width: 1440, height: 1200 });

    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const annexUser = {
      username: `alicia_romero_${uniqueSuffix}`,
      email: `alicia.romero.${uniqueSuffix}@documentchain.local`,
      password: 'Annex123!',
      fullName: 'Alicia Romero',
    };

    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /iniciar sesi[oó]n/i })).toBeVisible();
    await capture(page, 'login-page.png');

    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /crear cuenta|registro/i })).toBeVisible();
    await page.getByLabel('Nombre de usuario').fill(annexUser.username);
    await page.getByLabel('Email').fill(annexUser.email);
    await page.getByLabel('Nombre completo (opcional)').fill(annexUser.fullName);
    await capture(page, 'register-form.png');

    await page.getByLabel(/^Contraseña$/).fill(annexUser.password);
    await page.getByLabel('Confirmar Contraseña').fill(annexUser.password);
    await page.getByRole('button', { name: 'Registrarse' }).click();

    await expect(page.getByText(/guarde su clave de recuperaci[oó]n/i)).toBeVisible({ timeout: 20000 });
    await capture(page, 'recovery-key-modal.png');
    await page.getByRole('checkbox', { name: /confirmo que he guardado/i }).check();
    await page.getByRole('button', { name: /continuar al panel/i }).click();
    await expect(page).toHaveURL(/\/app\/documents$/);

    await clearStoredSession(page);

    const ownerSession = await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });
    await installHardhatWallet(page, seedUsers.owner.walletIndex);

    await page.goto('/app/documents');
    await expect(page.getByRole('heading', { name: 'Mis Documentos' })).toBeVisible();
    await capture(page, 'documents-page.png');

    await page.getByRole('button', { name: 'Nueva Carpeta' }).click();
    await expect(page.getByText('Crear Nueva Carpeta')).toBeVisible();
    await capture(page, 'create-folder-modal.png');
    await page.getByRole('button', { name: 'Cancelar' }).click();

    await page.getByRole('button', { name: 'Subir Documento' }).click();
    await expect(page.getByRole('heading', { name: 'Subir Documento' })).toBeVisible();
    await capture(page, 'upload-modal.png');

    const documentName = `acta_junta_vecinal_${uniqueSuffix}.txt`;
    const confirmCreateResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/documents/confirm') && response.request().method() === 'POST'
    );

    await page.locator('input[type="file"]').first().setInputFiles({
      name: documentName,
      mimeType: 'text/plain',
      buffer: Buffer.from('Documento de prueba para capturas del anexo.'),
    });
    await page.getByRole('button', { name: 'Subir y Firmar' }).click();
    await expect(page.getByTestId('wallet-selector-modal')).toBeVisible();
    await capture(page.getByTestId('wallet-selector-modal'), 'wallet-selector-modal.png');
    await selectFirstSavedWallet(page, getHardhatAddress(seedUsers.owner.walletIndex));

    const confirmCreateResponse = await confirmCreateResponsePromise;
    expect(confirmCreateResponse.ok()).toBeTruthy();
    const confirmCreateBody = await confirmCreateResponse.json();
    const documentId = confirmCreateBody.document.id as string;

    await waitForDocumentStatus(request, ownerSession.accessToken, documentId, 'SYNCED', {
      timeoutMs: 120000,
    });

    await page.goto(`/app/documents/${documentId}`);
    await expect(page.getByText(documentName, { exact: true })).toBeVisible({ timeout: 30000 });
    await capture(page, 'document-detail.png');

    await page.getByRole('button', { name: 'Descargar' }).click();
    await expect(page.getByText('Descargar Documento')).toBeVisible();
    await capture(page, 'download-modal.png');
    await page.getByRole('button', { name: 'Cancelar' }).click();

    await page.getByRole('button', { name: 'Firmar Documento' }).click();
    await expect(page.getByText(/versi[oó]n a firmar/i)).toBeVisible();
    await expect(page.getByLabel('Comentario (opcional)')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Verificando estado de firma...')).not.toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /^Firmar Documento$/ }).last()).toBeEnabled({ timeout: 15000 });
    await captureModalByTitle(page, 'Firmar Documento', 'sign-modal.png');
    await page.getByRole('button', { name: 'Cancelar' }).click();

    await page.getByRole('button', { name: 'Compartir' }).click();
    await expect(page.getByText('Compartir Documento')).toBeVisible();
    await capture(page, 'share-modal.png');
    await page.getByLabel('Nombre de Usuario').fill(seedUsers.recipient.username);
    await page.getByLabel('Su Contraseña de Cuenta').fill(seedUsers.owner.password);
    await page.getByRole('button', { name: 'Compartir y Firmar' }).click();
    await expect(page.getByTestId('wallet-selector-modal')).toBeVisible();
    await selectFirstSavedWallet(page, getHardhatAddress(seedUsers.owner.walletIndex));
    await expect(page.getByText(/documento compartido exitosamente/i)).toBeVisible({ timeout: 30000 });

    await page.getByRole('button', { name: 'Versiones' }).click();
    await expect(page.getByText(/versiones del documento/i)).toBeVisible();
    await capture(page, 'versions-tab-empty.png');

    await page.getByRole('button', { name: 'Firmar Documento' }).click();
    await expect(page.getByLabel('Comentario (opcional)')).toBeVisible({ timeout: 15000 });
    await page.getByLabel('Comentario (opcional)').fill('Firma para capturas del anexo');
    await page.getByRole('button', { name: /^Firmar Documento$/ }).last().click();
    await expect(page.getByTestId('wallet-selector-modal')).toBeVisible({ timeout: 15000 });
    await selectFirstSavedWallet(page, getHardhatAddress(seedUsers.owner.walletIndex));
    await expect(page.getByText('¡Documento firmado!')).toBeVisible({ timeout: 45000 });
    await expect(page.getByRole('button', { name: 'Versiones' })).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'Versiones' }).click();
    await expect(page.getByTestId('view-signers-v1')).toBeVisible({ timeout: 15000 });
    await capture(page, 'versions-tab.png');
    await page.getByTestId('view-signers-v1').click();
    await expect(page.getByText('Perfil del firmante')).toBeVisible({ timeout: 15000 });
    await captureModalByTitle(page, 'Firmantes de la versión 1', 'signers-modal.png');
    await page.getByRole('button', { name: 'Cerrar' }).click();

    await page.getByRole('button', { name: 'Subir Nueva Versión' }).click();
    await expect(page.getByRole('heading', { name: 'Subir Nueva Versión' })).toBeVisible();
    await capture(page, 'upload-version-modal.png');
    await page.getByRole('button', { name: 'Cancelar' }).last().click({ force: true });
    await expect(page.getByRole('heading', { name: 'Subir Nueva Versión' })).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: 'Transferir' }).click();
    await expect(page.getByText('Transferir Propiedad')).toBeVisible();
    await capture(page, 'transfer-tab.png');

    await page.getByRole('button', { name: 'Historial' }).click();
    await expect(page.getByRole('button', { name: 'Historial' })).toHaveClass(/text-blue-600/, { timeout: 10000 });
    await capture(page, 'timeline-page.png');

    const notificationsResponsePromise = page.waitForResponse((response) => {
      const url = response.url();
      return (
        response.request().method() === 'GET' &&
        url.includes('/api/notifications?') &&
        url.includes('take=100')
      );
    });
    await page.locator('a[href="/app/notifications"]').first().click();
    const notificationsResponse = await notificationsResponsePromise;
    if (notificationsResponse.status() >= 400) {
      const responseBody = await notificationsResponse.text().catch(() => '');
      throw new Error(
        `Notifications page request failed with ${notificationsResponse.status()}: ${responseBody}`
      );
    }
    await page.waitForURL('**/app/notifications');
    await expect(page.getByRole('heading', { name: 'Notificaciones', exact: true })).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Todas las Notificaciones')).toBeVisible({ timeout: 20000 });
    await capture(page, 'notifications-page.png');

    await page.locator('a[href="/app/settings"]').first().click();
    await expect(page.getByRole('heading', { name: 'Configuración' })).toBeVisible({ timeout: 20000 });
    await capture(page, 'settings-page.png');

    await page.evaluate(() => {
      window.history.pushState({}, '', '/app/profile');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await expect(page.getByRole('heading', { name: 'Perfil', exact: true })).toBeVisible({ timeout: 20000 });
    await capture(page, 'profile-page.png');

    await clearStoredSession(page);

    await loginWithStoredSession(page, request, {
      username: seedUsers.recipient.username,
      password: seedUsers.recipient.password,
    });
    await installHardhatWallet(page, seedUsers.recipient.walletIndex);

    await page.goto('/app/shared');
    await expect(page.getByRole('heading', { name: 'Compartidos Conmigo' })).toBeVisible();
    await capture(page, 'shared-page.png');

    await clearStoredSession(page);

    await loginWithStoredSession(page, request, {
      username: seedUsers.admin.username,
      password: seedUsers.admin.password,
    });

    await page.goto('/app/dashboard');
    await expect(page.getByRole('heading', { name: 'Panel de Administración' })).toBeVisible();
    await capture(page, 'admin-dashboard.png');

    await page.getByRole('tab', { name: /gesti[oó]n de usuarios/i }).click();
    await expect(page.getByRole('heading', { name: /usuarios regulares/i })).toBeVisible();
    await capture(page, 'admin-users-tab.png');

    await page.getByRole('tab', { name: /logs del sistema/i }).click();
    await expect(page.getByText('Visor de Logs del Sistema')).toBeVisible();
    await capture(page, 'admin-logs-tab.png');

    await page.goto('/app/blockchain');
    await expect(page.getByRole('heading', { name: 'Auditoría Blockchain' })).toBeVisible();
    await page.getByRole('button', { name: /filtros/i }).click();
    await expect(page.getByText('Filtros avanzados')).toBeVisible();
    await capture(page, 'blockchain-auditor.png');

    await clearStoredSession(page);

    await page.goto('/verify');
    await expect(page.getByRole('heading', { name: 'Verificar Documento' })).toBeVisible();
    await capture(page, 'verify-page.png');

    await page.goto('/audit');
    await expect(page.getByRole('heading', { name: 'Auditoría Blockchain', exact: true })).toBeVisible();
    await capture(page, 'public-audit-page.png');
  });

  test('capture 2FA setup and verification screens', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');
    test.setTimeout(180000);

    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const twoFactorUser = {
      username: `marcos_segura_${uniqueSuffix}`,
      email: `marcos.segura.${uniqueSuffix}@documentchain.local`,
      password: 'Admin123!',
      fullName: 'Marcos Segura',
    };

    const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
      data: twoFactorUser,
    });
    expect(registerResponse.ok()).toBeTruthy();

    await page.goto('/login');
    await page.getByLabel('Nombre de usuario o Email').fill(twoFactorUser.username);
    await page.getByLabel('Contraseña').fill(twoFactorUser.password);
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await expect(page).toHaveURL(/\/app\/documents$/);

    await page.goto('/app/settings');
    await page.getByRole('tab', { name: 'Seguridad' }).click();
    await page.getByRole('button', { name: 'Configurar 2FA' }).click();
    await expect(page.getByAltText('QR Code')).toBeVisible();
    await capture(page, 'two-factor-setup.png');

    const secret = (await page.locator('code').first().textContent())?.trim();
    expect(secret).toBeTruthy();

    await page.getByLabel('Código de Verificación').fill(
      speakeasy.totp({
        secret: secret!,
        encoding: 'base32',
      })
    );
    await page.getByRole('button', { name: 'Verificar y Activar' }).click();
    await expect(page.getByText('¡Guarde estos códigos de respaldo!')).toBeVisible({ timeout: 20000 });
    await page.getByRole('button', { name: 'He guardado los códigos' }).click();
    await expect(page.getByText('¡Guarde estos códigos de respaldo!')).not.toBeVisible({ timeout: 10000 });

    await clearStoredSession(page);
    await page.goto('/login');
    await page.getByLabel('Nombre de usuario o Email').fill(twoFactorUser.username);
    await page.getByLabel('Contraseña').fill(twoFactorUser.password);
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await expect(page.getByText('Verificación 2FA')).toBeVisible();
    await capture(page, 'two-factor-login.png');
  });
});