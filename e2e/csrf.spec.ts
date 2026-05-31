import { expect, test } from "@playwright/test";

test("GET /api/ping allows cross-origin safe requests", async ({ request }) => {
  const response = await request.get("/api/ping", {
    headers: {
      origin: "https://evil.example",
    },
  });

  expect(response.status()).toBe(200);
});

test("POST /api/ping rejects cross-origin unsafe requests", async ({
  request,
}) => {
  const response = await request.fetch("/api/ping", {
    method: "POST",
    headers: {
      origin: "https://evil.example",
    },
  });

  expect(response.status()).toBe(403);
  await expect(response.text()).resolves.toContain("Forbidden");
});

test("POST /api/ping allows same-origin requests through CSRF", async ({
  request,
}) => {
  const baseURL = test.info().project.use.baseURL;
  expect(typeof baseURL).toBe("string");

  const response = await request.fetch("/api/ping", {
    method: "POST",
    headers: {
      origin: new URL(baseURL as string).origin,
    },
  });

  // The route does not implement POST, so a non-403 response confirms CSRF let it pass.
  expect(response.status()).toBe(404);
});
