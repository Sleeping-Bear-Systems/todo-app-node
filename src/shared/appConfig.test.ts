import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { createAppConfig } from "./appConfig.js";

describe("createAppConfig", () => {
  test("validates behavior", () => {
    const env = { PORT: "1234" };
    const appConfig = createAppConfig(env);
    assert.equal(appConfig.port, 1234);
  });

  test("port defaults to 3000", () => {
    const appConfig = createAppConfig({});
    assert.equal(appConfig.port, 3000);
  });

  test("environment defaults to development", () => {
    const appConfig = createAppConfig({});
    assert.equal(appConfig.environment, "development");
  });

  test("environment reflects NODE_ENV", () => {
    const appConfig = createAppConfig({ NODE_ENV: "production" });
    assert.equal(appConfig.environment, "production");
  });

  test("seq apiKey is undefined when not set", () => {
    const appConfig = createAppConfig({});
    assert.equal(appConfig.seq.apiKey, undefined);
  });

  test("seq apiKey reflects SEQ_API_KEY", () => {
    const appConfig = createAppConfig({ SEQ_API_KEY: "my-api-key" });
    assert.equal(appConfig.seq.apiKey, "my-api-key");
  });

  test("seq url is undefined when not set", () => {
    const appConfig = createAppConfig({});
    assert.equal(appConfig.seq.url, undefined);
  });

  test("seq url reflects SEQ_URL", () => {
    const appConfig = createAppConfig({ SEQ_URL: "https://seq.example.com" });
    assert.equal(appConfig.seq.url, "https://seq.example.com");
  });

  test("throws on invalid port below range", () => {
    assert.throws(() => createAppConfig({ PORT: "0" }));
  });

  test("throws on invalid port above range", () => {
    assert.throws(() => createAppConfig({ PORT: "65536" }));
  });

  test("throws on non-numeric port", () => {
    assert.throws(() => createAppConfig({ PORT: "invalid" }));
  });
});
