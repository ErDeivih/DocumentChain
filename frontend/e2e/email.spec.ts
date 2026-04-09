import { expect, test } from '@playwright/test';

test.describe('Public Email And Verification Routes', () => {
  test('landing page should open the public document verification page', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Verificar Documento' }).click();

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
});