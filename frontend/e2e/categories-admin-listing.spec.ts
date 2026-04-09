import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  API_BASE_URL,
  getHardhatAddress,
  installHardhatWallet,
  loginWithStoredSession,
  seedUsers,
  selectFirstSavedWallet,
  waitForDocumentStatus,
} from './helpers';

const E2E_DATABASE_URL = process.env.E2E_DATABASE_URL ?? 'postgresql://documentchain:documentchain@localhost:5433/documentchain?schema=public';
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.resolve(currentDir, '../../backend');

function runBackendScript(script: string): string {
  return execFileSync('node', ['-e', script], {
    cwd: backendDir,
    encoding: 'utf8',
    env: {
      ...process.env,
      DATABASE_URL: E2E_DATABASE_URL,
    },
    stdio: 'pipe',
  });
}

function seedListingDocuments(username: string, prefix: string): void {
  const script = `
    const { PrismaClient, BlockchainStatus } = require('@prisma/client');
    const crypto = require('crypto');
    const prisma = new PrismaClient();

    (async () => {
      const user = await prisma.user.findUnique({ where: { username: ${JSON.stringify(username)} } });
      if (!user) {
        throw new Error('Owner user not found');
      }

      const wallet = await prisma.wallet.findFirst({
        where: { userId: user.id },
        orderBy: [{ isPrimary: 'desc' }, { addedAt: 'asc' }],
      });

      if (!wallet) {
        throw new Error('Owner wallet not found');
      }

      const fixtures = [
        { name: ${JSON.stringify(prefix)} + '-page-01.pdf', ext: '.pdf', mime: 'application/pdf', archived: false },
        { name: ${JSON.stringify(prefix)} + '-page-02.pdf', ext: '.pdf', mime: 'application/pdf', archived: false },
        { name: ${JSON.stringify(prefix)} + '-page-03.pdf', ext: '.pdf', mime: 'application/pdf', archived: false },
        { name: ${JSON.stringify(prefix)} + '-page-04.pdf', ext: '.pdf', mime: 'application/pdf', archived: false },
        { name: ${JSON.stringify(prefix)} + '-page-05.pdf', ext: '.pdf', mime: 'application/pdf', archived: false },
        { name: ${JSON.stringify(prefix)} + '-page-06.pdf', ext: '.pdf', mime: 'application/pdf', archived: false },
        { name: ${JSON.stringify(prefix)} + '-page-07.pdf', ext: '.pdf', mime: 'application/pdf', archived: false },
        { name: ${JSON.stringify(prefix)} + '-page-08.pdf', ext: '.pdf', mime: 'application/pdf', archived: false },
        { name: ${JSON.stringify(prefix)} + '-page-09.pdf', ext: '.pdf', mime: 'application/pdf', archived: false },
        { name: ${JSON.stringify(prefix)} + '-page-10.pdf', ext: '.pdf', mime: 'application/pdf', archived: false },
        { name: ${JSON.stringify(prefix)} + '-page-11.txt', ext: '.txt', mime: 'text/plain', archived: false },
        { name: ${JSON.stringify(prefix)} + '-archived.pdf', ext: '.pdf', mime: 'application/pdf', archived: true },
      ];

      for (const fixture of fixtures) {
        const id = crypto.randomUUID();
        const baseHash = crypto.createHash('sha256').update(fixture.name).digest('hex');
        await prisma.document.create({
          data: {
            id,
            blockchainId: 'seed-' + id,
            name: fixture.name,
            description: 'Fixture de listado para Playwright',
            mimeType: fixture.mime,
            size: BigInt(1024),
            contentHash: baseHash,
            metadataHash: crypto.createHash('sha256').update(fixture.name + '-meta').digest('hex'),
            fileExtension: fixture.ext,
            ownerId: user.id,
            creatorWalletId: wallet.id,
            encryptedSymmetricKey: 'SEEDED_TEST_KEY',
            blockchainStatus: BlockchainStatus.SYNCED,
            isArchived: fixture.archived,
            archivedAt: fixture.archived ? new Date() : null,
            tags: ['playwright', 'listing'],
          },
        });

        await prisma.documentStats.create({
          data: {
            documentId: id,
          },
        });
      }

      await prisma.$disconnect();
    })().catch(async (error) => {
      console.error(error);
      await prisma.$disconnect();
      process.exit(1);
    });
  `;

  runBackendScript(script);
}

function cleanupListingDocuments(username: string, prefix: string): void {
  const script = `
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    (async () => {
      const user = await prisma.user.findUnique({ where: { username: ${JSON.stringify(username)} } });
      if (!user) {
        await prisma.$disconnect();
        return;
      }

      await prisma.document.deleteMany({
        where: {
          ownerId: user.id,
          name: {
            startsWith: ${JSON.stringify(prefix)},
          },
        },
      });

      await prisma.$disconnect();
    })().catch(async (error) => {
      console.error(error);
      await prisma.$disconnect();
      process.exit(1);
    });
  `;

  runBackendScript(script);
}

test.describe('Categories, admin, and listing coverage', () => {
  test('owner can create, update, use, and delete a custom category', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');
    test.setTimeout(150000);

    const session = await loginWithStoredSession(page, request, {
      username: seedUsers.owner.username,
      password: seedUsers.owner.password,
    });
    await installHardhatWallet(page, seedUsers.owner.walletIndex);

    const baseName = `e2e-category-${Date.now()}`;
    const updatedName = `${baseName}-updated`;

    const createCategoryResponse = await request.post(`${API_BASE_URL}/categories`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      data: {
        name: baseName,
        description: 'Categoría creada por Playwright',
        color: '#0ea5e9',
      },
    });

    expect(createCategoryResponse.status()).toBe(201);
    const createdCategoryBody = await createCategoryResponse.json();
    const createdCategory = createdCategoryBody.category as { id: string };

    const duplicateCategoryResponse = await request.post(`${API_BASE_URL}/categories`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      data: {
        name: baseName,
      },
    });

    expect(duplicateCategoryResponse.status()).toBe(400);

    const updateCategoryResponse = await request.put(`${API_BASE_URL}/categories/${createdCategory.id}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      data: {
        name: updatedName,
        description: 'Categoría actualizada por Playwright',
        color: '#f97316',
      },
    });

    expect(updateCategoryResponse.ok()).toBeTruthy();

    const searchCategoryResponse = await request.get(`${API_BASE_URL}/categories/search`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      params: {
        q: updatedName,
      },
    });

    expect(searchCategoryResponse.ok()).toBeTruthy();
    const searchCategoryBody = await searchCategoryResponse.json();
    expect((searchCategoryBody.categories || []).some((category: { id: string }) => category.id === createdCategory.id)).toBeTruthy();

    const documentName = `category-usage-${Date.now()}.txt`;
    await page.goto('/app/documents');

    await page.getByRole('button', { name: 'Subir Documento' }).click();
    await expect(page.getByRole('heading', { name: 'Subir Documento' })).toBeVisible();

    const confirmCreateResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/documents/confirm') && response.request().method() === 'POST'
    );

    const uploadDialog = page.locator('div').filter({ has: page.getByText('Subir Documento') }).first();
    await page.locator('input[type="file"]').first().setInputFiles({
      name: documentName,
      mimeType: 'text/plain',
      buffer: Buffer.from('Documento con categoría personalizada para E2E'),
    });

    const categorySelect = uploadDialog
      .locator('label', { hasText: 'Categoría (opcional)' })
      .locator('xpath=following-sibling::div//select');

    await expect(uploadDialog.getByText('Cargando categorías...')).not.toBeVisible({ timeout: 15000 });
    await expect(categorySelect.locator(`option[value="${createdCategory.id}"]`)).toBeAttached({ timeout: 15000 });
    await categorySelect.selectOption(createdCategory.id);
    await expect(categorySelect).toHaveValue(createdCategory.id);

    await uploadDialog.getByRole('button', { name: 'Subir y Firmar' }).click();
    await selectFirstSavedWallet(page, getHardhatAddress(seedUsers.owner.walletIndex));

    const confirmCreateResponse = await confirmCreateResponsePromise;
    expect(confirmCreateResponse.ok()).toBeTruthy();
    const confirmCreateBody = await confirmCreateResponse.json();
    const documentId = confirmCreateBody.document.id as string;

    await waitForDocumentStatus(request, session.accessToken, documentId, 'SYNCED', {
      timeoutMs: 120000,
    });

    const documentResponse = await request.get(`${API_BASE_URL}/documents/${documentId}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    expect(documentResponse.ok()).toBeTruthy();
    const documentBody = await documentResponse.json();
    expect(documentBody.document.categoryId).toBe(createdCategory.id);

    const statsResponse = await request.get(`${API_BASE_URL}/categories/${createdCategory.id}/stats`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    expect(statsResponse.ok()).toBeTruthy();
    const statsBody = await statsResponse.json();
    expect(statsBody.stats.documentCount).toBe(1);

    const deleteCategoryResponse = await request.delete(`${API_BASE_URL}/categories/${createdCategory.id}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    expect(deleteCategoryResponse.ok()).toBeTruthy();

    const categoriesAfterDeleteResponse = await request.get(`${API_BASE_URL}/categories`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    expect(categoriesAfterDeleteResponse.ok()).toBeTruthy();
    const categoriesAfterDeleteBody = await categoriesAfterDeleteResponse.json();
    expect((categoriesAfterDeleteBody.categories || []).some((category: { id: string }) => category.id === createdCategory.id)).toBeFalsy();

    const documentAfterDeleteResponse = await request.get(`${API_BASE_URL}/documents/${documentId}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    expect(documentAfterDeleteResponse.ok()).toBeTruthy();
    const documentAfterDeleteBody = await documentAfterDeleteResponse.json();
    expect(documentAfterDeleteBody.document.categoryId).toBeNull();
  });

  test('admin can create, demote, and delete a managed user while self-protection remains enforced', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');

    const session = await loginWithStoredSession(page, request, {
      username: seedUsers.admin.username,
      password: seedUsers.admin.password,
    });

    const suffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const username = `admin_gestion_${suffix}`;
    const email = `admin.gestion.${suffix}@documentchain.local`;
    const password = 'AdminManaged123!';

    await page.goto('/app/dashboard');
    await page.getByRole('tab', { name: /Gestión de Usuarios/i }).click();

    const createAdminResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/admin/users') && response.request().method() === 'POST'
    );

    await page.getByRole('button', { name: 'Crear Admin' }).first().click();
    const createAdminForm = page.locator('form').first();
    await createAdminForm.locator('input').nth(0).fill(username);
    await createAdminForm.locator('input').nth(1).fill(email);
    await createAdminForm.locator('input[type="password"]').fill(password);
    await createAdminForm.locator('input').nth(3).fill('Ricardo Cobo');
    await createAdminForm.getByRole('button', { name: 'Crear Admin' }).click();

    const createAdminResponse = await createAdminResponsePromise;
    expect(createAdminResponse.status()).toBe(201);
    const createAdminBody = await createAdminResponse.json();
    const createdUserId = createAdminBody.user.id as string;

    await expect(page.getByText(/Guarde esta clave de recuperación/i)).toBeVisible();

    await expect.poll(async () => {
      const response = await request.get(`${API_BASE_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok()) {
        return null;
      }

      const body = await response.json();
      const managedUser = (body.users || []).find((user: { id: string }) => user.id === createdUserId);
      return managedUser?.role ?? null;
    }).toBe('ADMIN');

    const adminRow = page
      .getByText(username, { exact: true })
      .locator('xpath=ancestor::div[contains(@class,"border") and contains(@class,"rounded-lg")][1]');
    await expect(adminRow).toBeVisible({ timeout: 15000 });

    page.once('dialog', (dialog) => {
      void dialog.accept();
    });
    await adminRow.locator('button[title="Degradar a Usuario"]').click();
    await expect(page.getByText('Rol de usuario actualizado correctamente')).toBeVisible({ timeout: 15000 });

    await expect.poll(async () => {
      const response = await request.get(`${API_BASE_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok()) {
        return null;
      }

      const body = await response.json();
      const managedUser = (body.users || []).find((user: { id: string }) => user.id === createdUserId);
      return managedUser?.role ?? null;
    }).toBe('USER');

    const meResponse = await request.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    expect(meResponse.ok()).toBeTruthy();
    const meBody = await meResponse.json();

    const selfDemoteResponse = await request.put(`${API_BASE_URL}/admin/users/${meBody.user.id}/role`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      data: {
        role: 'USER',
      },
    });
    expect(selfDemoteResponse.status()).toBe(400);
    const selfDemoteBody = await selfDemoteResponse.json();
    expect(selfDemoteBody.error).toMatch(/No puede quitar su propio rol de administrador/i);

    const selfDeleteResponse = await request.delete(`${API_BASE_URL}/admin/users/${meBody.user.id}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    expect(selfDeleteResponse.status()).toBe(400);
    const selfDeleteBody = await selfDeleteResponse.json();
    expect(selfDeleteBody.error).toMatch(/No puede eliminar su propia cuenta/i);

    const managedUserRow = page
      .getByText(username, { exact: true })
      .locator('xpath=ancestor::div[contains(@class,"border") and contains(@class,"rounded-lg")][1]');
    await expect(managedUserRow).toBeVisible({ timeout: 15000 });

    page.once('dialog', (dialog) => {
      void dialog.accept();
    });
    await managedUserRow.locator('button[title="Eliminar usuario permanentemente"]').click();
    await expect(page.getByText('Usuario eliminado correctamente')).toBeVisible({ timeout: 15000 });

    await expect.poll(async () => {
      const response = await request.get(`${API_BASE_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok()) {
        return true;
      }

      const body = await response.json();
      return !(body.users || []).some((user: { id: string }) => user.id === createdUserId);
    }).toBeTruthy();
  });

  test('documents page paginates results and combines search, file type, and archived filters', async ({ page, request, browserName }) => {
    test.skip(browserName !== 'chromium');

    const prefix = `listing-e2e-${Date.now()}`;
    seedListingDocuments(seedUsers.owner.username, prefix);

    try {
      await loginWithStoredSession(page, request, {
        username: seedUsers.owner.username,
        password: seedUsers.owner.password,
      });

      await page.goto('/app/documents');
      await expect(page.getByRole('heading', { name: 'Mis Documentos' })).toBeVisible();

      const searchInput = page.getByPlaceholder('Buscar por nombre...');
      await searchInput.fill(prefix);

      await expect(page.getByText('Mostrando 1 a 10 de 11 documentos')).toBeVisible({ timeout: 15000 });
      await expect(page.getByText(`${prefix}-page-01.pdf`)).toBeVisible();
      await expect(page.getByRole('button', { name: '2', exact: true })).toBeVisible();

      await page.getByRole('button', { name: '2', exact: true }).click();
      await expect(page.getByText('Mostrando 11 a 11 de 11 documentos')).toBeVisible({ timeout: 15000 });
      await expect(page.getByText(`${prefix}-page-11.txt`)).toBeVisible();

      const fileTypeSelect = page.locator('select').first();
      await fileTypeSelect.selectOption('txt');
      await expect(page.getByText(`${prefix}-page-11.txt`)).toBeVisible();
      await expect(page.getByText(`${prefix}-page-01.pdf`)).not.toBeVisible();

      await fileTypeSelect.selectOption('');
      await page.getByText('Archivados').click();
      await expect(page.getByText(`${prefix}-archived.pdf`)).toBeVisible({ timeout: 15000 });
      await expect(page.getByText(`${prefix}-page-01.pdf`)).not.toBeVisible();
    } finally {
      cleanupListingDocuments(seedUsers.owner.username, prefix);
    }
  });
});