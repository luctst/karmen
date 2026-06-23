import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"

import { Workspace } from "./Workspace"
import { makeAggregate, makeFinancingRequest, makeScore } from "../../test/fixtures"
import type { DossierAggregate } from "../../api/types"

const useDossierMock = vi.fn()
vi.mock("../../api/hooks", () => ({
  useDossier: () => useDossierMock(),
}))

type DossierState = {
  data: DossierAggregate | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

function setDossierState(partial: Partial<DossierState>) {
  useDossierMock.mockReturnValue({
    data: null,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    ...partial,
  })
}

function renderWorkspace() {
  return render(
    <MemoryRouter initialEntries={["/dossiers/d-1"]}>
      <Routes>
        <Route path="/dossiers/:id" element={<Workspace />} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  useDossierMock.mockReset()
})

describe("Workspace — loading state", () => {
  it("renders the skeleton with aria-busy while loading", () => {
    setDossierState({ isLoading: true })
    renderWorkspace()
    expect(screen.getByLabelText("Chargement du dossier")).toHaveAttribute(
      "aria-busy",
      "true"
    )
  })
})

describe("Workspace — error state", () => {
  it("renders the ErrorBanner and retries via the refetch callback", async () => {
    const refetch = vi.fn()
    setDossierState({ error: new Error("boom"), refetch })
    renderWorkspace()

    const alert = screen.getByRole("alert")
    expect(
      within(alert).getByText("Impossible de charger le dossier.")
    ).toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: "Réessayer" }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })
})

describe("Workspace — header", () => {
  it("shows the company name, SIREN, verdict badge and score", () => {
    setDossierState({
      data: makeAggregate({
        company: {
          id: "c-1",
          name: "Boulangerie Dupont",
          siren: "552100554",
          businessType: "Conseil",
          legalCategory: "SAS",
          codeNaf: "62.01Z",
          creationDate: "2018-03-15",
          address: "12 rue de la Paix",
          countryCode: "FR",
          postalCode: "75002",
          owner: "Jeanne Martin",
        },
        financingRequest: makeFinancingRequest({ fundUsage: null }),
        score: { id: "s-1", ...makeScore(82, "low") },
      }),
    })
    renderWorkspace()

    const banner = screen.getByRole("banner")
    expect(
      within(banner).getByRole("heading", { name: "Boulangerie Dupont" })
    ).toBeInTheDocument()
    expect(within(banner).getByText("552100554")).toBeInTheDocument()
    expect(
      within(banner).getByLabelText("Propre : risque faible")
    ).toBeInTheDocument()
    expect(within(banner).getByText("82 / A")).toBeInTheDocument()
  })

  it("links back to the queue at /", () => {
    setDossierState({ data: makeAggregate() })
    renderWorkspace()
    expect(
      screen.getByRole("link", { name: /File d'attente/ })
    ).toHaveAttribute("href", "/")
  })
})

describe("Workspace — Aperçu overview", () => {
  it("renders société facts from the company", () => {
    setDossierState({
      data: makeAggregate({
        company: {
          id: "c-1",
          name: "Boulangerie Dupont",
          siren: "552100554",
          businessType: "Boulangerie",
          legalCategory: "SARL",
          codeNaf: "10.71C",
          creationDate: "2018-03-15",
          address: "12 rue de la Paix",
          countryCode: "FR",
          postalCode: "75002",
          owner: "Jeanne Martin",
        },
      }),
    })
    renderWorkspace()

    const company = companyCard()
    expect(within(company).getByText("SARL")).toBeInTheDocument()
    expect(within(company).getByText("10.71C")).toBeInTheDocument()
    expect(within(company).getByText("Jeanne Martin")).toBeInTheDocument()
    expect(within(company).getByText("Boulangerie")).toBeInTheDocument()
  })

  it("renders the financing request amount, duration and rate", () => {
    setDossierState({
      data: makeAggregate({
        financingRequest: {
          id: "fr-1",
          type: "loan",
          status: "pending_review",
          fundUsage: "Trésorerie",
          rejectedReason: null,
          amount: 50000,
          durationInMonth: 24,
          interestRate: 4.5,
        },
      }),
    })
    renderWorkspace()

    const financing = overviewCard("Demande de financement")
    expect(within(financing).getByText("Prêt")).toBeInTheDocument()
    expect(within(financing).getByText(/50\s?000/)).toBeInTheDocument()
    expect(within(financing).getByText("24 mois")).toBeInTheDocument()
    expect(within(financing).getByText("4,5 %")).toBeInTheDocument()
  })

  it("renders the documents list", () => {
    setDossierState({
      data: makeAggregate({
        documents: [
          {
            id: "doc-1",
            name: "liasse-2023.pdf",
            type: "liasse_fiscale",
            metadata: { year: 2023 },
          },
          {
            id: "doc-2",
            name: "releve-q1.pdf",
            type: "releve_bancaire",
            metadata: null,
          },
        ],
      }),
    })
    renderWorkspace()

    const docs = overviewCard("Pièces justificatives")
    expect(within(docs).getByText("liasse-2023.pdf")).toBeInTheDocument()
    expect(within(docs).getByText("releve-q1.pdf")).toBeInTheDocument()
    expect(within(docs).getAllByRole("listitem")).toHaveLength(2)
  })

  it("renders the score with band and risk phrase", () => {
    setDossierState({
      data: makeAggregate({ score: { id: "s-1", ...makeScore(82, "low") } }),
    })
    renderWorkspace()

    const scoreCard = overviewCard("Score")
    expect(within(scoreCard).getByText("82")).toBeInTheDocument()
    expect(
      within(scoreCard).getByText("A — Risque faible")
    ).toBeInTheDocument()
  })

  it("hides société rows whose value is null", () => {
    setDossierState({
      data: makeAggregate({
        company: {
          id: "c-1",
          name: "Société Sans Détails",
          siren: "552100554",
          businessType: null,
          legalCategory: null,
          codeNaf: null,
          creationDate: null,
          address: null,
          countryCode: null,
          postalCode: null,
          owner: null,
        },
      }),
    })
    renderWorkspace()

    const company = companyCard()
    expect(within(company).getByText("SIREN")).toBeInTheDocument()
    expect(within(company).queryByText("Forme juridique")).not.toBeInTheDocument()
    expect(within(company).queryByText("Code NAF")).not.toBeInTheDocument()
    expect(within(company).queryByText("Dirigeant")).not.toBeInTheDocument()
    expect(within(company).queryByText("Secteur")).not.toBeInTheDocument()
  })
})

function overview() {
  return screen.getByRole("region", { name: "Aperçu du dossier" })
}

function overviewCard(title: string) {
  return within(overview())
    .getByText(title)
    .closest("[data-slot='card']") as HTMLElement
}

function companyCard() {
  return overviewCard("Société")
}
