import type { Assessment } from "@/lib/assessment/compute";
import type { ReportRecord } from "@/lib/store/reports";
import { assembleReport } from "@/lib/report/assemble";
import { formatEuros } from "@/lib/payments/offers";
import { isDeductionValid } from "@/lib/payments/deduction";
import { isModulePublished } from "@/content/modules";
import type { EmailVariables } from "./render";
import type { SequenceKind } from "./types";

/**
 * Conditions d'envoi de chaque email de la séquence (CDC §19).
 *
 * Un email de cette séquence n'est pas seulement daté : il **affirme quelque
 * chose**. Le J+2 dit « votre rapport est prêt », le J+5 demande si vous
 * l'avez lu, le J+25 annonce l'expiration d'une déduction. Envoyer l'un
 * d'eux à la date prévue sans que le fait soit vrai n'est pas un défaut
 * d'affichage : c'est une fausse affirmation, et le destinataire n'a aucun
 * moyen de savoir laquelle.
 *
 * Chaque envoi est donc conditionné au fait qu'il énonce :
 *
 * — **J+2 et J+5** exigent un rapport effectivement envoyé. Le rapport est
 *   rédigé à la main puis marqué envoyé depuis le back-office ; à J+2 il peut
 *   très bien ne pas l'être. L'email attend alors, au lieu d'annoncer un
 *   document qui n'existe pas.
 * — **J+12** exige un module publié traitant le risque principal. Sans lui,
 *   `resourceUrl` pointerait vers une page vide — le CDC §25 interdit déjà de
 *   présenter un module non sourcé.
 * — **J+25** exige une déduction réelle et encore valable. Sans paiement du
 *   diagnostic, il n'y a rien à faire expirer, et annoncer une échéance
 *   inexistante fabriquerait une urgence.
 *
 * Le J+0 n'a pas de condition : il est envoyé à la soumission, hors de ce
 * passage.
 */

export type Ineligible =
  | "REPORT_NOT_SENT"
  | "NO_PUBLISHED_RESOURCE"
  | "NO_ACTIVE_DEDUCTION"
  | "ALREADY_SENT_AT_SUBMISSION";

export type Eligibility =
  | { ok: true; variables: EmailVariables }
  | { ok: false; reason: Ineligible };

export interface SequenceContext {
  assessment: Assessment;
  report: ReportRecord | null;
  /** Racine des liens, déjà résolue par l'appelant. */
  baseUrl: string;
  now: Date;
}

/** Le risque principal : le premier axe faible du rapport, ou rien. */
function mainRisk(context: SequenceContext): string | null {
  const assembled = assembleReport(context.assessment);
  return assembled.risks[0]?.title ?? null;
}

function reportVariables(context: SequenceContext): EmailVariables {
  const assembled = assembleReport(context.assessment);
  return {
    verdictTitle: assembled.verdictTitle,
    mainRisk: assembled.risks[0]?.title ?? "",
    offerName: assembled.offerName,
  };
}

function deductionVariables(context: SequenceContext): EmailVariables | null {
  const deduction = context.report?.deduction ?? null;
  if (!deduction) return null;
  if (!isDeductionValid(deduction, context.now)) return null;

  return {
    deductionAmount: formatEuros(deduction.amountCents),
    // Formatage en UTC : la date d'expiration est la même pour tout le monde,
    // et la calculer dans le fuseau du serveur la ferait varier d'un jour.
    deductionExpiry: new Date(deduction.expiresAt).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }),
  };
}

export function eligibility(kind: SequenceKind, context: SequenceContext): Eligibility {
  const reportSent = context.report?.status === "SENT";

  switch (kind) {
    case "J0_CONFIRMATION":
      // Parti à la soumission : ce passage n'a pas à le renvoyer.
      return { ok: false, reason: "ALREADY_SENT_AT_SUBMISSION" };

    case "J2_REPORT": {
      if (!reportSent) return { ok: false, reason: "REPORT_NOT_SENT" };
      const deduction = deductionVariables(context);
      // Le corps du J+2 cite la déduction : sans elle, il ne peut pas être
      // rendu. Un texte alternatif sans déduction reste à rédiger — d'ici là,
      // l'email attend plutôt que de partir à trou.
      if (!deduction) return { ok: false, reason: "NO_ACTIVE_DEDUCTION" };
      return { ok: true, variables: { ...reportVariables(context), ...deduction } };
    }

    case "J5_FOLLOWUP":
      // « Avez-vous eu le temps de lire votre rapport ? » n'a aucun sens si
      // aucun rapport n'est parti.
      if (!reportSent) return { ok: false, reason: "REPORT_NOT_SENT" };
      return { ok: true, variables: {} };

    case "J12_CONTENT": {
      const risk = mainRisk(context);
      const slug = risk ? resourceFor(context) : null;
      if (!risk || !slug) return { ok: false, reason: "NO_PUBLISHED_RESOURCE" };
      return {
        ok: true,
        variables: { mainRisk: risk, resourceUrl: `${context.baseUrl}/app/modules/${slug}` },
      };
    }

    case "J25_DEDUCTION_EXPIRY": {
      const deduction = deductionVariables(context);
      if (!deduction) return { ok: false, reason: "NO_ACTIVE_DEDUCTION" };
      return { ok: true, variables: { ...reportVariables(context), ...deduction } };
    }
  }
}

/**
 * Module publié à joindre au J+12.
 *
 * Le module recommandé par la feuille de route serait plus fin ; il exige de
 * charger la feuille de route pour un email dont c'est le seul besoin. Le
 * module d'orientation convient à tous les risques, et c'est le seul rédigé à
 * ce jour — `isModulePublished` le confirme au lieu de le supposer.
 */
function resourceFor(context: SequenceContext): string | null {
  void context;
  const slug = "module-0-orientation";
  return isModulePublished(slug) ? slug : null;
}
