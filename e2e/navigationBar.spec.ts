import { expect, type Page, test } from "@playwright/test";

async function signInAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("password1234");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/auth\/home$/);
}

test("Authenticated pages render navigation bar with username", async ({
  page,
}) => {
  await signInAsAdmin(page);

  const navigationBar = page.getByRole("navigation", {
    name: "Main navigation",
  });

  await expect(navigationBar).toBeVisible();
  await expect(navigationBar.getByText("admin")).toBeVisible();
  await expect(
    navigationBar.getByRole("button", { name: "Sign out" }),
  ).toBeVisible();
});

test("Home page hides Home link and can navigate to About", async ({
  page,
}) => {
  await signInAsAdmin(page);

  const navigationBar = page.getByRole("navigation", {
    name: "Main navigation",
  });

  await expect(navigationBar.getByRole("link", { name: "Home" })).toHaveCount(
    0,
  );
  await expect(
    navigationBar.getByRole("link", { name: "About" }),
  ).toBeVisible();

  await navigationBar.getByRole("link", { name: "About" }).click();

  await expect(page).toHaveURL(/\/auth\/about$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "About" }),
  ).toBeVisible();
});

test("About page hides About link and can navigate to Home", async ({
  page,
}) => {
  await signInAsAdmin(page);
  await page.goto("/auth/about");

  const navigationBar = page.getByRole("navigation", {
    name: "Main navigation",
  });

  await expect(navigationBar.getByRole("link", { name: "About" })).toHaveCount(
    0,
  );
  await expect(navigationBar.getByRole("link", { name: "Home" })).toBeVisible();

  await navigationBar.getByRole("link", { name: "Home" }).click();

  await expect(page).toHaveURL(/\/auth\/home$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Home" }),
  ).toBeVisible();
});

test("User can sign out from navigation bar", async ({ page }) => {
  await signInAsAdmin(page);
  await page.goto("/auth/about");

  const navigationBar = page.getByRole("navigation", {
    name: "Main navigation",
  });

  await navigationBar.getByRole("button", { name: "Sign out" }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Login" }),
  ).toBeVisible();
});
