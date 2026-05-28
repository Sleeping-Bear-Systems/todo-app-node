import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { createAppConfig } from "./appConfig.js";

describe("createAppConfig", () => {
  test("validates behavior", () => {
    const env = { port: "1234" };
    const appConfig = createAppConfig(env);
    assert.equal(appConfig.port, 1234);
  });

  test("port defaults to 3000", () => {
    const appConfig = createAppConfig({});
    assert.equal(appConfig.port, 3000);
  });
});
