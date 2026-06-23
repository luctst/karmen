import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"

import { Queue } from "./Queue"
import { makeDossier, makeScore } from "../../test/fixtures"
import type { DossierSummary } from "../../api/types"

// Mock the hook, not fetch: the test is about the loading/empty/error/success
// switch given an async state, not about transport.
const useQueueMock = vi.fn()
vi.mock("../../api/hooks", () => ({
  useQueue: () => useQueueMock(),
}))

type QueueState = {
  data: DossierSummary[] | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

function setQueueState(partial: Partial<QueueState>) {
  useQueueMock.mockReturnValue({
    data: null,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    ...partial,
  })
}

function renderQueue() {
  return render(
    <MemoryRouter>
      <Queue />
    </MemoryRouter>
  )
}

beforeEach(() => {
  useQueueMock.mockReset()
})

describe("Queue — loading state", () => {
  it("renders the skeleton with aria-busy while loading", () => {
    setQueueState({ isLoading: true })
    renderQueue()
    expect(screen.getByLabelText("Chargement de la file")).toHaveAttribute(
      "aria-busy",
      "true"
    )
  })
})

describe("Queue — empty state", () => {
  it('shows the "Tout est traité" EmptyState when the queue is empty', () => {
    setQueueState({ data: [] })
    renderQueue()
    expect(screen.getByText("Aucun dossier en attente.")).toBeInTheDocument()
    expect(screen.getByText("Tout est traité.")).toBeInTheDocument()
  })
})

describe("Queue — error state", () => {
  it("renders the ErrorBanner and retries via the refetch callback", async () => {
    const refetch = vi.fn()
    setQueueState({ error: new Error("boom"), refetch })
    renderQueue()

    const alert = screen.getByRole("alert")
    expect(
      within(alert).getByText("Impossible de charger la file.")
    ).toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: "Réessayer" }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })
})

describe("Queue — success state", () => {
  it("renders grouped rows with correct group headers and counts", () => {
    setQueueState({
      data: [
        makeDossier({ status: "pending_review", score: makeScore(82, "low") }),
        makeDossier({ status: "pending_review", score: makeScore(85, "low") }),
        makeDossier({ status: "blocked" }),
      ],
    })
    renderQueue()

    // Count now renders as a pill (the digit), not inline "(n)".
    const fastClose = screen.getByRole("heading", { name: /Clôtures rapides/ })
    expect(fastClose).toHaveTextContent("2")

    const blocked = screen.getByRole("heading", { name: /Bloqués/ })
    expect(blocked).toHaveTextContent("1")

    // Three rows total across the two groups.
    expect(screen.getAllByRole("listitem")).toHaveLength(3)
  })

  it("does not render headers for empty tiers", () => {
    setQueueState({
      data: [makeDossier({ status: "approved" })],
    })
    renderQueue()

    expect(screen.getByRole("heading", { name: /Décidés/ })).toBeInTheDocument()
    expect(
      screen.queryByRole("heading", { name: /Exceptions/ })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("heading", { name: /Clôtures rapides/ })
    ).not.toBeInTheDocument()
  })

  it("shows the pluralized dossier count in the top bar", () => {
    setQueueState({
      data: [makeDossier({ status: "blocked" }), makeDossier({ status: "approved" })],
    })
    renderQueue()
    // The count number and its descriptor are now separate nodes (the number
    // is emphasized in its own span), so assert each piece.
    expect(screen.getByText("2")).toBeInTheDocument()
    expect(
      screen.getByText(/dossiers · triés par priorité d'action/)
    ).toBeInTheDocument()
  })
})
