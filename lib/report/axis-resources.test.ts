import { describe, expect, it } from "vitest";
import { TOOL_BY_AXIS, resourcesForAxis } from "./axis-resources";
import { MODULE_BY_AXIS } from "@/lib/email/resource";
import { AXES } from "@/lib/engine-b/verdict";
import { findModule, isModulePublished } from "@/content/modules";
import { dashboard } from "@/content/dashboard";

describe("ressources d'un axe faible (personnalisation 1.3)", () => {
  it("couvre exactement les cinq axes", () => {
    expect(Object.keys(TOOL_BY_AXIS).sort()).toEqual([...AXES].sort());
  });

  it("chaque outil cité existe dans la navigation de l'espace", () => {
    // Un lien vers une page qui n'existe pas serait pire que pas de lien : il
    // nomme une fragilité et mène à une erreur.
    const connus = new Set(dashboard.nav.map((entry) => entry.href));
    for (const [axis, tool] of Object.entries(TOOL_BY_AXIS)) {
      if (tool) expect(connus, `${axis} → ${tool.href}`).toContain(tool.href);
    }
  });

  it("chaque module cité existe ET est publié", () => {
    for (const axis of AXES) {
      const { moduleSlug } = resourcesForAxis(axis);
      expect(moduleSlug, `aucun module publiable pour ${axis}`).not.toBeNull();
      expect(findModule(moduleSlug!), `slug inconnu : ${moduleSlug}`).not.toBeNull();
      expect(isModulePublished(moduleSlug!)).toBe(true);
    }
  });

  it("reprend la table du J+12 plutôt que d'en tenir une seconde", () => {
    // Deux tables diraient deux choses du même axe, et l'email cesserait un
    // jour de correspondre à l'écran.
    for (const axis of AXES) {
      expect(resourcesForAxis(axis).moduleSlug).toBe(MODULE_BY_AXIS[axis]);
    }
  });

  it("laisse sans outil les axes qu'aucun outil ne travaille", () => {
    /*
     * `null` est une réponse, pas un trou : le réalisme professionnel relève
     * d'un travail personnel, le risque migratoire d'autorités dont le produit
     * ne fait jamais les démarches. Inventer un outil suggérerait qu'il suffit
     * de cliquer.
     */
    expect(TOOL_BY_AXIS.PROFESSIONAL_REALISM).toBeNull();
    expect(TOOL_BY_AXIS.IMMIGRATION_RISK).toBeNull();
    // Ces axes gardent leur module : il reste quelque chose à lire.
    expect(resourcesForAxis("IMMIGRATION_RISK").moduleSlug).not.toBeNull();
  });
});
