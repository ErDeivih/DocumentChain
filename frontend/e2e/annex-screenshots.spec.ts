import { expect, test, type APIRequestContext, type Locator, type Page } from '@playwright/test';
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
  setUserEmailVerified,
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

async function captureModalByTitle(page: Page, title: string | RegExp, fileName: string) {
  const titleLocator = typeof title === 'string'
    ? page.getByRole('heading', { name: title, exact: true })
    : page.getByRole('heading', { name: title });
  await expect(titleLocator).toBeVisible({ timeout: 15000 });
  const modal = titleLocator.locator(
    'xpath=ancestor::div[contains(@class,"relative") and contains(@class,"w-full")][1]'
  );
  await capture(modal, fileName);
}

async function getAnnexDocument(
  request: APIRequestContext,
  accessToken: string
): Promise<{ id: string; name: string; signedVersionNumber: number; latestVersionNumber: number }> {
  const listResponse = await request.get(`${API_BASE_URL}/documents?limit=100`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  expect(listResponse.ok()).toBeTruthy();

  const listBody = (await listResponse.json()) as {
    documents?: Array<{ id: string; name: string; isArchived?: boolean }>;
  };

  let fallbackDocument: { id: string; name: string; signedVersionNumber: number; latestVersionNumber: number } | null = null;

  for (const document of listBody.documents ?? []) {
    if (document.isArchived) {
      continue;
    }

    const versionsResponse = await request.get(`${API_BASE_URL}/documents/${document.id}/versions`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!versionsResponse.ok()) {
      continue;
    }

    const versionsBody = (await versionsResponse.json()) as {
      versions?: Array<{ versionNumber: number }>;
    };
    const versions = versionsBody.versions ?? [];
    if (versions.length < 2) {
      continue;
    }

    const latestVersionNumber = Math.max(...versions.map(({ versionNumber }) => versionNumber));
    fallbackDocument ??= {
      id: document.id,
      name: document.name,
      signedVersionNumber: latestVersionNumber,
      latestVersionNumber,
    };

    for (const version of versions) {
      const signaturesResponse = await request.get(
        `${API_BASE_URL}/documents/${document.id}/versions/${version.versionNumber}/signatures`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!signaturesResponse.ok()) {
        continue;
      }

      const signaturesBody = (await signaturesResponse.json()) as {
        signatures?: Array<unknown>;
      };

      if ((signaturesBody.signatures ?? []).length > 0) {
        return {
          id: document.id,
          name: document.name,
          signedVersionNumber: version.versionNumber,
          latestVersionNumber,
        };
      }
    }
  }

  if (fallbackDocument) {
    return fallbackDocument;
  }

  throw new Error('No se encontro un documento sembrado con varias versiones y firmantes para el anexo.');
}

async function waitForLogsViewerReady(page: Page) {
  await expect(page.getByText('Visor de Logs del Sistema')).toBeVisible({ timeout: 20000 });
  await expect(page.getByText(/Mostrando\s+\d+\s+de\s+\d+\s+líneas solicitadas/i)).toBeVisible({ timeout: 30000 });
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

    await page.goto('/');
    await expect(page.getByTestId('landing-hero-heading')).toBeVisible();
    await capture(page, 'landing-public.png');

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
    await page.getByRole('button', { name: /continuar/i }).click();
    await expect(page.getByText(/¡Cuenta creada con éxito!/i)).toBeVisible({ timeout: 15000 });
    await capture(page, 'register-success.png');

    await clearStoredSession(page);

    const ownerSession = await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });
    await installHardhatWallet(page, seedUsers.owner.walletIndex);
    const annexDocument = await getAnnexDocument(request, ownerSession.accessToken);

    await page.goto('/app/documents');
    await expect(page.getByRole('heading', { name: 'Mis Documentos' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Subir Documento' })).toBeVisible();
    await capture(page, 'documents-page.png');

    await page.getByRole('button', { name: 'Nueva Carpeta' }).click();
    await expect(page.getByText('Crear Nueva Carpeta')).toBeVisible();
    await capture(page, 'create-folder-modal.png');
    await page.getByRole('button', { name: 'Cancelar' }).click();

    await page.getByRole('button', { name: 'Subir Documento' }).click();
    await expect(page.getByRole('heading', { name: 'Subir Documento' })).toBeVisible();
    await capture(page, 'upload-modal.png');
    await page.getByRole('button', { name: 'Cancelar' }).click();

    await page.goto(`/app/documents/${annexDocument.id}`);
    await expect(page.getByText(annexDocument.name, { exact: true })).toBeVisible({ timeout: 30000 });
    await capture(page, 'document-detail.png');

    await page.getByRole('button', { name: 'Descargar' }).click();
    await expect(page.getByText('Descargar Documento')).toBeVisible();
    await capture(page, 'download-modal.png');
    await page.getByRole('button', { name: 'Cancelar' }).click();

    await page.getByRole('button', { name: 'Firmar Documento' }).click();
    await expect(page.getByText(/versi[oó]n a firmar/i)).toBeVisible();
    const signModalTitle = page.getByRole('heading', { name: 'Firmar Documento', exact: true });
    const commentField = page.getByLabel('Comentario (opcional)');
    const alreadySignedAlert = page.getByRole('alert').filter({ hasText: /ya has firmado esta versi[oó]n/i });
    await expect(commentField.or(alreadySignedAlert)).toBeVisible({ timeout: 15000 });
    await captureModalByTitle(page, 'Firmar Documento', 'sign-modal.png');
    if (await alreadySignedAlert.isVisible()) {
      await page.getByRole('button', { name: 'Cancelar' }).click();
    } else {
      await expect(page.getByText('Verificando estado de firma...')).not.toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('button', { name: /^Firmar Documento$/ }).last()).toBeEnabled({ timeout: 15000 });
      await commentField.fill('Firma de validación para las capturas del anexo');
      await page.getByRole('button', { name: /^Firmar Documento$/ }).last().click();
      await expect(page.getByTestId('wallet-selector-modal')).toBeVisible({ timeout: 15000 });
      await capture(page.getByTestId('wallet-selector-modal'), 'wallet-selector-modal.png');
      await selectFirstSavedWallet(page, getHardhatAddress(seedUsers.owner.walletIndex));
      await expect(page.getByTestId('wallet-selector-modal')).not.toBeVisible({ timeout: 30000 });
      await expect(signModalTitle).not.toBeVisible({ timeout: 45000 });
      await waitForDocumentStatus(request, ownerSession.accessToken, annexDocument.id, 'SYNCED', {
        timeoutMs: 120000,
      });
    }

    await page.getByRole('button', { name: 'Compartir' }).click();
    await expect(page.getByText('Compartir Documento')).toBeVisible();
    await capture(page, 'share-modal.png');
    await page.getByRole('button', { name: 'Cancelar' }).click();

    await page.getByRole('button', { name: 'Versiones' }).click();
    await expect(page.getByText(/versiones del documento/i)).toBeVisible();
    await expect(page.getByText('Versión 1')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(`Versión ${annexDocument.latestVersionNumber}`)).toBeVisible({ timeout: 15000 });
    await capture(page, 'versions-tab.png');
    await page.getByTestId(`view-signers-v${annexDocument.signedVersionNumber}`).click();
    await expect(page.getByText('Perfil del firmante')).toBeVisible({ timeout: 15000 });
    await captureModalByTitle(page, /Firmantes de la versión \d+/, 'signers-modal.png');
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
    await page.waitForFunction(() => {
      const bodyText = document.body.innerText;
      const hasLoadedTimelineState =
        bodyText.includes('Historial del Documento') ||
        bodyText.includes('No hay eventos en el historial de este documento') ||
        bodyText.includes('Error');

      return !document.querySelector('.animate-pulse') && hasLoadedTimelineState;
    }, { timeout: 15000 });
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
    await expect(page.getByText('5/5 Wallets')).toBeVisible({ timeout: 20000 });
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
    await waitForLogsViewerReady(page);
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
    setUserEmailVerified(twoFactorUser.email);

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