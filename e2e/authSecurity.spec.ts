import { expect, test } from "@playwright/test";

test("POST /api/login rejects cross-origin unsafe requests", async ({
  request,
}) => {
  const response = await request.fetch("/api/login", {
    method: "POST",
    form: {
      username: "admin",
      password: "password1234",
    },
    headers: {
      origin: "https://evil.example",
    },
    maxRedirects: 0,
  });

  expect(response.status()).toBe(403);
  await expect(response.text()).resolves.toContain("Forbidden");
});

test("POST /api/logout rejects cross-origin unsafe requests", async ({
  request,
}) => {
  const response = await request.fetch("/api/logout", {
    method: "POST",
    headers: {
      origin: "https://evil.example",
    },
    maxRedirects: 0,
  });

  expect(response.status()).toBe(403);
  await expect(response.text()).resolves.toContain("Forbidden");
});
