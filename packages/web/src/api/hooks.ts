import { useCallback, useEffect, useState } from "react"

import { apiGet, apiPost } from "./client"
import type {
  DecisionPayload,
  DossierAggregate,
  DossierSummary,
} from "./types"

type AsyncState<T> = {
  data: T | null
  isLoading: boolean
  error: Error | null
}

export function useQueue() {
  const [state, setState] = useState<AsyncState<DossierSummary[]>>({
    data: null,
    isLoading: true,
    error: null,
  })
  const [reloadToken, setReloadToken] = useState(0)

  const refetch = useCallback(() => setReloadToken((token) => token + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    apiGet<DossierSummary[]>("/dossiers", { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return
        setState({ data, isLoading: false, error: null })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({
          data: null,
          isLoading: false,
          error:
            error instanceof Error
              ? error
              : new Error("Erreur inconnue lors du chargement."),
        })
      })

    return () => controller.abort()
  }, [reloadToken])

  return { ...state, refetch }
}

export function useDossier(id: string | undefined) {
  const [state, setState] = useState<AsyncState<DossierAggregate>>({
    data: null,
    isLoading: true,
    error: null,
  })
  const [reloadToken, setReloadToken] = useState(0)

  const refetch = useCallback(() => setReloadToken((token) => token + 1), [])

  useEffect(() => {
    if (!id) {
      setState({
        data: null,
        isLoading: false,
        error: new Error("Identifiant de dossier manquant."),
      })
      return
    }

    const controller = new AbortController()
    setState({ data: null, isLoading: true, error: null })

    apiGet<DossierAggregate>(`/dossiers/${id}`, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return
        setState({ data, isLoading: false, error: null })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({
          data: null,
          isLoading: false,
          error:
            error instanceof Error
              ? error
              : new Error("Erreur inconnue lors du chargement."),
        })
      })

    return () => controller.abort()
  }, [id, reloadToken])

  return { ...state, refetch }
}

export function useDecision(id: string | undefined) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const decide = useCallback(
    async (payload: DecisionPayload) => {
      if (!id) throw new Error("Identifiant de dossier manquant.")

      setIsPending(true)
      setError(null)

      try {
        return await apiPost<DossierAggregate>(
          `/dossiers/${id}/decision`,
          payload
        )
      } catch (err: unknown) {
        const normalized =
          err instanceof Error
            ? err
            : new Error("Erreur inconnue lors de la décision.")
        setError(normalized)
        throw normalized
      } finally {
        setIsPending(false)
      }
    },
    [id]
  )

  return { decide, isPending, error }
}
