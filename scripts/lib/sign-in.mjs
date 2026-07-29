import { readFileSync } from "node:fs";

/**
 * Connexion d'une page Playwright par lien email (CDC §10).
 *
 * Le lien n'est exposé par aucune route : il est lu dans la boîte aux lettres
 * de développement (`ADMITTO_MAIL_LOG`), que le serveur sous test doit avoir
 * configurée. Une vérification qui saurait fabriquer un lien de connexion ne
 * vérifierait plus rien.
 */

export function mailLogPath() {
  const path = process.env.ADMITTO_MAIL_LOG;
  if (!path) {
    console.error(
      "✗ ADMITTO_MAIL_LOG absent : la vérification a besoin de lire le lien de connexion."
    );
    process.exit(1);
  }
  return path;
}

/** Dernier lien de connexion adressé à `email`, ou `null`. */
export function lastSignInLink(email) {
  let content;
  try {
    content = readFileSync(mailLogPath(), "utf8");
  } catch {
    return null;
  }

  const matches = content
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter((mail) => mail && mail.to === email && /callback\/email/.test(mail.body ?? ""));

  const last = matches.at(-1);
  if (!last) return null;
  return (last.body.match(/https?:\/\/\S+callback\/email\S*/) ?? [null])[0];
}

/**
 * Demande un lien depuis /connexion, l'attend, puis l'ouvre.
 * Renvoie `true` si la session est ouverte.
 */
export async function signInByEmail(page, base, email, { timeoutMs = 30000 } = {}) {
  const before = lastSignInLink(email);

  await page.goto(`${base}/connexion`, { waitUntil: "networkidle" });
  await page.getByLabel("Adresse email").fill(email);
  await page.getByRole("button", { name: "Recevoir mon lien" }).click();

  const deadline = Date.now() + timeoutMs;
  let link = null;
  while (Date.now() < deadline) {
    link = lastSignInLink(email);
    if (link && link !== before) break;
    await page.waitForTimeout(300);
  }

  if (!link || link === before) {
    // Distinguer les deux causes : un plafond atteint n'est pas une panne.
    const text = await page.locator("body").innerText();
    if (/Trop de tentatives/i.test(text)) {
      console.error(`  ↳ connexion refusée par la limitation de débit pour ${email}`);
    } else {
      console.error(`  ↳ aucun lien de connexion reçu pour ${email} en ${timeoutMs} ms`);
    }
    return false;
  }

  await page.goto(link, { waitUntil: "networkidle" });

  // La preuve de connexion est le cookie de session, pas la page atteinte :
  // un lien expiré rend lui aussi une page, sans ouvrir de session.
  const cookies = await page.context().cookies();
  return cookies.some((c) => /session-token/.test(c.name));
}
