import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"

import { QueueRow } from "./QueueRow"
import { makeDossier, makeScore } from "../../test/fixtures"

function renderRow(dossier = makeDossier()) {
  return render(
    <MemoryRouter>
      <QueueRow dossier={dossier} />
    </MemoryRouter>
  )
}

describe("QueueRow", () => {
  it("renders the company name", () => {
    renderRow(makeDossier({ company: { name: "Boulangerie Martin" } as never }))
    expect(screen.getByText("Boulangerie Martin")).toBeInTheDocument()
  })

  it('shows "— / —" for a dossier with no score (never a fabricated 0)', () => {
    renderRow(makeDossier({ score: null }))
    expect(screen.getByText("— / —")).toBeInTheDocument()
    expect(screen.queryByText(/0 \//)).not.toBeInTheDocument()
  })

  it('renders "NN / X" for a scored dossier', () => {
    renderRow(makeDossier({ score: makeScore(82, "low") }))
    expect(screen.getByText(/82 \/ A/)).toBeInTheDocument()
    // Screen readers get a full sentence, not "82 slash A".
    expect(
      screen.getByText("Score 82 sur 100, catégorie A, Risque faible")
    ).toBeInTheDocument()
  })

  it("links the whole row to /dossiers/:id", () => {
    renderRow(makeDossier({ id: "abc-123" }))
    const link = screen.getByRole("listitem")
    expect(link.tagName).toBe("A")
    expect(link).toHaveAttribute("href", "/dossiers/abc-123")
  })

  it("sets a title attribute on the name for the truncation tooltip", () => {
    const longName =
      "Compagnie Générale des Établissements Réunis du Grand Sud-Ouest SAS"
    renderRow(makeDossier({ company: { name: longName } as never }))
    expect(screen.getByText(longName)).toHaveAttribute("title", longName)
  })

  it("renders the StatusBadge verdict for the dossier (a11y label present)", () => {
    renderRow(
      makeDossier({ status: "pending_review", score: makeScore(20, "high") })
    )
    expect(
      screen.getByLabelText("Anomalie bloquante : risque élevé")
    ).toBeInTheDocument()
  })
})
