/** biome-ignore-all lint/complexity/useLiteralKeys: noPropertyAccessFromIndexSignature = true */

import { expect, test } from "@playwright/test";

test("GET /error renders the error page", async ({ page }) => {
  await page.goto("/error");

  await expect(page).toHaveURL(/\/error$/);
  await expect(page).toHaveTitle("Error");
  await expect(
    page.getByRole("heading", { level: 1, name: "Error" }),
  ).toBeVisible();
});

test("POST /login without a Datastar request redirects to /error", async ({
  request,
}) => {
  const baseURL = test.info().project.use.baseURL;
  expect(typeof baseURL).toBe("string");

  const response = await request.fetch("/login", {
    method: "POST",
    form: {
      username: "admin",
      password: "password1234",
    },
    headers: {
      origin: new URL(baseURL as string).origin,
    },
    maxRedirects: 0,
  });

  expect(response.status()).toBe(303);
  expect(response.headers()["location"]).toBe("/error");
});
