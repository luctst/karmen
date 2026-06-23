import { describe, it, expect } from "vitest"

import { scoreDisplay } from "./score"
import { makeScore } from "../../test/fixtures"

describe("scoreDisplay — A–E band boundaries", () => {
  const cases: Array<[number, string]> = [
    [100, "A"],
    [80, "A"],
    [79, "B"],
    [65, "B"],
    [64, "C"],
    [50, "C"],
    [49, "D"],
    [35, "D"],
    [34, "E"],
    [0, "E"],
  ]

  it.each(cases)("globalScore %i → category %s", (globalScore, category) => {
    const result = scoreDisplay(makeScore(globalScore))
    expect(result.category).toBe(category)
  })

  it("renders the raw score value as a string, not a rounded/derived number", () => {
    const result = scoreDisplay(makeScore(82, "low"))
    expect(result.value).toBe("82")
    expect(result.isUnknown).toBe(false)
  })

  it("maps riskBucket to the authoritative risk phrase", () => {
    expect(scoreDisplay(makeScore(82, "low")).riskPhrase).toBe("Risque faible")
    expect(scoreDisplay(makeScore(60, "medium")).riskPhrase).toBe(
      "Risque modéré"
    )
    expect(scoreDisplay(makeScore(20, "high")).riskPhrase).toBe("Risque élevé")
  })
})

describe("scoreDisplay — null score", () => {
  it('returns the em-dash placeholders, never "0"', () => {
    const result = scoreDisplay(null)
    expect(result).toStrictEqual({
      value: "—",
      category: "—",
      riskPhrase: "",
      isUnknown: true,
    })
  })

  it("never produces a numeric zero for a missing score", () => {
    const result = scoreDisplay(null)
    expect(result.value).not.toBe("0")
    expect(result.category).not.toBe("E")
  })
})
