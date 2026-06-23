import type { DossierScore } from "../../api/types"

// Bands (globalScore): A >=80 · B 65–79 · C 50–64 · D 35–49 · E <35.
// Risk phrase comes from the API's riskBucket — the authoritative signal.
export type ScoreDisplay = {
  value: string
  category: string
  riskPhrase: string
  // No score → "— / —" muted, never a fabricated "0".
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
