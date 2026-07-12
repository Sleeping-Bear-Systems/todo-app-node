import { expect, type Page, test } from "@playwright/test";

const authCookieName = "todo-app-node";

async function signInAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("password1234");
  await page.getByRole("button", { name: "Sign in" }).click();
}

async function attemptSignIn(page: Page, username: string, password: string) {
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

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
  await expect(
    page.locator('link[rel="stylesheet"][href="/styles/app.css"]'),
  ).toHaveCount(1);

  await expect(page.getByLabel("Username")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toHaveCount(0);
});

test("Invalid credentials render inline login error", async ({ page }) => {
  await page.goto("/login");
  await attemptSignIn(page, "admin", "wrong-pass");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator("#errors")).toContainText("Invalid Credentials");
});

test("Valid credentials sign in from login form and redirect to home", async ({
  page,
}) => {
  await signInAsAdmin(page);

  await expect(page).toHaveURL(/\/auth\/home$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Home" }),
  ).toBeVisible();
});

test("Invalid login does not authenticate user", async ({ page }) => {
  await page.goto("/login");
  await attemptSignIn(page, "admin", "wrong-pass");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator("#errors")).toContainText("Invalid Credentials");

  await page.goto("/auth/home");
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Login" }),
  ).toBeVisible();
});

test("Repeated invalid login attempts keep a single inline error container", async ({
  page,
}) => {
  await page.goto("/login");
  await attemptSignIn(page, "admin", "wrong-pass");

  await expect(page.locator("#errors")).toContainText("Invalid Credentials");

  await attemptSignIn(page, "admin", "still-wrong");

  const errors = page.locator("#errors");
  await expect(errors).toHaveCount(1);
  await expect(errors).toContainText("Invalid Credentials");
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

test("POST /api/login returns success JSON and auth cookie for valid credentials", async ({
  request,
}) => {
  const response = await request.fetch("/api/login", {
    method: "POST",
    form: {
      username: "admin",
      password: "password1234",
    },
    headers: {
      origin: getOriginFromBaseUrl(),
    },
    maxRedirects: 0,
  });

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"] ?? "").toContain(
    "application/json",
  );
  await expect(response.json()).resolves.toEqual({ message: "Success" });
  expect(response.headers()["set-cookie"] ?? "").toContain(
    `${authCookieName}=`,
  );
});

test("POST /api/login sets secure cookie attributes for valid credentials", async ({
  request,
}) => {
  const response = await request.fetch("/api/login", {
    method: "POST",
    form: {
      username: "admin",
      password: "password1234",
    },
    headers: {
      origin: getOriginFromBaseUrl(),
    },
    maxRedirects: 0,
  });

  expect(response.status()).toBe(200);
  const setCookie = response.headers()["set-cookie"] ?? "";

  expect(setCookie).toContain(`${authCookieName}=`);
  expect(setCookie).toContain("HttpOnly");
  expect(setCookie).toContain("SameSite=Strict");
  expect(setCookie).toContain("Expires=");
});

test("POST /api/login returns Datastar SSE redirect for valid Datastar requests", async ({
  request,
}) => {
  const response = await request.fetch("/api/login", {
    method: "POST",
    form: {
      username: "admin",
      password: "password1234",
    },
    headers: {
      "Datastar-Request": "true",
      origin: getOriginFromBaseUrl(),
    },
    maxRedirects: 0,
  });

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"] ?? "").toContain(
    "text/event-stream",
  );
  await expect(response.text()).resolves.toContain(
    `window.location.href="/auth/home"`,
  );
});

test("POST /api/login rejects invalid credentials for non-Datastar requests", async ({
  request,
}) => {
  const response = await request.fetch("/api/login", {
    method: "POST",
    form: {
      username: "admin",
      password: "wrong-pass",
    },
    headers: {
      origin: getOriginFromBaseUrl(),
    },
    maxRedirects: 0,
  });

  expect(response.status()).toBe(401);
  await expect(response.json()).resolves.toEqual({
    message: "Invalid credentials",
  });
  expect(response.headers()["set-cookie"] ?? "").not.toContain(
    `${authCookieName}=`,
  );
});

test("POST /api/login rejects invalid credentials for Datastar requests", async ({
  request,
}) => {
  const response = await request.fetch("/api/login", {
    method: "POST",
    form: {
      username: "admin",
      password: "wrong-pass",
    },
    headers: {
      "Datastar-Request": "true",
      origin: getOriginFromBaseUrl(),
    },
    maxRedirects: 0,
  });

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"] ?? "").toContain("text/html");
  await expect(response.text()).resolves.toContain("Invalid Credentials");
  expect(response.headers()["set-cookie"] ?? "").not.toContain(
    `${authCookieName}=`,
  );
});

test("POST /api/login treats Datastar-Request header value false as non-Datastar", async ({
  request,
}) => {
  const response = await request.fetch("/api/login", {
    method: "POST",
    form: {
      username: "admin",
      password: "password1234",
    },
    headers: {
      "Datastar-Request": "false",
      origin: getOriginFromBaseUrl(),
    },
    maxRedirects: 0,
  });

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"] ?? "").toContain(
    "application/json",
  );
  await expect(response.json()).resolves.toEqual({ message: "Success" });
});
