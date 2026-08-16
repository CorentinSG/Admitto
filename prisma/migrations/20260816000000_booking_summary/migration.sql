-- Compte rendu de séance (CDC §31).
--
-- Rédigé par le fondateur après la séance, lu par le client dans son espace.
-- Sur la ligne de la réservation, comme la note de suivi vit sur la ligne du
-- statut : une table à part serait une seconde relation à effacer, à exporter
-- et à garder alignée. Colonnes nullables sans défaut : l'absence de compte
-- rendu EST null, et une réservation existante n'en a aucun à se voir inventer.
ALTER TABLE "Booking" ADD COLUMN "summary" TEXT;
ALTER TABLE "Booking" ADD COLUMN "summaryAt" TIMESTAMP(3);
