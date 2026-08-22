import { expect, type Page, test } from "@playwright/test";

async function signInAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("password1234");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/auth\/home$/);
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
  await expect(
    page.getByText(/^Version:\s+\d+\.\d+\.\d+\.\d+$/),
  ).toBeVisible();
  await expect(page.getByText(/Sleeping Bear Systems/)).toBeVisible();
});

test("GET /images/sleeping_bear_logo.svg returns svg asset", async ({
  request,
}) => {
  const response = await request.get("/images/sleeping_bear_logo.svg");

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/svg+xml");
});
