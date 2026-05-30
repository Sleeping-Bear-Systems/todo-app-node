import { expect, test } from "@playwright/test";

test("GET /api/ping returns ok", async ({ request }) => {
  const response = await request.get("/api/ping");

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/json");
  await expect(response.json()).resolves.toEqual({ message: "ok" });
});
