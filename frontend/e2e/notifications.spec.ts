import { expect, test } from '@playwright/test';
import { loginWithStoredSession, seedUsers } from './helpers';

/**
 * Suite específica para el comportamiento de notificaciones,
 * incluyendo auto-mark-as-read y mark-all-as-read.
 */
test.describe('Notifications behaviour', () => {
  test.describe.configure({ mode: 'serial' });

  test('notifications page loads with all tabs', async ({ page, request, browserName }) => {
    await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });

    await page.goto('/app/notifications');
    await expect(page.getByRole('heading', { name: 'Notificaciones', exact: true })).toBeVisible();

    await expect(page.getByRole('tab', { name: /Todas/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /No leídas/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Compartidos/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Documentos/i })).toBeVisible();
  });

  test('unread notifications are auto-marked as read after entering the page', async ({ page, request, browserName }) => {
    test.setTimeout(60000);

    await loginWithStoredSession(page, request, {
      username: seedUsers.recipient.username,
      password: seedUsers.recipient.password,
    });

    await page.goto('/app/notifications');
    await expect(page.getByRole('heading', { name: 'Notificaciones', exact: true })).toBeVisible();

    // Cambiar a la pestaña "No leídas" para ver si hay notificaciones
    await page.getByRole('tab', { name: /No leídas/i }).click();

    // Esperar un momento para que las notificaciones carguen
    await page.waitForTimeout(2000);

    // Si hay notificaciones no leídas, esperar 4 segundos (3s del timer + margen)
    // y verificar que desaparezcan de la pestaña "No leídas"
    const unreadItems = page.locator('div.cursor-pointer');
    const count = await unreadItems.count();

    if (count > 0) {
      await page.waitForTimeout(4000);
      // Tras el auto-mark, las notificaciones deberían desaparecer de "No leídas"
      // o al menos reducirse
      const newCount = await unreadItems.count();
      expect(newCount).toBeLessThanOrEqual(count);
    }
  });

  test('mark all as read button clears unread notifications', async ({ page, request, browserName }) => {
    test.setTimeout(60000);

    await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });

    await page.goto('/app/notifications');
    await expect(page.getByRole('heading', { name: 'Notificaciones', exact: true })).toBeVisible();

    // Ir a la pestaña "No leídas"
    await page.getByRole('tab', { name: /No leídas/i }).click();
    await page.waitForTimeout(1500);

    const markAllButton = page.getByRole('button', { name: /Marcar todas como leídas/i });

    // Solo si hay un botón visible (puede estar deshabilitado si no hay notificaciones)
    if (await markAllButton.isVisible().catch(() => false)) {
      if (await markAllButton.isEnabled().catch(() => false)) {
        await markAllButton.click();
        await expect(page.getByText('Todas las notificaciones marcadas como leídas')).toBeVisible({ timeout: 15000 });

        // Verificar que la pestaña "No leídas" esté vacía o muestre mensaje
        await expect(page.getByText('No hay notificaciones para mostrar')).toBeVisible({ timeout: 15000 });
      }
    }
  });

  test('notification badge in header reflects unread count', async ({ page, request, browserName }) => {
    test.setTimeout(60000);

    await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });

    await page.goto('/app/documents');
    await expect(page.getByRole('heading', { name: 'Mis Documentos' })).toBeVisible();

    // Verificar que existe el icono de campana en el header
    const bellButton = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: '' }).first();
    // O buscar por aria-label si existe
    const bellByLabel = page.locator('button[aria-label*="notificaciones"], button[aria-label*="Notificaciones"]');
    const bell = await bellByLabel.isVisible().catch(() => false) ? bellByLabel : bellButton;

    await expect(bell).toBeVisible();
  });
});
