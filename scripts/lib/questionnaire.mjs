import { waitFor, waitForTextChange } from "./wait.mjs";

/**
 * Parcours du questionnaire, partagé par les suites (revue §B2).
 *
 * Cinq suites répétaient la même boucle de clics avec un délai fixe de 220 ms
 * entre chaque écran. Le facteur y est doublement mauvais : trop court sur une
 * machine chargée — l'assertion suivante regarde l'écran précédent — et inutile
 * le reste du temps. Ici, chaque clic attend que l'écran ait réellement changé.
 */

/** Clique une réponse par écran, en attendant le changement d'écran à chaque fois. */
export async function answerScreens(page, labels) {
  const totals = [];

  for (const label of labels) {
    const step = await page.locator("text=Étape").first().innerText();
    const total = Number(step.match(/sur (\d+)/)?.[1]);
    if (Number.isFinite(total)) totals.push(total);

    const before = await page.locator("body").innerText();
    await page.getByRole("button", { name: label, exact: true }).click();
    // L'écran suivant remplace le précédent : le texte change nécessairement.
    await waitForTextChange(page, before);
  }

  return totals;
}

/**
 * Parcours complet : démarrage, réponses, contact, jusqu'à la page de résultat.
 * Rend l'identifiant du diagnostic.
 */
export async function submitDiagnostic(page, base, { labels, firstName, email }) {
  await page.goto(`${base}/diagnostic`, { waitUntil: "networkidle" });

  const beforeStart = await page.locator("body").innerText();
  await page.getByRole("button", { name: "Commencer" }).click();
  await waitForTextChange(page, beforeStart);

  const totals = await answerScreens(page, labels);

  await page.getByPlaceholder("Prénom").fill(firstName);
  await page.getByPlaceholder("Adresse email").fill(email);
  await page.getByRole("button", { name: "Obtenir mon résultat" }).click();

  // Un refus de plafond doit se lire comme tel : sinon la suite expire sur la
  // redirection absente et l'on cherche la panne au mauvais endroit.
  const refused = await waitFor(async () => {
    const text = await page.locator("body").innerText();
    return /Trop de tentatives/i.test(text) ? text : null;
  }, { timeoutMs: 2_000 });
  if (refused) {
    throw new Error(
      "Soumission refusée par la limitation de débit : " +
        (refused.match(/Trop de tentatives[^\n]*/)?.[0] ?? "")
    );
  }

  await page.waitForURL("**/resultat/**", { timeout: 30_000 });

  const id = await waitFor(() => {
    const match = page.url().split("/resultat/")[1];
    return match ? match.split(/[?#]/)[0] : null;
  });

  return { id, totals };
}
