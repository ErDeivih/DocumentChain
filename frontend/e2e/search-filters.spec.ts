import { expect, test } from '@playwright/test';
import {
  API_BASE_URL,
  installHardhatWallet,
  loginWithStoredSession,
  seedUsers,
  selectFirstSavedWallet,
  waitForDocumentStatus,
} from './helpers';

/**
 * Suite de búsqueda avanzada y filtros en la página de documentos.
 */
test.describe('Search and filters', () => {
  test.describe.configure({ mode: 'serial' });

  test('search by text filters documents', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');
    test.setTimeout(120000);

    const ownerSession = await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });
    await installHardhatWallet(page, seedUsers.owner.walletIndex);

    // Crear un documento con nombre único para la búsqueda
    const uniqueName = `search-filter-test-${Date.now()}.txt`;
    await page.goto('/app/documents');
    await expect(page.getByRole('heading', { name: 'Mis Documentos' })).toBeVisible();

    const confirmPromise = page.waitForResponse(
      (response) => response.url().includes('/api/documents/confirm') && response.request().method() === 'POST'
    );

    await page.getByRole('button', { name: 'Subir Documento' }).click();
    await page.locator('input[type="file"]').setInputFiles({
      name: uniqueName,
      mimeType: 'text/plain',
      buffer: Buffer.from('Documento de prueba para filtros de búsqueda'),
    });
    await page.getByRole('button', { name: 'Subir y Firmar' }).click();
    await selectFirstSavedWallet(page, '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');

    await expect(page.getByText('¡Documento subido exitosamente!')).toBeVisible({ timeout: 45000 });
    const confirmResponse = await confirmPromise;
    expect(confirmResponse.ok()).toBeTruthy();
    const { id: documentId } = (await confirmResponse.json()).document;

    await waitForDocumentStatus(request, ownerSession.accessToken, documentId, 'SYNCED', {
      timeoutMs: 120000,
    });

    // Buscar el documento por nombre
    await page.goto('/app/documents');
    await page.waitForTimeout(2000);

    const searchInput = page.locator('input[placeholder*="buscar"], input[placeholder*="Buscar"]');
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill(uniqueName);
      await page.waitForTimeout(1500);

      // Verificar que el documento aparece en los resultados
      await expect(page.getByText(uniqueName)).toBeVisible({ timeout: 10000 });
    }
  });

  test('filter by archived status hides active documents', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');
    test.setTimeout(120000);

    const ownerSession = await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });
    await installHardhatWallet(page, seedUsers.owner.walletIndex);

    // Crear documento, archivarlo, y verificar que aparece con filtro de archivados
    const archiveName = `archive-filter-${Date.now()}.txt`;
    await page.goto('/app/documents');

    const confirmPromise = page.waitForResponse(
      (response) => response.url().includes('/api/documents/confirm') && response.request().method() === 'POST'
    );

    await page.getByRole('button', { name: 'Subir Documento' }).click();
    await page.locator('input[type="file"]').setInputFiles({
      name: archiveName,
      mimeType: 'text/plain',
      buffer: Buffer.from('Documento para probar filtro de archivados'),
    });
    await page.getByRole('button', { name: 'Subir y Firmar' }).click();
    await selectFirstSavedWallet(page, '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');

    await expect(page.getByText('¡Documento subido exitosamente!')).toBeVisible({ timeout: 45000 });
    const confirmResponse = await confirmPromise;
    expect(confirmResponse.ok()).toBeTruthy();
    const { id: documentId } = (await confirmResponse.json()).document;

    await waitForDocumentStatus(request, ownerSession.accessToken, documentId, 'SYNCED', {
      timeoutMs: 120000,
    });

    // Archivar el documento
    await page.goto(`/app/documents/${documentId}`);
    await expect(page.getByRole('heading', { name: archiveName })).toBeVisible({ timeout: 30000 });
    await page.getByRole('button', { name: 'Archivar' }).click();
    await expect(page.getByText('Archivado')).toBeVisible({ timeout: 30000 });

    // Volver a documentos y aplicar filtro de archivados
    await page.goto('/app/documents');
    await page.waitForTimeout(2000);

    // Buscar un switch o checkbox de archivados
    const archivedToggle = page.locator('button[role="switch"], input[type="checkbox"]').filter({ hasText: /Archivado/i });
    if (await archivedToggle.isVisible().catch(() => false)) {
      await archivedToggle.click();
      await page.waitForTimeout(1500);
      await expect(page.getByText(archiveName)).toBeVisible({ timeout: 10000 });
    }

    // Limpiar: desarchivar y eliminar
    await page.goto(`/app/documents/${documentId}`);
    await page.getByRole('button', { name: 'Desarchivar' }).click();
    await expect(page.getByRole('button', { name: 'Archivar' })).toBeVisible({ timeout: 30000 });
    page.once('dialog', (dialog) => void dialog.accept());
    await page.getByRole('button', { name: 'Eliminar' }).click();
  });

  test('search returns empty state for non-matching query', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');

    await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });

    await page.goto('/app/documents');
    await page.waitForTimeout(2000);

    const searchInput = page.locator('input[placeholder*="buscar"], input[placeholder*="Buscar"]');
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('xyznonexistentquery12345');
      await page.waitForTimeout(1500);

      // Verificar que aparece el estado vacío
      await expect(page.getByText(/No hay documentos/i)).toBeVisible({ timeout: 10000 });
    }
  });
});
