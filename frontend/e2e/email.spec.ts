import { expect, test } from '@playwright/test';
import { API_BASE_URL } from './helpers';

test.describe('Public Email And Verification Routes', () => {
  test('landing page should open the public document verification page', async ({ page }) => {
    await page.goto('/');

    await page.locator('main').getByRole('link', { name: 'Verificar Documento' }).click();

    await expect(page).toHaveURL(/\/verify$/);
    await expect(page.getByRole('heading', { name: 'Verificar Documento' })).toBeVisible();
  });

  test('email verification page should confirm a valid token', async ({ page }) => {
    await page.route('**/api/email/verify/test-email-token', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: '¡Email verificado exitosamente! Ya puedes iniciar sesión.',
          username: 'usuario-demo',
        }),
      });
    });

    await page.goto('/verify-email?token=test-email-token');

    await expect(page.getByRole('heading', { name: 'Email verificado' })).toBeVisible();
    await expect(page.getByText('Cuenta confirmada para usuario-demo.')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText('¡Email verificado exitosamente!');
    await expect(page.getByRole('link', { name: 'Ir a iniciar sesión' })).toBeVisible();
  });

  test('email verification page allows manual resend after an invalid token error', async ({ page }) => {
    const recoveryEmail = `reenvio.manual.${Date.now()}@documentchain.local`;

    await page.route('**/api/email/verify/expired-email-token', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'El enlace de verificación no es válido o ha expirado.',
        }),
      });
    });

    await page.route('**/api/email/resend-verification', async (route) => {
      const body = route.request().postDataJSON() as { email?: string };
      expect(body.email).toBe(recoveryEmail);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Email de verificación enviado. Por favor, revisa tu bandeja de entrada.',
        }),
      });
    });

    await page.goto('/verify-email?token=expired-email-token');

    await expect(page.getByRole('heading', { name: 'No se pudo verificar el email' })).toBeVisible();
    await expect(page.getByRole('alert')).toContainText(/no es válido|ha expirado/i);

    await page.getByLabel('Correo para reenviar la verificación').fill(recoveryEmail);
    await page.getByRole('button', { name: 'Reenviar enlace de verificación' }).click();

    await expect(page.getByText(/Email de verificación enviado/i)).toBeVisible();
  });

  test('login exposes a resend path when credentials are valid but the email is still unverified', async ({ page, request }) => {
    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const unverifiedUser = {
      username: `correo_pendiente_${uniqueSuffix}`,
      email: `correo.pendiente.${uniqueSuffix}@documentchain.local`,
      password: 'Verify123!',
      fullName: 'Correo Pendiente',
    };

    const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
      data: unverifiedUser,
    });
    expect(registerResponse.ok()).toBeTruthy();

    await page.route('**/api/email/resend-verification', async (route) => {
      const body = route.request().postDataJSON() as { email?: string };
      expect(body.email).toBe(unverifiedUser.email);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Email de verificación enviado. Por favor, revisa tu bandeja de entrada.',
        }),
      });
    });

    await page.goto('/login');
    await page.getByLabel('Nombre de usuario o Email').fill(unverifiedUser.email);
    await page.getByLabel('Contraseña').fill(unverifiedUser.password);
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await expect(page.getByRole('alert')).toContainText(/Debes verificar tu email antes de iniciar sesión/i);
    await page.getByRole('link', { name: 'Reenviar verificación' }).click();

    await expect(page).toHaveURL(/\/verify-email$/);
    await expect(page.getByLabel('Correo para reenviar la verificación')).toHaveValue(unverifiedUser.email);
    await page.getByRole('button', { name: 'Reenviar enlace de verificación' }).click();
    await expect(page.getByText(/Email de verificación enviado/i)).toBeVisible();
  });

  test('an authenticated but unverified session is redirected to verify-email and can resend from there', async ({ page, request }) => {
    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const stagedUser = {
      username: `flujo_pendiente_${uniqueSuffix}`,
      email: `flujo.pendiente.${uniqueSuffix}@documentchain.local`,
      password: 'Verify123!',
      fullName: 'Flujo Pendiente',
    };

    const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
      data: stagedUser,
    });
    expect(registerResponse.ok()).toBeTruthy();
    const registerBody = await registerResponse.json();

    await page.route('**/api/email/resend-verification', async (route) => {
      const body = route.request().postDataJSON() as { email?: string };
      expect(body.email).toBe(stagedUser.email);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Email de verificación enviado. Por favor, revisa tu bandeja de entrada.',
        }),
      });
    });

    await page.goto('/');
    await page.evaluate(({ accessToken, refreshToken, user }) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify({ ...user, isAdmin: false }));
    }, {
      accessToken: registerBody.accessToken,
      refreshToken: registerBody.refreshToken,
      user: registerBody.user,
    });

    await page.goto('/app/documents');

    await expect(page).toHaveURL(/\/verify-email$/);
    await expect(page.getByRole('heading', { name: 'Confirma tu email' })).toBeVisible();
    await expect(page.getByRole('alert')).toContainText(/Debes verificar tu email para acceder/i);
    await expect(page.getByLabel('Correo para reenviar la verificación')).toHaveValue(stagedUser.email);
    await page.getByRole('button', { name: 'Reenviar enlace de verificación' }).click();
    await expect(page.getByText(/Email de verificación enviado/i)).toBeVisible();
  });
});