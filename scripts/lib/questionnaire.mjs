import { waitFor, waitForTextChange } from "./wait.mjs";

/**
 * Parcours du questionnaire, partagé par les suites (revue §B2).
 *
 * Cinq suites répétaient la même boucle de clics avec un délai fixe de 220 ms
 * entre chaque écran. Le facteur y est doublement mauvais : trop court sur une
 * machine chargée — l'assertion suivante regarde l'écran précédent — et inutile
 * le reste du temps. Ici, chaque clic attend que l'écran ait réellement changé.
 */

/**
 * Entre dans le questionnaire, que la page propose « Commencer » ou la
 * reprise d'un brouillon.
 *
 * Une suite qui parcourt le questionnaire DEUX fois dans le même contexte
 * retrouve son propre brouillon au second passage : « Commencer » a laissé la
 * place à « Reprendre mes N réponses » / « Repartir de zéro », et l'attente
 * expirait sur un bouton qui n'existe plus.
 */
export async function startQuestionnaire(page) {
  const before = await page.locator("body").innerText();
  const restart = page.getByRole("button", { name: "Repartir de zéro" });
  const entry = (await restart.count()) > 0 ? restart : page.getByRole("button", { name: "Commencer" });
  await entry.click();
  await waitForTextChange(page, before);
}

/**
 * Cible une réponse par son LIBELLÉ, même lorsque le bouton porte davantage.
 *
 * Une option peut afficher une précision sous son libellé — « Études puis stage
 * professionnel… » sous « Oui, à l'étranger, après une formation en cabinet ».
 * Cette précision entre dans le nom accessible du bouton, et c'est voulu : un
 * lecteur d'écran doit l'entendre, c'est elle qui distingue deux réponses
 * proches. Une correspondance EXACTE ne trouvait alors plus rien.
 *
 * L'ancrage au début reste strict : deux libellés dont l'un préfixe l'autre
 * feraient échouer Playwright pour ambiguïté plutôt que de choisir au hasard.
 */
const startsWithLabel = (page, label) =>
  page.getByRole("button", {
    name: new RegExp("^" + label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
  });

/** Clique une réponse par écran, en attendant le changement d'écran à chaque fois. */
export async function answerScreens(page, labels) {
  const totals = [];

  for (const label of labels) {
    const step = await page.locator("text=Étape").first().innerText();
    const total = Number(step.match(/sur (\d+)/)?.[1]);
    if (Number.isFinite(total)) totals.push(total);

    const before = await page.locator("body").innerText();
    await startsWithLabel(page, label).click();
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
