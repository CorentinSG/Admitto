import { SCREENS } from "@/content/diagnostic";
import type { Answers, ScreenId } from "./types";

/**
 * Brouillon du questionnaire, LOCAL au navigateur.
 *
 * Douze écrans, trois à quatre minutes, souvent sur mobile, souvent
 * interrompus — et jusqu'ici les réponses ne vivaient que dans un `useState` :
 * fermer l'onglet, recharger, suivre un lien, et tout était à refaire depuis
 * l'écran 1. C'est le point de conversion du produit, et l'interruption y
 * coûtait l'intégralité du parcours.
 *
 * ## Ce que le brouillon N'ENREGISTRE PAS, et pourquoi
 *
 * Ni prénom, ni adresse, ni commentaire, ni consentement. Deux raisons
 * distinctes, toutes deux suffisantes :
 *
 * - Un choix fermé (« Master 2 ») n'identifie personne ; une adresse email,
 *   si. Un navigateur est souvent partagé — poste de bibliothèque, ordinateur
 *   familial — et le brouillon survit à la fermeture de l'onglet par
 *   construction. Écrire là ce qui identifie serait le contraire de la
 *   minimisation que le reste du produit applique.
 * - Le consentement marketing n'est JAMAIS pré-coché (CDC §34). Le restaurer
 *   depuis un brouillon reviendrait exactement à le pré-cocher, avec en plus
 *   l'ancienneté comme circonstance aggravante.
 *
 * La valeur de la reprise est de toute façon dans les dix écrans de clics, pas
 * dans les deux champs qui se retapent en dix secondes.
 *
 * ## Ce qui est relu, et jamais cru sur parole
 *
 * Chaque valeur relue est confrontée à la liste fermée de son champ. Une
 * option retirée du questionnaire depuis l'enregistrement produirait sinon un
 * profil que les moteurs ne savent pas lire — et le rapport qui en sortirait
 * n'aurait aucun signe de l'anomalie. Une valeur inconnue est écartée ; le
 * reste du brouillon survit.
 *
 * ## Péremption
 *
 * Sept jours. Au-delà, la situation a pu changer — une rentrée est passée, un
 * test a été passé — et proposer de reprendre reviendrait à proposer de
 * repartir de réponses fausses.
 */

const KEY = "admitto.diagnostic.brouillon";
const VERSION = 1;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Champs enregistrables. La liste EST le contrôle : un champ absent d'ici n'est
 * jamais enregistré, donc jamais relu.
 *
 * Ce sont exactement les écrans à choix fermés — l'écran de contact n'y figure
 * pas, et c'est ce qui écarte le prénom, l'adresse, le commentaire et le
 * consentement.
 */
const DRAFTABLE = [
  "status",
  "education",
  "university",
  "foreignBar",
  "careerGoal",
  "geoGoal",
  "budget",
  "funding",
  "intake",
  "english",
  "usStatus",
] as const satisfies readonly ScreenId[];

/**
 * Valeurs admissibles d'un champ : celles que l'écran a réellement PROPOSÉES.
 *
 * Lues sur le questionnaire lui-même plutôt que recopiées depuis les unions
 * fermées. Deux listes se seraient séparées un jour — une option retirée de
 * l'écran mais laissée dans le type reviendrait alors par le brouillon, sans
 * qu'aucun écran ne l'ait jamais offerte. Accessoirement, le questionnaire
 * embarquait ainsi deux fois les mêmes chaînes.
 */
const allowedValues = (field: (typeof DRAFTABLE)[number]): readonly string[] =>
  SCREENS.find((screen) => screen.id === field)?.options.map((option) => option.value) ?? [];

export interface Draft {
  answers: Answers;
  /** Nombre de réponses retenues — ce qu'on annonce avant de reprendre. */
  count: number;
}

/** Ne garde que les champs enregistrables, et seulement leurs valeurs connues. */
export function draftable(answers: Answers): Answers {
  const kept: Answers = {};
  for (const field of DRAFTABLE) {
    const value = answers[field];
    if (typeof value === "string" && allowedValues(field).includes(value)) {
      // Le cast est borné par ce qui précède : la valeur vient d'être trouvée
      // parmi les options que l'écran a proposées.
      (kept as Record<string, string>)[field] = value;
    }
  }
  return kept;
}

/**
 * Relit un brouillon sérialisé. Rend `null` dès que quelque chose cloche —
 * version inconnue, date absente ou périmée, aucune réponse valide — plutôt
 * que de proposer une reprise sur un contenu douteux.
 */
export function parseDraft(raw: string | null, now: Date): Draft | null {
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;

  const record = parsed as { version?: unknown; savedAt?: unknown; answers?: unknown };
  if (record.version !== VERSION) return null;
  if (typeof record.savedAt !== "string") return null;

  const savedAt = Date.parse(record.savedAt);
  if (!Number.isFinite(savedAt)) return null;
  // Un brouillon daté du futur est un brouillon dont on ne sait rien : horloge
  // reculée, fichier bricolé. Il ne mérite pas plus de confiance qu'un périmé.
  if (savedAt > now.getTime() || now.getTime() - savedAt > MAX_AGE_MS) return null;

  if (typeof record.answers !== "object" || record.answers === null) return null;
  const answers = draftable(record.answers as Answers);
  const count = Object.keys(answers).length;
  return count > 0 ? { answers, count } : null;
}

/** Sérialisation, symétrique de `parseDraft`. */
export function serializeDraft(answers: Answers, now: Date): string | null {
  const kept = draftable(answers);
  if (Object.keys(kept).length === 0) return null;
  return JSON.stringify({ version: VERSION, savedAt: now.toISOString(), answers: kept });
}

/*
 * Accès au stockage. Isolés ici pour que la logique ci-dessus reste testable
 * sans navigateur — et enveloppés parce que `localStorage` LÈVE dans plusieurs
 * situations ordinaires : navigation privée sur certains navigateurs, quota
 * atteint, cookies tiers bloqués. Une exception y ferait tomber tout le
 * questionnaire, c'est-à-dire perdre le parcours pour avoir voulu le sauver.
 */

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readDraft(now: Date): Draft | null {
  const store = storage();
  if (!store) return null;
  try {
    return parseDraft(store.getItem(KEY), now);
  } catch {
    return null;
  }
}

export function writeDraft(answers: Answers, now: Date): void {
  const store = storage();
  if (!store) return;
  const payload = serializeDraft(answers, now);
  try {
    if (payload) store.setItem(KEY, payload);
    else store.removeItem(KEY);
  } catch {
    /* Stockage plein ou refusé : la reprise sera indisponible, rien de plus. */
  }
}

export function clearDraft(): void {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(KEY);
  } catch {
    /* idem */
  }
}
