import { expect, type Page, test } from "@playwright/test";

async function signInAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("password1234");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/auth\/home$/);
}

test("GET /forbidden renders forbidden page for unauthenticated users", async ({
  page,
}) => {
  await page.goto("/forbidden", { waitUntil: "domcontentloaded" });

  await expect(page).toHaveURL(/\/forbidden$/);
  await expect(page).toHaveTitle("Forbidden");
  await expect(
    page.getByRole("heading", { level: 1, name: "Forbidden" }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toHaveCount(0);
});

test("Authenticated users can open /forbidden directly", async ({ page }) => {
  await signInAsAdmin(page);
  await page.goto("/forbidden", { waitUntil: "domcontentloaded" });

  await expect(page).toHaveURL(/\/forbidden$/);
  await expect(page).toHaveTitle("Forbidden");
  await expect(
    page.getByRole("heading", { level: 1, name: "Forbidden" }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toHaveCount(0);
});
