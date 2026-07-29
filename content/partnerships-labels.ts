import type { PartnershipType, TuitionCategory } from "@/lib/partnerships/types";

/** Libellés des partenariats (CDC §27), repris de la base source. */

export const PARTNERSHIP_LABELS: Record<PartnershipType, string> = {
  reserved_seat: "Place réservée",
  preferential_treatment: "Traitement préférentiel",
  reserved_seat_and_preferential_treatment: "Place réservée et traitement préférentiel",
  pipeline: "Admission facilitée, sans place réservée",
  dual_degree: "Double diplôme",
  to_confirm: "Type d'accord à confirmer",
};

export const TUITION_LABELS: Record<TuitionCategory, string> = {
  no_tuition: "Sans frais de scolarité",
  fixed_fee: "Frais fixes réduits",
  reduced_tuition: "Frais de scolarité réduits",
  scholarship_possible: "Bourse possible",
  full_or_unknown: "Frais complets ou non communiqués",
  to_confirm: "Frais à confirmer",
};
