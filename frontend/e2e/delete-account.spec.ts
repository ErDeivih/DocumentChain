import { expect, test } from '@playwright/test';
import {
  API_BASE_URL,
  loginWithStoredSession,
  setUserEmailVerified,
  installHardhatWallet,
} from './helpers';

test.describe('Delete account flow', () => {
  test.describe.configure({ mode: 'serial' });

  test('delete account confirmation modal and wallet selector open correctly', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');
    test.setTimeout(60000);

    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const user = {
      username: `delete_user_${uniqueSuffix}`,
      email: `delete.user.${uniqueSuffix}@documentchain.local`,
      password: 'Admin123!',
      fullName: 'Delete Test',
    };

    // Register user
    const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
      data: user,
    });
    expect(registerResponse.ok()).toBeTruthy();
    setUserEmailVerified(user.email);

    await loginWithStoredSession(page, request, {
      username: user.username,
      password: user.password,
    });

    // Go to Settings → Seguridad y Cuenta
    await page.goto('/app/settings');
    await page.getByRole('tab', { name: 'Seguridad y Cuenta' }).click();

    // Click delete account
    await page.getByRole('button', { name: 'Eliminar mi cuenta' }).click();

    // Verify confirmation modal appears
    await expect(page.getByText(/Eliminar cuenta permanentemente/i)).toBeVisible();
    await expect(page.getByText(/no se puede deshacer/i)).toBeVisible();
    await expect(page.getByText(/suspendMyself/i)).toBeVisible();

    // Click confirm - should open wallet selector modal
    await page.getByRole('button', { name: 'Confirmar eliminación' }).click();
    await expect(page.getByTestId('wallet-selector-modal')).toBeVisible({ timeout: 10000 });

    // Cancel the flow
    await page.getByRole('button', { name: /Cancelar/i }).first().click();
    await expect(page.getByTestId('wallet-selector-modal')).not.toBeVisible();
  });
});
