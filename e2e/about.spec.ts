import { expect, type Page, test } from "@playwright/test";

async function signInAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("password1234");
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("GET /auth/about redirects unauthenticated users to /login", async ({
  page,
}) => {
  await page.goto("/auth/about");

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Login" }),
  ).toBeVisible();
});

test("Authenticated user can view the about page", async ({ page }) => {
  await signInAsAdmin(page);
  await page.goto("/auth/about");

  await expect(page).toHaveURL(/\/auth\/about$/);
  await expect(page).toHaveTitle("About");
  await expect(
    page.getByRole("heading", { level: 1, name: "About" }),
  ).toBeVisible();
  await expect(page.getByText(/Sleeping Bear Systems/)).toBeVisible();
});
