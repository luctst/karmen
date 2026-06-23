import { describe, it, expect } from "vitest"

import { badgeFor, groupQueue, tierFor } from "./grouping"
import { makeDossier, makeScore } from "../../test/fixtures"

describe("tierFor — 6-tier assignment", () => {
  it("pending_review + low risk → fast_close", () => {
    expect(
      tierFor(makeDossier({ status: "pending_review", score: makeScore(82, "low") }))
    ).toBe("fast_close")
  })

  it("pending_review + medium risk → exceptions", () => {
    expect(
      tierFor(
        makeDossier({ status: "pending_review", score: makeScore(55, "medium") })
      )
    ).toBe("exceptions")
  })

  it("pending_review + high risk → exceptions", () => {
    expect(
      tierFor(
        makeDossier({ status: "pending_review", score: makeScore(20, "high") })
      )
    ).toBe("exceptions")
  })

  it("pending_review + no score → exceptions (must not slip into fast_close)", () => {
    expect(
      tierFor(makeDossier({ status: "pending_review", score: null }))
    ).toBe("exceptions")
  })

  it("info_requested → re_eval", () => {
    expect(tierFor(makeDossier({ status: "info_requested" }))).toBe("re_eval")
  })

  it("awaiting_client → awaiting_client", () => {
    expect(tierFor(makeDossier({ status: "awaiting_client" }))).toBe(
      "awaiting_client"
    )
  })

  it("blocked → blocked", () => {
    expect(tierFor(makeDossier({ status: "blocked" }))).toBe("blocked")
  })

  it("approved → decided", () => {
    expect(tierFor(makeDossier({ status: "approved" }))).toBe("decided")
  })

  it("rejected → decided", () => {
    expect(tierFor(makeDossier({ status: "rejected" }))).toBe("decided")
  })
})

describe("groupQueue", () => {
  it("orders groups by actionability, not input order", () => {
    // Provide in deliberately scrambled order; expect the priority ladder out.
    const dossiers = [
      makeDossier({ status: "approved" }), // decided
      makeDossier({ status: "blocked" }), // blocked
      makeDossier({ status: "pending_review", score: makeScore(82, "low") }), // fast_close
      makeDossier({ status: "awaiting_client" }), // awaiting_client
      makeDossier({ status: "info_requested" }), // re_eval
      makeDossier({ status: "pending_review", score: makeScore(20, "high") }), // exceptions
    ]

    const tiers = groupQueue(dossiers).map((g) => g.tier)

    expect(tiers).toStrictEqual([
      "fast_close",
      "exceptions",
      "re_eval",
      "awaiting_client",
      "blocked",
      "decided",
    ])
  })

  it("omits empty tiers entirely", () => {
    const dossiers = [
      makeDossier({ status: "blocked" }),
      makeDossier({ status: "approved" }),
    ]

    const groups = groupQueue(dossiers)

    expect(groups.map((g) => g.tier)).toStrictEqual(["blocked", "decided"])
    expect(groups).toHaveLength(2)
  })

  it("returns no groups for an empty queue", () => {
    expect(groupQueue([])).toStrictEqual([])
  })

  it("collects multiple dossiers into the same tier and carries the label", () => {
    const dossiers = [
      makeDossier({ status: "pending_review", score: makeScore(82, "low") }),
      makeDossier({ status: "pending_review", score: makeScore(85, "low") }),
    ]

    const groups = groupQueue(dossiers)

    expect(groups).toHaveLength(1)
    expect(groups[0].tier).toBe("fast_close")
    expect(groups[0].label).toBe("Clôtures rapides")
    expect(groups[0].dossiers).toHaveLength(2)
  })

  it("preserves within-tier input order", () => {
    const a = makeDossier({
      id: "first",
      status: "pending_review",
      score: makeScore(82, "low"),
    })
    const b = makeDossier({
      id: "second",
      status: "pending_review",
      score: makeScore(90, "low"),
    })

    const [group] = groupQueue([a, b])

    expect(group.dossiers.map((d) => d.id)).toStrictEqual(["first", "second"])
  })
})

describe("badgeFor — status + risk → badge key", () => {
  it("pending_review + low → clean", () => {
    const badge = badgeFor(
      makeDossier({ status: "pending_review", score: makeScore(82, "low") })
    )
    expect(badge.status).toBe("clean")
    expect(badge.label).toBe("Propre")
  })

  it("pending_review + medium → anomaly_notable", () => {
    expect(
      badgeFor(
        makeDossier({ status: "pending_review", score: makeScore(55, "medium") })
      ).status
    ).toBe("anomaly_notable")
  })

  it("pending_review + high → anomaly_blocking", () => {
    expect(
      badgeFor(
        makeDossier({ status: "pending_review", score: makeScore(20, "high") })
      ).status
    ).toBe("anomaly_blocking")
  })

  it("pending_review + no score → incomplete_action", () => {
    const badge = badgeFor(
      makeDossier({ status: "pending_review", score: null })
    )
    expect(badge.status).toBe("incomplete_action")
    expect(badge.label).toBe("Action requise")
  })

  it("awaiting_client → incomplete_waiting", () => {
    expect(badgeFor(makeDossier({ status: "awaiting_client" })).status).toBe(
      "incomplete_waiting"
    )
  })

  it("info_requested → pending", () => {
    expect(badgeFor(makeDossier({ status: "info_requested" })).status).toBe(
      "pending"
    )
  })

  it("blocked → anomaly_blocking with its own label", () => {
    const badge = badgeFor(makeDossier({ status: "blocked" }))
    expect(badge.status).toBe("anomaly_blocking")
    expect(badge.label).toBe("Bloqué")
  })

  it("approved → clean / Validé", () => {
    const badge = badgeFor(makeDossier({ status: "approved" }))
    expect(badge.status).toBe("clean")
    expect(badge.label).toBe("Validé")
  })

  // A rejected dossier is a closed decision, not something needing attention —
  // it wears the calm neutral `decided` key, not amber (§5 signal economy).
  it("rejected → decided / Refusé", () => {
    const badge = badgeFor(makeDossier({ status: "rejected" }))
    expect(badge.status).toBe("decided")
    expect(badge.label).toBe("Refusé")
  })

  it("always supplies a non-empty visible label and a context for a11y", () => {
    const badge = badgeFor(
      makeDossier({ status: "pending_review", score: makeScore(20, "high") })
    )
    expect(badge.label.length).toBeGreaterThan(0)
    expect(badge.context.length).toBeGreaterThan(0)
  })
})
