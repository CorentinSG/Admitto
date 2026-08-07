import { paymentsEnabled } from "@/lib/payments/offers";
import { emailsAreDelivered } from "@/lib/email/transport";
import { storageEnabled } from "@/lib/vault/storage";
import { isPublicSite } from "@/lib/seo/site";
import { usingDatabase } from "@/lib/db/client";

/**
 * Ce que la configuration ouvre, et ce qu'elle laisse fermé.
 *
 * Chaque capacité du produit est fermée par défaut et s'ouvre par
 * configuration — c'est la règle répétée partout : « ce qui n'est pas
 * configuré est fermé, pas ouvert ». Ce fichier est le seul endroit où l'on
 * peut LIRE cette règle en entier, et où l'on peut la vérifier.
 *
 * Il existe parce que la règle avait été appliquée à chaque variable prise
 * séparément, jamais aux ENSEMBLES. Trois capacités s'ouvraient à moitié :
 *
 * - le **paiement** ne regardait que la clé secrète Stripe. Sans le secret de
 *   signature, Stripe encaissait et le webhook restait inerte : le rapport
 *   n'était ni marqué payé, ni prioritaire, ni porteur d'une déduction ;
 * - l'**envoi d'emails** ne regardait que la clé et l'expéditeur. Sans adresse
 *   publique, de vrais messages partaient vers de vraies personnes avec des
 *   liens vers `localhost` — dont le lien de désinscription ;
 * - les **comptes** exigeaient bien les deux valeurs, mais le prédicat était
 *   réécrit à quatre endroits, ce qui est la façon habituelle d'en oublier un.
 *
 * Le régime minimal (aucune variable) et le régime complet étaient tous deux
 * vérifiés. L'entre-deux ne l'était pas — et c'est l'état NORMAL d'une
 * configuration en cours : on renseigne les valeurs une par une.
 *
 * `requires` n'est donc pas de la documentation : un test retire chaque
 * variable à tour de rôle et exige que la capacité se referme.
 */

export const CAPABILITY_IDS = [
  "ACCOUNTS",
  "EMAIL_DELIVERY",
  "PAYMENT",
  "VAULT_STORAGE",
  "CRON",
  "PUBLIC_SITE",
  "ERROR_WEBHOOK",
] as const;

export type CapabilityId = (typeof CAPABILITY_IDS)[number];

export interface Capability {
  id: CapabilityId;
  label: string;
  /** Ce que son absence ferme — jamais ce qu'elle casse. */
  closedMeans: string;
  /** Toutes nécessaires : il en manque une, la capacité reste fermée. */
  requires: readonly string[];
  isOpen: () => boolean;
}

/**
 * Les comptes exigent une base ET un secret de session.
 *
 * Ce prédicat vivait en quatre exemplaires — page de connexion, action de
 * connexion, page de résultat, action de revendication. Quatre copies d'une
 * même règle sont quatre occasions de n'en corriger que trois.
 */
export function accountsAvailable(): boolean {
  return usingDatabase() && Boolean(process.env.AUTH_SECRET);
}

/** Le déclencheur planifié : séquence email, rappels d'échéance, purges. */
export function cronEnabled(): boolean {
  return Boolean(process.env.ADMITTO_CRON_SECRET);
}

/** Le signalement des erreurs serveur vers un webhook externe. */
export function errorWebhookEnabled(): boolean {
  return Boolean(process.env.ADMITTO_ERROR_WEBHOOK);
}

export const CAPABILITIES: readonly Capability[] = [
  {
    id: "ACCOUNTS",
    label: "Comptes et espace payant",
    closedMeans:
      "La connexion affiche un formulaire inerte et le dit ; l'espace payant renvoie vers la connexion.",
    requires: ["DATABASE_URL", "AUTH_SECRET"],
    isOpen: accountsAvailable,
  },
  {
    id: "EMAIL_DELIVERY",
    label: "Expédition des emails",
    closedMeans:
      "Les messages sont journalisés sans être expédiés, et les écrans qui les annonçaient disent la bêta.",
    requires: ["RESEND_API_KEY", "ADMITTO_EMAIL_FROM", "ADMITTO_BASE_URL"],
    isOpen: emailsAreDelivered,
  },
  {
    id: "PAYMENT",
    label: "Paiement",
    closedMeans: "Le diagnostic est offert : c'est le régime de la phase bêta.",
    requires: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
    isOpen: paymentsEnabled,
  },
  {
    id: "VAULT_STORAGE",
    label: "Dépôt de fichiers au coffre",
    closedMeans:
      "Le coffre suit les documents déclarés ; aucun fichier ne quitte l'ordinateur de la personne.",
    requires: ["ADMITTO_VAULT_DIR"],
    isOpen: storageEnabled,
  },
  {
    id: "CRON",
    label: "Déclencheur planifié",
    closedMeans:
      "La route répond 503 : ni séquence email, ni rappels d'échéance, ni purge des données techniques.",
    requires: ["ADMITTO_CRON_SECRET"],
    isOpen: cronEnabled,
  },
  {
    id: "PUBLIC_SITE",
    label: "Site public et indexable",
    closedMeans:
      "robots.txt interdit toute exploration, le sitemap est vide, aucune canonique n'est émise.",
    requires: ["ADMITTO_BASE_URL"],
    isOpen: isPublicSite,
  },
  {
    id: "ERROR_WEBHOOK",
    label: "Signalement des erreurs serveur",
    closedMeans: "Les erreurs sont journalisées sur la machine, sans alerte sortante.",
    requires: ["ADMITTO_ERROR_WEBHOOK"],
    isOpen: errorWebhookEnabled,
  },
];

export interface CapabilityState extends Capability {
  open: boolean;
  /** Variables non renseignées, dans l'ordre où elles sont attendues. */
  missing: string[];
}

/**
 * État courant, lu à la requête.
 *
 * `missing` nomme ce qui manque, et c'est le point : une capacité fermée sans
 * dire POURQUOI se diagnostique en relisant le code, jamais en regardant
 * l'écran. Les valeurs elles-mêmes ne sont évidemment jamais lues ici — seule
 * leur présence l'est.
 */
export function capabilityStates(): CapabilityState[] {
  return CAPABILITIES.map((capability) => ({
    ...capability,
    open: capability.isOpen(),
    missing: capability.requires.filter((name) => !process.env[name]?.trim()),
  }));
}
