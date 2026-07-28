import type { Answers } from "@/lib/questionnaire/types";

/**
 * Principales échéances du résultat immédiat (CDC §15).
 *
 * Les dates sont calculées par décalage depuis la rentrée visée (mi-août de
 * l'année cible). Ce sont des repères de planification, pas des dates
 * officielles : chaque université, autorité et prestataire publie son propre
 * calendrier, qui prime.
 */

export interface Deadline {
  label: string;
  /** Date repère (ISO, jour près). */
  date: string;
  /** Nombre de mois avant la rentrée. */
  monthsBeforeIntake: number;
  note: string;
  /** Clé stable, utilisée pour écarter une échéance sans objet pour le profil. */
  key: "ENGLISH" | "SCHOOL_LIST" | "APPLICATIONS" | "SCHOLARSHIPS" | "VISA" | "BOLE" | "BAR_REGISTRATION";
}

const MILESTONES: Array<Omit<Deadline, "date">> = [
  {
    key: "ENGLISH",
    label: "Test d'anglais passé",
    monthsBeforeIntake: 12,
    note: "Prévoir une session de rattrapage possible avant les dépôts.",
  },
  {
    key: "SCHOOL_LIST",
    label: "Liste d'écoles finalisée",
    monthsBeforeIntake: 11,
    note: "Croiser coût net, placement, éligibilité au barreau et partenariats.",
  },
  {
    key: "APPLICATIONS",
    label: "Dossiers de candidature déposés",
    monthsBeforeIntake: 9,
    note: "Les dates limites varient selon les écoles ; les plus sélectives ferment tôt.",
  },
  {
    key: "SCHOLARSHIPS",
    label: "Demandes de bourses envoyées",
    monthsBeforeIntake: 9,
    note: "Souvent instruites en même temps que la candidature, parfois avant.",
  },
  {
    key: "VISA",
    label: "Dossier de visa engagé",
    monthsBeforeIntake: 4,
    note: "Ne peut démarrer qu'après réception des documents de l'université.",
  },
];

/** Échéances propres au parcours de barreau, une fois le LL.M. commencé. */
const BAR_MILESTONES: Array<Omit<Deadline, "date">> = [
  {
    key: "BOLE",
    label: "Dossier d'évaluation adressé au BOLE",
    monthsBeforeIntake: -2,
    note: "L'évaluation individuelle relève exclusivement du New York Board of Law Examiners.",
  },
  {
    key: "BAR_REGISTRATION",
    label: "Inscription à l'examen",
    monthsBeforeIntake: -8,
    note: "Les fenêtres d'inscription sont courtes et fixées par l'autorité.",
  },
];

function shiftMonths(from: Date, months: number): string {
  const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() - months, from.getUTCDate()));
  return d.toISOString().slice(0, 10);
}

/**
 * @param reference date du jour, injectée pour rester déterministe et testable
 */
export function computeDeadlines(answers: Answers, reference: Date): Deadline[] {
  if (!answers.intake || answers.intake === "UNDECIDED") return [];

  const offsetYears = { Y1: 1, Y2: 2, Y3: 3, LATER: 4, ALREADY_STARTED: 0 }[answers.intake];
  const intakeDate = new Date(Date.UTC(reference.getUTCFullYear() + offsetYears, 7, 15));

  const milestones =
    answers.intake === "ALREADY_STARTED" || answers.status === "ADMITTED_OR_ENROLLED"
      ? BAR_MILESTONES
      : MILESTONES;

  return milestones
    .filter((m) => isRelevant(m.key, answers))
    .map((m) => ({ ...m, date: shiftMonths(intakeDate, m.monthsBeforeIntake) }))
    .filter((m) => m.date >= reference.toISOString().slice(0, 10));
}

/**
 * Une échéance sans objet pour le profil ne doit pas être affichée :
 * - pas de branche visa pour un double national américain (CDC §12.4) ;
 * - pas d'échéance de test d'anglais si le test est déjà passé ;
 * - pas de demande de bourses si l'utilisateur a écarté cette option.
 */
function isRelevant(key: Deadline["key"], answers: Answers): boolean {
  if (key === "VISA" && answers.usStatus === "US_DUAL_NATIONAL") return false;
  if (key === "ENGLISH" && answers.english === "TEST_TAKEN") return false;
  if (key === "SCHOLARSHIPS" && (answers.funding === "LOAN" || answers.funding === "NONE")) {
    return false;
  }
  return true;
}
