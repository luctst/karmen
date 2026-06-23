import type { DossierScore } from "../../api/types"

/**
 * Score → A–E category + risk phrase derivation.
 *
 * The API gives a 0–100 `globalScore` and a `riskBucket`. We render the
 * category WORD as the bearer of meaning (P2 / a11y): color reinforces, the
 * word decides.
 *
 * Category band (globalScore):  A >=80 · B 65–79 · C 50–64 · D 35–49 · E <35
 * Risk phrase comes from the API's riskBucket (the authoritative signal),
 * falling back to the band when no bucket is present.
 */

export type ScoreDisplay = {
  /** e.g. "82" — already a string, mono tabular-nums at the call site. */
  value: string
  /** e.g. "A" */
  category: string
  /** e.g. "Risque faible" */
  riskPhrase: string
  /** True when there is no score → render "— / —" muted, never "0". */
  isUnknown: boolean
}

function categoryFor(globalScore: number): string {
  if (globalScore >= 80) return "A"
  if (globalScore >= 65) return "B"
  if (globalScore >= 50) return "C"
  if (globalScore >= 35) return "D"
  return "E"
}

const RISK_PHRASE: Record<DossierScore["riskBucket"], string> = {
  low: "Risque faible",
  medium: "Risque modéré",
  high: "Risque élevé",
}

export function scoreDisplay(score: DossierScore | null): ScoreDisplay {
  if (!score) {
    return {
      value: "—",
      category: "—",
      riskPhrase: "",
      isUnknown: true,
    }
  }

  return {
    value: String(score.globalScore),
    category: categoryFor(score.globalScore),
    riskPhrase: RISK_PHRASE[score.riskBucket],
    isUnknown: false,
  }
}
