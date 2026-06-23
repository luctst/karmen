import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"

import { Workspace } from "./Workspace"
import {
  makeAggregate,
  makeAnalyse,
  makeCompleteness,
  makeConnectionSource,
  makeFinancingRequest,
  makeHiddenAccount,
  makeIndicator,
  makeScore,
  makeScoreCheckItem,
  makeScoreDetail,
  makeScoreFactor,
} from "../../test/fixtures"
import type { DossierAggregate } from "../../api/types"

const useDossierMock = vi.fn()
const decideMock = vi.fn()
const useDecisionMock = vi.fn(() => ({
  decide: decideMock,
  isPending: false,
  error: null,
}))
vi.mock("../../api/hooks", () => ({
  useDossier: () => useDossierMock(),
  useDecision: () => useDecisionMock(),
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
        <Route path="/" element={<div>File d'attente — accueil</div>} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  useDossierMock.mockReset()
  decideMock.mockReset()
  decideMock.mockResolvedValue(makeAggregate())
  useDecisionMock.mockReset()
  useDecisionMock.mockReturnValue({
    decide: decideMock,
    isPending: false,
    error: null,
  })
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
        score: makeScoreDetail({ id: "s-1", ...makeScore(82, "low") }),
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
      data: makeAggregate({
        score: makeScoreDetail({ id: "s-1", ...makeScore(82, "low") }),
      }),
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

function sidebar() {
  return screen.getByRole("navigation", { name: "Sections du dossier" })
}

async function gotoSection(label: string | RegExp) {
  await userEvent.click(within(sidebar()).getByRole("button", { name: label }))
}

describe("Workspace — section navigation", () => {
  it("switches the main content when a sidebar section is selected", async () => {
    setDossierState({ data: makeAggregate() })
    renderWorkspace()

    expect(
      screen.getByRole("region", { name: "Aperçu du dossier" })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("region", { name: "Score" })
    ).not.toBeInTheDocument()

    await gotoSection(/Score/)

    expect(
      screen.getByRole("region", { name: "Score" })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("region", { name: "Aperçu du dossier" })
    ).not.toBeInTheDocument()
  })

  it("marks the active section with aria-current", async () => {
    setDossierState({ data: makeAggregate() })
    renderWorkspace()

    await gotoSection(/Complétude/)

    expect(
      within(sidebar()).getByRole("button", { name: /Complétude/ })
    ).toHaveAttribute("aria-current", "page")
  })
})

describe("Workspace — Complétude section", () => {
  function showCompleteness() {
    return gotoSection(/Complétude/)
  }

  it("renders the completeness gate, sources and hidden account", async () => {
    setDossierState({
      data: makeAggregate({
        completeness: makeCompleteness({
          gateStatus: "action_requise",
          sources: [
            makeConnectionSource({
              id: "src-1",
              label: "Banque Crédit Agricole",
              state: "connected",
            }),
            makeConnectionSource({
              id: "src-2",
              label: "DGFiP — liasse fiscale",
              state: "pending",
            }),
          ],
          hiddenAccounts: [
            makeHiddenAccount({
              id: "ha-1",
              pattern: "Compte non déclaré détecté",
              ibanMasked: "FR76 **** **** 9001",
            }),
          ],
        }),
      }),
    })
    renderWorkspace()
    await showCompleteness()

    const region = screen.getByRole("region", { name: "Complétude" })
    expect(
      within(region).getByText("Incomplet — action requise")
    ).toBeInTheDocument()
    expect(
      within(region).getByText("Banque Crédit Agricole")
    ).toBeInTheDocument()
    expect(
      within(region).getByText("DGFiP — liasse fiscale")
    ).toBeInTheDocument()
    expect(
      within(region).getByText("Compte non déclaré détecté")
    ).toBeInTheDocument()
    expect(
      within(region).getByText("FR76 **** **** 9001")
    ).toBeInTheDocument()
  })

  it("omits the hidden account block when none are detected", async () => {
    setDossierState({
      data: makeAggregate({
        completeness: makeCompleteness({ hiddenAccounts: [] }),
      }),
    })
    renderWorkspace()
    await showCompleteness()

    expect(
      screen.queryByText("Détection compte caché")
    ).not.toBeInTheDocument()
  })

  it("shows the empty state when completeness is missing", async () => {
    setDossierState({ data: makeAggregate({ completeness: null }) })
    renderWorkspace()
    await showCompleteness()

    expect(
      screen.getByText("Complétude indisponible.")
    ).toBeInTheDocument()
  })
})

describe("Workspace — Score section", () => {
  function showScore() {
    return gotoSection(/Score/)
  }

  it("renders the score, confidence, reason, factors, check items and calibration", async () => {
    setDossierState({
      data: makeAggregate({
        score: makeScoreDetail({
          id: "s-1",
          ...makeScore(74, "medium"),
          confidence: "medium",
          confidenceReason: "Un trimestre de relevés manquant.",
          calibrationNote: "Calibré sur le secteur boulangerie.",
          factors: [
            makeScoreFactor({
              id: "f-1",
              label: "Trésorerie en hausse",
              direction: "up",
              weight: 80,
            }),
            makeScoreFactor({
              id: "f-2",
              label: "Endettement élevé",
              direction: "down",
              weight: 40,
            }),
          ],
          checkItems: [
            makeScoreCheckItem({ id: "ci-1", label: "Vérifier le bail commercial" }),
          ],
        }),
      }),
    })
    renderWorkspace()
    await showScore()

    const region = screen.getByRole("region", { name: "Score" })
    expect(within(region).getByText("74")).toBeInTheDocument()
    expect(within(region).getByText("B — Risque modéré")).toBeInTheDocument()
    expect(within(region).getByText("Confiance modérée")).toBeInTheDocument()
    expect(
      within(region).getByText(/Un trimestre de relevés manquant\./)
    ).toBeInTheDocument()
    expect(within(region).getByText("Trésorerie en hausse")).toBeInTheDocument()
    expect(within(region).getByText("Endettement élevé")).toBeInTheDocument()
    expect(
      within(region).getByText("Vérifier le bail commercial")
    ).toBeInTheDocument()
    expect(
      within(region).getByText("Calibré sur le secteur boulangerie.")
    ).toBeInTheDocument()
  })

  it("shows the empty state when score is missing", async () => {
    setDossierState({ data: makeAggregate({ score: null }) })
    renderWorkspace()
    await showScore()

    expect(
      screen.getByText("Score indisponible — données insuffisantes.")
    ).toBeInTheDocument()
  })
})

describe("Workspace — Analyse section", () => {
  function showAnalyse() {
    return gotoSection(/Analyse financière/)
  }

  it("renders the pre-assessment and anomaly cards with mitigants", async () => {
    setDossierState({
      data: makeAggregate({
        analyse: makeAnalyse({
          preAssessment: "Risque de liquidité à surveiller.",
          indicators: [
            makeIndicator({
              id: "a-1",
              label: "Ratio de liquidité",
              status: "blocking",
              value: "0,6",
              threshold: "1,0",
              mitigants: [
                { id: "m-1", text: "Ligne de crédit non utilisée disponible." },
              ],
            }),
            makeIndicator({ id: "c-1", label: "Marge brute", status: "conforme" }),
          ],
        }),
      }),
    })
    renderWorkspace()
    await showAnalyse()

    const region = screen.getByRole("region", { name: "Analyse financière" })
    expect(
      within(region).getByText("Risque de liquidité à surveiller.")
    ).toBeInTheDocument()

    const anomaly = within(region)
      .getByRole("heading", { name: "Ratio de liquidité" })
      .closest("article") as HTMLElement
    expect(
      within(anomaly).getByText(
        "Ligne de crédit non utilisée disponible."
      )
    ).toBeInTheDocument()
  })

  it("hides conforming indicators from the anomaly list but counts them in the expander", async () => {
    setDossierState({
      data: makeAggregate({
        analyse: makeAnalyse({
          indicators: [
            makeIndicator({
              id: "a-1",
              label: "Ratio de liquidité",
              status: "notable",
            }),
            makeIndicator({ id: "c-1", label: "Marge brute", status: "conforme" }),
            makeIndicator({
              id: "c-2",
              label: "Rotation des stocks",
              status: "conforme",
            }),
          ],
        }),
      }),
    })
    renderWorkspace()
    await showAnalyse()

    const region = screen.getByRole("region", { name: "Analyse financière" })
    expect(within(region).getByText("Anomalies (1)")).toBeInTheDocument()

    expect(
      within(region).getByRole("heading", { name: "Ratio de liquidité" })
    ).toBeInTheDocument()
    expect(
      within(region).queryByRole("heading", { name: "Marge brute" })
    ).not.toBeInTheDocument()
    expect(
      within(region).queryByRole("heading", { name: "Rotation des stocks" })
    ).not.toBeInTheDocument()

    const summary = within(region).getByText("2 indicateurs conformes")
    const details = summary.closest("details") as HTMLElement

    expect(within(details).getByText("Marge brute")).toBeInTheDocument()
    expect(within(details).getByText("Rotation des stocks")).toBeInTheDocument()
  })

  it("shows the all-clear message when there are no anomalies", async () => {
    setDossierState({
      data: makeAggregate({
        analyse: makeAnalyse({
          indicators: [
            makeIndicator({ id: "c-1", status: "conforme" }),
            makeIndicator({ id: "c-2", status: "conforme" }),
          ],
        }),
      }),
    })
    renderWorkspace()
    await showAnalyse()

    const region = screen.getByRole("region", { name: "Analyse financière" })
    expect(within(region).getByText("Anomalies (0)")).toBeInTheDocument()
    expect(
      within(region).getByText(/Aucune anomalie\. 2 indicateurs conformes\./)
    ).toBeInTheDocument()
  })
})

describe("Workspace — decision action", () => {
  it("posts the decision and navigates back to the queue on success", async () => {
    setDossierState({ data: makeAggregate() })
    renderWorkspace()

    await userEvent.click(screen.getByRole("button", { name: "Valider" }))

    expect(decideMock).toHaveBeenCalledTimes(1)
    expect(decideMock).toHaveBeenCalledWith({ decision: "approve" })

    expect(
      await screen.findByText("File d'attente — accueil")
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("region", { name: "Aperçu du dossier" })
    ).not.toBeInTheDocument()
  })

  it("posts a reject decision with the matching body", async () => {
    setDossierState({ data: makeAggregate() })
    renderWorkspace()

    await userEvent.click(screen.getByRole("button", { name: "Refuser" }))

    expect(decideMock).toHaveBeenCalledWith({ decision: "reject" })
  })

  it("stays on the workspace when the decision fails", async () => {
    decideMock.mockRejectedValueOnce(new Error("boom"))
    setDossierState({ data: makeAggregate() })
    renderWorkspace()

    await userEvent.click(screen.getByRole("button", { name: "Valider" }))

    expect(decideMock).toHaveBeenCalledWith({ decision: "approve" })
    expect(
      screen.getByRole("region", { name: "Aperçu du dossier" })
    ).toBeInTheDocument()
  })
})
