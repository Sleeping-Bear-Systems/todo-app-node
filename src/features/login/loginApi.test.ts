/** biome-ignore-all lint/complexity/useLiteralKeys: noPropertyAccessFromIndexSignature = true */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import type { AppVariables } from "#shared/appVariables.js";
import { loginApi } from "./loginApi.js";
import { getOrCreateUser } from "./user.js";

describe("loginApi", () => {
  const appConfig = {
    port: 3000,
    environment: "test",
    seq: {
      apiKey: undefined,
      url: undefined,
    },
    jwt: {
      secretKey:
        "fake_jwt_secret_key_only_used_for_testing_the_login_api_01234567",
      cookieName: "todo-app-node",
    },
  } as const;

  const fixedNow = new Date();

  function createApp() {
    const app = new Hono<{ Variables: AppVariables }>();
    app.use("*", async (c, next) => {
      c.set("appConfig", appConfig);
      c.set("clock", { now: () => fixedNow });
      c.set("logger", {} as never);
      await next();
    });
    app.route("/login", loginApi);
    return app;
  }

  test("returns 302 redirect and sets a signed auth cookie for valid credentials", async () => {
    const app = createApp();
    const createdUser = getOrCreateUser("Alice", "password1234", "admin");

    const response = await app.request("/login", {
      method: "POST",
      body: new URLSearchParams({
        username: "  ALICE  ",
        password: "password1234",
      }),
    });

    assert.equal(response.status, 302);
    assert.equal(response.headers.get("location"), "/auth/home");

    const setCookieHeader = response.headers.get("set-cookie");
    assert.notEqual(setCookieHeader, null);
    assert.match(setCookieHeader ?? "", /^todo-app-node=/);
    assert.match(setCookieHeader ?? "", /HttpOnly/);
    assert.match(setCookieHeader ?? "", /SameSite=Strict/);

    const token = (setCookieHeader ?? "").split(";")[0]?.split("=")[1];
    assert.notEqual(token, undefined);

    const payload = await verify(token ?? "", appConfig.jwt.secretKey, "HS256");

    assert.equal(payload["sub"], createdUser.id);
    assert.equal(payload["preferred_username"], createdUser.username);
    assert.equal(payload["role"], createdUser.role);
    assert.equal(payload["iss"], "todo-app-node");
    assert.equal(payload["iat"], Math.floor(fixedNow.getTime() / 1000));
    assert.equal(
      payload["exp"],
      Math.floor(fixedNow.getTime() / 1000) + 60 * 60 * 24,
    );
  });

  test("returns 401 for invalid credentials", async () => {
    const app = createApp();

    const response = await app.request("/login", {
      method: "POST",
      body: new URLSearchParams({
        username: "unknown-user",
        password: "password1234",
      }),
    });

    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { message: "Invalid credentials" });
    assert.equal(response.headers.get("set-cookie"), null);
  });

  test("returns 400 when request validation fails", async () => {
    const app = createApp();

    const response = await app.request("/login", {
      method: "POST",
      body: new URLSearchParams({
        username: "ab",
        password: "short",
      }),
    });

    assert.equal(response.status, 400);
    assert.equal(response.headers.get("set-cookie"), null);
  });
});
