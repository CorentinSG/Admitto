import type { LegalDocument } from "@/lib/legal/types";
import { PENDING } from "@/lib/legal/types";

/**
 * Textes légaux (revue §A1) — mentions légales, confidentialité, CGV.
 *
 * Le pied de page renvoyait déjà vers ces trois adresses avant qu'elles
 * n'existent : un lien vers un 404 est pire qu'une absence de lien, parce qu'il
 * laisse croire que le document existe.
 *
 * Deux régimes se croisent ici, et la distinction est délibérée :
 *
 * — Ce que le **produit** fait est vérifiable dans ce dépôt. La politique de
 *   confidentialité énumère donc exactement ce que `prisma/schema.prisma`
 *   stocke, avec la base légale de chaque traitement. Rien n'y est rédigé « en
 *   général » : chaque ligne correspond à une table.
 *
 * — Ce que l'**éditeur** est — raison sociale, immatriculation, adresse,
 *   hébergeur, médiateur — ne se déduit d'aucun fichier. Ces mentions restent
 *   `PENDING`. Une raison sociale plausible inventée ici ne serait pas un
 *   brouillon : ce serait une fausse mention légale, et elle passerait
 *   inaperçue précisément parce qu'elle aurait l'air complète.
 *
 * `npm run check:legal` refuse qu'un document incomplet soit annoncé comme
 * publié, et les pages affichent en clair ce qui manque.
 */

const CONTACT = "contact@admitto.app";

// ── Mentions légales (LCEN art. 6-III) ──────────────────────────────────────

const MENTIONS: LegalDocument = {
  slug: "mentions-legales",
  title: "Mentions légales",
  intro:
    "Informations relatives à l'éditeur et à l'hébergeur du site, publiées en application de la loi pour la confiance dans l'économie numérique.",
  updatedAt: "2026-07-30",
  sections: [
    {
      id: "editeur",
      title: "Éditeur du site",
      blocks: [
        {
          kind: "ENTRIES",
          entries: [
            {
              label: "Dénomination sociale",
              value: PENDING,
              why: "Nom exact figurant sur l'extrait Kbis, ou nom et prénom si l'activité est exercée en nom propre.",
            },
            {
              label: "Forme juridique et capital social",
              value: PENDING,
              why: "Exigé pour les sociétés ; sans objet pour un entrepreneur individuel.",
            },
            {
              label: "Siège social",
              value: PENDING,
              why: "Adresse postale complète du siège.",
            },
            {
              label: "Numéro RCS / SIREN",
              value: PENDING,
              why: "Immatriculation au registre du commerce et des sociétés, ou au répertoire des métiers.",
            },
            {
              label: "Numéro de TVA intracommunautaire",
              value: PENDING,
              why: "À indiquer dès lors que l'éditeur est assujetti.",
            },
            {
              label: "Directeur de la publication",
              value: PENDING,
              why: "Représentant légal de l'éditeur.",
            },
            {
              label: "Adresse de contact",
              value: CONTACT,
            },
          ],
        },
      ],
    },
    {
      id: "hebergeur",
      title: "Hébergeur",
      blocks: [
        {
          kind: "ENTRIES",
          entries: [
            {
              label: "Hébergeur",
              value: PENDING,
              why: "Dénomination de l'hébergeur retenu en production.",
            },
            {
              label: "Adresse de l'hébergeur",
              value: PENDING,
              why: "Adresse postale et numéro de téléphone, exigés par la LCEN.",
            },
            {
              label: "Localisation des serveurs",
              value: PENDING,
              why: "Région d'hébergement ; conditionne ce qui est écrit sur les transferts hors Union européenne dans la politique de confidentialité.",
            },
          ],
        },
      ],
    },
    {
      id: "nature",
      title: "Nature du service",
      blocks: [
        {
          kind: "TEXT",
          body: [
            "Admitto est un service éducatif et méthodologique destiné aux juristes formés en France qui envisagent un LL.M. aux États-Unis et, le cas échéant, l'examen du barreau de New York.",
            "Le service n'est pas un cabinet d'avocats et n'exerce aucune activité de consultation juridique. Il ne crée aucune relation avocat-client, ne délivre aucune consultation en droit américain et ne se substitue à aucune autorité.",
            "Les décisions relatives à l'admission dans une université, à l'évaluation d'un diplôme étranger et à l'accès à l'examen du barreau appartiennent exclusivement aux universités concernées et, pour l'État de New York, au New York State Board of Law Examiners et à la Court of Appeals. Les informations publiées sur ce site décrivent les règles applicables et leurs sources ; elles ne préjugent d'aucune décision individuelle.",
          ],
        },
      ],
    },
    {
      id: "propriete",
      title: "Propriété intellectuelle",
      blocks: [
        {
          kind: "TEXT",
          body: [
            "L'ensemble des contenus du site — textes, méthodologie, modules, modèles de documents, éléments graphiques et développements logiciels — est protégé par le droit de la propriété intellectuelle et demeure la propriété de l'éditeur.",
            "L'accès à un contenu payant ouvre un droit d'usage personnel et non transférable, pour la durée de l'offre souscrite. Toute reproduction, diffusion ou revente, même partielle, est interdite sans autorisation écrite.",
          ],
        },
      ],
    },
    {
      id: "signalement",
      title: "Signalement d'un contenu",
      blocks: [
        {
          kind: "TEXT",
          body: [
            `Toute erreur factuelle, source périmée ou contenu jugé illicite peut être signalée à ${CONTACT}. Les règles officielles citées portent leur source et leur date de vérification : un signalement documenté est traité en priorité.`,
          ],
        },
      ],
    },
  ],
};

// ── Politique de confidentialité (RGPD art. 13) ─────────────────────────────

const CONFIDENTIALITE: LegalDocument = {
  slug: "confidentialite",
  title: "Politique de confidentialité",
  intro:
    "Ce que le service enregistre, pourquoi, sur quelle base légale, combien de temps, et comment reprendre la main sur ces données.",
  updatedAt: "2026-07-30",
  sections: [
    {
      id: "responsable",
      title: "Responsable du traitement",
      blocks: [
        {
          kind: "ENTRIES",
          entries: [
            {
              label: "Responsable du traitement",
              value: PENDING,
              why: "Même entité que l'éditeur indiqué dans les mentions légales.",
            },
            {
              label: "Contact",
              value: CONTACT,
            },
            {
              label: "Délégué à la protection des données",
              value: PENDING,
              why: "À renseigner uniquement si un DPO est désigné ; la désignation n'est pas obligatoire pour ce traitement.",
            },
          ],
        },
      ],
    },
    {
      id: "principe",
      title: "Principe retenu",
      blocks: [
        {
          kind: "TEXT",
          body: [
            "Le service ne collecte que ce dont le parcours a besoin pour fonctionner. Ce principe n'est pas seulement une intention : il est inscrit dans le code.",
            "Le coffre de documents n'accepte que cinq types de pièces limitativement énumérés, refuse les formats image — un scan de pièce d'identité en est un — et ne conserve aucun fichier tant qu'aucun espace de stockage n'est configuré. Le questionnaire ne propose que des réponses fermées : aucun champ de texte libre n'y est ouvert, donc aucune donnée sensible ne peut y être saisie par inadvertance.",
          ],
        },
      ],
    },
    {
      id: "donnees",
      title: "Données traitées",
      blocks: [
        {
          kind: "TABLE",
          columns: ["Données", "Finalité", "Base légale"],
          rows: [
            [
              "Prénom et adresse email",
              "Vous transmettre votre résultat, créer votre compte et vous permettre de vous connecter.",
              "Exécution du contrat (art. 6.1.b)",
            ],
            [
              "Réponses au questionnaire (parcours, diplôme, objectif professionnel, budget, calendrier, niveau d'anglais, statut administratif)",
              "Établir la voie préliminaire et le rapport personnalisé.",
              "Exécution du contrat (art. 6.1.b)",
            ],
            [
              "Résultat produit : voie préliminaire, blocs de rapport, partenariats retenus, coûts estimés, échéances, état des règles utilisées",
              "Vous restituer un résultat reproductible et permettre sa relecture avant envoi.",
              "Exécution du contrat (art. 6.1.b)",
            ],
            [
              "Avancement : statut de vos tâches, scénarios de simulation, jalons atteints",
              "Faire fonctionner le tableau de bord, la feuille de route et les rappels d'échéance.",
              "Exécution du contrat (art. 6.1.b)",
            ],
            [
              "Votre liste d'écoles : nom des programmes visés, classement que vous leur donnez, avancement, date limite et vos notes",
              "Vous permettre de constituer et de suivre votre sélection de programmes.",
              "Exécution du contrat (art. 6.1.b)",
            ],
            [
              "Documents déposés dans le coffre et leurs métadonnées (type, nom du fichier, taille, date)",
              "Conserver vos pièces de candidature au même endroit que votre feuille de route.",
              "Exécution du contrat (art. 6.1.b)",
            ],
            [
              "Séances réservées et solde de séances de votre offre",
              "Organiser les consultations incluses dans l'offre souscrite.",
              "Exécution du contrat (art. 6.1.b)",
            ],
            [
              "Rappels d'échéance déjà envoyés",
              "Ne pas vous envoyer deux fois le même rappel.",
              "Exécution du contrat (art. 6.1.b)",
            ],
            [
              "Emails d'information sur l'offre",
              "Vous informer des évolutions du service et des offres.",
              "Consentement (art. 6.1.a), révocable à tout moment",
            ],
            [
              "Jetons de connexion et sessions",
              "Vous authentifier sans mot de passe.",
              "Exécution du contrat (art. 6.1.b)",
            ],
            [
              "Adresse IP et adresse email des demandes soumises aux formulaires publics",
              "Limiter le nombre de tentatives par heure et protéger le service des envois automatisés.",
              "Intérêt légitime (art. 6.1.f) : sécurité du service",
            ],
            [
              "Traces de paiement conservées par le prestataire",
              "Encaisser et justifier les paiements.",
              "Exécution du contrat et obligation légale (art. 6.1.b et 6.1.c)",
            ],
          ],
        },
        {
          kind: "TEXT",
          body: [
            "Aucune donnée relevant de l'article 9 du règlement — santé, opinions, appartenance syndicale, origine, orientation sexuelle — n'est demandée ni acceptée. Le dépôt de documents refuse explicitement ces catégories, et le refus est motivé à l'écran.",
            "Aucun profilage publicitaire n'est effectué, et aucune donnée n'est vendue ni cédée à des fins de prospection par un tiers.",
          ],
        },
      ],
    },
    {
      id: "cookies",
      title: "Cookies et mesure d'audience",
      blocks: [
        {
          kind: "TEXT",
          body: [
            "Le site ne dépose aucun cookie publicitaire et n'utilise aucun traceur tiers de mesure d'audience.",
            "Seul un cookie de session est déposé une fois que vous vous connectez : il est strictement nécessaire au fonctionnement du service et ne requiert donc pas de consentement préalable. Il disparaît à la déconnexion ou à l'expiration de la session.",
            "Le service compte en revanche ses propres étapes de parcours : combien de fois le questionnaire a été commencé, combien de fois chaque écran a été atteint, combien de diagnostics ont été soumis. Ces compteurs de parcours ne comportent aucun identifiant — ni cookie, ni numéro de passage, ni adresse IP, ni empreinte du navigateur. Deux passages successifs de la même personne y sont indiscernables de deux passages de deux personnes différentes, et rien ne permet de les rattacher à votre compte ou à votre diagnostic.",
            "Ces compteurs ne constituent donc pas des données personnelles au sens du règlement, et ne figurent pas dans le tableau ci-dessus. Ils servent une seule question : à quel endroit du parcours les gens s'arrêtent, afin de corriger cet endroit.",
          ],
        },
      ],
    },
    {
      id: "destinataires",
      title: "Destinataires et sous-traitants",
      blocks: [
        {
          kind: "TEXT",
          body: [
            "Vos données sont accessibles à l'éditeur et aux personnes chargées de la relecture des rapports, dans la limite de ce que leur rôle exige. Elles sont également confiées aux prestataires techniques suivants, agissant comme sous-traitants au sens de l'article 28 du règlement :",
          ],
        },
        {
          kind: "ENTRIES",
          entries: [
            {
              label: "Hébergement de l'application et de la base",
              value: PENDING,
              why: "Prestataire retenu en production, et localisation des données.",
            },
            {
              label: "Envoi des emails",
              value: PENDING,
              why: "Prestataire d'envoi retenu. Tant qu'aucun n'est configuré, aucun email ne quitte le service : les messages sont seulement journalisés.",
            },
            {
              label: "Paiement",
              value: PENDING,
              why: "Prestataire de paiement retenu. Aucune coordonnée bancaire ne transite par le service ni n'y est stockée : la saisie se fait sur la page du prestataire.",
            },
          ],
        },
        {
          kind: "TEXT",
          body: [
            "Aucun transfert hors Union européenne n'est effectué en dehors de ce qui est encadré par les clauses contractuelles types de la Commission européenne conclues avec ces prestataires.",
          ],
        },
      ],
    },
    {
      id: "conservation",
      title: "Durées de conservation",
      blocks: [
        {
          kind: "TABLE",
          columns: ["Données", "Durée", "Point de départ"],
          rows: [
            [
              "Diagnostic jamais rattaché à un compte",
              "12 mois, puis suppression automatique",
              "Date du diagnostic",
            ],
            [
              "Compte, diagnostics rattachés, avancement et documents",
              "Jusqu'à la suppression du compte, puis 36 mois d'inactivité",
              "Dernière connexion",
            ],
            [
              "Jetons de connexion expirés",
              "Supprimés au passage suivant de la purge",
              "Expiration du jeton (15 minutes)",
            ],
            [
              "Tentatives comptées sur les formulaires publics",
              "Quelques heures",
              "Date de la tentative",
            ],
            ["Pièces comptables liées à un paiement", "10 ans", "Clôture de l'exercice comptable"],
          ],
        },
        {
          kind: "TEXT",
          body: [
            "La suppression des diagnostics jamais rattachés à un compte est automatique, pas discrétionnaire : passé le délai, la donnée disparaît sans qu'une décision humaine ait à intervenir. Un diagnostic rattaché à un compte, en revanche, n'est jamais supprimé sans que vous l'ayez demandé — c'est votre travail.",
          ],
        },
      ],
    },
    {
      id: "droits",
      title: "Vos droits",
      blocks: [
        {
          kind: "LIST",
          intro: "Vous disposez, sur les données vous concernant, des droits suivants :",
          items: [
            "Accès : obtenir la copie des données traitées.",
            "Rectification : corriger une donnée inexacte — en pratique, reprendre le questionnaire.",
            "Effacement : demander la suppression de votre compte et de tout ce qui s'y rattache.",
            "Portabilité : récupérer vos données dans un format lisible par machine.",
            "Opposition et limitation : vous opposer à un traitement fondé sur l'intérêt légitime, ou en demander la limitation.",
            "Retrait du consentement : cesser de recevoir les emails d'information, sans que cela affecte le reste du service.",
          ],
        },
        {
          kind: "TEXT",
          body: [
            "L'accès, la portabilité et l'effacement s'exercent directement depuis la page « Vos données » de votre espace, sans demande préalable ni délai d'instruction : l'export est immédiat et la suppression est définitive dès sa confirmation. Les autres droits s'exercent par écrit à " +
              CONTACT +
              ".",
            "Le retrait du consentement aux emails d'information n'interrompt jamais les messages nécessaires à l'exécution du service — lien de connexion, envoi de votre rapport, rappel d'une échéance que vous avez inscrite à votre feuille de route.",
            "Vous pouvez introduire une réclamation auprès de la Commission nationale de l'informatique et des libertés (CNIL), 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07 — www.cnil.fr.",
          ],
        },
      ],
    },
    {
      id: "securite",
      title: "Sécurité",
      blocks: [
        {
          kind: "LIST",
          intro: "Les mesures suivantes sont en place :",
          items: [
            "Chiffrement des échanges en transit et politique de sécurité de contenu restrictive.",
            "Authentification sans mot de passe par lien à usage unique valable quinze minutes : aucun mot de passe n'est stocké, donc aucun ne peut fuiter.",
            "Espace payant et back-office fermés par défaut : en l'absence de session valide, l'accès est refusé plutôt qu'accordé.",
            "Un résultat rattaché à un compte n'est plus consultable par la seule possession de son adresse.",
            "Limitation du nombre de tentatives par adresse email et par adresse IP sur les formulaires publics.",
            "Refus, à l'écriture, des types de documents non prévus, des formats image et des fichiers hors gabarit.",
          ],
        },
      ],
    },
    {
      id: "journaux",
      title: "Journaux techniques",
      blocks: [
        {
          kind: "TEXT",
          body: [
            "Le service tient un journal d'exploitation : une ligne par passage des tâches planifiées, par confirmation de paiement reçue, par connexion et par erreur du serveur. Il sert à constater qu'une fonction s'exécute encore, et à retrouver une panne signalée.",
            "Ce journal ne contient aucune donnée personnelle. Il enregistre des compteurs, des motifs de refus et des classes d'erreur ; jamais votre adresse email, votre prénom, ni l'identifiant de votre diagnostic. Les adresses et identifiants qui apparaîtraient dans un message d'erreur sont remplacés avant écriture, et non tronqués : une adresse tronquée désigne encore quelqu'un.",
            "Lorsqu'un écran d'erreur vous présente une référence, c'est le seul élément qui relie ce que vous avez vu à la ligne correspondante. Il ne révèle rien par lui-même.",
          ],
        },
        {
          kind: "TEXT",
          body: [
            "L'éditeur peut configurer une adresse externe recevant une alerte à chaque erreur du serveur. Cette alerte est plus pauvre encore que la ligne conservée sur la machine : elle porte la route concernée, la méthode, la classe de l'erreur et la référence, jamais le message d'erreur ni le détail de son exécution.",
          ],
        },
      ],
    },
  ],
};

// ── Conditions générales de vente et d'utilisation ──────────────────────────

const CGV: LegalDocument = {
  slug: "conditions-generales",
  title: "Conditions générales",
  intro:
    "Conditions de vente et d'utilisation du service. Elles définissent ce qui est vendu, ce qui ne l'est pas, et ce que chacun doit à l'autre.",
  updatedAt: "2026-07-30",
  sections: [
    {
      id: "objet",
      title: "Objet et périmètre",
      blocks: [
        {
          kind: "TEXT",
          body: [
            "Les présentes conditions régissent l'accès au site et la souscription aux offres proposées par l'éditeur, dont l'identité figure dans les mentions légales.",
            "Le service fournit une méthode : un diagnostic préliminaire, un rapport personnalisé, une feuille de route, des modules pédagogiques, des outils de simulation et, selon l'offre, des séances de coaching.",
          ],
        },
        {
          kind: "LIST",
          intro: "Le service ne comprend en aucun cas :",
          items: [
            "une consultation juridique, en droit français comme en droit américain ;",
            "la constitution ou le dépôt d'un dossier de candidature à votre place ;",
            "une démarche auprès d'une université, d'un organisme d'évaluation de diplôme ou d'une autorité d'admission au barreau ;",
            "une préparation à l'examen du barreau, qui relève d'organismes spécialisés ;",
            "une prestation d'immigration ou de placement professionnel.",
          ],
        },
        {
          kind: "TEXT",
          body: [
            "Aucun résultat n'est promis. Les décisions d'admission, d'évaluation de diplôme et d'accès à l'examen relèvent exclusivement des institutions compétentes, selon leurs propres critères et à la date où elles statuent.",
          ],
        },
      ],
    },
    {
      id: "offres",
      title: "Offres et prix",
      blocks: [
        {
          kind: "TEXT",
          body: [
            "Les offres et leurs prix sont présentés sur le site avant toute souscription. Les prix sont indiqués en euros, toutes taxes comprises pour les particuliers.",
            "Le montant du diagnostic est déduit du prix d'une offre supérieure souscrite dans les trente jours suivant son paiement. Passé ce délai, la déduction n'est plus applicable, et le montant affiché avant paiement est celui qui sera prélevé.",
            "Le paiement échelonné, lorsqu'il est proposé, ne modifie ni le prix total ni le périmètre de l'offre.",
          ],
        },
      ],
    },
    {
      id: "commande",
      title: "Commande et paiement",
      blocks: [
        {
          kind: "TEXT",
          body: [
            "La commande est formée lorsque le paiement est confirmé par le prestataire de paiement. Un récapitulatif du périmètre et du montant est affiché avant validation.",
            "Aucune coordonnée bancaire n'est saisie sur le site ni conservée par l'éditeur : le paiement est réalisé sur l'interface du prestataire.",
          ],
        },
      ],
    },
    {
      id: "retractation",
      title: "Droit de rétractation",
      blocks: [
        {
          kind: "TEXT",
          body: [
            "Conformément à l'article L. 221-18 du code de la consommation, vous disposez de quatorze jours à compter de la souscription pour vous rétracter, sans motif ni pénalité.",
            "L'exécution du service commence à l'issue de ce délai, sauf demande expresse de votre part. Si vous demandez à en bénéficier immédiatement et que la prestation est entièrement exécutée avant la fin du délai, le droit de rétractation s'éteint, conformément à l'article L. 221-28, 1° du même code — cette conséquence vous est rappelée au moment où vous formulez la demande.",
            "Si l'exécution a commencé à votre demande sans être achevée, le remboursement est proportionnel à ce qui reste à fournir.",
            `La rétractation s'exerce par écrit à ${CONTACT}, sans formalisme particulier.`,
          ],
        },
      ],
    },
    {
      id: "seances",
      title: "Séances de coaching",
      blocks: [
        {
          kind: "TEXT",
          body: [
            "Le nombre de séances incluses est celui indiqué dans l'offre souscrite ; il est toujours chiffré, et aucune offre n'en propose un nombre indéterminé.",
            "Une séance se réserve au moins quarante-huit heures à l'avance. Une annulation effectuée dans ce même délai reconstitue le solde ; passé ce délai, la séance est décomptée.",
            "Chaque type de séance porte à l'écran ce qu'il couvre et ce qu'il exclut. Une séance ne comporte jamais de consultation juridique, ni d'appréciation sur l'issue d'une candidature ou d'une demande d'accès à l'examen.",
          ],
        },
      ],
    },
    {
      id: "duree",
      title: "Durée et accès",
      blocks: [
        {
          kind: "TEXT",
          body: [
            "L'accès à la plateforme est ouvert pour la durée indiquée dans l'offre. Les contenus évoluent : les règles officielles citées portent leur source et leur date de vérification, et sont mises à jour lorsque la source change.",
            "L'éditeur peut faire évoluer les fonctionnalités sans réduire le périmètre de l'offre déjà souscrite.",
          ],
        },
      ],
    },
    {
      id: "obligations",
      title: "Vos obligations",
      blocks: [
        {
          kind: "LIST",
          items: [
            "Fournir des informations exactes : un diagnostic établi sur des réponses inexactes n'a aucune valeur, et l'éditeur ne peut en répondre.",
            "Conserver l'usage de votre accès pour vous-même : il est personnel et non transférable.",
            "Ne déposer dans le coffre que les documents demandés, et aucune pièce contenant des données sensibles.",
            "Ne pas reproduire ni diffuser les contenus hors de l'usage personnel prévu.",
          ],
        },
      ],
    },
    {
      id: "responsabilite",
      title: "Responsabilité",
      blocks: [
        {
          kind: "TEXT",
          body: [
            "L'éditeur est tenu d'une obligation de moyens sur la qualité et l'actualité de la méthode et des informations fournies. Il ne répond pas des décisions prises par les universités, les organismes d'évaluation de diplôme ou les autorités d'admission au barreau, ni des conséquences d'une évolution de leurs règles postérieure à la date de vérification indiquée.",
            "Les estimations de coût et de calendrier sont des ordres de grandeur fondés sur les paramètres que vous saisissez ; elles ne constituent ni un devis, ni un engagement de tiers.",
            "Aucune stipulation des présentes ne limite les droits que la loi reconnaît au consommateur, notamment la garantie légale de conformité.",
          ],
        },
      ],
    },
    {
      id: "resiliation",
      title: "Suspension et résiliation",
      blocks: [
        {
          kind: "TEXT",
          body: [
            "Vous pouvez supprimer votre compte à tout moment depuis la page « Vos données ». La suppression efface le compte et l'ensemble des données rattachées ; elle est définitive et n'ouvre pas droit au remboursement d'une offre déjà exécutée.",
            "L'éditeur peut suspendre un accès en cas de manquement caractérisé aux présentes, après vous en avoir informé et vous avoir mis en mesure d'y remédier, sauf manquement rendant la poursuite immédiatement impossible.",
          ],
        },
      ],
    },
    {
      id: "litiges",
      title: "Réclamations et litiges",
      blocks: [
        {
          kind: "TEXT",
          body: [
            `Toute réclamation est à adresser à ${CONTACT}. Une réponse est apportée dans un délai raisonnable.`,
            "En cas de litige non résolu, le consommateur peut recourir gratuitement à un médiateur de la consommation, conformément à l'article L. 612-1 du code de la consommation.",
          ],
        },
        {
          kind: "ENTRIES",
          entries: [
            {
              label: "Médiateur de la consommation",
              value: PENDING,
              why: "Nom, adresse et site du médiateur auquel l'éditeur adhère. L'adhésion à un dispositif de médiation est obligatoire pour un professionnel vendant à des consommateurs.",
            },
          ],
        },
        {
          kind: "TEXT",
          body: [
            "La plateforme européenne de règlement en ligne des litiges est accessible à l'adresse ec.europa.eu/consumers/odr.",
            "Les présentes conditions sont soumises au droit français. À défaut de résolution amiable, le litige relève des juridictions compétentes selon les règles de droit commun.",
          ],
        },
      ],
    },
  ],
};

export const LEGAL_DOCUMENTS: LegalDocument[] = [MENTIONS, CONFIDENTIALITE, CGV];

export function legalDocument(slug: string): LegalDocument | undefined {
  return LEGAL_DOCUMENTS.find((doc) => doc.slug === slug);
}

/** Copie de l'encart qui signale les mentions encore à fournir. */
export const legalNotice = {
  title: "Mentions à compléter avant mise en ligne publique",
  body: "Les informations ci-dessous engagent l'éditeur et ne peuvent venir que de lui. Elles sont volontairement laissées vides plutôt que remplies d'une valeur plausible.",
};
