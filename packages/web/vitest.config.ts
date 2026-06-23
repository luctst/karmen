import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

// Vitest config kept separate from vite.config.ts so the app build does not
// pull in the test-only jsdom/globals setup. The react plugin transforms both
// web sources and the @karmen/ui .tsx components imported across the workspace.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    css: false,
  },
})
