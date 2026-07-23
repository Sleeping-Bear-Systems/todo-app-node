import { type APIRequestContext, expect, test } from "@playwright/test";

const authCookieName = "todo-app-node";

function getOriginFromBaseUrl() {
  const baseURL = test.info().project.use.baseURL;
  expect(typeof baseURL).toBe("string");
  return new URL(baseURL as string).origin;
}

async function signInAndGetAuthCookie(request: APIRequestContext) {
  const loginResponse = await request.fetch("/api/login", {
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

  const setCookie = loginResponse.headers()["set-cookie"] ?? "";
  expect(setCookie).toContain(`${authCookieName}=`);

  return setCookie.split(";")[0] ?? "";
}

test("POST /api/auth/add-task creates a task for authenticated users", async ({
  request,
}) => {
  const authCookie = await signInAndGetAuthCookie(request);

  const response = await request.fetch("/api/auth/add-task", {
    method: "POST",
    form: {
      title: "Buy milk",
      description: "2 liters",
    },
    headers: {
      Cookie: authCookie,
      origin: getOriginFromBaseUrl(),
    },
    maxRedirects: 0,
  });

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"] ?? "").toContain(
    "application/json",
  );

  const payload = await response.json();
  expect(payload.requestId).toBeTruthy();
  expect(payload.taskId).toBeTruthy();
});

test("POST /api/auth/add-task returns Datastar redirect for Datastar requests", async ({
  request,
}) => {
  const authCookie = await signInAndGetAuthCookie(request);

  const response = await request.fetch("/api/auth/add-task", {
    method: "POST",
    form: {
      title: "Buy milk",
    },
    headers: {
      Cookie: authCookie,
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

test("POST /api/auth/add-task allows description to be omitted", async ({
  request,
}) => {
  const authCookie = await signInAndGetAuthCookie(request);

  const response = await request.fetch("/api/auth/add-task", {
    method: "POST",
    form: {
      title: "Buy milk",
    },
    headers: {
      Cookie: authCookie,
      origin: getOriginFromBaseUrl(),
    },
    maxRedirects: 0,
  });

  expect(response.status()).toBe(200);

  const payload = await response.json();
  expect(payload.requestId).toBeTruthy();
  expect(payload.taskId).toBeTruthy();
});

test("POST /api/auth/add-task rejects unauthenticated users", async ({
  request,
}) => {
  const response = await request.fetch("/api/auth/add-task", {
    method: "POST",
    form: {
      title: "Buy milk",
      description: "2 liters",
    },
    headers: {
      origin: getOriginFromBaseUrl(),
    },
    maxRedirects: 0,
  });

  expect(response.status()).toBe(401);
  await expect(response.json()).resolves.toEqual({ message: "Unauthorized" });
});

test("POST /api/auth/add-task rejects an empty title", async ({ request }) => {
  const authCookie = await signInAndGetAuthCookie(request);

  const response = await request.fetch("/api/auth/add-task", {
    method: "POST",
    form: {
      title: "",
      description: "2 liters",
    },
    headers: {
      Cookie: authCookie,
      origin: getOriginFromBaseUrl(),
    },
    maxRedirects: 0,
  });

  expect(response.status()).toBe(400);
});
