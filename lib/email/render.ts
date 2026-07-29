import { EMAIL_TEMPLATES } from "@/content/emails";
import { EMAIL_LEGAL_BASIS, type EmailKind, type RenderedEmail } from "./types";

/**
 * Rendu des emails à partir des blocs pré-rédigés.
 * Même principe que le rapport (CDC §17) : liste fermée de variables, et échec
 * plutôt qu'envoi d'un email à trou.
 */

export const ALLOWED_EMAIL_VARIABLES = [
  "firstName",
  "resultUrl",
  "reportUrl",
  "resourceUrl",
  "unsubscribeUrl",
  "delay",
  "pathLabel",
  "verdictTitle",
  "mainRisk",
  "offerName",
  "deductionAmount",
  "deductionExpiry",
  "taskTitle",
  "noticeLead",
  "deadlineList",
  "dashboardUrl",
] as const;

export type AllowedEmailVariable = (typeof ALLOWED_EMAIL_VARIABLES)[number];
export type EmailVariables = Partial<Record<AllowedEmailVariable, string>>;

const PLACEHOLDER = /\{(\w+)\}/g;

function fillEmail(template: string, variables: EmailVariables): string {
  return template.replace(PLACEHOLDER, (_m, name: string) => {
    if (!(ALLOWED_EMAIL_VARIABLES as readonly string[]).includes(name)) {
      throw new Error(
        `Variable « ${name} » non autorisée dans un email. ` +
          `Variables admises : ${ALLOWED_EMAIL_VARIABLES.join(", ")}.`
      );
    }
    const value = variables[name as AllowedEmailVariable];
    if (value === undefined) throw new Error(`Variable « ${name} » attendue mais absente.`);
    return value;
  });
}

export function renderEmail(kind: EmailKind, variables: EmailVariables): RenderedEmail {
  const template = EMAIL_TEMPLATES[kind];
  return {
    subject: fillEmail(template.subject, variables),
    body: fillEmail(template.body, variables),
    legalBasis: EMAIL_LEGAL_BASIS[kind],
  };
}
