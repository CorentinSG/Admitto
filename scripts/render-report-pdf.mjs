#!/usr/bin/env node
/**
 * Rend la version imprimable d'un rapport en PDF (CDC §17).
 *
 * Usage :
 *   ADMITTO_ADMIN_TOKEN=… node scripts/render-report-pdf.mjs <url-impression> <sortie.pdf>
 *
 * Le jeton d'administration est injecté sous forme de cookie : la page
 * imprimable est derrière le middleware du back-office, elle n'est jamais
 * accessible publiquement.
 */

const [url, output = "rapport.pdf"] = process.argv.slice(2);

if (!url) {
  console.error("Usage : node scripts/render-report-pdf.mjs <url-impression> [sortie.pdf]");
  process.exit(1);
}

const token = process.env.ADMITTO_ADMIN_TOKEN;
if (!token) {
  console.error("✗ ADMITTO_ADMIN_TOKEN absent : la page imprimable est protégée.");
  process.exit(1);
}

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("✗ Playwright absent. npm i -D playwright && npx playwright install chromium");
  process.exit(1);
}

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
});
const context = await browser.newContext();
const { hostname } = new URL(url);
await context.addCookies([
  { name: "admitto_admin", value: token, domain: hostname, path: "/admin", httpOnly: true },
]);

const page = await context.newPage();
const response = await page.goto(url, { waitUntil: "networkidle" });

if (!response || response.status() >= 400) {
  console.error(`✗ Page inaccessible (HTTP ${response?.status() ?? "?"}).`);
  await browser.close();
  process.exit(1);
}

await page.pdf({
  path: output,
  format: "A4",
  printBackground: true,
  margin: { top: "18mm", bottom: "18mm", left: "16mm", right: "16mm" },
});

await browser.close();
console.log(`✓ PDF écrit : ${output}`);
