import type { Metadata } from "next";
import { gradients } from "@/design/tokens";
import { Questionnaire } from "./Questionnaire";
import { emailsAreDelivered } from "@/lib/email/transport";
import { deliveryPromise } from "@/content/diagnostic-delivery";

export const metadata: Metadata = {
  title: "Diagnostic gratuit — Admitto",
  description:
    "Quatre minutes pour situer votre projet de LL.M. américain et de barreau de New York. Résultat préliminaire immédiat.",
};

/*
 * Rendue à la demande : le régime d'envoi se lit dans l'environnement, et une
 * page figée au build annoncerait celui du build, pas celui du serveur.
 */
export const dynamic = "force-dynamic";

export default function DiagnosticPage() {
  return (
    <main id="contenu" tabIndex={-1}
      style={{
        minHeight: "100vh",
        background: gradients.hero,
        padding: "140px 8% 100px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Questionnaire deliveryPromise={deliveryPromise(emailsAreDelivered())} />
    </main>
  );
}
