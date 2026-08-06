import type { Metadata } from "next";
import { colors, fonts } from "@/design/tokens";
import type { RuleCondition } from "@/lib/engine-a/types";
import { effectiveRules, ruleDivergesFromCode } from "@/lib/matrices/rules";
import { BLOCK_DEFINITIONS, blockDivergesFromCode, resolveBlocksAsOf } from "@/lib/matrices/blocks";
import { blockRevisionStore, ruleRevisionStore } from "@/lib/store/matrices";
import { matrices } from "@/content/matrices";
import { BlockForm, RuleForm, type BlockView, type RuleView } from "./MatrixForms";

export const metadata: Metadata = {
  title: "Matrices — Admitto",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const dateFr = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

/** Condition rendue lisible — affichée, jamais éditée. */
function conditionSummary(condition: RuleCondition): string {
  if ("all" in condition) return condition.all.map(conditionSummary).join(" ET ");
  if ("any" in condition) return condition.any.map(conditionSummary).join(" OU ");
  return `${condition.field} ${condition.op} ${JSON.stringify(condition.value)}`;
}

/**
 * Édition des matrices (CDC §33).
 *
 * La page montre l'état EFFECTIF — code plus révisions — parce que c'est lui
 * qui gouverne les diagnostics. La provenance est affichée à côté : « état du
 * code » ou « révision n du … », pour que l'écart entre le dépôt et la base
 * reste visible au lieu d'être découvert en comparant à la main.
 */
export default async function MatricesPage() {
  const [ruleRevisions, blockRevisions] = await Promise.all([
    ruleRevisionStore.latest(),
    blockRevisionStore.all(),
  ]);

  const rules = effectiveRules(ruleRevisions);
  const ruleViews: RuleView[] = rules.map((rule) => {
    const revision = ruleRevisions.get(rule.id);
    /*
     * La révision GOUVERNE : une règle activée en code mais éteinte par une
     * révision reste éteinte. C'est le comportement voulu — le back-office doit
     * pouvoir fermer une règle sans déploiement — mais il était SILENCIEUX. Une
     * activation faite en code pouvait n'avoir aucun effet sans que rien ne le
     * signale, et c'est arrivé.
     */
    const diverges = revision !== undefined && ruleDivergesFromCode(rule);
    return {
      id: rule.id,
      produces: rule.factProduced,
      conditionSummary: conditionSummary(rule.condition),
      active: rule.active,
      sourceUrl: rule.sourceUrl,
      verifiedAtValue: rule.verifiedAt ?? "",
      version: rule.version,
      revisionLabel: revision
        ? matrices.rules.revised(revision.revision, dateFr(revision.createdAt))
        : matrices.rules.fromCode,
      divergence: diverges ? matrices.rules.diverges(!rule.active) : null,
    };
  });

  const resolved = resolveBlocksAsOf(blockRevisions, new Date());
  const latestByKey = new Map<string, { revision: number; createdAt: string }>();
  for (const row of blockRevisions) {
    const current = latestByKey.get(row.key);
    if (!current || row.revision > current.revision) {
      latestByKey.set(row.key, { revision: row.revision, createdAt: row.createdAt });
    }
  }

  const blockViews: BlockView[] = BLOCK_DEFINITIONS.map((definition) => {
    const latest = latestByKey.get(definition.key);
    const payload = resolved.get(definition.key) ?? definition.defaultPayload;
    /*
     * Une révision FIGE le bloc, comme elle gouverne une règle. Corriger le
     * texte en code après coup ne parvient alors jamais au lecteur, et le
     * libellé n'annonçait qu'un numéro de révision. La comparaison au texte du
     * code coûte une égalité et supprime une panne silencieuse.
     */
    const diverges = latest !== undefined && blockDivergesFromCode(definition.key, payload);
    return {
      key: definition.key,
      label: definition.label,
      payload,
      revisionLabel: latest
        ? matrices.blocks.revised(latest.revision, dateFr(latest.createdAt))
        : matrices.blocks.fromCode,
      divergence: diverges ? matrices.blocks.diverges : null,
    };
  });

  const families = ["VOIE", "VERDICT", "RISK"] as const;

  const heading = {
    fontFamily: fonts.serif,
    fontWeight: 400,
    fontSize: "1.4rem",
    margin: "0 0 8px",
    color: colors.navy900,
  } as const;

  const intro = {
    fontFamily: fonts.sans,
    fontSize: "0.9rem",
    lineHeight: 1.8,
    maxWidth: 720,
    margin: 0,
    color: colors.slate,
  } as const;

  return (
    <div>
      <style>{`
@media (max-width: 760px) {
  .matrix-grid { grid-template-columns: 1fr !important; }
}
`}</style>

      <h1
        style={{
          fontFamily: fonts.serif,
          fontWeight: 300,
          fontSize: "2rem",
          margin: 0,
          color: colors.navy900,
        }}
      >
        {matrices.title}
      </h1>
      <p style={{ ...intro, marginTop: 12 }}>{matrices.intro}</p>

      <section style={{ marginTop: 48 }}>
        <h2 style={heading}>{matrices.rules.title}</h2>
        <p style={intro}>{matrices.rules.intro}</p>
        <div style={{ marginTop: 10 }}>
          {ruleViews.map((rule) => (
            <RuleForm key={rule.id} rule={rule} />
          ))}
        </div>
      </section>

      <section style={{ marginTop: 56 }}>
        <h2 style={heading}>{matrices.blocks.title}</h2>
        <p style={intro}>{matrices.blocks.intro}</p>

        {families.map((family) => (
          <div key={family} style={{ marginTop: 28 }}>
            <h3
              style={{
                fontFamily: fonts.sans,
                fontSize: "0.7rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: colors.goldText,
                margin: "0 0 4px",
              }}
            >
              {matrices.blocks.families[family]}
            </h3>
            {blockViews
              .filter((block) => block.key.startsWith(`${family}:`))
              .map((block) => (
                <BlockForm key={block.key} block={block} />
              ))}
          </div>
        ))}
      </section>
    </div>
  );
}
