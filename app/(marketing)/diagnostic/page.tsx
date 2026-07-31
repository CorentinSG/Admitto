import type { Metadata } from "next";
import { gradients } from "@/design/tokens";
import { Questionnaire } from "./Questionnaire";

export const metadata: Metadata = {
  title: "Diagnostic gratuit — Admitto",
  description:
    "Quatre minutes pour situer votre projet de LL.M. américain et de barreau de New York. Résultat préliminaire immédiat.",
};

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
      <Questionnaire />
    </main>
  );
}
