import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, '..', '..');
const templatesDir = path.join(repoRoot, 'backend', 'src', 'templates', 'emails');
const outputDir = path.join(repoRoot, 'anexos', 'capturas-ui');

function renderTemplate(template, data) {
  const withConditionals = template.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (_, key, block) => {
    return data[key] ? block : '';
  });

  return withConditionals.replace(/{{\s*(\w+)\s*}}/g, (_, key) => {
    const value = data[key];
    return value === undefined || value === null ? '' : String(value);
  });
}

async function renderEmailPreview(page, fileName, templateName, data) {
  const templatePath = path.join(templatesDir, `${templateName}.html`);
  const template = await fs.readFile(templatePath, 'utf8');
  const html = renderTemplate(template, data);

  await page.setViewportSize({ width: 980, height: 1400 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.screenshot({
    path: path.join(outputDir, fileName),
    fullPage: true,
    animations: 'disabled',
  });
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });

  const year = new Date().getFullYear();
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await renderEmailPreview(page, 'email-verification-preview.png', 'verification', {
      username: 'davidpeve01',
      verificationUrl: 'http://localhost:5173/verify-email?token=demo-verification-token',
      appUrl: 'http://localhost:5173',
      year,
    });

    await renderEmailPreview(page, 'email-password-reset-preview.png', 'password-reset', {
      username: 'davidpeve01',
      resetUrl: 'http://localhost:5173/reset-password?token=demo-reset-token',
      expiresIn: '1 hora',
      appUrl: 'http://localhost:5173',
      year,
    });

    await renderEmailPreview(page, 'email-password-changed-preview.png', 'password-changed', {
      username: 'davidpeve01',
      timestamp: new Intl.DateTimeFormat('es-ES', {
        dateStyle: 'short',
        timeStyle: 'medium',
      }).format(new Date()),
      settingsUrl: 'http://localhost:5173/app/settings',
      appUrl: 'http://localhost:5173',
      year,
    });

    await renderEmailPreview(page, 'email-document-signed-preview.png', 'notification', {
      username: 'davidpeve01',
      subject: 'Documento firmado',
      message: 'diego_ortega firmo la version 3 de "contrato_colaboracion_i+d.pdf".',
      actionUrl: 'http://localhost:5173/app/documents/demo-document-id',
      actionText: 'Ver firma registrada',
      appUrl: 'http://localhost:5173',
      year,
    });
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});