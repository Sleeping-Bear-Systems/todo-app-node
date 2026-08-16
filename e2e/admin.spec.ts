import { expect, type Page, test } from "@playwright/test";

async function signInAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("password1234");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/auth\/home$/);
}

async function signInAsStandardUser(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Username").fill("john-doe");
  await page.getByLabel("Password").fill("password1357");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/auth\/home$/);
}

test("GET /auth/admin redirects unauthenticated users to /login", async ({
  page,
}) => {
  await page.goto("/auth/admin");

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Login" }),
  ).toBeVisible();
});

test("Authenticated admin can view the admin page", async ({ page }) => {
  await signInAsAdmin(page);
  await page.goto("/auth/admin");

  await expect(page).toHaveURL(/\/auth\/admin$/);
  await expect(page).toHaveTitle("Admin");
  await expect(
    page.getByRole("heading", { level: 1, name: "Admin" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Rebuild Projections" }),
  ).toBeVisible();
});

test("Admin page hides Admin link and can navigate to Home", async ({
  page,
}) => {
  await signInAsAdmin(page);
  await page.goto("/auth/admin");

  const navigationBar = page.getByRole("navigation", {
    name: "Main navigation",
  });

  await expect(navigationBar.getByRole("link", { name: "Admin" })).toHaveCount(
    0,
  );
  await expect(navigationBar.getByRole("link", { name: "Home" })).toBeVisible();

  await navigationBar.getByRole("link", { name: "Home" }).click();

  await expect(page).toHaveURL(/\/auth\/home$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Home" }),
  ).toBeVisible();
});

test("Authenticated standard users are redirected from /auth/admin to /forbidden", async ({
  page,
}) => {
  await signInAsStandardUser(page);

  await page.goto("/auth/admin");

  await expect(page).toHaveURL(/\/forbidden$/);
  await expect(page).toHaveTitle("Forbidden");
  await expect(
    page.getByRole("heading", { level: 1, name: "Forbidden" }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toHaveCount(0);
});
