/**
 * Modules pédagogiques (CDC §25).
 *
 * Ordre de production imposé par le CDC §25.1 : Module 0 (décision),
 * Module 2 (choix du LL.M.), Module 5 (BOLE), Module 6 (bar preparation).
 * Les autres viennent ensuite, selon la demande observée.
 *
 * `published` gouverne l'affichage : un module non publié est annoncé comme en
 * production, jamais lié. Un lien vers une page inexistante casse la navigation
 * et pollue la console — Next.js préfetche les liens visibles.
 */

export interface ModuleEntry {
  slug: string;
  order: number;
  title: string;
  summary: string;
  published: boolean;
}

export const MODULES: ModuleEntry[] = [
  {
    slug: "module-0-decision",
    order: 0,
    title: "Faut-il faire ce parcours ?",
    summary:
      "JD ou LL.M., parcours sur trois à cinq ans, coût, retour sur investissement, risques, profils types, raisons de faire ou de ne pas faire le projet.",
    published: false,
  },
  {
    slug: "module-1-career",
    order: 1,
    title: "Stratégie de carrière",
    summary:
      "Grands cabinets, niches, retour en France, entreprise, arbitrage, immigration, organisations internationales.",
    published: false,
  },
  {
    slug: "module-2-choisir",
    order: 2,
    title: "Choisir le bon LL.M.",
    summary:
      "Ranking, coût, bourses, networking, placement, éligibilité au barreau, partenariats, LSAC et candidatures directes.",
    published: false,
  },
  {
    slug: "module-3-candidatures",
    order: 3,
    title: "Candidatures et financement",
    summary:
      "CV, personal statement, recommandations, relevés de notes, traductions, candidatures et bourses.",
    published: false,
  },
  {
    slug: "module-4-immigration",
    order: 4,
    title: "Panorama migratoire",
    summary:
      "F-1, OPT, H-1B, O-1, L-1, sponsoring, limites et erreurs courantes. Information générale uniquement.",
    published: false,
  },
  {
    slug: "module-5-bole",
    order: 5,
    title: "Éligibilité New York et dossier d'évaluation",
    summary:
      "Advance evaluation, documents, communication avec l'autorité, échéances et responsabilités.",
    published: false,
  },
  {
    slug: "module-6-bar",
    order: 6,
    title: "Préparation du bar exam",
    summary: "UBE, MBE, MEE, MPT, NYLE, MPRE, prestataires et planning de révision.",
    published: false,
  },
  {
    slug: "module-7-admission",
    order: 7,
    title: "Admission",
    summary: "Character and Fitness, documents, références, serment et formation continue.",
    published: false,
  },
  {
    slug: "module-8-autres-barreaux",
    order: 8,
    title: "Autres barreaux et équivalences",
    summary: "UBE, Californie, autres juridictions, France et Europe.",
    published: false,
  },
  {
    slug: "module-9-recherche",
    order: 9,
    title: "Recherche de stage et d'emploi",
    summary: "Networking, alumni, cold emails, CV américain, LinkedIn, entretiens et tracker.",
    published: false,
  },
  {
    slug: "module-10-suite",
    order: 10,
    title: "Rester, rentrer ou aller ailleurs",
    summary: "Rester aux États-Unis, rentrer en France ou travailler dans un autre pays.",
    published: false,
  },
];

export function findModule(slug: string | undefined): ModuleEntry | null {
  if (!slug) return null;
  return MODULES.find((m) => m.slug === slug) ?? null;
}

export function isModulePublished(slug: string | undefined): boolean {
  return findModule(slug)?.published === true;
}
