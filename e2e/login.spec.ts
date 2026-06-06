import { expect, test } from "@playwright/test";

function getOriginFromBaseUrl() {
  const baseURL = test.info().project.use.baseURL;
  expect(typeof baseURL).toBe("string");
  return new URL(baseURL as string).origin;
}

test("GET /login renders the login form", async ({ page }) => {
  await page.goto("/login");

  await expect(page).toHaveTitle("Login");
  await expect(
    page.getByRole("heading", { level: 1, name: "Login" }),
  ).toBeVisible();

  await expect(page.getByLabel("Username")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toHaveCount(0);
});

test("POST /api/login with invalid credentials redirects to login error", async ({
  page,
}) => {
  await page.goto("/login");

  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("wrong-pass");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/login-error$/);
  await expect(page.getByText("Invalid credentials.")).toBeVisible();
});

test("POST /api/login rejects username shorter than 3", async ({ request }) => {
  const response = await request.fetch("/api/login", {
    method: "POST",
    form: {
      username: "ab",
      password: "password1234",
    },
    headers: {
      origin: getOriginFromBaseUrl(),
    },
    maxRedirects: 0,
  });

  expect(response.status()).toBe(400);
});

test("POST /api/login rejects password shorter than 8", async ({ request }) => {
  const response = await request.fetch("/api/login", {
    method: "POST",
    form: {
      username: "admin",
      password: "short",
    },
    headers: {
      origin: getOriginFromBaseUrl(),
    },
    maxRedirects: 0,
  });

  expect(response.status()).toBe(400);
});
