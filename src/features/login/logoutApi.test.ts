import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { Hono } from "hono";
import type { AppVariables } from "#shared/appVariables.js";
import { logoutApi } from "./logoutApi.js";

describe("logoutApi", () => {
  function createApp(cookieName = "todo-app-node") {
    const app = new Hono<{ Variables: AppVariables }>();
    app.use("*", async (c, next) => {
      c.set("appConfig", {
        port: 3000,
        environment: "test",
        seq: {
          apiKey: undefined,
          url: undefined,
        },
        jwt: {
          secretKey:
            "fake_jwt_secret_key_only_used_for_testing_the_logout_api_0123456",
          cookieName,
        },
      });
      c.set("clock", { now: () => new Date("2026-05-31T12:00:00Z") });
      c.set("logger", {} as never);
      await next();
    });
    app.route("/logout", logoutApi);
    return app;
  }

  test("POST redirects to /login", async () => {
    const app = createApp();

    const response = await app.request("/logout", { method: "POST" });

    assert.equal(response.status, 302);
    assert.equal(response.headers.get("location"), "/login");
  });

  test("POST clears configured auth cookie", async () => {
    const app = createApp("custom-auth-cookie");

    const response = await app.request("/logout", { method: "POST" });

    const setCookieHeader = response.headers.get("set-cookie");
    assert.notEqual(setCookieHeader, null);
    assert.match(setCookieHeader ?? "", /^custom-auth-cookie=;/);
    assert.match(setCookieHeader ?? "", /Max-Age=0/);
  });
});
