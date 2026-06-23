import { useCallback, useEffect, useState } from "react"

import { apiGet } from "./client"
import type { DossierDetail, DossierSummary } from "./types"

type AsyncState<T> = {
  data: T | null
  isLoading: boolean
  error: Error | null
}

// No react-query yet — no mutations to justify it; add it when writes (Valider,
// override) arrive. Aborts in-flight requests on unmount/refetch.
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
  const [state, setState] = useState<AsyncState<DossierDetail>>({
    data: null,
    isLoading: true,
    error: null,
  })

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

    apiGet<DossierDetail>(`/dossiers/${id}`, { signal: controller.signal })
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
  }, [id])

  return state
}
