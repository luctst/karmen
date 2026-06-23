/**
 * Tiny typed fetch wrapper around the Karmen API. Reads the API origin from
 * VITE_API_BASE_URL (inlined at build time), falling back to localhost:3000.
 * Throws a useful Error on any non-2xx response.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export async function apiGet<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${path}`
  const response = await fetch(url, {
    ...init,
    headers: { Accept: "application/json", ...init?.headers },
  })

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Requête échouée (${response.status}) sur ${path}.`
    )
  }

  return (await response.json()) as T
}
