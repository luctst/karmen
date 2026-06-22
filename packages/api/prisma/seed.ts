/**
 * PLACEHOLDER seed script for the Karmen API (Prisma).
 *
 * This file exists so the Docker `migrate` one-shot service is coherent before
 * the real API package lands. The app MUST replace it with a real seed.
 *
 * Wiring (already assumed by docker-compose.yml `migrate` service):
 *   1. db becomes healthy
 *   2. `prisma migrate deploy`  applies committed migrations
 *   3. `prisma db seed`         runs THIS file via the configured seed hook
 *   4. api starts (depends_on migrate: service_completed_successfully)
 *
 * The seed hook must be declared by the app, e.g. in prisma.config.ts:
 *   export default defineConfig({ migrations: { seed: "tsx prisma/seed.ts" } });
 * (or the legacy package.json "prisma": { "seed": "tsx prisma/seed.ts" } key).
 *
 * Make the seed IDEMPOTENT (use upserts / check-before-insert) so it is safe to
 * re-run. `prisma db seed` is NOT triggered automatically by migrate in Prisma
 * v7 — the `migrate` service calls it explicitly.
 *
 * Replace everything below with real PrismaClient logic once the schema exists.
 */

async function main(): Promise<void> {
  // Example shape (uncomment once @prisma/client + schema exist):
  //
  //   import { PrismaClient } from "@prisma/client";
  //   const prisma = new PrismaClient();
  //   await prisma.user.upsert({
  //     where: { email: "demo@karmen.local" },
  //     update: {},
  //     create: { email: "demo@karmen.local", name: "Demo" },
  //   });
  //   await prisma.$disconnect();

  // eslint-disable-next-line no-console
  console.log("[seed] placeholder seed ran — replace prisma/seed.ts with real data");
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[seed] failed:", err);
  process.exit(1);
});
