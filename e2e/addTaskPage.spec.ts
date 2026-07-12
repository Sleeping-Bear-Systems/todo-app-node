import { expect, type Page, test } from "@playwright/test";

async function signInAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("password1234");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/auth\/home$/);
}

test("GET /auth/add-task redirects unauthenticated users to /login", async ({
  page,
}) => {
  await page.goto("/auth/add-task");

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Login" }),
  ).toBeVisible();
});

test("Authenticated user can view the add-task form", async ({ page }) => {
  await signInAsAdmin(page);
  await page.goto("/auth/add-task");

  await expect(page).toHaveURL(/\/auth\/add-task$/);
  await expect(page).toHaveTitle("Add Task");
  await expect(
    page.getByRole("heading", { level: 1, name: "Add Task" }),
  ).toBeVisible();
  await expect(page.getByLabel("Title")).toBeVisible();
  await expect(page.getByLabel("Description")).toBeVisible();
  await expect(page.getByRole("button", { name: "Add" })).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
});

test("Authenticated user can submit add-task form", async ({ page }) => {
  await signInAsAdmin(page);
  await page.goto("/auth/add-task");

  await page.getByLabel("Title").fill("Buy milk");
  await page.getByLabel("Description").fill("2 liters");

  const [response] = await Promise.all([
    page.waitForResponse(
      (candidate) =>
        candidate.url().endsWith("/api/auth/add-task") &&
        candidate.request().method() === "POST",
    ),
    page.getByRole("button", { name: "Add" }).click(),
  ]);

  expect(response.status()).toBe(200);
  await expect(page.locator("#errors")).toBeEmpty();
});
