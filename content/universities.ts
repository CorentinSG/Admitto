import { FRENCH_UNIVERSITIES_DATA } from "./partnerships.generated";

/**
 * Universités françaises proposées au questionnaire (écran 3).
 *
 * La liste réunit celles couvertes par la base de partenariats — dont les
 * identifiants viennent de la base elle-même, ce qui garantit une détection
 * fiable — et d'autres facultés fréquentes, sans partenariat enregistré à ce
 * jour. Le questionnaire stocke l'IDENTIFIANT, jamais le libellé : renommer une
 * université ne doit pas casser la détection.
 */

export interface UniversityOption {
  id: string;
  name: string;
}

/** Facultés sans partenariat enregistré, ajoutées pour la couverture du questionnaire. */
const WITHOUT_PARTNERSHIP: UniversityOption[] = [
  { id: "paris-cite", name: "Université Paris Cité" },
  { id: "sciences-po", name: "Sciences Po Paris" },
  { id: "lille", name: "Université de Lille" },
  { id: "montpellier", name: "Université de Montpellier" },
  { id: "strasbourg", name: "Université de Strasbourg" },
  { id: "rennes", name: "Université de Rennes" },
  { id: "toulouse", name: "Université Toulouse Capitole" },
];

export const OTHER_UNIVERSITY_ID = "autre";

export const UNIVERSITIES: UniversityOption[] = [
  ...FRENCH_UNIVERSITIES_DATA.map((u) => ({ id: u.id, name: u.name })),
  ...WITHOUT_PARTNERSHIP,
]
  .sort((a, b) => a.name.localeCompare(b.name, "fr"))
  .concat({ id: OTHER_UNIVERSITY_ID, name: "Autre université / non listée" });

export const UNIVERSITY_IDS = UNIVERSITIES.map((u) => u.id);

/** Libellé affichable d'une université, pour les rapports et emails. */
export function universityName(id: string | undefined): string {
  if (!id) return "votre université";
  return UNIVERSITIES.find((u) => u.id === id)?.name ?? "votre université";
}
