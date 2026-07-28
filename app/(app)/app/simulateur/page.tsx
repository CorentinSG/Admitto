import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { colors, fonts } from "@/design/tokens";
import { ACCESS_COOKIE, verifyAccessToken } from "@/lib/access/session";
import { scenarioStore } from "@/lib/store/scenarios";
import { simulator } from "@/content/simulator";
import { Simulator } from "./Simulator";

export const metadata: Metadata = {
  title: "Simulateur de coût — Admitto",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Simulateur de coût (CDC §26). */
export default async function SimulatorPage() {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  const assessmentId = await verifyAccessToken(token, new Date());
  if (!assessmentId) redirect("/diagnostic");

  const saved = await scenarioStore.list(assessmentId);

  return (
    <div>
      <h1
        style={{
          fontFamily: fonts.serif,
          fontWeight: 300,
          fontSize: "2.1rem",
          margin: 0,
          color: colors.navy900,
        }}
      >
        {simulator.title}
      </h1>
      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.92rem",
          lineHeight: 1.75,
          maxWidth: 680,
          margin: "14px 0 0",
          color: colors.slate,
        }}
      >
        {simulator.intro}
      </p>

      <Simulator saved={saved} />
    </div>
  );
}
