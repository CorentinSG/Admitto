import { notFound } from "next/navigation";

/**
 * Cible de réécriture du middleware lorsque l'accès au back-office est refusé.
 * Rend une 404 standard : l'existence de l'interface n'est pas révélée.
 */
export default function AdminNotFound(): never {
  notFound();
}
