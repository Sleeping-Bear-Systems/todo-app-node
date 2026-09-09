import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { Hono } from "hono";
import { isDatastarRequest } from "./datastar.ts";

describe("isDatastarRequest", () => {
  test("returns true when the Datastar request header is set to true", async () => {
    const app = new Hono();

    app.get("/", (c) => {
      assert.equal(isDatastarRequest(c), true);
      return c.text("ok");
    });

    const response = await app.request("/", {
      headers: { "Datastar-Request": "true" },
    });

    assert.equal(response.status, 200);
  });

  test("returns false when the Datastar request header is missing", async () => {
    const app = new Hono();

    app.get("/", (c) => {
      assert.equal(isDatastarRequest(c), false);
      return c.text("ok");
    });

    const response = await app.request("/");

    assert.equal(response.status, 200);
  });

  test("returns false when the Datastar request header is not exactly true", async () => {
    const app = new Hono();

    app.get("/", (c) => {
      assert.equal(isDatastarRequest(c), false);
      return c.text("ok");
    });

    const response = await app.request("/", {
      headers: { "Datastar-Request": "false" },
    });

    assert.equal(response.status, 200);
  });
});
