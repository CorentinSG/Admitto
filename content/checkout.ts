/**
 * Tunnel de paiement du diagnostic (CDC §16.2).
 *
 * Le cahier des charges impose d'indiquer clairement : le contenu du rapport,
 * le délai, la nature éducative et stratégique, l'absence de conseil juridique,
 * le mécanisme de déduction, les conditions de rétractation et la politique de
 * remboursement. Chacun de ces points est un bloc ci-dessous — n'en retirer
 * aucun.
 */
export const checkout = {
  badge: "✦ RAPPORT PERSONNALISÉ",
  title: "Votre rapport éducatif et stratégique.",
  intro:
    "Le résultat préliminaire reste gratuit. Le rapport complet approfondit votre situation et vous donne une méthode d'exécution.",

  contents: {
    title: "Ce que contient le rapport",
    items: [
      "Une synthèse de votre situation et la voie préliminaire identifiée",
      "Les cinq axes de viabilité, notés et commentés",
      "Vos risques principaux et les actions permettant de les réduire",
      "Vos prochaines étapes, dans l'ordre",
      "Une timeline datée et vos scénarios de coût",
      "Les partenariats applicables, avec leurs sources et dates de vérification",
      "L'offre correspondant à votre situation",
    ],
  },

  delay: {
    title: "Délai",
    body: "Votre rapport est préparé et relu par le fondateur avant envoi. Le délai annoncé au moment de la commande est celui qui s'applique : {delay}.",
  },

  nature: {
    title: "Nature du rapport",
    body: "Il s'agit d'un produit éducatif et stratégique, fondé sur les informations que vous communiquez, des sources publiques, des parcours documentés et l'expérience personnelle du fondateur. Il ne constitue pas un conseil juridique, ne crée aucune relation avocat-client et ne vaut décision d'aucune université, autorité de barreau, autorité migratoire ou employeur.",
  },

  deduction: {
    title: "Déduction sur l'offre principale",
    body: "Le montant que vous payez aujourd'hui est intégralement déduit de l'offre Roadmap & Platform, Guided ou Concierge si vous y souscrivez dans les trente jours. Passé ce délai, la déduction n'est plus applicable.",
  },

  withdrawal: {
    title: "Droit de rétractation",
    body: "Vous disposez d'un délai de rétractation de quatorze jours. En demandant la préparation immédiate de votre rapport, vous acceptez que son exécution commence avant la fin de ce délai : une fois le rapport envoyé, le droit de rétractation ne peut plus être exercé pour cette prestation.",
  },

  refund: {
    title: "Remboursement",
    body: "Tant que votre rapport n'a pas été envoyé, il est remboursé intégralement sur simple demande. Après envoi, aucun remboursement n'est dû, la prestation étant exécutée.",
  },

  consent: {
    label:
      "J'accepte de recevoir des contenus et informations sur les offres Admitto. Facultatif, révocable à tout moment.",
    note: "Les emails nécessaires à l'exécution du service — confirmation, rapport, suivi — vous sont envoyés indépendamment de ce choix.",
  },

  cta: "Payer {price}",
  ctaDisabled: "Paiement non activé",
  betaNotice:
    "Phase bêta : le rapport complet est actuellement offert aux premiers participants, en échange de leur retour d'expérience. Aucun paiement ne vous sera demandé.",
  betaCta: "Recevoir mon rapport",
  error: "Le paiement n'a pas pu être initié. Réessayez ou écrivez-nous.",
};
