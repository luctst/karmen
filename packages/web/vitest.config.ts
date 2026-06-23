import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

// Separate from vite.config.ts so the app build stays free of the jsdom/globals
// test setup. react() also transforms the @karmen/ui .tsx imported cross-workspace.
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
