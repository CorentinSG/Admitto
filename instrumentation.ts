import { reportServerError } from "@/lib/observability/log";

/**
 * Capture des erreurs serveur non rattrapées (lot D).
 *
 * `onRequestError` est le seul point où Next.js expose TOUTES les erreurs du
 * serveur — rendu, actions serveur, routes d'API — avec le `digest` qu'il
 * remet au navigateur. Un `try/catch` par route en manquerait par
 * construction : ce qu'on veut journaliser, c'est précisément ce que personne
 * n'a prévu d'attraper.
 *
 * Ce fichier ne fait pas d'analyse : il traduit l'erreur en ligne JSON et
 * délègue le reste. Toute logique ici tournerait hors des tests.
 */
export async function onRequestError(
  error: unknown,
  request: { path?: string; method?: string },
  context: { routePath?: string; routeType?: string }
): Promise<void> {
  const err = error as { name?: string; message?: string; digest?: string };

  await reportServerError(
    {
      /*
       * Le PATRON de route, jamais le chemin appelé.
       *
       * `request.path` vaut `/rapport/clx7…` : cet identifiant ouvre la page
       * de résultat à qui le détient (`lib/access/result.ts`). Journalisé, il
       * ferait du journal d'erreurs une liste de liens d'accès — et les
       * journaux se copient, se transfèrent et survivent à l'effacement du
       * compte. `context.routePath` vaut `/rapport/[id]` : il dit où ça casse
       * sans dire pour qui.
       *
       * Le repli n'est PAS `request.path` : mieux vaut ne pas savoir où
       * l'erreur s'est produite que de déposer une capacité dans un fichier.
       */
      route: context.routePath ?? "(inconnue)",
      method: request.method ?? "(inconnue)",
      name: err?.name ?? "Error",
      digest: err?.digest,
      routeType: context.routeType,
    },
    err?.message
  );
}

/**
 * Requis par Next.js même vide : sans `register`, le module d'instrumentation
 * n'est pas chargé et `onRequestError` n'est jamais appelé.
 */
export function register(): void {}
