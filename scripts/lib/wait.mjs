/**
 * Attentes sur condition, en remplacement des délais fixes (revue §B2).
 *
 * Un `waitForTimeout(220)` fait deux dégâts opposés : il rend la suite fausse
 * quand la machine est lente — l'assertion regarde un écran qui n'est pas
 * arrivé — et il ralentit inutilement quand elle est rapide. Une suite qui peut
 * être rouge sans que rien ne soit cassé ne protège plus rien : c'est
 * exactement ce que ce module supprime.
 *
 * Le principe : attendre que la page ait *changé de la manière attendue*, avec
 * un plafond, plutôt qu'attendre une durée devinée.
 */

/** Plafond par défaut d'une attente : au-delà, c'est un vrai échec. */
export const DEFAULT_TIMEOUT_MS = 15_000;

/**
 * Attend que `predicate` renvoie une valeur vraie, puis la rend.
 * Rend `null` à l'expiration : l'appelant décide si c'est un échec.
 */
export async function waitFor(predicate, { timeoutMs = DEFAULT_TIMEOUT_MS, intervalMs = 100 } = {}) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    let value;
    try {
      value = await predicate();
    } catch {
      // Une navigation en cours peut faire échouer une lecture : on réessaie.
      value = null;
    }
    if (value) return value;
    if (Date.now() >= deadline) return null;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

/** Attend que le texte de la page contienne `needle`, casse ignorée. */
export async function waitForText(page, needle, options) {
  const wanted = needle.toLowerCase();
  return waitFor(async () => {
    const text = await page.locator("body").innerText();
    return text.toLowerCase().includes(wanted) ? text : null;
  }, options);
}

/** Attend que le texte de la page ne contienne PLUS `needle`. */
export async function waitForTextGone(page, needle, options) {
  const unwanted = needle.toLowerCase();
  return waitFor(async () => {
    const text = await page.locator("body").innerText();
    return text.toLowerCase().includes(unwanted) ? null : text;
  }, options);
}

/**
 * Attend que le texte de la page change par rapport à `before`.
 *
 * Sert aux écrans qui se succèdent sans changer d'URL — le questionnaire — où
 * l'on ne sait pas ce qui va apparaître, seulement que ce sera différent.
 */
export async function waitForTextChange(page, before, options) {
  return waitFor(async () => {
    const text = await page.locator("body").innerText();
    return text !== before ? text : null;
  }, options);
}

/**
 * Réchauffage : provoque la compilation et le premier accès à la base sur
 * chaque zone avant la première assertion.
 *
 * Sans cela, la toute première navigation d'une suite paie le démarrage à
 * froid — client Prisma, chargement d'Auth.js, rendu initial — et c'est elle
 * qui expire.
 */
export async function warmUp(
  page,
  base,
  // `/api/auth/csrf` est le point d'entrée le moins coûteux d'Auth.js : le
  // toucher ici compile la route et instancie l'adaptateur Prisma. Sans lui, la
  // première demande de lien de connexion payait ce démarrage et expirait —
  // c'est ce qui faisait échouer cinq suites sur huit à la première exécution.
  paths = ["/", "/diagnostic", "/connexion"]
) {
  for (const path of paths) {
    try {
      await page.goto(`${base}${path}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
    } catch {
      // Un réchauffage n'assertionne rien : son échec ne doit pas masquer la
      // vraie cause, que la première assertion révélera de toute façon.
    }
  }
}
