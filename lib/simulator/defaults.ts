import type { City, ScenarioInputs } from "./types";

/**
 * Valeurs de départ du simulateur (CDC §26).
 *
 * ⚠️ Ce sont des ORDRES DE GRANDEUR destinés à amorcer la réflexion, pas des
 * tarifs. Chaque école, chaque bailleur et chaque prestataire publie ses
 * propres montants, qui priment. L'interface le dit à l'utilisateur.
 *
 * Ces valeurs sont volontairement regroupées ici, séparées du calcul : les
 * réviser ne demande de toucher à aucune logique.
 */

export interface CityPreset {
  label: string;
  housingMonthly: number;
  dailyLivingMonthly: number;
  transportMonthly: number;
}

export const CITY_PRESETS: Record<City, CityPreset> = {
  NEW_YORK: { label: "New York", housingMonthly: 2200, dailyLivingMonthly: 900, transportMonthly: 130 },
  BOSTON: { label: "Boston", housingMonthly: 1900, dailyLivingMonthly: 800, transportMonthly: 90 },
  WASHINGTON: { label: "Washington D.C.", housingMonthly: 1800, dailyLivingMonthly: 800, transportMonthly: 100 },
  CHICAGO: { label: "Chicago", housingMonthly: 1500, dailyLivingMonthly: 750, transportMonthly: 80 },
  LOS_ANGELES: { label: "Los Angeles", housingMonthly: 1900, dailyLivingMonthly: 850, transportMonthly: 150 },
  BERKELEY: { label: "Berkeley / San Francisco", housingMonthly: 2100, dailyLivingMonthly: 900, transportMonthly: 110 },
  OTHER: { label: "Autre ville", housingMonthly: 1400, dailyLivingMonthly: 700, transportMonthly: 90 },
};

/** Scénario de départ, à ajuster poste par poste par l'utilisateur. */
export function defaultInputs(label: string, city: City = "NEW_YORK"): ScenarioInputs {
  const preset = CITY_PRESETS[city];
  return {
    label,
    tuition: 60_000,
    universityFees: 2_500,
    lsac: 500,
    translations: 400,
    city,
    studyMonths: 10,
    housingMonthly: preset.housingMonthly,
    dailyLivingMonthly: preset.dailyLivingMonthly,
    transportMonthly: preset.transportMonthly,
    insurance: 3_000,
    visa: 700,
    travel: 1_500,
    barPrep: 3_500,
    exams: 800,
    retake: 0,
    admission: 800,
    noIncomeMonths: 3,
    scholarships: 0,
    partnerships: 0,
  };
}

/** Applique les valeurs d'une ville sans écraser les autres saisies. */
export function applyCityPreset(inputs: ScenarioInputs, city: City): ScenarioInputs {
  const preset = CITY_PRESETS[city];
  return {
    ...inputs,
    city,
    housingMonthly: preset.housingMonthly,
    dailyLivingMonthly: preset.dailyLivingMonthly,
    transportMonthly: preset.transportMonthly,
  };
}
