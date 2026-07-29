/**
 * ⚠️ FICHIER GÉNÉRÉ — ne pas modifier à la main.
 * Régénérer avec : node scripts/import-partnerships.mjs <chemin-du-depot-source>
 *
 * Source   : https://github.com/corentinsg/llm-partnerships
 * Commit   : 07ef9a7d37598a02fad2956e91219821efbe1bda
 * Importé  : 2026-07-29
 *
 * Base de partenariats entre universités françaises et law schools américaines
 * (CDC §27). Seules les fiches « confirmed » sont actives, c'est-à-dire
 * affichables à un utilisateur ; les fiches « to_confirm » et « incomplete »
 * sont conservées comme pistes de vérification et restent inactives.
 *
 * `verifiedAt` porte la date de l'instantané source, pas une vérification
 * fiche par fiche : c'est la seule affirmation que la donnée permet.
 */
import type { Partnership, PartnerUniversity } from "@/lib/partnerships/types";

export const IMPORT_SOURCE = {
  "repo": "https://github.com/corentinsg/llm-partnerships",
  "commit": "07ef9a7d37598a02fad2956e91219821efbe1bda",
  "importedAt": "2026-07-29"
} as const;

export const FRENCH_UNIVERSITIES_DATA: PartnerUniversity[] = [
  {
    "id": "amu",
    "name": "Aix-Marseille Université",
    "city": "Aix-en-Provence"
  },
  {
    "id": "cy-cergy",
    "name": "CY Cergy Paris Université",
    "city": "Cergy"
  },
  {
    "id": "catholille",
    "name": "Faculté de droit de l'Université Catholique de Lille",
    "city": "Lille"
  },
  {
    "id": "nantes",
    "name": "Nantes Université",
    "city": "Nantes"
  },
  {
    "id": "dauphine",
    "name": "Paris Dauphine-PSL",
    "city": "Paris"
  },
  {
    "id": "ucly",
    "name": "Université Catholique de Lyon",
    "city": "Lyon"
  },
  {
    "id": "nice-cote-azur",
    "name": "Université Côte d’Azur (Nice)",
    "city": "Nice"
  },
  {
    "id": "bordeaux",
    "name": "Université de Bordeaux",
    "city": "Bordeaux"
  },
  {
    "id": "lyon3",
    "name": "Université Jean Moulin Lyon 3",
    "city": "Lyon"
  },
  {
    "id": "paris1",
    "name": "Université Paris 1 Panthéon-Sorbonne",
    "city": "Paris"
  },
  {
    "id": "paris-nanterre",
    "name": "Université Paris Nanterre",
    "city": "Nanterre"
  },
  {
    "id": "assas",
    "name": "Université Paris-Panthéon-Assas",
    "city": "Paris"
  },
  {
    "id": "paris-saclay",
    "name": "Université Paris-Saclay",
    "city": "Saclay / Sceaux"
  }
];

export const PARTNERSHIPS_DATA: Partnership[] = [
  {
    "id": "amu-boston",
    "frenchUniversityId": "amu",
    "frenchUniversity": "Aix-Marseille Université",
    "usLawSchool": "Université à Boston (nom exact à confirmer)",
    "city": "Boston",
    "state": "Massachusetts",
    "partnershipType": "preferential_treatment",
    "tuitionCategory": "reduced_tuition",
    "tuitionDisplay": "Environ 30 000 $ (prix exact à confirmer)",
    "financialAid": null,
    "seatsDisplay": "Environ une dizaine de places pour les partenariats LL.M américains, selon retour étudiant.",
    "seatsMin": null,
    "seatsMax": null,
    "requiredLevel": "M2",
    "requiredLevelRaw": "Master 2",
    "programLanguage": "Anglais",
    "duration": "1 an",
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": "Processus (à confirmer) : sélection interne IDA (liste de 3 universités, CV FR, lettre FR, entretien en anglais), puis candidature auprès du partenaire à Boston (CV EN, lettre EN, relevés, test d’anglais ; dossier LSAC selon retour étudiant).",
    "languageTests": [],
    "applicationDeadline": null,
    "shortDescription": "Partenariat LL.M avec une université située à Boston. Le nom exact de l’université partenaire doit encore être confirmé.",
    "officialLink": null,
    "reliability": "to_confirm",
    "missingInformation": [
      "Nom exact de l’université partenaire à Boston",
      "Nom exact du LL.M",
      "Prix exact",
      "Test d’anglais requis",
      "Deadline",
      "Lien officiel"
    ],
    "notes": "Retour d’étudiante récente : partenariat à Boston avec candidature via LSAC ; coût exact encore attendu.",
    "active": false,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "amu-chicago-kent",
    "frenchUniversityId": "amu",
    "frenchUniversity": "Aix-Marseille Université",
    "usLawSchool": "Chicago-Kent College of Law",
    "city": "Chicago",
    "state": "Illinois",
    "partnershipType": "preferential_treatment",
    "tuitionCategory": "reduced_tuition",
    "tuitionDisplay": "Environ 9 000 $ l’année",
    "financialAid": "Tarif réduit dans le cadre du partenariat.",
    "seatsDisplay": "Environ une dizaine de places pour les partenariats LL.M américains, selon retour étudiant.",
    "seatsMin": null,
    "seatsMax": null,
    "requiredLevel": "M2",
    "requiredLevelRaw": "Master 2",
    "programLanguage": "Anglais",
    "duration": "1 an",
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": "Processus (à confirmer) : sélection interne IDA (liste de 3 universités par ordre de préférence, CV FR, lettre de motivation FR, entretien avec les directeurs du master — entretien en anglais), puis candidature auprès de l’université américaine (CV EN, lettre EN, relevés de notes, test d’anglais, et parfois dossier via LSAC).",
    "languageTests": [
      {
        "test": "TOEFL",
        "minimumScore": "100",
        "details": "Information à confirmer si encore applicable."
      },
      {
        "test": "TOEIC",
        "minimumScore": "890",
        "details": "Information à confirmer si encore applicable."
      }
    ],
    "applicationDeadline": null,
    "shortDescription": "Partenariat LL.M entre l’Institut de Droit des Affaires d’Aix-Marseille Université et Chicago-Kent College of Law.",
    "officialLink": null,
    "reliability": "to_confirm",
    "missingInformation": [
      "Nom exact du LL.M",
      "Test d’anglais exact",
      "Deadline",
      "Détail des frais annexes"
    ],
    "notes": "Retour étudiant : procédure en 2 temps (sélection interne IDA puis candidature US). À confirmer : (1) réservé aux étudiants IDA ou plus largement AMU, (2) candidature pendant le M2 ou après validation du M2, (3) quota exact par université.",
    "active": false,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "amu-lsu",
    "frenchUniversityId": "amu",
    "frenchUniversity": "Aix-Marseille Université",
    "usLawSchool": "Louisiana State University Paul M. Hebert Law Center",
    "city": "Baton Rouge",
    "state": "Louisiana",
    "partnershipType": "preferential_treatment",
    "tuitionCategory": "to_confirm",
    "tuitionDisplay": null,
    "financialAid": null,
    "seatsDisplay": "Environ une dizaine de places pour les partenariats LL.M américains, selon retour étudiant.",
    "seatsMin": null,
    "seatsMax": null,
    "requiredLevel": "M2",
    "requiredLevelRaw": "Master 2",
    "programLanguage": "Anglais",
    "duration": "1 an",
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": "Processus (à confirmer) : sélection interne IDA (liste de 3 universités par ordre de préférence, CV FR, lettre de motivation FR, entretien en anglais), puis candidature auprès de LSU (CV EN, lettre EN, relevés, test d’anglais, dossier LSAC selon info disponible).",
    "languageTests": [],
    "applicationDeadline": null,
    "shortDescription": "Partenariat LL.M entre l’Institut de Droit des Affaires d’Aix-Marseille Université et Louisiana State University à Baton Rouge.",
    "officialLink": null,
    "reliability": "to_confirm",
    "missingInformation": [
      "Nom exact du LL.M",
      "Prix",
      "Test d’anglais",
      "Deadline",
      "Détail des frais annexes",
      "Lien officiel"
    ],
    "notes": "Information pratique confirmée par une étudiante récente du programme, mais les frais exacts ne sont pas communiqués.",
    "active": false,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "amu-university-of-san-diego",
    "frenchUniversityId": "amu",
    "frenchUniversity": "Aix-Marseille Université",
    "usLawSchool": "University of San Diego School of Law",
    "city": "San Diego",
    "state": "California",
    "partnershipType": "preferential_treatment",
    "tuitionCategory": "reduced_tuition",
    "tuitionDisplay": "Environ 24 000 $",
    "financialAid": null,
    "seatsDisplay": "Environ une dizaine de places pour les partenariats LL.M américains, selon retour étudiant.",
    "seatsMin": null,
    "seatsMax": null,
    "requiredLevel": "M2",
    "requiredLevelRaw": "Master 2",
    "programLanguage": "Anglais",
    "duration": "1 an",
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": "Processus (à confirmer) : sélection interne IDA (liste de 3 universités, CV FR, lettre FR, entretien en anglais), puis candidature auprès de l’université américaine (CV EN, lettre EN, relevés, test d’anglais).",
    "languageTests": [
      {
        "test": "TOEFL",
        "minimumScore": "90",
        "details": "Confirmé par une étudiante récente du programme."
      }
    ],
    "applicationDeadline": null,
    "shortDescription": "Partenariat LL.M entre l’Institut de Droit des Affaires d’Aix-Marseille Université et University of San Diego School of Law.",
    "officialLink": null,
    "reliability": "to_confirm",
    "missingInformation": [
      "Nom exact du LL.M",
      "Deadline",
      "Détail des frais annexes",
      "Procédure exacte de candidature américaine",
      "Lien officiel"
    ],
    "notes": "Les informations pratiques (tarif indicatif, test d’anglais, sélection) sont confirmées par une étudiante ayant récemment terminé le LL.M.",
    "active": false,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "amu-usc",
    "frenchUniversityId": "amu",
    "frenchUniversity": "Aix-Marseille Université",
    "usLawSchool": "University of Southern California Gould School of Law",
    "city": "Los Angeles",
    "state": "California",
    "partnershipType": "preferential_treatment",
    "tuitionCategory": "reduced_tuition",
    "tuitionDisplay": "Environ 50 000 $",
    "financialAid": null,
    "seatsDisplay": "Environ une dizaine de places pour les partenariats LL.M américains, selon retour étudiant.",
    "seatsMin": null,
    "seatsMax": null,
    "requiredLevel": "M2",
    "requiredLevelRaw": "Master 2",
    "programLanguage": "Anglais",
    "duration": "1 an",
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": "Processus (à confirmer) : sélection interne IDA (liste de 3 universités, CV FR, lettre FR, entretien en anglais), puis candidature auprès d’USC (CV EN, lettre EN, relevés, test d’anglais ; LSAC possiblement).",
    "languageTests": [],
    "applicationDeadline": null,
    "shortDescription": "Partenariat LL.M entre l’Institut de Droit des Affaires d’Aix-Marseille Université et USC Gould School of Law.",
    "officialLink": null,
    "reliability": "to_confirm",
    "missingInformation": [
      "Nom exact du LL.M",
      "Test d’anglais requis",
      "Deadline",
      "Détail des frais annexes",
      "Confirmation LSAC",
      "Lien officiel"
    ],
    "notes": "Information pratique confirmée par une étudiante récente du programme.",
    "active": false,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "assas-boston-university",
    "frenchUniversityId": "assas",
    "frenchUniversity": "Université Paris-Panthéon-Assas",
    "usLawSchool": "Boston University School of Law",
    "city": "Boston",
    "state": "Massachusetts",
    "partnershipType": "reserved_seat",
    "tuitionCategory": "fixed_fee",
    "tuitionDisplay": "2 places à 5 000 €. Une autre place semble proposée avec frais de scolarité BU réduits d'environ 27 000 $, montant à confirmer.",
    "financialAid": "Réduction d'environ 27 000 $ mentionnée pour une place, montant à confirmer.",
    "seatsDisplay": "2 places à 5 000 €. Une place supplémentaire avec frais BU réduits est mentionnée mais à confirmer.",
    "seatsMin": 2,
    "seatsMax": 3,
    "requiredLevel": "M2",
    "requiredLevelRaw": "M2",
    "programLanguage": "Anglais",
    "duration": "1 an",
    "specialties": [
      "American Law Program"
    ],
    "admissionConditions": "TOEFL iBT minimum 100/120 avec 25 minimum par sous-section, Home Edition acceptée, ou IELTS minimum 7/9.",
    "languageTests": [
      {
        "test": "TOEFL iBT",
        "minimumScore": "100/120",
        "details": "25 minimum par sous-section. Home Edition acceptée."
      },
      {
        "test": "IELTS",
        "minimumScore": "7/9",
        "details": "IELTS Indicator accepté."
      }
    ],
    "applicationDeadline": null,
    "shortDescription": "Programme LL.M à Boston University School of Law dans le cadre d'un partenariat avec Paris-Panthéon-Assas.",
    "officialLink": null,
    "reliability": "to_confirm",
    "missingInformation": [
      "Lien officiel actuel",
      "Montant actualisé",
      "Nombre total exact de places"
    ],
    "notes": "Frais LSAC, logement, visa et santé exclus.",
    "active": false,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "assas-cardozo-reduction-50-officieux",
    "frenchUniversityId": "assas",
    "frenchUniversity": "Université Paris-Panthéon-Assas",
    "usLawSchool": "Cardozo School of Law / Yeshiva University",
    "city": "New York",
    "state": "New York",
    "partnershipType": "preferential_treatment",
    "tuitionCategory": "reduced_tuition",
    "tuitionDisplay": "Réduction de 50 % des frais d'inscription (≈ 38 801 $/an), à confirmer.",
    "financialAid": null,
    "seatsDisplay": null,
    "seatsMin": null,
    "seatsMax": null,
    "requiredLevel": null,
    "requiredLevelRaw": null,
    "programLanguage": "Anglais",
    "duration": null,
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": null,
    "languageTests": [],
    "applicationDeadline": null,
    "shortDescription": "Information officieuse : réduction de 50 % des frais d'inscription Cardozo pour certains candidats issus d'universités parisiennes.",
    "officialLink": null,
    "reliability": "confirmed",
    "missingInformation": [
      "Lien officiel Cardozo / université française",
      "Conditions exactes d'éligibilité",
      "Programme LL.M concerné",
      "Procédure de candidature (interne / LSAC)",
      "Frais exacts et année de référence",
      "Nombre de places / quota"
    ],
    "notes": "Info transmise par l’utilisateur : partenariat « officieux » annoncé à -50%.",
    "active": true,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "assas-chicago-kent",
    "frenchUniversityId": "assas",
    "frenchUniversity": "Université Paris-Panthéon-Assas",
    "usLawSchool": "Chicago-Kent College of Law",
    "city": "Chicago",
    "state": "Illinois",
    "partnershipType": "reserved_seat",
    "tuitionCategory": "fixed_fee",
    "tuitionDisplay": "5 000 €",
    "financialAid": null,
    "seatsDisplay": "2 places",
    "seatsMin": 2,
    "seatsMax": 2,
    "requiredLevel": "M2",
    "requiredLevelRaw": "M2",
    "programLanguage": "Anglais",
    "duration": "1 an",
    "specialties": [
      "U.S., International and Transnational Law",
      "International Intellectual Property Law",
      "Financial Services",
      "Legal Innovation and Technology",
      "Trial Advocacy for International Students"
    ],
    "admissionConditions": "TOEFL iBT minimum 100/120, Home Edition acceptée, ou IELTS minimum 6.5/9, ou Duolingo English Test minimum 100.",
    "languageTests": [
      {
        "test": "TOEFL iBT",
        "minimumScore": "100/120",
        "details": "Home Edition acceptée."
      },
      {
        "test": "IELTS",
        "minimumScore": "6.5/9",
        "details": "Aucune précision supplémentaire communiquée."
      },
      {
        "test": "Duolingo English Test",
        "minimumScore": "100",
        "details": "Aucune précision supplémentaire communiquée."
      }
    ],
    "applicationDeadline": null,
    "shortDescription": "Programme LL.M à Chicago-Kent College of Law, avec possibilité de candidater à certaines spécialisations une fois sur place.",
    "officialLink": null,
    "reliability": "confirmed",
    "missingInformation": [
      "Lien officiel actuel",
      "Frais supplémentaires",
      "Conditions exactes pour accéder aux LL.M spécialisés"
    ],
    "notes": "Certaines spécialisations nécessitent des prérequis.",
    "active": true,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "assas-fordham",
    "frenchUniversityId": "assas",
    "frenchUniversity": "Université Paris-Panthéon-Assas",
    "usLawSchool": "Fordham University School of Law",
    "city": "New York",
    "state": "New York",
    "partnershipType": "reserved_seat",
    "tuitionCategory": "fixed_fee",
    "tuitionDisplay": "5 000 € à verser à Paris-Panthéon-Assas",
    "financialAid": null,
    "seatsDisplay": "2 places",
    "seatsMin": 2,
    "seatsMax": 2,
    "requiredLevel": "M2",
    "requiredLevelRaw": "M2",
    "programLanguage": "Anglais",
    "duration": "1 an",
    "specialties": [
      "Banking, Corporate and Finance Law",
      "Intellectual Property and Information Technology Law",
      "International Business and Trade Law",
      "International Law and Justice",
      "U.S. Law",
      "Fashion Law",
      "International Dispute Resolution",
      "Corporate Compliance",
      "Real Estate Law"
    ],
    "admissionConditions": "TOEFL iBT minimum 100/120, Home Edition acceptée, ou IELTS minimum 7/9, ou Duolingo English Test minimum 120.",
    "languageTests": [
      {
        "test": "TOEFL iBT",
        "minimumScore": "100/120",
        "details": "Home Edition acceptée."
      },
      {
        "test": "IELTS",
        "minimumScore": "7/9",
        "details": "Aucune précision supplémentaire communiquée."
      },
      {
        "test": "Duolingo English Test",
        "minimumScore": "120",
        "details": "Aucune précision supplémentaire communiquée."
      }
    ],
    "applicationDeadline": null,
    "shortDescription": "Programme LL.M à Fordham University School of Law avec large choix de spécialisations.",
    "officialLink": null,
    "reliability": "confirmed",
    "missingInformation": [
      "Lien officiel actuel",
      "Frais supplémentaires",
      "Montants actualisés"
    ],
    "notes": "Frais à verser à Paris-Panthéon-Assas.",
    "active": true,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "assas-indiana-maurer",
    "frenchUniversityId": "assas",
    "frenchUniversity": "Université Paris-Panthéon-Assas",
    "usLawSchool": "Indiana University Maurer School of Law",
    "city": "Bloomington",
    "state": "Indiana",
    "partnershipType": "reserved_seat",
    "tuitionCategory": "reduced_tuition",
    "tuitionDisplay": "Frais de scolarité Indiana avec réduction de 20 000 $, montant à confirmer.",
    "financialAid": "Réduction de 20 000 $ mentionnée, montant à confirmer.",
    "seatsDisplay": "2 places",
    "seatsMin": 2,
    "seatsMax": 2,
    "requiredLevel": "M2",
    "requiredLevelRaw": "M2",
    "programLanguage": "Anglais",
    "duration": "1 an",
    "specialties": [
      "Business & Commercial Law",
      "Financial Regulation & Capital Markets",
      "Intellectual Property Law",
      "Information Privacy & Cybersecurity Law",
      "International and Comparative Law & Globalization",
      "LL.M in American Law"
    ],
    "admissionConditions": "TOEFL iBT minimum 94/120, Home Edition acceptée, ou IELTS minimum 7/9, ou Duolingo English Test minimum 115, ou TOEIC 830/990.",
    "languageTests": [
      {
        "test": "TOEFL iBT",
        "minimumScore": "94/120",
        "details": "Home Edition acceptée."
      },
      {
        "test": "IELTS",
        "minimumScore": "7/9",
        "details": "Aucune précision supplémentaire communiquée."
      },
      {
        "test": "Duolingo English Test",
        "minimumScore": "115",
        "details": "Aucune précision supplémentaire communiquée."
      },
      {
        "test": "TOEIC",
        "minimumScore": "830/990",
        "details": "Aucune précision supplémentaire communiquée."
      }
    ],
    "applicationDeadline": null,
    "shortDescription": "Programme LL.M à Indiana University Maurer School of Law avec spécialisations en droit des affaires, finance, propriété intellectuelle, cybersécurité et droit comparé.",
    "officialLink": null,
    "reliability": "confirmed",
    "missingInformation": [
      "Lien officiel actuel",
      "Frais exacts après réduction",
      "Montant actualisé"
    ],
    "notes": "Montant à confirmer avant publication.",
    "active": true,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "assas-notre-dame",
    "frenchUniversityId": "assas",
    "frenchUniversity": "Université Paris-Panthéon-Assas",
    "usLawSchool": "University of Notre Dame Law School",
    "city": "Notre Dame",
    "state": "Indiana",
    "partnershipType": "reserved_seat",
    "tuitionCategory": "no_tuition",
    "tuitionDisplay": "Sans frais de scolarité",
    "financialAid": null,
    "seatsDisplay": "1 place",
    "seatsMin": 1,
    "seatsMax": 1,
    "requiredLevel": "M2",
    "requiredLevelRaw": "M2",
    "programLanguage": "Anglais",
    "duration": "1 an",
    "specialties": [
      "Business and Tax Law",
      "Intellectual Property Law",
      "Fundamentals of American Private Law",
      "Real Estate Law and Environmental Law"
    ],
    "admissionConditions": "TOEFL minimum 100 avec 25 minimum dans chaque section, ou IELTS minimum 7.5.",
    "languageTests": [
      {
        "test": "TOEFL",
        "minimumScore": "100",
        "details": "25 minimum dans chaque section."
      },
      {
        "test": "IELTS",
        "minimumScore": "7.5",
        "details": "Aucune précision supplémentaire communiquée."
      }
    ],
    "applicationDeadline": null,
    "shortDescription": "Programme LL.M à Notre Dame Law School avec possibilité de concentration dans une spécialité.",
    "officialLink": null,
    "reliability": "confirmed",
    "missingInformation": [
      "Lien officiel actuel",
      "Frais annexes"
    ],
    "notes": "Les frais de vie, visa, assurance et autres frais annexes ne sont pas communiqués.",
    "active": true,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "assas-penn-carey",
    "frenchUniversityId": "assas",
    "frenchUniversity": "Université Paris-Panthéon-Assas",
    "usLawSchool": "University of Pennsylvania Carey Law School",
    "city": "Philadelphia",
    "state": "Pennsylvania",
    "partnershipType": "reserved_seat",
    "tuitionCategory": "no_tuition",
    "tuitionDisplay": "Sans frais de scolarité",
    "financialAid": null,
    "seatsDisplay": "2 places",
    "seatsMin": 2,
    "seatsMax": 2,
    "requiredLevel": "M2",
    "requiredLevelRaw": "M2",
    "programLanguage": "Anglais",
    "duration": "1 an",
    "specialties": [
      "Choix de cours LL.M avec mêmes préférences d'inscription que les autres étudiants LL.M"
    ],
    "admissionConditions": "TOEFL minimum 100 avec 24 minimum dans chaque section, ou IELTS minimum 7 avec 7 minimum dans chaque section.",
    "languageTests": [
      {
        "test": "TOEFL",
        "minimumScore": "100",
        "details": "24 minimum dans chaque section."
      },
      {
        "test": "IELTS",
        "minimumScore": "7",
        "details": "7 minimum dans chaque section."
      }
    ],
    "applicationDeadline": null,
    "shortDescription": "Programme LL.M à Penn Carey Law dans le cadre d'un partenariat avec Paris-Panthéon-Assas.",
    "officialLink": null,
    "reliability": "confirmed",
    "missingInformation": [
      "Lien officiel actuel",
      "Frais annexes"
    ],
    "notes": "Les étudiants LL.M exchange ont les mêmes préférences d'inscription aux cours que les autres étudiants LL.M.",
    "active": true,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "assas-uc-law-sf",
    "frenchUniversityId": "assas",
    "frenchUniversity": "Université Paris-Panthéon-Assas",
    "usLawSchool": "University of California College of the Law, San Francisco",
    "city": "San Francisco",
    "state": "California",
    "partnershipType": "reserved_seat",
    "tuitionCategory": "fixed_fee",
    "tuitionDisplay": "2 places à 5 000 €. Une place avec frais UC Law SF réduits de 20 000 $ via la bourse Riesenfeld est mentionnée, montant à confirmer.",
    "financialAid": "Bourse Riesenfeld de 20 000 $ mentionnée, à confirmer.",
    "seatsDisplay": "2 places à 5 000 €. Une place avec réduction de 20 000 $ est mentionnée mais à confirmer.",
    "seatsMin": 2,
    "seatsMax": 3,
    "requiredLevel": "M2",
    "requiredLevelRaw": "M2",
    "programLanguage": "Anglais",
    "duration": "1 an",
    "specialties": [
      "U.S. Legal Studies",
      "Certificat de spécialisation possible sous conditions"
    ],
    "admissionConditions": "TOEFL iBT minimum 90/120, Home Edition acceptée, ou IELTS minimum 7/9.",
    "languageTests": [
      {
        "test": "TOEFL iBT",
        "minimumScore": "90/120",
        "details": "Home Edition acceptée."
      },
      {
        "test": "IELTS",
        "minimumScore": "7/9",
        "details": "Aucune précision supplémentaire communiquée."
      }
    ],
    "applicationDeadline": null,
    "shortDescription": "Programme LL.M à UC Law San Francisco avec possibilité éventuelle de certificat de spécialisation.",
    "officialLink": null,
    "reliability": "to_confirm",
    "missingInformation": [
      "Lien officiel actuel",
      "Montant actualisé",
      "Critères précis du certificat de spécialisation"
    ],
    "notes": "Les conditions d'éligibilité au certificat de spécialisation sont précisées sur place.",
    "active": false,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "assas-virginia",
    "frenchUniversityId": "assas",
    "frenchUniversity": "Université Paris-Panthéon-Assas",
    "usLawSchool": "University of Virginia School of Law",
    "city": "Charlottesville",
    "state": "Virginia",
    "partnershipType": "reserved_seat",
    "tuitionCategory": "no_tuition",
    "tuitionDisplay": "Sans frais de scolarité",
    "financialAid": null,
    "seatsDisplay": "1 place",
    "seatsMin": 1,
    "seatsMax": 1,
    "requiredLevel": "M2",
    "requiredLevelRaw": "M2",
    "programLanguage": "Anglais",
    "duration": "1 an",
    "specialties": [
      "Accès large aux cours proposés par la faculté"
    ],
    "admissionConditions": "IELTS minimum 7.5 dans chaque section, ou TOEFL PBT Writing 60, Listening 60, Reading 60, TWE 4, ou TOEFL iBT Writing 24, Speaking 22, Reading 26, Listening 26.",
    "languageTests": [
      {
        "test": "IELTS",
        "minimumScore": "7.5",
        "details": "7.5 minimum dans chaque section."
      },
      {
        "test": "TOEFL iBT",
        "minimumScore": "Writing 24, Speaking 22, Reading 26, Listening 26",
        "details": "Scores par section communiqués."
      },
      {
        "test": "TOEFL PBT",
        "minimumScore": "Writing 60, Listening 60, Reading 60, TWE 4",
        "details": "Scores par section communiqués."
      }
    ],
    "applicationDeadline": null,
    "shortDescription": "Programme LL.M à University of Virginia School of Law avec accès aux enseignements proposés aux étudiants LL.M.",
    "officialLink": null,
    "reliability": "confirmed",
    "missingInformation": [
      "Lien officiel actuel",
      "Frais annexes"
    ],
    "notes": "Les frais de vie, visa, assurance et autres frais annexes ne sont pas communiqués.",
    "active": true,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "bordeaux-cincinnati",
    "frenchUniversityId": "bordeaux",
    "frenchUniversity": "Université de Bordeaux",
    "usLawSchool": "University of Cincinnati College of Law",
    "city": "Cincinnati",
    "state": "Ohio",
    "partnershipType": "pipeline",
    "tuitionCategory": "scholarship_possible",
    "tuitionDisplay": "Prix environ 30 000 $. Bourse généralement autour de 9 000 $. Assurance santé obligatoire environ 2 000 $, plus manuels. Frais de 250 $ après acceptation.",
    "financialAid": "Bourse généralement autour de 9 000 $, selon les données transmises.",
    "seatsDisplay": "Pas véritablement de limite de places selon les données disponibles",
    "seatsMin": null,
    "seatsMax": null,
    "requiredLevel": "M1",
    "requiredLevelRaw": "Accessible dès M1 selon les données disponibles",
    "programLanguage": "Anglais",
    "duration": null,
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": "Personal statement, CV, deux lettres de recommandation, credential evaluation, test d'anglais, relevés de notes en anglais. Préférence pour TOEFL internet-based de 100 ou équivalent ; TOEFL à partir de 85 aussi considéré ; IELTS 7.0 ; CEFR C1 ; Duolingo 110 ou plus.",
    "languageTests": [
      {
        "test": "TOEFL iBT",
        "minimumScore": "85",
        "details": "100 ou équivalent recommandé / préféré."
      },
      {
        "test": "IELTS",
        "minimumScore": "7.0",
        "details": "Aucune précision supplémentaire communiquée."
      },
      {
        "test": "CEFR",
        "minimumScore": "C1",
        "details": "Aucune précision supplémentaire communiquée."
      },
      {
        "test": "Duolingo",
        "minimumScore": "110",
        "details": "Aucune précision supplémentaire communiquée."
      }
    ],
    "applicationDeadline": "Priority deadline : 15 février. Regular deadline : 15 mai.",
    "shortDescription": "Partenariat avec University of Cincinnati College of Law. Candidature via UC Law app sur LSAC.",
    "officialLink": null,
    "reliability": "confirmed",
    "missingInformation": [
      "Lien officiel",
      "Durée exacte",
      "Spécialités",
      "Confirmation officielle du nombre de places"
    ],
    "notes": "Il s'agit plutôt d'un pipeline ou d'une candidature facilitée que d'une place réservée garantie.",
    "active": true,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "catholille-delaware",
    "frenchUniversityId": "catholille",
    "frenchUniversity": "Faculté de droit de l'Université Catholique de Lille",
    "usLawSchool": "Delaware Law School of Widener University",
    "city": "Wilmington",
    "state": "Delaware",
    "partnershipType": "to_confirm",
    "tuitionCategory": "to_confirm",
    "tuitionDisplay": "Information incertaine. Le coût indiqué serait de 1 999 $ par crédit pour 2026/2027. Un LL.M classique de 24 crédits coûterait environ 47 976 $, hors frais supplémentaires.",
    "financialAid": null,
    "seatsDisplay": null,
    "seatsMin": null,
    "seatsMax": null,
    "requiredLevel": null,
    "requiredLevelRaw": null,
    "programLanguage": "Anglais",
    "duration": null,
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": null,
    "languageTests": [],
    "applicationDeadline": null,
    "shortDescription": "Partenariat potentiel avec Delaware Law School / Widener University.",
    "officialLink": null,
    "reliability": "to_confirm",
    "missingInformation": [
      "Confirmation officielle du partenariat",
      "Type de LL.M",
      "Niveau requis",
      "Test de langue",
      "Nombre de places",
      "Frais applicables au partenariat",
      "Lien officiel"
    ],
    "notes": "Il faut confirmer si le tarif par crédit s'applique réellement au partenariat avec la Faculté de droit de l'Université Catholique de Lille.",
    "active": false,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "cy-cergy-vermont",
    "frenchUniversityId": "cy-cergy",
    "frenchUniversity": "CY Cergy Paris Université",
    "usLawSchool": "Vermont Law and Graduate School",
    "city": "South Royalton",
    "state": "Vermont",
    "partnershipType": "to_confirm",
    "tuitionCategory": "to_confirm",
    "tuitionDisplay": null,
    "financialAid": null,
    "seatsDisplay": null,
    "seatsMin": null,
    "seatsMax": null,
    "requiredLevel": null,
    "requiredLevelRaw": null,
    "programLanguage": "Anglais",
    "duration": null,
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": null,
    "languageTests": [],
    "applicationDeadline": null,
    "shortDescription": "Partenariat potentiel avec Vermont Law and Graduate School.",
    "officialLink": null,
    "reliability": "incomplete",
    "missingInformation": [
      "Confirmation officielle du partenariat",
      "Type de programme",
      "Niveau requis",
      "Test de langue",
      "Nombre de places",
      "Frais",
      "Durée",
      "Lien officiel"
    ],
    "notes": "Aucun détail fiable communiqué sur les conditions du partenariat.",
    "active": false,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "dauphine-cardozo-reduction-50-officieux",
    "frenchUniversityId": "dauphine",
    "frenchUniversity": "Paris Dauphine-PSL",
    "usLawSchool": "Cardozo School of Law / Yeshiva University",
    "city": "New York",
    "state": "New York",
    "partnershipType": "preferential_treatment",
    "tuitionCategory": "reduced_tuition",
    "tuitionDisplay": "Réduction de 50 % des frais d'inscription (≈ 38 801 $/an), à confirmer.",
    "financialAid": null,
    "seatsDisplay": null,
    "seatsMin": null,
    "seatsMax": null,
    "requiredLevel": null,
    "requiredLevelRaw": null,
    "programLanguage": "Anglais",
    "duration": null,
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": null,
    "languageTests": [],
    "applicationDeadline": null,
    "shortDescription": "Information officieuse : réduction de 50 % des frais d'inscription Cardozo pour certains candidats issus d'universités parisiennes.",
    "officialLink": null,
    "reliability": "confirmed",
    "missingInformation": [
      "Lien officiel Cardozo / université française",
      "Conditions exactes d'éligibilité",
      "Programme LL.M concerné",
      "Procédure de candidature (interne / LSAC)",
      "Frais exacts et année de référence",
      "Nombre de places / quota"
    ],
    "notes": "Info transmise par l’utilisateur : partenariat « officieux » annoncé à -50%.",
    "active": true,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "dauphine-case-western",
    "frenchUniversityId": "dauphine",
    "frenchUniversity": "Paris Dauphine-PSL",
    "usLawSchool": "Case Western Reserve University School of Law",
    "city": "Cleveland (Ohio)",
    "state": "Ohio",
    "partnershipType": "reserved_seat",
    "tuitionCategory": "no_tuition",
    "tuitionDisplay": "Frais au tarif Dauphine uniquement.",
    "financialAid": null,
    "seatsDisplay": "2 à 4 places (partenariat Dauphine → US)",
    "seatsMin": 2,
    "seatsMax": 4,
    "requiredLevel": "M2",
    "requiredLevelRaw": "M2 (fin de Master)",
    "programLanguage": "Anglais",
    "duration": null,
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": "Sélection au début de l’année sur dossier (application packets).",
    "languageTests": [
      {
        "test": "TOEFL iBT",
        "minimumScore": "80+",
        "details": "4.0 and above / 80 and above (selon info transmise)."
      },
      {
        "test": "IELTS",
        "minimumScore": "6.5+",
        "details": null
      },
      {
        "test": "Duolingo English Test",
        "minimumScore": "120+",
        "details": null
      },
      {
        "test": "ELS",
        "minimumScore": "Level 112",
        "details": "Graduation from ELS: Level 112"
      }
    ],
    "applicationDeadline": null,
    "shortDescription": "2 à 4 places au tarif Dauphine pour effectuer un LL.M aux États-Unis (Case Western, Ohio) à la fin du Master.",
    "officialLink": "https://dauphine.psl.eu/en/training/masters-degrees/business-law/masters-year-2-european-and-international-business-law/international",
    "reliability": "confirmed",
    "missingInformation": [
      "Lien officiel",
      "Durée exacte",
      "Calendrier détaillé",
      "Frais exacts (tarif Dauphine) et coûts annexes",
      "Précision TOEFL (barème / format)"
    ],
    "notes": "Information confirmée par l’utilisateur.",
    "active": true,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "dauphine-saint-louis-university",
    "frenchUniversityId": "dauphine",
    "frenchUniversity": "Paris Dauphine-PSL",
    "usLawSchool": "Saint Louis University School of Law",
    "city": "St. Louis (Missouri)",
    "state": "Missouri",
    "partnershipType": "reserved_seat",
    "tuitionCategory": "no_tuition",
    "tuitionDisplay": "Frais au tarif Dauphine uniquement.",
    "financialAid": null,
    "seatsDisplay": "2 à 4 places (partenariat Dauphine → US)",
    "seatsMin": 2,
    "seatsMax": 4,
    "requiredLevel": "M2",
    "requiredLevelRaw": "M2 (fin de Master)",
    "programLanguage": "Anglais",
    "duration": null,
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": "Sélection au début de l’année sur dossier (application packets).",
    "languageTests": [
      {
        "test": "TOEFL iBT",
        "minimumScore": "80+",
        "details": "4.0 and above / 80 and above (selon info transmise)."
      },
      {
        "test": "IELTS",
        "minimumScore": "6.5+",
        "details": null
      },
      {
        "test": "Duolingo English Test",
        "minimumScore": "120+",
        "details": null
      },
      {
        "test": "ELS",
        "minimumScore": "Level 112",
        "details": "Graduation from ELS: Level 112"
      }
    ],
    "applicationDeadline": null,
    "shortDescription": "2 à 4 places au tarif Dauphine pour effectuer un LL.M aux États-Unis (Saint Louis University, Missouri) à la fin du Master.",
    "officialLink": "https://dauphine.psl.eu/en/training/masters-degrees/business-law/masters-year-2-european-and-international-business-law/international",
    "reliability": "confirmed",
    "missingInformation": [
      "Lien officiel",
      "Durée exacte",
      "Calendrier détaillé",
      "Frais exacts (tarif Dauphine) et coûts annexes",
      "Précision TOEFL (barème / format)"
    ],
    "notes": "Information confirmée par l’utilisateur.",
    "active": true,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "lyon3-brooklyn",
    "frenchUniversityId": "lyon3",
    "frenchUniversity": "Université Jean Moulin Lyon 3",
    "usLawSchool": "Brooklyn Law School",
    "city": "Brooklyn / New York City, NY",
    "state": "New York",
    "partnershipType": "preferential_treatment",
    "tuitionCategory": "reduced_tuition",
    "tuitionDisplay": "1 semestre gratuit et 1 semestre payant. Estimation 2025-2026 : environ 1 450 $ de frais + 63 949 $ pour l’année complète, soit environ 33 424 $ après remise.",
    "financialAid": "Traitement préférentiel de 50 %",
    "seatsDisplay": "1 place avec traitement préférentiel à 50 %",
    "seatsMin": 1,
    "seatsMax": 1,
    "requiredLevel": "M2",
    "requiredLevelRaw": "Master 2 de droit",
    "programLanguage": "Anglais",
    "duration": "1 an",
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": "Sélection sur dossier par Lyon 3, puis entretien en anglais. Après sélection, candidature auprès de Brooklyn (via LSAC).",
    "languageTests": [
      {
        "test": "TOEFL iBT",
        "minimumScore": "95",
        "details": "Aucune précision supplémentaire communiquée."
      },
      {
        "test": "IELTS",
        "minimumScore": "7.0",
        "details": "Aucune précision supplémentaire communiquée."
      }
    ],
    "applicationDeadline": null,
    "shortDescription": "Partenariat LL.M avec Brooklyn Law School. Une place bénéficie d’un traitement préférentiel : un semestre gratuit et un semestre payant.",
    "officialLink": null,
    "reliability": "confirmed",
    "missingInformation": [
      "Nom exact du LL.M",
      "Frais actualisés définitifs",
      "Deadline américaine",
      "Lien officiel"
    ],
    "notes": "Données (année 2026/2027) issues de supports Lyon 3 fournis par l’utilisateur.",
    "active": true,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "lyon3-georgetown",
    "frenchUniversityId": "lyon3",
    "frenchUniversity": "Université Jean Moulin Lyon 3",
    "usLawSchool": "Georgetown University Law Center",
    "city": "Washington, DC",
    "state": "District of Columbia",
    "partnershipType": "preferential_treatment",
    "tuitionCategory": "reduced_tuition",
    "tuitionDisplay": "Réduction de 50 % des frais de scolarité. Estimation 2025-2026 : environ 86 294 $ pour l’année complète, soit environ 43 147 $ après remise.",
    "financialAid": "Réduction de 50 % des frais de scolarité",
    "seatsDisplay": "3 places avec traitement préférentiel à 50 %",
    "seatsMin": 3,
    "seatsMax": 3,
    "requiredLevel": "M2",
    "requiredLevelRaw": "Master 2 de droit",
    "programLanguage": "Anglais",
    "duration": "1 an",
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": "Sélection sur dossier par Lyon 3, puis entretien en anglais. Après sélection, candidature auprès de Georgetown (modalités US).",
    "languageTests": [
      {
        "test": "TOEFL iBT",
        "minimumScore": "100",
        "details": "Aucune précision supplémentaire communiquée."
      },
      {
        "test": "IELTS",
        "minimumScore": "7.5",
        "details": "Aucune précision supplémentaire communiquée."
      }
    ],
    "applicationDeadline": null,
    "shortDescription": "Partenariat LL.M avec Georgetown University Law Center. Trois places bénéficient d’une réduction de 50 % des frais de scolarité.",
    "officialLink": null,
    "reliability": "confirmed",
    "missingInformation": [
      "Nom exact du LL.M",
      "Frais actualisés définitifs",
      "Procédure de candidature américaine",
      "Deadline américaine",
      "Lien officiel"
    ],
    "notes": "Données (année 2026/2027) issues de supports Lyon 3 fournis par l’utilisateur.",
    "active": true,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "lyon3-lsu",
    "frenchUniversityId": "lyon3",
    "frenchUniversity": "Université Jean Moulin Lyon 3",
    "usLawSchool": "Louisiana State University Paul M. Hebert Law Center",
    "city": "Baton Rouge, LA",
    "state": "Louisiana",
    "partnershipType": "reserved_seat_and_preferential_treatment",
    "tuitionCategory": "no_tuition",
    "tuitionDisplay": "1 place sans frais de scolarité. Frais d’inscription : environ 4 100 $ (sous réserve de modification), plus frais de dossier LSAC. Pour les étudiants supplémentaires avec traitement préférentiel : frais de scolarité d’environ 6 400 $ au lieu de 36 400 $, plus environ 4 100 $ d’inscription et frais LSAC.",
    "financialAid": null,
    "seatsDisplay": "1 place sans frais de scolarité + possibilité d’étudiant supplémentaire avec traitement préférentiel",
    "seatsMin": 1,
    "seatsMax": null,
    "requiredLevel": "M2",
    "requiredLevelRaw": "Master 2 de droit",
    "programLanguage": "Anglais",
    "duration": "1 an",
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": "Sélection sur dossier par Lyon 3 (CV EN, lettre de motivation EN, résultats académiques), puis entretien en anglais. Après sélection, candidature auprès de LSU (modalités LSU, via LSAC).",
    "languageTests": [
      {
        "test": "TOEFL iBT",
        "minimumScore": "90",
        "details": "Score recommandé : 100+."
      },
      {
        "test": "IELTS",
        "minimumScore": "7.0",
        "details": "Aucune précision supplémentaire communiquée."
      }
    ],
    "applicationDeadline": null,
    "shortDescription": "Partenariat LL.M avec Louisiana State University à Baton Rouge. Une place est proposée sans frais de scolarité, avec frais d’inscription et frais LSAC. Des places supplémentaires peuvent bénéficier d’un traitement préférentiel avec frais réduits.",
    "officialLink": null,
    "reliability": "confirmed",
    "missingInformation": [
      "Nom exact du LL.M",
      "Nombre exact de places avec traitement préférentiel",
      "Lien officiel",
      "Frais actualisés définitifs"
    ],
    "notes": "Données (année 2026/2027) issues de supports Lyon 3 fournis par l’utilisateur. Important : il s’agit d’un partenariat (pas un échange universitaire). Les étudiants restent inscrits à Lyon 3 pendant l’année de mobilité et obtiennent uniquement le LL.M américain.",
    "active": true,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "lyon3-minnesota",
    "frenchUniversityId": "lyon3",
    "frenchUniversity": "Université Jean Moulin Lyon 3",
    "usLawSchool": "University of Minnesota Law School",
    "city": "Minneapolis, MN",
    "state": "Minnesota",
    "partnershipType": "reserved_seat",
    "tuitionCategory": "no_tuition",
    "tuitionDisplay": "1 place sans frais de scolarité",
    "financialAid": null,
    "seatsDisplay": "1 place sans frais de scolarité",
    "seatsMin": 1,
    "seatsMax": 1,
    "requiredLevel": "M2",
    "requiredLevelRaw": "Master 2 de droit",
    "programLanguage": "Anglais",
    "duration": "1 an",
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": "Sélection sur dossier par Lyon 3, puis entretien en anglais. Après sélection, candidature auprès de l’université américaine (modalités Minnesota).",
    "languageTests": [
      {
        "test": "TOEFL iBT",
        "minimumScore": "95",
        "details": "Aucune précision supplémentaire communiquée."
      },
      {
        "test": "IELTS",
        "minimumScore": "6.5",
        "details": "Aucune précision supplémentaire communiquée."
      }
    ],
    "applicationDeadline": null,
    "shortDescription": "Partenariat LL.M avec University of Minnesota Law School. Une place est proposée sans frais de scolarité.",
    "officialLink": null,
    "reliability": "confirmed",
    "missingInformation": [
      "Frais annexes",
      "Procédure de candidature américaine",
      "Deadline américaine",
      "Lien officiel",
      "Nom exact du LL.M"
    ],
    "notes": "Données (année 2026/2027) issues de supports Lyon 3 fournis par l’utilisateur. Important : partenariat (pas échange).",
    "active": true,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "nanterre-american-university-wcl",
    "frenchUniversityId": "paris-nanterre",
    "frenchUniversity": "Université Paris Nanterre",
    "usLawSchool": "American University Washington College of Law",
    "city": "Washington, DC",
    "state": "District of Columbia",
    "partnershipType": "to_confirm",
    "tuitionCategory": "to_confirm",
    "tuitionDisplay": "Full scholarship indiquée dans le document, à confirmer.",
    "financialAid": "Full scholarship potentielle, à confirmer.",
    "seatsDisplay": "Selon le document : soit 2 étudiants LL.M full year + 1 étudiant 1 semestre, soit 1 étudiant JD 2 ans + 1 étudiant 1 semestre, soit 5 étudiants 1 semestre.",
    "seatsMin": null,
    "seatsMax": null,
    "requiredLevel": "M2",
    "requiredLevelRaw": "M2",
    "programLanguage": "Anglais",
    "duration": "LL.M : 1 an ; échange : 1 semestre ; option JD : 2 ans (à confirmer)",
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": null,
    "languageTests": [],
    "applicationDeadline": null,
    "shortDescription": "Selon un document étudiant : partenariat possible avec American University WCL avec options variables (LL.M full-year, échange un semestre, voire option JD 2 ans).",
    "officialLink": null,
    "reliability": "to_confirm",
    "missingInformation": [
      "Confirmation officielle du partenariat",
      "Nom exact du LL.M",
      "Conditions d’admission",
      "Tests d’anglais requis",
      "Coût réel actualisé",
      "Nombre exact de places pour la promotion actuelle",
      "Éligibilité exacte au JD deux ans"
    ],
    "notes": "À afficher avec avertissement Nanterre : source étudiante non officielle, modalités variables selon les promotions.",
    "active": false,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "nanterre-boston-college-law",
    "frenchUniversityId": "paris-nanterre",
    "frenchUniversity": "Université Paris Nanterre",
    "usLawSchool": "Boston College Law School",
    "city": "Boston",
    "state": "Massachusetts",
    "partnershipType": "to_confirm",
    "tuitionCategory": "to_confirm",
    "tuitionDisplay": "Full scholarship possible pour certaines places ; 25 % scholarship possible pour d’autres places, à confirmer.",
    "financialAid": "Full scholarship ou 25 % scholarship selon option, à confirmer.",
    "seatsDisplay": "Selon le document : full scholarship pour 2 étudiants LL.M full-year ou 4 étudiants 1 semestre. Une bourse de 25 % serait aussi possible pour 3 étudiants full-year.",
    "seatsMin": null,
    "seatsMax": null,
    "requiredLevel": null,
    "requiredLevelRaw": null,
    "programLanguage": "Anglais",
    "duration": "LL.M : 1 an ; échange : 1 semestre",
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": null,
    "languageTests": [],
    "applicationDeadline": null,
    "shortDescription": "Selon un document étudiant : Boston College pourrait proposer soit un LL.M full-year (avec bourse), soit un échange d’un semestre.",
    "officialLink": null,
    "reliability": "to_confirm",
    "missingInformation": [
      "Confirmation officielle du partenariat",
      "Nom exact du LL.M",
      "Conditions d’admission",
      "Tests d’anglais requis",
      "Coût réel après bourse",
      "Nombre exact de places pour la promotion actuelle"
    ],
    "notes": "À afficher avec avertissement Nanterre : source étudiante non officielle, modalités variables selon les promotions.",
    "active": false,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "nanterre-uc-davis-law",
    "frenchUniversityId": "paris-nanterre",
    "frenchUniversity": "Université Paris Nanterre",
    "usLawSchool": "UC Davis School of Law",
    "city": "Davis, California",
    "state": "California",
    "partnershipType": "to_confirm",
    "tuitionCategory": "to_confirm",
    "tuitionDisplay": "Full scholarship possible pour échange non diplômant ; bourse partielle possible pour LL.M, à confirmer.",
    "financialAid": "Full scholarship pour échange non diplômant ; bourse partielle pour LL.M potentiel.",
    "seatsDisplay": "Selon le document : full scholarship sans diplôme pour 2 étudiants par semestre ; exceptionnellement 2 étudiants pour 2 semestres. Possibilité de bourse partielle avec diplôme pour 2 étudiants.",
    "seatsMin": null,
    "seatsMax": null,
    "requiredLevel": null,
    "requiredLevelRaw": null,
    "programLanguage": "Anglais",
    "duration": "1 semestre, 2 semestres exceptionnellement, ou LL.M selon option",
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": null,
    "languageTests": [],
    "applicationDeadline": null,
    "shortDescription": "Selon un document étudiant : UC Davis pourrait permettre un échange non diplômant (avec bourse) ou un LL.M avec bourse partielle selon option.",
    "officialLink": null,
    "reliability": "to_confirm",
    "missingInformation": [
      "Confirmation officielle du partenariat",
      "Différence exacte entre échange non diplômant et LL.M diplômant",
      "Conditions d’admission au LL.M",
      "Tests d’anglais requis",
      "Coût réel après bourse",
      "Nombre exact de places pour la promotion actuelle",
      "Impact exact sur l’éligibilité au New York Bar"
    ],
    "notes": "À afficher avec une distinction très claire entre échange non diplômant et LL.M. Ne pas présenter l’échange UC Davis comme un LL.M.",
    "active": false,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "nantes-lsu",
    "frenchUniversityId": "nantes",
    "frenchUniversity": "Nantes Université",
    "usLawSchool": "Louisiana State University Law Center",
    "city": "Baton Rouge",
    "state": "Louisiana",
    "partnershipType": "pipeline",
    "tuitionCategory": "scholarship_possible",
    "tuitionDisplay": "Frais LL.M non communiqués. Les très bons dossiers peuvent obtenir une bourse complète ou une demi-bourse.",
    "financialAid": "Bourse complète ou demi-bourse possible pour les très bons dossiers.",
    "seatsDisplay": "1 place annuelle pour le semestre M1 à LSU ; 3 places de stage M2 ; nombre de places LL.M non communiqué.",
    "seatsMin": null,
    "seatsMax": null,
    "requiredLevel": "M2",
    "requiredLevelRaw": "Master Juriste trilingue uniquement",
    "programLanguage": "Anglais",
    "duration": "M1 : un semestre ; LL.M : un an ou possiblement un semestre si semestre M1 déjà effectué à LSU",
    "specialties": [
      "Comparative Law",
      "Droit civil",
      "Common law",
      "Traduction juridique"
    ],
    "admissionConditions": "Pour le M1 : réservé aux étudiants du Master 1 Juriste trilingue. Candidature pendant la L3 si étudiant à Nantes ou au début du M1. Validation du dossier par Mme Garreau puis par le Professeur Olivier Moréteau et la commission des programmes internationaux. Pour le LL.M : candidature en janvier-février pendant l'année de M2 ; sélection en mars-avril.",
    "languageTests": [],
    "applicationDeadline": "Candidature LL.M en janvier-février ; sélection en mars-avril.",
    "shortDescription": "Convention entre Nantes Université et LSU (Master Juriste trilingue). IMPORTANT : accord suspendu pour 2025/2026 et 2026/2027 (information confirmée par email).",
    "officialLink": null,
    "reliability": "confirmed",
    "missingInformation": [
      "Test de langue",
      "Nombre exact de places LL.M",
      "Frais exacts du LL.M",
      "Lien officiel"
    ],
    "notes": "Accord suspendu pour l'année universitaire 2025/2026 et 2026/2027 (email de Pauline Bruno). Les étudiants ayant effectué le semestre 2 de M1 à LSU peuvent avoir acquis un semestre LL.M et ne faire ensuite qu'un semestre après le M2 pour valider le LL.M, à confirmer au cas par cas.",
    "active": true,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "nice-st-johns-llm",
    "frenchUniversityId": "nice-cote-azur",
    "frenchUniversity": "Université Côte d’Azur (Nice)",
    "usLawSchool": "St. John's University School of Law",
    "city": "New York",
    "state": "New York",
    "partnershipType": "preferential_treatment",
    "tuitionCategory": "reduced_tuition",
    "tuitionDisplay": "Estimation tuition seulement : environ 75 720 $ de frais d’inscription LL.M. au tarif public 2026-2027 de St. John’s University School of Law, puis environ 37 860 $ après réduction estimée de 50 % grâce au partenariat. Cette estimation ne comprend ni logement, ni assurance, ni transport, ni visa.",
    "financialAid": "Réduction de frais d’environ 50 %, soit une tuition estimée autour de 37 860 $ au lieu d’environ 75 720 $, selon le retour étudiant et le tarif public St. John’s 2026-2027.",
    "seatsDisplay": "Pas de nombre de places fixe communiqué. Une seule étudiante est partie sur la cohorte mentionnée ; aucune l’année précédente, selon le retour étudiant.",
    "seatsMin": null,
    "seatsMax": null,
    "requiredLevel": "M1",
    "requiredLevelRaw": "M1 ou M2, à confirmer",
    "programLanguage": "Anglais",
    "duration": "1 an",
    "specialties": [
      "U.S. Legal Studies",
      "Transnational Legal Practice"
    ],
    "admissionConditions": "Sélection gérée directement par Nice, sans LSAC selon le retour étudiant. Dossier académique requis ; seuil indicatif de 12/20 pour que le dossier soit examiné ; entretien possible mais non obligatoire ; TOEFL minimum 80. La difficulté pratique signalée est aussi d’obtenir l’accord pédagogique du professeur de M1 ou M2 concerné.",
    "languageTests": [
      {
        "test": "TOEFL",
        "minimumScore": "80",
        "details": "Seuil communiqué par une étudiante du programme."
      }
    ],
    "applicationDeadline": null,
    "shortDescription": "Selon un retour d’étudiante, l’Université Côte d’Azur (Nice) dispose d’un partenariat LL.M avec St. John’s University School of Law, avec réduction d’environ 50 % des frais de scolarité.",
    "officialLink": null,
    "reliability": "to_confirm",
    "missingInformation": [
      "Lien officiel",
      "Nom exact de la faculté française impliquée",
      "Nombre habituel de départs",
      "Date limite de candidature",
      "Niveau exact de départ",
      "Conditions précises d’éligibilité au barreau de New York"
    ],
    "notes": "Selon l’étudiante, les candidats peuvent choisir entre deux LL.M : U.S. Legal Studies et Transnational Legal Practice. Les deux permettraient en principe d’être éligible au barreau de New York, mais ce point doit être confirmé officiellement. L’estimation tuition repose sur la page officielle St. John’s LL.M. 2026-2027.",
    "active": false,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "paris-nanterre-cardozo-reduction-50-officieux",
    "frenchUniversityId": "paris-nanterre",
    "frenchUniversity": "Université Paris Nanterre",
    "usLawSchool": "Cardozo School of Law / Yeshiva University",
    "city": "New York",
    "state": "New York",
    "partnershipType": "preferential_treatment",
    "tuitionCategory": "reduced_tuition",
    "tuitionDisplay": "50 % scholarship indiquée dans un document étudiant (plus de place gratuite selon retour étudiant). Coût exact à confirmer.",
    "financialAid": null,
    "seatsDisplay": null,
    "seatsMin": null,
    "seatsMax": null,
    "requiredLevel": null,
    "requiredLevelRaw": null,
    "programLanguage": "Anglais",
    "duration": null,
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": null,
    "languageTests": [],
    "applicationDeadline": "Pour une rentrée Fall : période d’application indiquée du 15 septembre au 1er juin, à confirmer.",
    "shortDescription": "Information officieuse : réduction de 50 % des frais d'inscription Cardozo pour certains candidats issus d'universités parisiennes.",
    "officialLink": null,
    "reliability": "to_confirm",
    "missingInformation": [
      "Confirmation officielle du partenariat",
      "Conditions exactes d'éligibilité",
      "Programme LL.M concerné",
      "Tests d’anglais requis",
      "Conditions exactes de la scholarship",
      "Deadline actualisée",
      "Nombre de places / quota"
    ],
    "notes": "Données issues d’un document étudiant non officiel (2025-2026) + retour étudiant : Cardozo ne proposerait plus de place gratuite contrairement à une année précédente. À afficher avec un badge « À confirmer – source étudiante non officielle ».",
    "active": false,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "paris-saclay-cardozo-reduction-50-officieux",
    "frenchUniversityId": "paris-saclay",
    "frenchUniversity": "Université Paris-Saclay",
    "usLawSchool": "Cardozo School of Law / Yeshiva University",
    "city": "New York",
    "state": "New York",
    "partnershipType": "preferential_treatment",
    "tuitionCategory": "reduced_tuition",
    "tuitionDisplay": "Réduction de 50 % des frais d'inscription (≈ 38 801 $/an), à confirmer.",
    "financialAid": null,
    "seatsDisplay": null,
    "seatsMin": null,
    "seatsMax": null,
    "requiredLevel": null,
    "requiredLevelRaw": null,
    "programLanguage": "Anglais",
    "duration": null,
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": null,
    "languageTests": [],
    "applicationDeadline": null,
    "shortDescription": "Information officieuse : réduction de 50 % des frais d'inscription Cardozo pour certains candidats issus d'universités parisiennes.",
    "officialLink": null,
    "reliability": "confirmed",
    "missingInformation": [
      "Lien officiel Cardozo / université française",
      "Conditions exactes d'éligibilité",
      "Programme LL.M concerné",
      "Procédure de candidature (interne / LSAC)",
      "Frais exacts et année de référence",
      "Nombre de places / quota"
    ],
    "notes": "Info transmise par l’utilisateur : partenariat « officieux » annoncé à -50%.",
    "active": true,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "paris1-boston-college",
    "frenchUniversityId": "paris1",
    "frenchUniversity": "Université Paris 1 Panthéon-Sorbonne",
    "usLawSchool": "Boston College Law School",
    "city": "Boston",
    "state": "Massachusetts",
    "partnershipType": "reserved_seat",
    "tuitionCategory": "fixed_fee",
    "tuitionDisplay": "Frais de scolarité à payer auprès de Paris 1, montant proche d'une inscription en Master, plus CVEC le cas échéant.",
    "financialAid": "Aucune aide financière prévue par le programme.",
    "seatsDisplay": "2 places pour 2025/2026",
    "seatsMin": 2,
    "seatsMax": 2,
    "requiredLevel": "M1",
    "requiredLevelRaw": "M1 ou M2 en droit",
    "programLanguage": "Anglais",
    "duration": "1 an",
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": "TOEFL minimum 100 ou IELTS minimum 7.0. Sélection sur dossier et audition.",
    "languageTests": [
      {
        "test": "TOEFL",
        "minimumScore": "100",
        "details": "TOEFL préférable."
      },
      {
        "test": "IELTS",
        "minimumScore": "7.0",
        "details": "Accepté comme dispense de TOEFL."
      }
    ],
    "applicationDeadline": "6 janvier 2025 à 17h",
    "shortDescription": "Programme LL.M à Boston College Law School dans le cadre du programme LL.M USA/Australie de Paris 1.",
    "officialLink": null,
    "reliability": "confirmed",
    "missingInformation": [
      "Spécialité exacte du LL.M",
      "Lien officiel",
      "Montant exact des frais Paris 1"
    ],
    "notes": "Assurance santé américaine obligatoire. Exemple communiqué : environ 3 000 $ par an pour Boston College.",
    "active": true,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "paris1-cardozo",
    "frenchUniversityId": "paris1",
    "frenchUniversity": "Université Paris 1 Panthéon-Sorbonne",
    "usLawSchool": "Cardozo School of Law / Yeshiva University",
    "city": "New York",
    "state": "New York",
    "partnershipType": "reserved_seat",
    "tuitionCategory": "fixed_fee",
    "tuitionDisplay": "Frais de scolarité à payer auprès de Paris 1, montant proche d'une inscription en Master, plus CVEC le cas échéant.",
    "financialAid": "Aucune aide financière prévue par le programme.",
    "seatsDisplay": "1 place pour 2025/2026",
    "seatsMin": 1,
    "seatsMax": 1,
    "requiredLevel": "M1",
    "requiredLevelRaw": "M1 ou M2 en droit",
    "programLanguage": "Anglais",
    "duration": "1 an",
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": "TOEFL minimum 100 ou IELTS minimum 7.0. Sélection sur dossier et audition.",
    "languageTests": [
      {
        "test": "TOEFL",
        "minimumScore": "100",
        "details": "TOEFL préférable."
      },
      {
        "test": "IELTS",
        "minimumScore": "7.0",
        "details": "Accepté comme dispense de TOEFL."
      }
    ],
    "applicationDeadline": "6 janvier 2025 à 17h",
    "shortDescription": "Programme LL.M à Cardozo School of Law dans le cadre du programme LL.M USA/Australie de Paris 1.",
    "officialLink": null,
    "reliability": "confirmed",
    "missingInformation": [
      "Spécialité exacte du LL.M",
      "Lien officiel",
      "Montant exact des frais Paris 1"
    ],
    "notes": "Données issues du document Paris 1 transmis.",
    "active": true,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "paris1-cardozo-reduction-50-officieux",
    "frenchUniversityId": "paris1",
    "frenchUniversity": "Université Paris 1 Panthéon-Sorbonne",
    "usLawSchool": "Cardozo School of Law / Yeshiva University",
    "city": "New York",
    "state": "New York",
    "partnershipType": "preferential_treatment",
    "tuitionCategory": "reduced_tuition",
    "tuitionDisplay": "Réduction de 50 % des frais d'inscription (≈ 38 801 $/an), à confirmer.",
    "financialAid": null,
    "seatsDisplay": null,
    "seatsMin": null,
    "seatsMax": null,
    "requiredLevel": null,
    "requiredLevelRaw": null,
    "programLanguage": "Anglais",
    "duration": null,
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": null,
    "languageTests": [],
    "applicationDeadline": null,
    "shortDescription": "Information officieuse : réduction de 50 % des frais d'inscription Cardozo pour certains candidats issus d'universités parisiennes.",
    "officialLink": null,
    "reliability": "confirmed",
    "missingInformation": [
      "Lien officiel Cardozo / université française",
      "Conditions exactes d'éligibilité",
      "Programme LL.M concerné",
      "Procédure de candidature (interne / LSAC)",
      "Frais exacts et année de référence",
      "Nombre de places / quota"
    ],
    "notes": "Info transmise par l’utilisateur : partenariat « officieux » annoncé à -50%.",
    "active": true,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "paris1-columbia",
    "frenchUniversityId": "paris1",
    "frenchUniversity": "Université Paris 1 Panthéon-Sorbonne",
    "usLawSchool": "Columbia University",
    "city": "New York",
    "state": null,
    "partnershipType": "dual_degree",
    "tuitionCategory": "full_or_unknown",
    "tuitionDisplay": null,
    "financialAid": null,
    "seatsDisplay": null,
    "seatsMin": null,
    "seatsMax": null,
    "requiredLevel": null,
    "requiredLevelRaw": null,
    "programLanguage": "Anglais et français probablement, à confirmer",
    "duration": null,
    "specialties": [
      "Droit français et droit américain"
    ],
    "admissionConditions": null,
    "languageTests": [],
    "applicationDeadline": null,
    "shortDescription": "Double diplôme Paris 1 ↔ Columbia : ce programme n’est pas un LL.M mais un J.D. (correction confirmée par message reçu).",
    "officialLink": null,
    "reliability": "incomplete",
    "missingInformation": [
      "Structure exacte du double diplôme (parcours, durée, diplômes délivrés)",
      "Niveau requis",
      "Test de langue",
      "Nombre de places",
      "Frais",
      "Durée",
      "Lien officiel"
    ],
    "notes": "Correction confirmée par message reçu : le double diplôme Paris 1 ↔ Columbia est un J.D., pas un LL.M. Les détails (modalités, durée, frais, éligibilité, procédure) restent à documenter via une source officielle.",
    "active": false,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "paris1-cornell",
    "frenchUniversityId": "paris1",
    "frenchUniversity": "Université Paris 1 Panthéon-Sorbonne",
    "usLawSchool": "Cornell Law School",
    "city": "Ithaca",
    "state": "New York",
    "partnershipType": "reserved_seat",
    "tuitionCategory": "fixed_fee",
    "tuitionDisplay": "Frais de scolarité à payer auprès de Paris 1, montant proche d'une inscription en Master, plus CVEC le cas échéant.",
    "financialAid": "Aucune aide financière prévue par le programme.",
    "seatsDisplay": "2 places pour 2025/2026",
    "seatsMin": 2,
    "seatsMax": 2,
    "requiredLevel": "M1",
    "requiredLevelRaw": "M1 ou M2 en droit",
    "programLanguage": "Anglais",
    "duration": "1 an",
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": "Être inscrit en Master 1 ou Master 2 de droit à Paris 1 lors de l'année de sélection. TOEFL minimum 100 ou IELTS minimum 7.0. L'étudiant doit valider au moins un diplôme de niveau Bac+4 avant le départ. Candidature préalable Cornell via LSAC (LL.M. Credential Assembly Service).",
    "languageTests": [
      {
        "test": "TOEFL",
        "minimumScore": "100",
        "details": "TOEFL préférable à tout autre diplôme."
      },
      {
        "test": "IELTS",
        "minimumScore": "7.0",
        "details": "Accepté comme dispense de TOEFL."
      }
    ],
    "applicationDeadline": "Cornell/LSAC : 1er décembre 2024 (envoi des candidats nominés par email) ; 15 décembre 2024 (dossier LSAC). Paris 1 : 6 janvier 2025 à 17h (dossier).",
    "shortDescription": "Programme permettant aux étudiants sélectionnés de passer un an à Cornell Law School et d'obtenir un LL.M.",
    "officialLink": null,
    "reliability": "confirmed",
    "missingInformation": [
      "Spécialité exacte du LL.M",
      "Lien officiel",
      "Montant exact des frais Paris 1"
    ],
    "notes": "Candidature Cornell : dépôt via LSAC (LL.M. Credential Assembly Service) ; prévoir 4–6 semaines de traitement LSAC. Lettres de recommandation : au moins 2, dont la lettre de nomination (via LSAC LOR). Nominés à envoyer à glsadmissions@cornell.edu avant le 1er décembre 2024 (copie : fas75@cornell.edu, dfp7@cornell.edu). Lien de candidature directe Cornell : https://llm.lsac.org/login/access.aspx?appl=2098L11. Fee waiver : demander à glsadmissions@cornell.edu (le fee LSAC CAS reste dû). Assurance maladie US obligatoire, logement/repas à charge.",
    "active": true,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "paris1-fordham",
    "frenchUniversityId": "paris1",
    "frenchUniversity": "Université Paris 1 Panthéon-Sorbonne",
    "usLawSchool": "Fordham University School of Law",
    "city": "New York",
    "state": "New York",
    "partnershipType": "reserved_seat",
    "tuitionCategory": "fixed_fee",
    "tuitionDisplay": "Frais de scolarité à payer auprès de Paris 1, montant proche d'une inscription en Master, plus CVEC le cas échéant.",
    "financialAid": "Aucune aide financière prévue par le programme.",
    "seatsDisplay": "2 places pour 2025/2026",
    "seatsMin": 2,
    "seatsMax": 2,
    "requiredLevel": "M1",
    "requiredLevelRaw": "M1 ou M2 en droit",
    "programLanguage": "Anglais",
    "duration": "1 an",
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": "TOEFL minimum 100 ou IELTS minimum 7.0. Sélection sur dossier et audition.",
    "languageTests": [
      {
        "test": "TOEFL",
        "minimumScore": "100",
        "details": "TOEFL préférable."
      },
      {
        "test": "IELTS",
        "minimumScore": "7.0",
        "details": "Accepté comme dispense de TOEFL."
      }
    ],
    "applicationDeadline": "6 janvier 2025 à 17h",
    "shortDescription": "Programme LL.M à Fordham University School of Law dans le cadre du programme LL.M USA/Australie de Paris 1.",
    "officialLink": null,
    "reliability": "confirmed",
    "missingInformation": [
      "Spécialité exacte du LL.M",
      "Lien officiel",
      "Montant exact des frais Paris 1"
    ],
    "notes": "Logement, repas, vie quotidienne et assurance santé américaine à la charge de l'étudiant.",
    "active": true,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "paris1-pace",
    "frenchUniversityId": "paris1",
    "frenchUniversity": "Université Paris 1 Panthéon-Sorbonne",
    "usLawSchool": "Pace University",
    "city": "New York",
    "state": "New York",
    "partnershipType": "reserved_seat",
    "tuitionCategory": "fixed_fee",
    "tuitionDisplay": "Frais de scolarité à payer auprès de Paris 1, montant proche d'une inscription en Master, plus CVEC le cas échéant.",
    "financialAid": "Aucune aide financière prévue par le programme.",
    "seatsDisplay": "2 places pour 2025/2026",
    "seatsMin": 2,
    "seatsMax": 2,
    "requiredLevel": "M1",
    "requiredLevelRaw": "M1 ou M2 en droit",
    "programLanguage": "Anglais",
    "duration": "1 an",
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": "TOEFL minimum 100 ou IELTS minimum 7.0. Sélection sur dossier et audition.",
    "languageTests": [
      {
        "test": "TOEFL",
        "minimumScore": "100",
        "details": "TOEFL préférable."
      },
      {
        "test": "IELTS",
        "minimumScore": "7.0",
        "details": "Accepté comme dispense de TOEFL."
      }
    ],
    "applicationDeadline": "6 janvier 2025 à 17h",
    "shortDescription": "Programme LL.M à Pace University dans le cadre du programme LL.M USA/Australie de Paris 1.",
    "officialLink": null,
    "reliability": "confirmed",
    "missingInformation": [
      "Spécialité exacte du LL.M",
      "Lien officiel",
      "Montant exact des frais Paris 1"
    ],
    "notes": "Données issues du document Paris 1 transmis.",
    "active": true,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "paris1-pittsburgh",
    "frenchUniversityId": "paris1",
    "frenchUniversity": "Université Paris 1 Panthéon-Sorbonne",
    "usLawSchool": "University of Pittsburgh School of Law",
    "city": "Pittsburgh",
    "state": "Pennsylvania",
    "partnershipType": "reserved_seat",
    "tuitionCategory": "fixed_fee",
    "tuitionDisplay": "Frais de scolarité à payer auprès de Paris 1, montant proche d'une inscription en Master, plus CVEC le cas échéant.",
    "financialAid": "Aucune aide financière prévue par le programme.",
    "seatsDisplay": "2 places pour 2025/2026",
    "seatsMin": 2,
    "seatsMax": 2,
    "requiredLevel": "M1",
    "requiredLevelRaw": "M1 ou M2 en droit",
    "programLanguage": "Anglais",
    "duration": "1 an",
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": "TOEFL minimum 100 ou IELTS minimum 7.0. Sélection sur dossier et audition.",
    "languageTests": [
      {
        "test": "TOEFL",
        "minimumScore": "100",
        "details": "TOEFL préférable."
      },
      {
        "test": "IELTS",
        "minimumScore": "7.0",
        "details": "Accepté comme dispense de TOEFL."
      }
    ],
    "applicationDeadline": "6 janvier 2025 à 17h",
    "shortDescription": "Programme LL.M à University of Pittsburgh School of Law dans le cadre du programme LL.M USA/Australie de Paris 1.",
    "officialLink": null,
    "reliability": "confirmed",
    "missingInformation": [
      "Spécialité exacte du LL.M",
      "Lien officiel",
      "Montant exact des frais Paris 1"
    ],
    "notes": "Données issues du document Paris 1 transmis.",
    "active": true,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "paris1-st-johns",
    "frenchUniversityId": "paris1",
    "frenchUniversity": "Université Paris 1 Panthéon-Sorbonne",
    "usLawSchool": "St. John's University School of Law",
    "city": "New York",
    "state": "New York",
    "partnershipType": "reserved_seat",
    "tuitionCategory": "fixed_fee",
    "tuitionDisplay": "Frais de scolarité à payer auprès de Paris 1, montant proche d'une inscription en Master, plus CVEC le cas échéant.",
    "financialAid": "Aucune aide financière prévue par le programme.",
    "seatsDisplay": "2 places pour 2025/2026",
    "seatsMin": 2,
    "seatsMax": 2,
    "requiredLevel": "M1",
    "requiredLevelRaw": "M1 ou M2 en droit",
    "programLanguage": "Anglais",
    "duration": "1 an",
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": "TOEFL minimum 100 ou IELTS minimum 7.0. Sélection sur dossier et audition.",
    "languageTests": [
      {
        "test": "TOEFL",
        "minimumScore": "100",
        "details": "TOEFL préférable."
      },
      {
        "test": "IELTS",
        "minimumScore": "7.0",
        "details": "Accepté comme dispense de TOEFL."
      }
    ],
    "applicationDeadline": "6 janvier 2025 à 17h",
    "shortDescription": "Programme LL.M à St. John's University School of Law dans le cadre du programme LL.M USA/Australie de Paris 1.",
    "officialLink": null,
    "reliability": "confirmed",
    "missingInformation": [
      "Spécialité exacte du LL.M",
      "Lien officiel",
      "Montant exact des frais Paris 1"
    ],
    "notes": "Données issues du document Paris 1 transmis.",
    "active": true,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "paris1-washu-stl",
    "frenchUniversityId": "paris1",
    "frenchUniversity": "Université Paris 1 Panthéon-Sorbonne",
    "usLawSchool": "Washington University in St. Louis School of Law",
    "city": "St. Louis",
    "state": "Missouri",
    "partnershipType": "reserved_seat",
    "tuitionCategory": "fixed_fee",
    "tuitionDisplay": "Frais de scolarité à payer auprès de Paris 1, montant proche d'une inscription en Master, plus CVEC le cas échéant.",
    "financialAid": "Aucune aide financière prévue par le programme.",
    "seatsDisplay": "2 places pour 2025/2026",
    "seatsMin": 2,
    "seatsMax": 2,
    "requiredLevel": "M1",
    "requiredLevelRaw": "M1 ou M2 en droit",
    "programLanguage": "Anglais",
    "duration": "1 an",
    "specialties": [
      "Non communiqué"
    ],
    "admissionConditions": "TOEFL minimum 100 ou IELTS minimum 7.0. Sélection sur dossier et audition.",
    "languageTests": [
      {
        "test": "TOEFL",
        "minimumScore": "100",
        "details": "TOEFL préférable."
      },
      {
        "test": "IELTS",
        "minimumScore": "7.0",
        "details": "Accepté comme dispense de TOEFL."
      }
    ],
    "applicationDeadline": "6 janvier 2025 à 17h",
    "shortDescription": "Programme LL.M à Washington University in St. Louis School of Law dans le cadre du programme LL.M USA/Australie de Paris 1.",
    "officialLink": null,
    "reliability": "confirmed",
    "missingInformation": [
      "Spécialité exacte du LL.M",
      "Lien officiel",
      "Montant exact des frais Paris 1"
    ],
    "notes": "Données issues du document Paris 1 transmis.",
    "active": true,
    "verifiedAt": "2026-07-29"
  },
  {
    "id": "ucly-st-johns",
    "frenchUniversityId": "ucly",
    "frenchUniversity": "Université Catholique de Lyon",
    "usLawSchool": "St. John's University School of Law",
    "city": "New York",
    "state": "New York",
    "partnershipType": "dual_degree",
    "tuitionCategory": "fixed_fee",
    "tuitionDisplay": "St John's Track : 20 500 € + environ 2 700 € d'assurance. Option New York Bar : semestre supplémentaire à St. John's (~15 000 €) + environ 2 700 € d'assurance.",
    "financialAid": null,
    "seatsDisplay": "Pas de nombre de places fixe. Admissions selon le dossier. Une étudiante du programme indique qu'environ 10 étudiants sont partis sur la cohorte concernée.",
    "seatsMin": null,
    "seatsMax": null,
    "requiredLevel": "M1",
    "requiredLevelRaw": "Au moins 4 années d'études juridiques supérieures",
    "programLanguage": "Anglais",
    "duration": "1 an (St John's Track) : septembre à décembre à Lyon, janvier à mai à New York",
    "specialties": [
      "European and International Trade Law",
      "International Investment Law",
      "International Trade Agreements",
      "WTO Law",
      "EU External Trade Agreements",
      "International Investment Treaties",
      "Trade Dispute Settlement",
      "Transnational Legal Practice",
      "International Customs Law",
      "Foreign Direct Investment"
    ],
    "admissionConditions": "Les candidats doivent avoir un diplôme de droit de premier cycle (Licence en droit, LL.B. ou équivalent), ainsi qu'au moins 4 années d'études supérieures en droit. Pour les candidats internes (M1 International Business Law à l'UCLy) : 14/20 de moyenne requis pour partir un semestre à New York ; 15/20 de moyenne requis pour partir deux semestres avec l'option permettant de préparer le New York Bar. Les candidatures extérieures sont acceptées sur dossier.",
    "languageTests": [
      {
        "test": "IELTS",
        "minimumScore": "6.5",
        "details": "Test en ligne accepté."
      },
      {
        "test": "TOEFL iBT",
        "minimumScore": "90",
        "details": "Aucune précision supplémentaire communiquée."
      },
      {
        "test": "CAE",
        "minimumScore": "58",
        "details": "Aucune précision supplémentaire communiquée."
      },
      {
        "test": "Duolingo",
        "minimumScore": "120",
        "details": "Test internet-based accepté."
      }
    ],
    "applicationDeadline": "Mai 2025",
    "shortDescription": "Programme de double diplôme UCLy × St. John's (New York). Un semestre à New York permet d'obtenir le LL.M. de St. John's ; un second semestre est nécessaire pour l'option New York Bar (frais supplémentaires).",
    "officialLink": "https://www.ucly.fr/en/academics/our-programmes/ll-m-in-european-and-international-trade-investment-law-master-2/",
    "reliability": "confirmed",
    "missingInformation": [
      "Montant exact et officiel de l'assurance (année universitaire en cours)",
      "Montant exact actualisé du second semestre (New York Bar)",
      "Critères détaillés pour les candidats extérieurs",
      "Conditions exactes du New York Bar applicables aux diplômés",
      "Logement, visa, transport et coût de la vie à New York"
    ],
    "notes": "Mise à jour confirmée par une étudiante du programme : 20 500 € + ~2 700 € d'assurance (semestre à New York) ; ~15 000 € + ~2 700 € d'assurance (semestre supplémentaire New York Bar) ; sélection sur notes/dossier ; 14/20 requis (1 semestre NY) et 15/20 (2 semestres + NY Bar) pour les candidats internes ; candidatures extérieures acceptées sur dossier ; pas de quota fixe ; cohorte rapportée ~10 étudiants.",
    "active": true,
    "verifiedAt": "2026-07-29"
  }
];
