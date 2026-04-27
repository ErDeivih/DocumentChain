import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, '..', '..');
const miniHtmlDir = path.join(repoRoot, 'anexos', 'bocetos-anexo2', 'minihtml');
const outputDir = path.join(repoRoot, 'anexos', 'bocetos-anexo2');

const files = [
  ['login-wireframe-guide.html', 'login-wireframe.png'],
  ['register-wireframe-guide.html', 'register-wireframe.png'],
  ['documents-dashboard-wireframe-guide.html', 'documents-dashboard-wireframe.png'],
  ['document-detail-wireframe-guide.html', 'document-detail-wireframe.png'],
  ['share-modal-wireframe-guide.html', 'share-modal-wireframe.png'],
  ['shared-documents-wireframe-guide.html', 'shared-documents-wireframe.png'],
  ['admin-dashboard-wireframe-guide.html', 'admin-dashboard-wireframe.png'],
  ['blockchain-auditor-wireframe-guide.html', 'blockchain-auditor-wireframe.png'],
  ['public-verify-wireframe-guide.html', 'public-verify-wireframe.png'],
  ['profile-wireframe-guide.html', 'profile-wireframe.png'],
  ['settings-wireframe-guide.html', 'settings-wireframe.png'],
];

async function capturePage(page, htmlFile, outputFile) {
  const target = path.join(miniHtmlDir, htmlFile);
  const outputPath = path.join(outputDir, outputFile);

  await page.goto(pathToFileURL(target).href, { waitUntil: 'load' });
  const frame = page.locator('.browser, .browser-compact, .browser-square').first();
  await frame.waitFor({ state: 'visible' });
  await frame.screenshot({
    path: outputPath,
    animations: 'disabled',
  });
  console.log(`Captured ${outputFile}`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1400 }, deviceScaleFactor: 1.5 });

  try {
    for (const [htmlFile, outputFile] of files) {
      await capturePage(page, htmlFile, outputFile);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});