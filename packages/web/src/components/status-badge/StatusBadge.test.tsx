import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"

import { StatusBadge } from "@karmen/ui/components/status-badge"

/**
 * StatusBadge contract (DESIGN.md §5/§7): color-is-never-alone. Every badge
 * must carry a visible text label and an aria-label that includes context, so
 * a screen reader (and a colorblind user) gets the full verdict without color.
 */
describe("StatusBadge", () => {
  it("renders the default label text for the clean family", () => {
    render(<StatusBadge status="clean" />)
    expect(screen.getByText("Propre")).toBeInTheDocument()
  })

  it("renders a visible text label, not just a colored chip (block family)", () => {
    render(<StatusBadge status="anomaly_blocking" label="Risque élevé" />)
    // The meaning is carried by readable text, asserted by content.
    expect(screen.getByText("Risque élevé")).toBeInTheDocument()
  })

  it("renders the neutral/waiting family with its label", () => {
    render(<StatusBadge status="incomplete_waiting" />)
    expect(screen.getByText("Incomplet — en attente client")).toBeInTheDocument()
  })

  it("composes aria-label from the canonical status label + context", () => {
    render(
      <StatusBadge
        status="anomaly_blocking"
        label="Risque élevé"
        context="risque élevé"
      />
    )
    // aria-label uses the §7 canonical label, not the visible override.
    const badge = screen.getByLabelText("Anomalie bloquante : risque élevé")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute("data-status", "anomaly_blocking")
  })

  it("falls back to the visible label as aria-label when no context is given", () => {
    render(<StatusBadge status="clean" label="Validé" />)
    expect(screen.getByLabelText("Validé")).toBeInTheDocument()
  })

  it("renders an icon alongside the text (icon hidden from a11y tree)", () => {
    const { container } = render(<StatusBadge status="pending" />)
    const svg = container.querySelector("svg")
    expect(svg).not.toBeNull()
    expect(svg).toHaveAttribute("aria-hidden", "true")
    // Text is still present — color/icon are reinforcement, not the carrier.
    expect(screen.getByText("En attente")).toBeInTheDocument()
  })
})
