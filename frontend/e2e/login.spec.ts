import { test, expect } from '@playwright/test';
import { seedUsers } from './helpers';

test.describe('Login Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/DecentralizedStore/);
    await expect(page.getByText('Iniciar Sesión - DecentralizedStore')).toBeVisible();
    await expect(page.getByLabel('Nombre de usuario o Email')).toBeVisible();
    await expect(page.getByLabel('Contraseña')).toBeVisible();
  });

  test('should show an authentication error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Nombre de usuario o Email').fill('usuario-invalido');
    await page.getByLabel('Contraseña').fill('Credencial123!');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await expect(page.getByRole('alert')).toContainText(/inválido|credenciales/i);
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('link', { name: 'Regístrese aquí' }).click();
    await expect(page).toHaveURL(/.*register/);
  });

  test('should allow requesting a password reset from the forgot password page', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: '¿Olvidó su contraseña?' }).click();

    await expect(page).toHaveURL(/.*forgot-password/);
    const forgotPasswordResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/auth/forgot-password') && response.request().method() === 'POST'
    );
    await page.getByLabel('Dirección de Email').fill(seedUsers.owner.email);
    await page.getByRole('button', { name: 'Enviar Enlace de Restablecimiento' }).click();

    const forgotPasswordResponse = await forgotPasswordResponsePromise;
    expect(forgotPasswordResponse.ok()).toBeTruthy();

    await expect(page.getByRole('heading', { name: /Compruebe Su Email/i })).toBeVisible({ timeout: 15000 });
  });

  test('should validate invalid email format on the forgot password page', async ({ page }) => {
    await page.goto('/forgot-password');

    const emailInput = page.getByLabel('Dirección de Email');
    await emailInput.fill('correo-invalido');
    await page.getByRole('button', { name: 'Enviar Enlace de Restablecimiento' }).click();

    await expect(emailInput).toBeFocused();
    await expect
      .poll(() => emailInput.evaluate((element) => (element as HTMLInputElement).validationMessage))
      .toMatch(/@|email/i);
  });

  test('should show the invalid token state on reset password when no token is present', async ({ page }) => {
    await page.goto('/reset-password');

    await expect(page.getByText(/Token de restablecimiento inválido o faltante/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Volver al Inicio de Sesión/i })).toBeVisible();
  });

  test('should validate password confirmation on the reset password page', async ({ page }) => {
    await page.goto('/reset-password?token=test-reset-token');

    await page.locator('input[name="recoveryKey"]').fill('recovery-key-demo');
    await page.locator('input[name="newPassword"]').fill('NuevaPass123!');
    await page.locator('input[name="confirmPassword"]').fill('OtraPass123!');
    await page.getByRole('button', { name: 'Restablecer Contraseña' }).click();

    await expect(page.getByText(/Las contraseñas no coinciden/i)).toBeVisible();
  });
});

test.describe('Home Page', () => {
  test('should display home page when not authenticated', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/$/);
  });
});
