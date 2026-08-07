/**
 * Ce que le diagnostic promet de livrer, selon le régime d'envoi.
 *
 * Deux rédactions, parce que deux régimes. Le texte annonçait un rapport
 * « par email » sans condition ; en Phase 1A le transport journalise sans
 * expédier, si bien que la personne aurait attendu un message qui ne part pas
 * — et le seul chemin vers son rapport, le lien de son résultat, ne lui aurait
 * pas été signalé. Même correction que sur la page de résultat et l'écran de
 * connexion.
 *
 * Ces deux phrases vivent HORS de `content/diagnostic.ts`, et c'est
 * volontaire : ce module-là est importé par le questionnaire, qui est un
 * composant client. Une seconde variante y aurait voyagé jusqu'au navigateur
 * pour n'être jamais rendue — et le budget de la route disait exactement cela.
 * Le serveur choisit la phrase, le client reçoit celle qui s'affiche.
 */
export const DELIVERY_PROMISE = {
  withEmail:
    "Vous recevez immédiatement votre résultat préliminaire à l'écran, puis votre rapport éducatif et stratégique personnalisé par email.",
  withoutEmail:
    "Vous recevez immédiatement votre résultat préliminaire à l'écran. Pendant la bêta, aucun email n'est expédié : conservez le lien de votre résultat, c'est par lui que votre rapport vous parviendra.",
} as const;

export const deliveryPromise = (emailsDelivered: boolean): string =>
  emailsDelivered ? DELIVERY_PROMISE.withEmail : DELIVERY_PROMISE.withoutEmail;
