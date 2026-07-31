import { assessmentStore } from "@/lib/store/assessments";
import { roadmapStore } from "@/lib/store/roadmap";
import { noticeStore } from "@/lib/store/notifications";
import { loadRoadmap } from "@/lib/roadmap/load";
import { baseUrl, dispatchEmail } from "@/lib/email/dispatch";
import { deadlineList, dueNotices, noticeLead } from "./deadlines";
import { log } from "@/lib/observability/log";

/**
 * Passage d'envoi des rappels d'échéance (CDC §22).
 *
 * Déclenché de l'extérieur (tâche planifiée), jamais par une visite : un
 * rappel ne doit pas dépendre du fait que la personne se connecte — c'est
 * précisément quand elle ne se connecte pas qu'il sert.
 *
 * Deux garde-fous d'envoi :
 *
 * - **Aucun rappel à qui n'a jamais ouvert sa feuille de route.** Le journal
 *   des statuts fait foi : sans une seule tâche touchée, la personne n'a pas
 *   commencé à s'en servir, et lui écrire serait de la relance, pas du service.
 * - **Le journal n'est écrit qu'après un envoi réussi.** Un échec de transport
 *   laisse le rappel dû et le passage suivant le renverra.
 */

export interface RunSummary {
  /** Rappels dus, tous destinataires confondus. */
  considered: number;
  /** Messages envoyés — un par destinataire, pas un par rappel. */
  sent: number;
  /** Destinataires écartés faute d'avoir jamais ouvert leur feuille de route. */
  skipped: number;
  failed: number;
}

export async function runDeadlineNotifications(reference: Date): Promise<RunSummary> {
  const summary: RunSummary = { considered: 0, sent: 0, skipped: 0, failed: 0 };
  const url = baseUrl();

  for (const assessment of await assessmentStore.all()) {
    const email = assessment.answers.email;
    if (!email) continue;

    if (!(await roadmapStore.hasAny(assessment.id))) {
      summary.skipped += 1;
      continue;
    }

    const loaded = await loadRoadmap(assessment.id, reference);
    if (!loaded) continue;

    const sentAlready = await noticeStore.sent(assessment.id);
    const notices = dueNotices(loaded.tasks, reference, sentAlready);
    summary.considered += notices.length;
    if (notices.length === 0) continue;

    // Un seul message par passage, quel que soit le nombre d'échéances dues.
    // `dueNotices` les rend déjà triées, la plus proche en tête.
    const first = notices[0];
    const result = await dispatchEmail(
      "DEADLINE_NOTICE",
      email,
      {
        firstName: assessment.answers.firstName ?? "",
        taskTitle: first.taskTitle,
        noticeLead: noticeLead(first),
        deadlineList: deadlineList(notices),
        dashboardUrl: `${url}/app/roadmap`,
      },
      // Base contractuelle : le consentement marketing n'entre pas en jeu.
      // Il est passé à `false` pour que, si la base légale était un jour
      // requalifiée par erreur, l'email cesse de partir au lieu de partir à tort.
      false
    );

    if (result.ok) {
      // Le journal n'est écrit qu'après succès : un échec laisse tous les
      // rappels dus, et le passage suivant les reprend ensemble.
      for (const notice of notices) await noticeStore.markSent(assessment.id, notice.id);
      summary.sent += 1;
    } else {
      summary.failed += 1;
    }
  }


  // Le résumé partait au client HTTP et nulle part ailleurs : un cron qui
  // n'échoue pas mais n'envoie plus rien (`sent` à zéro pendant que
  // `considered` monte) était indétectable sans lire la réponse d'une requête
  // que personne ne lit.
  log(summary.failed > 0 ? "warn" : "info", "notifications.done", { ...summary });
  return summary;
}
