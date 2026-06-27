import { expect, type Page, test } from "@playwright/test";

async function signInAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("password1234");
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("GET /auth/home redirects unauthenticated users to /login", async ({
  page,
}) => {
  await page.goto("/auth/home");

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Login" }),
  ).toBeVisible();
});

test("Authenticated user can view the home page", async ({ page }) => {
  await signInAsAdmin(page);

  await expect(page).toHaveURL(/\/auth\/home$/);
  await expect(page).toHaveTitle("Home");
  await expect(
    page.getByRole("heading", { level: 1, name: "Home" }),
  ).toBeVisible();
  await expect(page.locator("#home-calendar")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
});

test("User can sign out from home page", async ({ page }) => {
  await signInAsAdmin(page);
  await page.getByRole("button", { name: "Sign out" }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Login" }),
  ).toBeVisible();

  await page.goto("/auth/home");
  await expect(page).toHaveURL(/\/login$/);
});
