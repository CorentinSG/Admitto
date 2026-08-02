import type { Answers } from "@/lib/questionnaire/types";
import type { Task } from "./types";

/**
 * Tâches que la personne a DÉCLARÉES faites au questionnaire.
 *
 * Le produit demandait « où en êtes-vous du test d'anglais ? », recevait
 * « je l'ai déjà passé », puis proposait « programmer le test d'anglais » avec
 * une échéance et un risque de retard. Répondre à une question puis se voir
 * ignoré est pire que ne pas avoir été interrogé.
 *
 * ## Pourquoi une PROPOSITION et non un cochage automatique
 *
 * La feuille de route pose une règle que ce module ne contourne pas : « c'est
 * l'utilisateur qui coche, jamais le système à sa place » (CDC §24). Elle
 * protège de deux choses — une progression qui affiche un avancement non
 * réalisé, et un Milestone Challenge acquis sans qu'aucune action ne l'ait
 * mérité.
 *
 * Mais refuser de PRÉSUMER n'oblige pas à ignorer une déclaration explicite.
 * Ce module ne change donc aucun statut : il signale à l'écran que la réponse
 * existe, et laisse le clic à la personne. La règle est respectée à la lettre,
 * et le produit cesse d'oublier ce qu'on vient de lui dire.
 *
 * ## Liste FERMÉE, et volontairement courte
 *
 * Une correspondance n'entre ici que si la réponse dit sans ambiguïté que le
 * travail de la tâche est fait. « Préparation commencée » ne vaut pas « test
 * passé » : un « à confirmer » posé sur une tâche à moitié faite ferait plus
 * de dégâts que l'oubli qu'il corrige.
 */
export interface DeclaredDone {
  taskId: string;
  /** Ce que la personne a répondu, à lui redire mot pour mot. */
  answerLabel: string;
}

const CORRESPONDANCES: ReadonlyArray<{
  taskId: string;
  applies: (answers: Answers) => boolean;
  answerLabel: string;
}> = [
  {
    taskId: "T-SEL-02",
    // Seul `TEST_TAKEN` compte : « test programmé » ou « préparation
    // commencée » décrivent une tâche en cours, pas une tâche faite.
    applies: (answers) => answers.english === "TEST_TAKEN",
    answerLabel: "Test déjà passé",
  },
];

/** Tâches applicables dont la personne a déclaré le travail fait. */
export function declaredDone(tasks: Task[], answers: Answers): DeclaredDone[] {
  return CORRESPONDANCES.filter((rule) => rule.applies(answers))
    .filter((rule) =>
      tasks.some(
        (task) =>
          task.id === rule.taskId &&
          // Ni déjà cochée, ni hors périmètre : dans les deux cas il n'y a
          // rien à confirmer.
          task.status === "TODO"
      )
    )
    .map(({ taskId, answerLabel }) => ({ taskId, answerLabel }));
}
