import { expect, test } from '@playwright/test';
import {
  getHardhatAddress,
  installHardhatWallet,
  loginWithStoredSession,
  seedUsers,
} from './helpers';

test.describe('Route coverage gaps', () => {
  test('register route can complete the UI flow and redirect into the profile wallet step', async ({ page, browserName }) => {
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
    await page
      .getByLabel('Tras crear mi cuenta, quiero enlazar una wallet inmediatamente.')
      .check();

    await page.getByRole('button', { name: 'Registrarse' }).click();

    await expect(page.getByText(/Guarde Su Clave de Recuperación/i)).toBeVisible({ timeout: 20000 });
    await page.getByRole('checkbox', { name: /Confirmo que he guardado mi clave de recuperación/i }).check();
    await page.getByRole('button', { name: /Continuar al Panel/i }).click();

    await expect(page).toHaveURL(/\/app\/profile\?connectWallet=1&next=\/app\/documents/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Perfil', exact: true })).toBeVisible();
    await expect(page.getByText('Gestión de Wallets')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Navegador' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Móvil (QR)' })).toBeVisible();
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
    const userInformationCard = page
      .getByRole('heading', { name: 'Información del Usuario', exact: true })
      .locator('xpath=ancestor::div[contains(@class,"rounded-lg")][1]');
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

    const emptyState = page.getByText('No se encontraron eventos con los filtros actuales');
    const eventRow = page.locator('div.border.rounded-lg.px-3.py-2').first();

    if (await eventRow.isVisible().catch(() => false)) {
      await eventRow.getByRole('button').click();
      await expect(page.getByText('Transacción')).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('button', { name: /Copiar Metadata/i })).toBeVisible();
    } else {
      await expect(emptyState).toBeVisible({ timeout: 15000 });
    }
  });
});