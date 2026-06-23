import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router-dom"

import "@karmen/ui/globals.css"
import "./styles/globals.css"

import { router } from "./router"

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("Root element #root introuvable.")
}

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
