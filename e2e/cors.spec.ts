import { expect, test } from "@playwright/test";

test("GET /api/ping includes CORS allow-origin header", async ({ request }) => {
  const response = await request.get("/api/ping", {
    headers: {
      origin: "https://example.com",
    },
  });

  expect(response.status()).toBe(200);
  expect(response.headers()["access-control-allow-origin"]).toBe("*");
});

test("OPTIONS /api/ping preflight returns CORS headers", async ({
  request,
}) => {
  const response = await request.fetch("/api/ping", {
    method: "OPTIONS",
    headers: {
      origin: "https://example.com",
      "access-control-request-method": "GET",
      "access-control-request-headers": "Content-Type, X-Custom",
    },
  });

  expect(response.status()).toBe(204);
  expect(response.headers()["access-control-allow-origin"]).toBe("*");
  expect(response.headers()["access-control-allow-methods"]).toContain("GET");
  expect(response.headers()["access-control-allow-headers"]).toBe(
    "Content-Type,X-Custom",
  );
  // biome-ignore lint/complexity/useLiteralKeys: noPropertyAccessFromIndexSignature = true
  expect(response.headers()["vary"]).toContain(
    "Access-Control-Request-Headers",
  );
});
