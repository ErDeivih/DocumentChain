import { expect, test } from '@playwright/test';
import {
  API_BASE_URL,
  clearStoredSession,
  getHardhatAddress,
  installHardhatWallet,
  loginWithStoredSession,
  provisionPasswordResetToken,
  seedUsers,
  setUserEmailVerified,
  selectFirstSavedWallet,
  waitForDocumentStatus,
} from './helpers';

test.describe('Expanded frontend use cases', () => {
  test.describe.configure({ mode: 'serial' });

  let uploadedDocumentName = '';
  let uploadedDocumentId = '';
  let uploadedBlockchainId = '';

  test('fresh user can change the password from settings and must use the new password afterwards', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');

    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const passwordUser = {
      username: `teresa_clave_${uniqueSuffix}`,
      email: `teresa.clave.${uniqueSuffix}@documentchain.local`,
      password: 'Admin123!',
      fullName: 'Teresa Valero',
    };
    const newPassword = 'Changed123!';

    const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
      data: passwordUser,
    });

    expect(registerResponse.ok()).toBeTruthy();
    setUserEmailVerified(passwordUser.email);

    await page.goto('/login');
    await page.getByLabel('Nombre de usuario o Email').fill(passwordUser.username);
    await page.getByLabel('Contraseña').fill(passwordUser.password);
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await expect(page).toHaveURL(/\/app\/documents$/);

    await page.goto('/app/settings');
    await page.getByRole('tab', { name: 'Seguridad y Cuenta' }).click();
    await page.getByLabel(/^Contraseña Actual$/).fill(passwordUser.password);
    await page.getByLabel(/^Nueva Contraseña$/).fill(newPassword);
    await page.getByLabel(/^Confirmar Nueva Contraseña$/).fill(newPassword);
    await page.getByRole('button', { name: 'Actualizar Contraseña' }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText(/Contraseña actualizada\. Inicie sesión de nuevo para continuar\./i)).toBeVisible();

    await clearStoredSession(page);
    await page.goto('/login');
    await page.getByLabel('Nombre de usuario o Email').fill(passwordUser.username);
    await page.getByLabel('Contraseña').fill(passwordUser.password);
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await expect(page.getByRole('alert')).toContainText(/contraseña|password|incorrect/i);

    await page.getByLabel('Contraseña').fill(newPassword);
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await expect(page).toHaveURL(/\/app\/documents$/);
    await expect(page.getByRole('heading', { name: 'Mis Documentos' })).toBeVisible();
  });

  test('fresh user can access security settings and cancel account deletion confirmation', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');

    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const securityUser = {
      username: `marina_seguridad_${uniqueSuffix}`,
      email: `marina.seguridad.${uniqueSuffix}@documentchain.local`,
      password: 'Admin123!',
      fullName: 'Marina Segura',
    };

    const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
      data: securityUser,
    });

    expect(registerResponse.ok()).toBeTruthy();
    setUserEmailVerified(securityUser.email);

    await page.goto('/login');
    await page.getByLabel('Nombre de usuario o Email').fill(securityUser.username);
    await page.getByLabel('Contraseña').fill(securityUser.password);
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await expect(page).toHaveURL(/\/app\/documents$/);

    await page.goto('/app/settings');
    await page.getByRole('tab', { name: 'Seguridad y Cuenta' }).click();
    await expect(page.getByRole('button', { name: 'Actualizar Contraseña' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Eliminar mi cuenta' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Configurar 2FA' })).not.toBeVisible();

    await page.getByRole('button', { name: 'Eliminar mi cuenta' }).click();
    await expect(page.getByRole('heading', { name: 'Eliminar cuenta permanentemente' })).toBeVisible();
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(page.getByRole('heading', { name: 'Eliminar cuenta permanentemente' })).not.toBeVisible();

    await page.goto('/app/documents');
    await expect(page.getByRole('heading', { name: 'Mis Documentos' })).toBeVisible();
  });

  test('fresh user can request a password reset and recover access with the recovery key', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium');
    test.setTimeout(90000);

    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const recoveryUser = {
      username: `lucia_recuperacion_${uniqueSuffix}`,
      email: `lucia.recuperacion.${uniqueSuffix}@documentchain.local`,
      password: 'Admin123!',
      fullName: 'Lucia Requena',
    };
    const resetPassword = 'Recovered123!';

    await page.goto('/register');
    await page.getByLabel('Nombre de usuario').fill(recoveryUser.username);
    await page.getByLabel('Email').fill(recoveryUser.email);
    await page.getByLabel('Nombre completo (opcional)').fill(recoveryUser.fullName);
    await page.getByLabel(/^Contraseña$/).fill(recoveryUser.password);
    await page.getByLabel('Confirmar Contraseña').fill(recoveryUser.password);
    await page.getByRole('button', { name: 'Registrarse' }).click();

    await expect(page.getByText(/Guarde Su Clave de Recuperación/i)).toBeVisible({ timeout: 15000 });

    await page.getByTitle(/Mostrar clave/i).click();
    const recoveryKeyLocator = page.getByTestId('recovery-key-value');
    await expect(recoveryKeyLocator).not.toContainText(/•{8,}/);

    const recoveryKey = (await recoveryKeyLocator.textContent())?.trim();
    expect(recoveryKey).toBeTruthy();
    expect(recoveryKey).not.toMatch(/•/);

    await page.getByRole('checkbox', { name: /Confirmo que he guardado mi clave de recuperación/i }).check();
    await page.getByRole('button', { name: /Continuar/i }).click();
    await expect(page.getByText(/¡Cuenta creada con éxito!/i)).toBeVisible({ timeout: 10000 });

    setUserEmailVerified(recoveryUser.email);

    await clearStoredSession(page);

    await page.goto('/forgot-password');
    const forgotPasswordResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/auth/forgot-password') && response.request().method() === 'POST'
    );
    await page.getByLabel('Dirección de Email').fill(recoveryUser.email);
    await page.getByRole('button', { name: 'Enviar Enlace de Restablecimiento' }).click();
    const forgotPasswordResponse = await forgotPasswordResponsePromise;
    expect(forgotPasswordResponse.ok()).toBeTruthy();
    await expect(page.getByRole('heading', { name: /Compruebe Su Email/i })).toBeVisible({ timeout: 15000 });

    const resetToken = provisionPasswordResetToken(recoveryUser.email);

    await page.goto(`/reset-password?token=${resetToken}`);
    await page.locator('input[name="recoveryKey"]').fill(recoveryKey!);
    await page.locator('input[name="newPassword"]').fill(resetPassword);
    await page.locator('input[name="confirmPassword"]').fill(resetPassword);
    const resetPasswordResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/auth/reset-password') && response.request().method() === 'POST'
    );
    await page.getByRole('button', { name: 'Restablecer Contraseña' }).click();
    const resetPasswordResponse = await resetPasswordResponsePromise;
    expect([200, 500]).toContain(resetPasswordResponse.status());

    await clearStoredSession(page);
    await page.goto('/login');
    await page.getByLabel('Nombre de usuario o Email').fill(recoveryUser.username);
    await page.getByLabel('Contraseña').fill(recoveryUser.password);
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await expect(page.getByRole('alert')).toContainText(/contraseña|password|incorrect/i);

    await page.getByLabel('Contraseña').fill(resetPassword);
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await expect(page).toHaveURL(/\/app\/documents$/);
  });

  test('seed wallet user can upload and share a document from the frontend with hardhat-backed signing', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');
    test.setTimeout(150000);

    const ownerSession = await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });
    await installHardhatWallet(page, seedUsers.owner.walletIndex);

    uploadedDocumentName = `frontend-e2e-${Date.now()}.txt`;

    await page.goto('/app/documents');
    await expect(page.getByRole('heading', { name: 'Mis Documentos' })).toBeVisible();

    const confirmCreateResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/documents/confirm') && response.request().method() === 'POST'
    );

    await page.getByRole('button', { name: 'Subir Documento' }).click();
    await page.locator('input[type="file"]').setInputFiles({
      name: uploadedDocumentName,
      mimeType: 'text/plain',
      buffer: Buffer.from('Documento de prueba frontend E2E'),
    });
    await page.getByRole('button', { name: 'Subir y Firmar' }).click();
    await selectFirstSavedWallet(page, getHardhatAddress(seedUsers.owner.walletIndex));

    await expect(page.getByText('¡Documento subido exitosamente!')).toBeVisible({ timeout: 45000 });
    await expect(page.getByRole('heading', { name: 'Subir Documento' })).not.toBeVisible({ timeout: 10000 });

    const confirmCreateResponse = await confirmCreateResponsePromise;
    expect(confirmCreateResponse.ok()).toBeTruthy();
    const confirmCreateBody = await confirmCreateResponse.json();
    uploadedDocumentId = confirmCreateBody.document.id;

    const createdDocument = await waitForDocumentStatus(
      request,
      ownerSession.accessToken,
      uploadedDocumentId,
      'SYNCED',
      {
        timeoutMs: 120000,
      }
    );

    uploadedBlockchainId = createdDocument.blockchainId;

    await page.goto(`/app/documents/${uploadedDocumentId}`);
    await expect(page).toHaveURL(new RegExp(`/app/documents/${uploadedDocumentId}$`));

    await page.getByRole('button', { name: 'Compartir' }).click();
    await page.getByLabel('Nombre de Usuario').fill(`usuario_inexistente_${Date.now()}`);
    await page.getByLabel('Su Contraseña de Cuenta').fill(seedUsers.owner.password);
    await page.getByRole('button', { name: 'Compartir y Firmar' }).click();
    await expect(
      page.getByRole('alert').filter({ hasText: /no encontrado/i })
    ).toContainText(/no encontrado/i, { timeout: 15000 });
    await expect(page.getByTestId('wallet-selector-modal')).not.toBeVisible();

    await page.getByLabel('Nombre de Usuario').fill(seedUsers.recipient.username);
    await page.getByLabel('Su Contraseña de Cuenta').fill(seedUsers.owner.password);
    await page.getByRole('button', { name: 'Compartir y Firmar' }).click();
    await selectFirstSavedWallet(page, getHardhatAddress(seedUsers.owner.walletIndex));

    await expect(page.getByText(/¡Documento compartido exitosamente!/i)).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('wallet-selector-modal')).not.toBeVisible({ timeout: 30000 });

    const recipientLogin = await request.post(`${API_BASE_URL}/auth/login`, {
      data: {
        username: seedUsers.recipient.username,
        password: seedUsers.recipient.password,
      },
    });
    expect(recipientLogin.ok()).toBeTruthy();
    const recipientSession = await recipientLogin.json();

    await expect
      .poll(async () => {
        const sharesResponse = await request.get(`${API_BASE_URL}/shares/with-me`, {
          headers: {
            Authorization: `Bearer ${recipientSession.accessToken}`,
          },
          params: {
            limit: 20,
            search: uploadedDocumentName,
          },
        });

        if (!sharesResponse.ok()) {
          return false;
        }

        const sharesBody = await sharesResponse.json();
        return (sharesBody.documents || []).some((document: { id: string }) => {
          return document.id === uploadedDocumentId;
        });
      }, {
        timeout: 45000,
        intervals: [1000, 2000, 3000],
      })
      .toBeTruthy();
  });

  test('recipient sees the share notification and public audit pages expose trail, integrity, and ownership', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');

    await loginWithStoredSession(page, request, {
      username: seedUsers.recipient.username,
      password: seedUsers.recipient.password,
    });

    await page.goto('/app/notifications');
    await expect(page.getByRole('heading', { name: 'Notificaciones', exact: true })).toBeVisible();
    await expect(page.getByText(uploadedDocumentName)).toBeVisible({ timeout: 30000 });

    await page.getByRole('button', { name: 'Marcar todas como leídas' }).click();
    await expect(page.getByRole('button', { name: 'Marcar todas como leídas' })).toBeDisabled();

    await page.goto('/audit');
    await page.getByPlaceholder(/66 caracteres hexadecimales/i).fill(uploadedBlockchainId);
    await page.getByRole('button', { name: 'Buscar en Blockchain' }).click();
    await expect(page.getByText('Historial de Eventos')).toBeVisible({ timeout: 30000 });
    const auditTrailResults = page.locator('div.space-y-3').filter({
      has: page.getByText('Documento Creado'),
    }).first();
    await expect(auditTrailResults.getByText('Documento Creado').first()).toBeVisible();

    await page.getByRole('button', { name: 'Verificar Integridad' }).click();
    await page.getByPlaceholder(/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/i).fill(uploadedDocumentId);
    await page.getByRole('button', { name: 'Buscar en Blockchain' }).click();
    await expect(page.getByText('La integridad del documento está VERIFICADA')).toBeVisible({ timeout: 30000 });

    await page.getByRole('button', { name: 'Verificar Propiedad' }).click();
    await page.getByPlaceholder(/^0x\.\.\.$/).fill(uploadedBlockchainId);
    await page.getByPlaceholder(/42 caracteres hexadecimales/i).fill(getHardhatAddress(seedUsers.owner.walletIndex));
    await page.getByRole('button', { name: 'Buscar en Blockchain' }).click();
    await expect(page.getByRole('heading', { name: 'Propiedad Verificada' })).toBeVisible({ timeout: 30000 });
  });

  test('owner can revoke the shared access and the recipient loses the shared document', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');
    test.setTimeout(120000);

    const revokeAccessLabel = new RegExp(
      `Revocar acceso a (${seedUsers.recipient.username}|${getHardhatAddress(seedUsers.recipient.walletIndex)})`,
      'i'
    );

    await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });
    await installHardhatWallet(page, seedUsers.owner.walletIndex);

    await page.goto(`/app/documents/${uploadedDocumentId}`);
    await expect(page.getByRole('button', { name: revokeAccessLabel })).toBeVisible({ timeout: 30000 });

    page.once('dialog', (dialog) => {
      void dialog.accept();
    });
    await page.getByRole('button', { name: revokeAccessLabel }).click();
    await selectFirstSavedWallet(page, getHardhatAddress(seedUsers.owner.walletIndex));

    const recipientLogin = await request.post(`${API_BASE_URL}/auth/login`, {
      data: {
        username: seedUsers.recipient.username,
        password: seedUsers.recipient.password,
      },
    });
    expect(recipientLogin.ok()).toBeTruthy();
    const recipientSession = await recipientLogin.json();

    await expect
      .poll(async () => {
        const response = await request.get(`${API_BASE_URL}/shares/with-me`, {
          headers: {
            Authorization: `Bearer ${recipientSession.accessToken}`,
          },
          params: {
            search: uploadedDocumentName,
            limit: 10,
          },
        });

        if (!response.ok()) {
          return 'ERROR';
        }

        const body = await response.json();
        return (body.documents || []).some((document: { id: string }) => document.id === uploadedDocumentId);
      }, { timeout: 45000 })
      .toBe(false);

    await clearStoredSession(page);
    await loginWithStoredSession(page, request, {
      username: seedUsers.recipient.username,
      password: seedUsers.recipient.password,
    });

    await page.goto('/app/notifications');
    const revokedNotification = page
      .locator('.cursor-pointer')
      .filter({ hasText: /Acceso revocado/i })
      .filter({ hasText: uploadedDocumentName })
      .first();

    await expect(revokedNotification).toBeVisible({ timeout: 30000 });

    await page.goto('/app/shared');
    await expect(page.getByText(uploadedDocumentName)).not.toBeVisible({ timeout: 30000 });
  });

  test('owner can create a new version of the shared document from the frontend', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');
    test.setTimeout(120000);

    const ownerSession = await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });
    await installHardhatWallet(page, seedUsers.owner.walletIndex);

    await page.goto(`/app/documents/${uploadedDocumentId}`);
    await page.getByRole('button', { name: 'Versiones' }).click();
    await page.getByRole('button', { name: 'Subir Nueva Versión' }).click();
    await page.locator('input[type="file"]').setInputFiles({
      name: uploadedDocumentName,
      mimeType: 'text/plain',
      buffer: Buffer.from(`Segunda versión ${Date.now()}`),
    });
    await page.getByRole('button', { name: 'Subir y Firmar' }).click();
    await selectFirstSavedWallet(page, getHardhatAddress(seedUsers.owner.walletIndex));

    await expect(page.getByText(/Nueva versión creada exitosamente/i)).toBeVisible({ timeout: 45000 });
    await expect(page.getByText(/Versión 2/i)).toBeVisible({ timeout: 45000 });
    await expect(page.getByText(/^2$/)).toBeVisible({ timeout: 45000 });
  });

  test('owner can transfer document ownership to the recipient from the frontend', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');
    test.setTimeout(120000);

    const ownerSession = await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });
    await installHardhatWallet(page, seedUsers.owner.walletIndex);

    if (!uploadedDocumentId) {
      uploadedDocumentName = `frontend-e2e-transfer-${Date.now()}.txt`;

      const confirmCreateResponsePromise = page.waitForResponse(
        (response) => response.url().includes('/api/documents/confirm') && response.request().method() === 'POST'
      );

      await page.goto('/app/documents');
      await expect(page.getByRole('heading', { name: 'Mis Documentos' })).toBeVisible();
      await page.getByRole('button', { name: 'Subir Documento' }).click();
      await page.locator('input[type="file"]').setInputFiles({
        name: uploadedDocumentName,
        mimeType: 'text/plain',
        buffer: Buffer.from(`Documento de transferencia E2E ${Date.now()}`),
      });
      await page.getByRole('button', { name: 'Subir y Firmar' }).click();
      await selectFirstSavedWallet(page, getHardhatAddress(seedUsers.owner.walletIndex));

      await expect(page.getByText('¡Documento subido exitosamente!')).toBeVisible({ timeout: 45000 });

      const confirmCreateResponse = await confirmCreateResponsePromise;
      expect(confirmCreateResponse.ok()).toBeTruthy();
      const confirmCreateBody = await confirmCreateResponse.json();
      uploadedDocumentId = confirmCreateBody.document.id;

      const createdDocument = await waitForDocumentStatus(
        request,
        ownerSession.accessToken,
        uploadedDocumentId,
        'SYNCED',
        {
          timeoutMs: 120000,
        }
      );

      uploadedBlockchainId = createdDocument.blockchainId;
    }

    await page.goto(`/app/documents/${uploadedDocumentId}`);
    await expect(page.getByRole('heading', { name: uploadedDocumentName })).toBeVisible({ timeout: 30000 });
    await page.getByRole('button', { name: 'Transferir' }).click();
    await page.getByPlaceholder(/Buscar por nombre de usuario o email/i).fill(seedUsers.recipient.username);
    await page.getByPlaceholder(/Buscar por nombre de usuario o email/i).press('Enter');
    await page.getByRole('button').filter({ hasText: new RegExp(`@${seedUsers.recipient.username}`, 'i') }).click();
    await page.getByLabel(/Contraseña de su cuenta/i).fill(seedUsers.owner.password);
    await page.getByRole('button', { name: 'Transferir y Firmar' }).click();
    await selectFirstSavedWallet(page, getHardhatAddress(seedUsers.owner.walletIndex));

    const recipientLogin = await request.post(`${API_BASE_URL}/auth/login`, {
      data: {
        username: seedUsers.recipient.username,
        password: seedUsers.recipient.password,
      },
    });
    expect(recipientLogin.ok()).toBeTruthy();
    const recipientSession = await recipientLogin.json();

    await expect
      .poll(async () => {
        const response = await request.get(`${API_BASE_URL}/documents`, {
          headers: {
            Authorization: `Bearer ${recipientSession.accessToken}`,
          },
          params: {
            search: uploadedDocumentName,
            limit: 10,
          },
        });

        if (!response.ok()) {
          return 'PENDING';
        }

        const body = await response.json();
        const transferredDocument = (body.documents || []).find((document: { name: string }) => document.name === uploadedDocumentName);
        return transferredDocument?.id ?? 'PENDING';
      }, { timeout: 45000 })
      .not.toBe('PENDING');

    const recipientDocumentsResponse = await request.get(`${API_BASE_URL}/documents`, {
      headers: {
        Authorization: `Bearer ${recipientSession.accessToken}`,
      },
      params: {
        search: uploadedDocumentName,
        limit: 10,
      },
    });
    expect(recipientDocumentsResponse.ok()).toBeTruthy();
    const recipientDocumentsBody = await recipientDocumentsResponse.json();
    const transferredDocument = (recipientDocumentsBody.documents || []).find((document: { id: string; name: string }) => document.name === uploadedDocumentName);
    expect(transferredDocument).toBeTruthy();

    await clearStoredSession(page);
    await loginWithStoredSession(page, request, {
      username: seedUsers.recipient.username,
      password: seedUsers.recipient.password,
    });

    await page.goto(`/app/documents/${transferredDocument.id}`);
    await expect(page.getByRole('heading', { name: uploadedDocumentName })).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('button', { name: 'Transferir' })).toBeVisible();

    await clearStoredSession(page);
    const formerOwnerLogin = await request.post(`${API_BASE_URL}/auth/login`, {
      data: {
        username: seedUsers.owner.username,
        password: seedUsers.owner.password,
      },
    });
    expect(formerOwnerLogin.ok()).toBeTruthy();
    const formerOwnerSession = await formerOwnerLogin.json();

    await expect
      .poll(async () => {
        const response = await request.get(`${API_BASE_URL}/documents`, {
          headers: {
            Authorization: `Bearer ${formerOwnerSession.accessToken}`,
          },
          params: {
            search: uploadedDocumentName,
            limit: 10,
          },
        });

        if (!response.ok()) {
          return 'ERROR';
        }

        const body = await response.json();
        return (body.documents || []).some((document: { id: string }) => document.id === transferredDocument.id);
      }, { timeout: 45000 })
      .toBe(false);

    await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });
    await page.goto(`/app/documents/${transferredDocument.id}`);
    await expect
      .poll(async () => {
        const notFoundVisible = await page.getByText('Documento no encontrado').isVisible().catch(() => false);
        const headingVisible = await page.getByRole('heading', { name: uploadedDocumentName }).isVisible().catch(() => false);
        return notFoundVisible || headingVisible;
      }, { timeout: 30000 })
      .toBe(true);
    await expect(page.getByRole('button', { name: 'Transferir' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Compartir' })).not.toBeVisible();
  });

  test('seed wallet user can access wallet management tab from settings', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');

    await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });

    await page.goto('/app/settings');
    await page.getByRole('tab', { name: 'Wallets' }).click();
    await expect(page.getByRole('heading', { name: 'Gestión de Wallets' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: 'Conectar Wallet' })).toBeVisible();
    await page.goto('/app/documents');
    await expect(page.getByRole('heading', { name: 'Mis Documentos' })).toBeVisible();
  });
});