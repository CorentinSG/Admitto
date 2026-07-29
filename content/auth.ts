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
