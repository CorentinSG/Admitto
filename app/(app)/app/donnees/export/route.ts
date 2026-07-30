import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth/current";
import { exportPersonalData } from "@/lib/legal/personal-data";

/**
 * Portabilité (RGPD art. 20 — revue §A1.2).
 *
 * Une route plutôt qu'une action serveur : le résultat est un fichier à
 * télécharger, et une action serveur renvoie une valeur au composant, pas une
 * réponse HTTP portant un nom de fichier.
 *
 * JSON indenté, et non compacté : le règlement demande un format « lisible par
 * machine », mais la personne qui exerce ce droit veut d'abord lire elle-même
 * ce qui est détenu.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Accès refusé." }, { status: 401 });

  const data = await exportPersonalData(user.id);
  if (!data) return NextResponse.json({ error: "Export indisponible." }, { status: 503 });

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": 'attachment; filename="admitto-donnees.json"',
      // Une copie de données personnelles n'a rien à faire dans un cache
      // intermédiaire, fût-il celui du navigateur.
      "cache-control": "no-store",
    },
  });
}
