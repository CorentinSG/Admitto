/** Copie de la connexion (CDC §10). */

export const AUTH_EMAIL = {
  subject: "Votre lien de connexion — Admitto",
  body: (url: string) => `Bonjour,

Voici votre lien de connexion à Admitto :

${url}

Ce lien est valable quinze minutes et ne fonctionne qu'une fois. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email : aucun compte n'est créé tant que le lien n'est pas ouvert.

Corentin Saint-Girons
Founder`,
};

export const auth = {
  title: "Connexion",
  intro:
    "Indiquez l'adresse utilisée lors de votre diagnostic. Vous recevrez un lien de connexion — il n'y a pas de mot de passe à retenir.",
  emailLabel: "Adresse email",
  submit: "Recevoir mon lien",
  sending: "Envoi…",
  invalidEmail: "Indiquez une adresse email valide.",
  closedTitle: "Connexion indisponible",
  closedBody:
    "Les comptes ne sont pas activés sur cette instance. L'espace payant reste fermé tant que la base de données et le secret d'authentification ne sont pas configurés.",
  checkTitle: "Vérifiez votre boîte email",
  checkBody:
    "Si un compte peut être créé pour cette adresse, un lien de connexion vient d'être envoyé. Il est valable quinze minutes et ne fonctionne qu'une fois.",
  /* Même défaut que sur la page de résultat : sans transport configuré, le
     lien est journalisé côté serveur et n'arrive nulle part. Laisser quelqu'un
     surveiller ses indésirables pour un message qui ne partira jamais est la
     seule chose que cette page pouvait faire de pire. */
  checkBodyUndelivered:
    "Aucun email n'est expédié depuis cette instance : le transport n'est pas configuré. Un lien a bien été produit, mais il reste dans le journal du serveur — inutile de surveiller votre boîte.",
  checkNote:
    "Rien reçu ? Vérifiez les indésirables, puis redemandez un lien depuis la page de connexion.",
  backToSignIn: "Retour à la connexion",
  signOut: "Se déconnecter",
  noAssessment:
    "Aucun diagnostic n'est rattaché à ce compte. Commencez par le diagnostic : votre profil sera repris automatiquement.",
  startDiagnostic: "Faire le diagnostic",
  resultCta: "Accéder à ma feuille de route",
  resultCtaHint:
    "Vous recevrez un lien de connexion à l'adresse indiquée dans votre diagnostic.",
};
