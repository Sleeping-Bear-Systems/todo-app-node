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

  const body = await response.json();
  expect(body.requestId).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  );
  expect(body.taskId).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
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
  expect(response.headers()["content-type"] ?? "").toContain(
    "application/json",
  );

  const body = await response.json();
  expect(body.requestId).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  );
  expect(body.taskId).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  );
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
