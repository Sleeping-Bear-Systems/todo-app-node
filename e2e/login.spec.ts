import { expect, test } from "@playwright/test";

test("GET /login renders the login form", async ({ page }) => {
  await page.goto("/login");

  await expect(page).toHaveTitle("Login");
  await expect(
    page.getByRole("heading", { level: 1, name: "Login" }),
  ).toBeVisible();

  await expect(page.getByLabel("Username")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
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

test("Login error page link returns to login page", async ({ page }) => {
  await page.goto("/login-error");

  await expect(page.getByText("Invalid credentials.")).toBeVisible();
  await page.getByRole("link", { name: "Back to Login" }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Login" }),
  ).toBeVisible();
});
