/**
 * Substitution de variables dans les blocs pré-rédigés (CDC §17).
 *
 * Le cahier des charges limite strictement les variables autorisées : prénom,
 * université, dates, coûts, partenariats, phase et parcours type. Toute autre
 * variable dans un bloc est une erreur de rédaction et fait échouer
 * l'assemblage — c'est le garde-fou qui empêche qu'un texte soit produit
 * librement au lieu d'être assemblé.
 */

export const ALLOWED_VARIABLES = [
  "firstName",
  "university",
  "intakeDate",
  "totalCostLow",
  "totalCostHigh",
  "partnershipCount",
  "phase",
  "journeyType",
] as const;

export type AllowedVariable = (typeof ALLOWED_VARIABLES)[number];
export type ReportVariables = Partial<Record<AllowedVariable, string>>;

const PLACEHOLDER = /\{(\w+)\}/g;

export class UnauthorizedVariableError extends Error {
  constructor(variable: string) {
    super(
      `Variable « ${variable} » non autorisée dans un bloc de rapport. ` +
        `Variables admises : ${ALLOWED_VARIABLES.join(", ")} (CDC §17).`
    );
    this.name = "UnauthorizedVariableError";
  }
}

export function fill(template: string, variables: ReportVariables): string {
  return template.replace(PLACEHOLDER, (_match, name: string) => {
    if (!(ALLOWED_VARIABLES as readonly string[]).includes(name)) {
      throw new UnauthorizedVariableError(name);
    }
    const value = variables[name as AllowedVariable];
    // Une variable autorisée mais non fournie laisse le bloc inutilisable :
    // mieux vaut échouer que livrer un rapport à trou.
    if (value === undefined) throw new Error(`Variable « ${name} » attendue mais absente.`);
    return value;
  });
}
