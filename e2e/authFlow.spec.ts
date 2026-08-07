/** biome-ignore-all lint/complexity/useLiteralKeys: noPropertyAccessFromIndexSignature = true */
import { expect, type Page, test } from "@playwright/test";

const authCookieName = "todo-app-node";

async function signInAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("password1234");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/auth\/home$/);
}

test("GET / redirects unauthenticated users to /login", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Login" }),
  ).toBeVisible();
});

test("GET / redirects authenticated users to /auth/home", async ({ page }) => {
  await signInAsAdmin(page);
  await page.goto("/");

  await expect(page).toHaveURL(/\/auth\/home$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Home" }),
  ).toBeVisible();
});

test("POST /api/logout clears auth cookie and redirects to /login", async ({
  page,
  request,
}) => {
  const baseURL = test.info().project.use.baseURL;
  expect(typeof baseURL).toBe("string");
  const origin = new URL(baseURL as string).origin;

  await signInAsAdmin(page);

  const cookies = await page.context().cookies();
  const authCookie = cookies.find((cookie) => cookie.name === authCookieName);
  expect(authCookie).toBeDefined();
  const authCookiePair = `${authCookie!.name}=${authCookie!.value}`;

  const logoutResponse = await request.fetch("/api/logout", {
    method: "POST",
    headers: {
      Cookie: authCookiePair,
      origin,
    },
    maxRedirects: 0,
  });

  expect(logoutResponse.status()).toBe(302);
  expect(logoutResponse.headers()["location"]).toBe("/login");

  const logoutSetCookie = logoutResponse.headers()["set-cookie"];
  expect(logoutSetCookie).toContain(`${authCookieName}=`);
  expect(logoutSetCookie).toContain("Max-Age=0");
});

test("POST /api/logout without auth cookie still redirects to /login", async ({
  request,
}) => {
  const baseURL = test.info().project.use.baseURL;
  expect(typeof baseURL).toBe("string");

  const response = await request.fetch("/api/logout", {
    method: "POST",
    headers: {
      origin: new URL(baseURL as string).origin,
    },
    maxRedirects: 0,
  });

  expect(response.status()).toBe(302);
  expect(response.headers()["location"]).toBe("/login");
});
