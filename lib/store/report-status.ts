/**
 * Statuts d'un rapport — liste fermée, SANS aucune dépendance.
 *
 * Ces trois valeurs vivaient dans `lib/store/reports.ts`, à côté du store. Un
 * composant client en avait besoin pour dessiner trois boutons, et l'important
 * ici : importer une CONSTANTE depuis ce fichier y importe tout le module, donc
 * `lib/db/client`, donc le client Prisma. Le bundle de
 * `/admin/rapports/[id]` pesait 18,9 Ko pour trois chaînes de caractères.
 *
 * Le type ne suffisait pas à éviter le piège : `import type` disparaît à la
 * compilation, mais `REPORT_STATUSES` est une valeur — elle est bel et bien
 * chargée. C'est la raison d'être de ce fichier : ce qu'un navigateur doit
 * connaître ne doit dépendre de rien qu'il ne doive pas connaître.
 */
export const REPORT_STATUSES = ["QUEUED", "IN_REVIEW", "SENT"] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];
