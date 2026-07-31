-- Contrainte d'unicité sur (diagnostic, nom normalisé) — lot E.
--
-- Le contrôle de doublon existait déjà dans `decideAdd`, mais il LIT la liste
-- avant d'écrire : deux soumissions simultanées — un double-clic suffit —
-- passaient toutes deux le contrôle et produisaient deux lignes. Une garde
-- dans le code protège d'une erreur de saisie, jamais d'une course ; seul le
-- stockage peut trancher.

-- AlterTable : colonne d'abord nullable, le temps de la remplir.
ALTER TABLE "SchoolChoice" ADD COLUMN "nameKey" TEXT;

-- Remplissage des lignes existantes.
--
-- Reproduit `normalizeName` : minuscules, diacritiques retirés, espaces
-- réduits, extrémités coupées. `translate` plutôt que l'extension `unaccent`,
-- qui n'est pas garantie présente sur le serveur de destination — une
-- migration qui exige une extension échoue au déploiement, pas en revue.
UPDATE "SchoolChoice"
SET "nameKey" = btrim(
  regexp_replace(
    translate(
      lower("name"),
      'àáâãäåèéêëìíîïòóôõöùúûüýÿçñ',
      'aaaaaaeeeeiiiiooooouuuuyycn'
    ),
    '\s+', ' ', 'g'
  )
);

-- Deux lignes déjà en doublon empêcheraient la création de l'index. Le cas
-- n'existe pas au moment d'écrire cette migration (aucun doublon normalisé en
-- base), mais un déploiement plus tardif pourrait en porter : on garde la plus
-- ancienne, celle que l'utilisateur a voulue, et non la répétition accidentelle.
DELETE FROM "SchoolChoice" a
USING "SchoolChoice" b
WHERE a."assessmentId" = b."assessmentId"
  AND a."nameKey" = b."nameKey"
  AND (a."addedAt" > b."addedAt" OR (a."addedAt" = b."addedAt" AND a."id" > b."id"));

ALTER TABLE "SchoolChoice" ALTER COLUMN "nameKey" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SchoolChoice_assessmentId_nameKey_key" ON "SchoolChoice"("assessmentId", "nameKey");
