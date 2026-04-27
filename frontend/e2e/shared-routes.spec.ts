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

test.describe('Shared route coverage', () => {
  test.describe.configure({ mode: 'serial' });

  let sharedDocumentId = '';
  let sharedDocumentName = '';

  const resolveHardhatIndexForAddress = (address: string): number => {
    const normalizedAddress = address.toLowerCase();

    for (let candidateIndex = 0; candidateIndex <= 9; candidateIndex += 1) {
      if (getHardhatAddress(candidateIndex).toLowerCase() === normalizedAddress) {
        return candidateIndex;
      }
    }

    throw new Error(`No Hardhat wallet index found for address ${address}`);
  };

  const uploadDocumentWithRetry = async (page: Parameters<typeof test>[0]['page'], documentName: string, walletIndex: number) => {
    const rateLimitMessage = page.getByText('Demasiadas solicitudes. Por favor, reduzca la velocidad.');
    const successToast = page.getByText('¡Documento subido exitosamente!');

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      await page.goto('/app/documents');
      await expect(page.getByRole('heading', { name: 'Mis Documentos' })).toBeVisible();

      const confirmCreateResponsePromise = page.waitForResponse(
        (response) => response.url().includes('/api/documents/confirm') && response.request().method() === 'POST'
      );

      await page.getByRole('button', { name: 'Subir Documento' }).click();
      await page.locator('input[type="file"]').setInputFiles({
        name: documentName,
        mimeType: 'text/plain',
        buffer: Buffer.from('Documento de cobertura para rutas compartidas'),
      });
      await page.getByRole('button', { name: 'Subir y Firmar' }).click();

      const initialOutcome = await Promise.race([
        page.getByTestId('wallet-selector-modal').waitFor({ state: 'visible', timeout: 10000 }).then(() => 'wallet'),
        rateLimitMessage.waitFor({ state: 'visible', timeout: 10000 }).then(() => 'rate-limit'),
      ]);

      if (initialOutcome === 'rate-limit') {
        if (attempt === 2) {
          throw new Error('La subida del documento siguio bloqueada por rate limit tras el reintento.');
        }

        await page.waitForTimeout(65000);
        continue;
      }

      await selectFirstSavedWallet(page, getHardhatAddress(walletIndex));

      const completionOutcome = await Promise.race([
        successToast.waitFor({ state: 'visible', timeout: 45000 }).then(() => 'success'),
        rateLimitMessage.waitFor({ state: 'visible', timeout: 45000 }).then(() => 'rate-limit'),
      ]);

      if (completionOutcome === 'success') {
        const confirmCreateResponse = await confirmCreateResponsePromise;
        await expect(successToast).toBeVisible();
        return confirmCreateResponse;
      }

      if (attempt === 2) {
        throw new Error('La subida del documento termino en rate limit incluso tras esperar y reintentar.');
      }

      await page.waitForTimeout(65000);
    }

    throw new Error('No se pudo completar la subida del documento.');
  };

  test('seed owner can create and share a document used for shared-page coverage', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');
    test.setTimeout(240000);

    const ownerSession = await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });
    await installHardhatWallet(page, seedUsers.owner.walletIndex);

    sharedDocumentName = `shared-route-e2e-${Date.now()}.txt`;

    const confirmCreateResponse = await uploadDocumentWithRetry(page, sharedDocumentName, seedUsers.owner.walletIndex);
    expect(confirmCreateResponse.ok()).toBeTruthy();
    const confirmCreateBody = await confirmCreateResponse.json();
    sharedDocumentId = confirmCreateBody.document.id;

    await waitForDocumentStatus(request, ownerSession.accessToken, sharedDocumentId, 'SYNCED', {
      timeoutMs: 120000,
    });

    await page.goto(`/app/documents/${sharedDocumentId}`);
    await page.getByRole('button', { name: 'Compartir' }).click();
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
            search: sharedDocumentName,
          },
        });

        if (!sharesResponse.ok()) {
          return false;
        }

        const body = await sharesResponse.json();
        return (body.documents || []).some((document: { id: string }) => document.id === sharedDocumentId);
      }, { timeout: 45000 })
      .toBeTruthy();
  });

  test('recipient can use the shared-with-me page search, filters, and open the shared document', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');

    const recipientSession = await loginWithStoredSession(page, request, {
      username: seedUsers.recipient.username,
      password: seedUsers.recipient.password,
    });

    await expect
      .poll(async () => {
        const sharesResponse = await request.get(`${API_BASE_URL}/shares/with-me`, {
          headers: {
            Authorization: `Bearer ${recipientSession.accessToken}`,
          },
          params: {
            limit: 20,
            search: sharedDocumentName,
          },
        });

        if (!sharesResponse.ok()) {
          return false;
        }

        const sharesBody = await sharesResponse.json();
        return (sharesBody.documents || []).some((document: { id: string }) => document.id === sharedDocumentId);
      }, {
        timeout: 30000,
        intervals: [1000, 2000, 3000],
      })
      .toBeTruthy();

    await page.goto('/app/shared');

    await expect(page.getByRole('heading', { name: 'Compartidos Conmigo' })).toBeVisible();

    const searchInput = page.getByPlaceholder('Buscar por nombre...');
    await searchInput.fill(sharedDocumentName);

    const sharedDocumentCard = page.getByRole('link', { name: new RegExp(sharedDocumentName, 'i') }).first();
    await expect(sharedDocumentCard).toBeVisible({ timeout: 15000 });

    await page.locator('select').selectOption('pdf');
    await expect(page.getByText(/No se encontraron documentos con esos filtros/i)).toBeVisible({ timeout: 15000 });

    await page.locator('select').selectOption('txt');
    await expect(sharedDocumentCard).toBeVisible({ timeout: 15000 });

    await sharedDocumentCard.click();
    await expect(page).toHaveURL(new RegExp(`/app/documents/${sharedDocumentId}$`));
    await expect(page.getByRole('button', { name: 'Firmar Documento' })).toBeVisible();

    await page.getByRole('button', { name: 'Versiones' }).click();
    await expect(page.getByText(/Solo el propietario puede cambiar la versión operacional/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Subir Nueva Versión' })).toHaveCount(0);
  });

  test('recipient can sign the shared document and the owner receives a document notification', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');
    test.setTimeout(180000);

    const recipientSession = await loginWithStoredSession(page, request, {
      username: seedUsers.recipient.username,
      password: seedUsers.recipient.password,
    });

    const walletsResponse = await request.get(`${API_BASE_URL}/wallets`, {
      headers: {
        Authorization: `Bearer ${recipientSession.accessToken}`,
      },
    });
    expect(walletsResponse.ok()).toBeTruthy();
    const walletsBody = await walletsResponse.json();
    const primaryWallet = (walletsBody.wallets || []).find((wallet: { isPrimary: boolean }) => wallet.isPrimary) || walletsBody.wallets?.[0];
    expect(primaryWallet).toBeTruthy();

    const recipientWalletIndex = resolveHardhatIndexForAddress(primaryWallet.address);
    await installHardhatWallet(page, recipientWalletIndex);

    await page.goto(`/app/documents/${sharedDocumentId}`);
    await expect(page.getByRole('button', { name: 'Firmar Documento' })).toBeVisible({ timeout: 30000 });

    await page.getByRole('button', { name: 'Firmar Documento' }).click();
    await expect(page.getByText('Versión 1')).toBeVisible({ timeout: 15000 });
    await page.getByPlaceholder(/Revisado y aprobado/i).fill('Firma E2E del destinatario compartido');
    await page.getByRole('button', { name: /^Firmar Documento$/ }).last().click();
    await selectFirstSavedWallet(page, getHardhatAddress(recipientWalletIndex));

    await expect(page.getByText('¡Documento firmado!')).toBeVisible({ timeout: 45000 });

    await expect
      .poll(async () => {
        const signaturesResponse = await request.get(`${API_BASE_URL}/documents/${sharedDocumentId}/versions/1/signatures`, {
          headers: {
            Authorization: `Bearer ${recipientSession.accessToken}`,
          },
        });

        if (!signaturesResponse.ok()) {
          return false;
        }

        const signaturesBody = await signaturesResponse.json();
        return (signaturesBody.signatures || []).some((signature: { signerWalletId: string }) => Boolean(signature.signerWalletId));
      }, {
        timeout: 60000,
        intervals: [1000, 2000, 3000],
      })
      .toBeTruthy();

    const ownerLogin = await request.post(`${API_BASE_URL}/auth/login`, {
      data: {
        username: seedUsers.owner.username,
        password: seedUsers.owner.password,
      },
    });
    expect(ownerLogin.ok()).toBeTruthy();
    const ownerSession = await ownerLogin.json();

    await expect
      .poll(async () => {
        const notificationsResponse = await request.get(`${API_BASE_URL}/notifications`, {
          headers: {
            Authorization: `Bearer ${ownerSession.accessToken}`,
          },
          params: {
            take: 50,
          },
        });

        if (!notificationsResponse.ok()) {
          return false;
        }

        const notificationsBody = await notificationsResponse.json();
        return (notificationsBody.notifications || []).some((notification: { type: string; message?: string }) => {
          return notification.type === 'FILE_SIGNED' && (notification.message || '').includes(sharedDocumentName);
        });
      }, {
        timeout: 60000,
        intervals: [1000, 2000, 3000],
      })
      .toBeTruthy();
  });

  test('recipient can inspect the signer profile for the signed version', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');

    const recipientSession = await loginWithStoredSession(page, request, {
      username: seedUsers.recipient.username,
      password: seedUsers.recipient.password,
    });

    const walletsResponse = await request.get(`${API_BASE_URL}/wallets`, {
      headers: {
        Authorization: `Bearer ${recipientSession.accessToken}`,
      },
    });
    expect(walletsResponse.ok()).toBeTruthy();
    const walletsBody = await walletsResponse.json();
    const primaryWallet = (walletsBody.wallets || []).find((wallet: { isPrimary: boolean }) => wallet.isPrimary) || walletsBody.wallets?.[0];
    expect(primaryWallet).toBeTruthy();

    await page.goto(`/app/documents/${sharedDocumentId}`);
    await page.getByRole('button', { name: 'Versiones' }).click();
    await page.getByTestId('view-signers-v1').click();

    await expect(page.getByText('Firmantes de la versión 1')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Perfil del firmante')).toBeVisible({ timeout: 15000 });
    const signerProfilePanel = page.getByTestId('signer-profile-panel');
    await expect(signerProfilePanel.getByText('@diego_ortega')).toBeVisible({ timeout: 15000 });
    await expect(signerProfilePanel.getByText('Cuenta actual')).toBeVisible({ timeout: 15000 });
    await expect(signerProfilePanel).toContainText(primaryWallet.address);
  });

  test('notifications tabs expose share and document events, and a share notification can be deleted', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');

    await loginWithStoredSession(page, request, {
      username: seedUsers.recipient.username,
      password: seedUsers.recipient.password,
    });

    await page.goto('/app/notifications');

    await expect(page.getByRole('heading', { name: 'Notificaciones', exact: true })).toBeVisible();
    const recipientSharedNotificationCard = page.locator('div.cursor-pointer').filter({ hasText: sharedDocumentName }).first();
    await expect(recipientSharedNotificationCard).toBeVisible({ timeout: 30000 });

    await page.getByRole('tab', { name: /Compartidos/i }).click();
    await expect(recipientSharedNotificationCard).toBeVisible({ timeout: 15000 });

    const sharedNotificationCard = recipientSharedNotificationCard;
    await sharedNotificationCard.getByRole('button').click();
    await expect(page.getByText('Notificación eliminada')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(sharedDocumentName)).not.toBeVisible({ timeout: 15000 });

    await page.getByRole('tab', { name: /Todas/i }).click();
    await expect(page.getByText(sharedDocumentName)).not.toBeVisible({ timeout: 15000 });

    await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });

    await page.goto('/app/notifications');
    await expect(page.getByRole('heading', { name: 'Notificaciones', exact: true })).toBeVisible();
    await page.getByRole('tab', { name: /Documentos/i }).click();
    const ownerDocumentNotification = page.locator('p.text-sm.text-muted-foreground').filter({ hasText: sharedDocumentName }).first();
    await expect(ownerDocumentNotification).toBeVisible({ timeout: 30000 });

    await page.getByRole('tab', { name: /No leídas/i }).click();
    await expect(ownerDocumentNotification).toBeVisible({ timeout: 15000 });
  });

});