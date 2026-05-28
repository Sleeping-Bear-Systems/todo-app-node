import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { Hono } from "hono";
import { pingApi } from "./pingApi.js";

describe("pingApi", () => {
  test("GET responds with ok message", async () => {
    const app = new Hono();
    app.route("/ping", pingApi);

    const response = await app.request("/ping");

    assert.equal(response.status, 200);
    assert.match(
      response.headers.get("content-type") ?? "",
      /^application\/json/,
    );
    assert.deepEqual(await response.json(), { message: "ok" });
  });
});
