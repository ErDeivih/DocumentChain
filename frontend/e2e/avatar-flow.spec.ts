import { expect, test } from '@playwright/test';
import {
  API_BASE_URL,
  clearStoredSession,
  loginWithStoredSession,
  setUserEmailVerified,
} from './helpers';

test.describe('Avatar flow', () => {
  test.describe.configure({ mode: 'serial' });

  test('user can upload avatar via API and see it in settings, then remove it', async ({ page, request, browserName }) => {
    test.setTimeout(60000);

    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const user = {
      username: `avatar_user_${uniqueSuffix}`,
      email: `avatar.user.${uniqueSuffix}@documentchain.local`,
      password: 'Admin123!',
      fullName: 'Avatar Test',
    };

    // Register user
    const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
      data: user,
    });
    expect(registerResponse.ok()).toBeTruthy();
    setUserEmailVerified(user.email);

    const session = await loginWithStoredSession(page, request, {
      username: user.username,
      password: user.password,
    });

    // Upload avatar via API using fetch with multipart
    const avatarResponse = await request.fetch(`${API_BASE_URL}/users/me/avatar`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      multipart: {
        avatar: {
          name: 'avatar.png',
          mimeType: 'image/png',
          buffer: Buffer.from('fake-png-data'),
        },
      },
    });

    if (!avatarResponse.ok()) {
      const errorText = await avatarResponse.text();
      console.error('Avatar upload failed:', avatarResponse.status(), errorText);
    }
    expect(avatarResponse.ok()).toBeTruthy();
    const avatarBody = await avatarResponse.json();
    expect(avatarBody.user.avatarUrl).toBeTruthy();

    await page.goto('/app/settings');
    await expect(page.getByRole('heading', { name: /Configuración/i })).toBeVisible();

    // Verify avatar image is visible in settings
    await expect(page.locator('img[alt="' + user.username + '"]').first()).toBeVisible({ timeout: 10000 });

    // Remove avatar via UI
    await page.getByRole('button', { name: /^Eliminar$/ }).click();

    // Verify avatar removed (fallback initials should be visible)
    await expect(page.getByText(user.username.slice(0, 2).toUpperCase()).first()).toBeVisible({ timeout: 10000 });

    await clearStoredSession(page);
  });
});
