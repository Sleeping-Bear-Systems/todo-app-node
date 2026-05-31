import { expect, test } from "@playwright/test";

function expectSecureHeaders(headers: Record<string, string>) {
  expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
  expect(headers["cross-origin-resource-policy"]).toBe("same-origin");
  expect(headers["origin-agent-cluster"]).toBe("?1");
  expect(headers["referrer-policy"]).toBe("no-referrer");
  expect(headers["strict-transport-security"]).toContain("max-age=");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-dns-prefetch-control"]).toBe("off");
  expect(headers["x-download-options"]).toBe("noopen");
  expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
  expect(headers["x-permitted-cross-domain-policies"]).toBe("none");
  expect(headers["x-xss-protection"]).toBe("0");
}

test("GET /about includes secure headers", async ({ request }) => {
  const response = await request.get("/about");

  expect(response.status()).toBe(200);
  expectSecureHeaders(response.headers());
});

test("GET /api/ping includes secure headers", async ({ request }) => {
  const response = await request.get("/api/ping");

  expect(response.status()).toBe(200);
  expectSecureHeaders(response.headers());
});
