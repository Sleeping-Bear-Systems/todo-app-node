# Tests
- For changes to server-rendered `.tsx` pages/components, add Playwright E2E specs under `e2e/` (e.g. `*.spec.ts`).

# Playwright
- For local runs, prefer `npm run playwright:test:non-blocking` for concise output; CI uses `npm run playwright:test`.
