import "@testing-library/jest-dom/vitest"

import { afterEach } from "vitest"
import { cleanup } from "@testing-library/react"

// Isolate tests: unmount + reset jsdom between cases.
afterEach(() => {
  cleanup()
})
