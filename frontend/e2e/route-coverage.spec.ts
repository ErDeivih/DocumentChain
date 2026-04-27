import { expect, test } from '@playwright/test';
import {
  getHardhatAddress,
  installHardhatWallet,
  loginWithStoredSession,
  seedUsers,
} from './helpers';

test.describe('Route coverage gaps', () => {
  test('unauthenticated users are redirected to login when opening a protected route', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium');

    await page.goto('/app/settings');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText('Iniciar Sesión - DocumentChain')).toBeVisible();
    await expect(page.getByLabel('Nombre de usuario o Email')).toBeVisible();
  });

  test('register route can complete the UI flow and show the verification-required confirmation', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium');

    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const registerUser = {
      username: `sofia_registro_${uniqueSuffix}`,
      email: `sofia.registro.${uniqueSuffix}@documentchain.local`,
      password: 'Register123!',
      fullName: 'Sofia Ramos',
    };

    await page.goto('/register');

    await expect(page.getByRole('heading', { name: 'Crear Cuenta' })).toBeVisible();
    await page.getByLabel('Nombre de usuario').fill(registerUser.username);
    await page.getByLabel('Email').fill(registerUser.email);
    await page.getByLabel('Nombre completo (opcional)').fill(registerUser.fullName);
    await page.getByLabel(/^Contraseña$/).fill(registerUser.password);
    await page.getByLabel('Confirmar Contraseña').fill(registerUser.password);
    await expect(page.getByText(/La wallet se enlaza más adelante desde el perfil/i)).toBeVisible();

    await page.getByRole('button', { name: 'Registrarse' }).click();

    await expect(page.getByText(/Guarde Su Clave de Recuperación/i)).toBeVisible({ timeout: 20000 });
    await page.getByRole('checkbox', { name: /Confirmo que he guardado mi clave de recuperación/i }).check();
    await page.getByRole('button', { name: /Continuar/i }).click();

    await expect(page.getByRole('heading', { name: '¡Cuenta creada con éxito!' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Debes verificarlo antes de iniciar sesión/i)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ir a Iniciar Sesión' })).toBeVisible();
  });

  test('seed owner can access the protected verify route and the profile wallet view', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');

    await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });

    await page.goto('/app/verify');
    await expect(page.getByRole('heading', { name: 'Verificar Documento' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Subir Archivo' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Hash IPFS' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'ID Blockchain' })).toBeVisible();

    await page.goto('/app/profile');
    await expect(page.getByRole('heading', { name: 'Perfil', exact: true })).toBeVisible();
    const userInformationCard = page.getByTestId('profile-user-information-card');
    await expect(userInformationCard.getByText(seedUsers.owner.username, { exact: true })).toBeVisible();
    await expect(userInformationCard.getByText(seedUsers.owner.email, { exact: true })).toBeVisible();
    await expect(page.getByText('Gestión de Wallets')).toBeVisible();
    await expect(page.getByText(new RegExp(getHardhatAddress(seedUsers.owner.walletIndex), 'i'))).toBeVisible();
  });

  test('admin can open the dashboard, user management, and logs tabs', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');

    await loginWithStoredSession(page, request, {
      username: seedUsers.admin.username,
      password: seedUsers.admin.password,
    });

    await page.goto('/app/dashboard');

    await expect(page.getByRole('heading', { name: 'Panel de Administración' })).toBeVisible();
    await expect(page.getByText('Total Users')).toBeVisible();
    await expect(page.getByText('Total Documents')).toBeVisible();
    await expect(page.getByRole('tab', { name: /Gestión de Usuarios/i })).toBeVisible();

    await page.getByRole('tab', { name: /Gestión de Usuarios/i }).click();
    await expect(page.getByRole('button', { name: 'Crear Admin' })).toBeVisible();
    await expect(page.getByText(/Administradores \(/i)).toBeVisible();

    await page.getByRole('tab', { name: /Logs del Sistema/i }).click();
    await expect(page.getByText('Visor de Logs del Sistema')).toBeVisible();
    await expect(page.getByRole('button', { name: /Recargar/i })).toBeVisible();
  });

  test('non-admin users are redirected away from the dashboard route', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');

    await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });

    await page.goto('/app/dashboard');

    await expect(page).toHaveURL(/\/app\/documents$/);
    await expect(page.getByRole('heading', { name: 'Mis Documentos' })).toBeVisible();
  });

  test('seed owner can inspect blockchain auditor filters and expand an event', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');

    await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });
    await installHardhatWallet(page, seedUsers.owner.walletIndex);

    await page.goto('/app/blockchain');

    await expect(page.getByRole('heading', { name: 'Auditoría Blockchain' })).toBeVisible();
    await page.getByRole('button', { name: /Filtros/i }).click();
    await expect(page.getByText('Filtros avanzados')).toBeVisible();

    await page.getByRole('button', { name: /Documento Creado/i }).click();
    await page.getByRole('button', { name: 'Buscar eventos' }).click();

    await expect(page.getByText(/Eventos \(/)).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('Cargando eventos...')).not.toBeVisible({ timeout: 30000 });

    const emptyState = page.getByText('No se encontraron eventos con los filtros actuales');
    const eventRows = page.locator('div.border.rounded-lg.px-3.py-2');

    if ((await eventRows.count()) > 0) {
      const eventRow = eventRows.first();
      await eventRow.getByRole('button').click();
      await expect(page.getByText('Transacción')).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('button', { name: /Copiar Metadata/i })).toBeVisible();
    } else {
      await expect(emptyState).toBeVisible({ timeout: 15000 });
    }
  });
});