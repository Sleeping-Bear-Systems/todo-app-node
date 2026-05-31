import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { createAppConfig } from "./appConfig.js";

const validJwtSecretKey = "12345678901234567890123456789012";

function createEnv(overrides: Record<string, string | undefined> = {}) {
  return {
    JWT_SECRET_KEY: validJwtSecretKey,
    ...overrides,
  };
}

describe("createAppConfig", () => {
  test("validates behavior", () => {
    const env = createEnv({ PORT: "1234" });
    const appConfig = createAppConfig(env);
    assert.equal(appConfig.port, 1234);
  });

  test("port defaults to 3000", () => {
    const appConfig = createAppConfig(createEnv());
    assert.equal(appConfig.port, 3000);
  });

  test("environment defaults to development", () => {
    const appConfig = createAppConfig(createEnv());
    assert.equal(appConfig.environment, "development");
  });

  test("environment reflects NODE_ENV", () => {
    const appConfig = createAppConfig(createEnv({ NODE_ENV: "production" }));
    assert.equal(appConfig.environment, "production");
  });

  test("seq apiKey is undefined when not set", () => {
    const appConfig = createAppConfig(createEnv());
    assert.equal(appConfig.seq.apiKey, undefined);
  });

  test("seq apiKey reflects SEQ_API_KEY", () => {
    const appConfig = createAppConfig(createEnv({ SEQ_API_KEY: "my-api-key" }));
    assert.equal(appConfig.seq.apiKey, "my-api-key");
  });

  test("seq url is undefined when not set", () => {
    const appConfig = createAppConfig(createEnv());
    assert.equal(appConfig.seq.url, undefined);
  });

  test("seq url reflects SEQ_URL", () => {
    const appConfig = createAppConfig(
      createEnv({ SEQ_URL: "https://seq.example.com" }),
    );
    assert.equal(appConfig.seq.url, "https://seq.example.com");
  });

  test("jwt secretKey reflects JWT_SECRET_KEY", () => {
    const appConfig = createAppConfig(
      createEnv({ JWT_SECRET_KEY: validJwtSecretKey }),
    );
    assert.equal(appConfig.jwt.secretKey, validJwtSecretKey);
  });

  test("throws when JWT_SECRET_KEY is missing", () => {
    assert.throws(() =>
      createAppConfig(createEnv({ JWT_SECRET_KEY: undefined })),
    );
  });

  test("throws when JWT_SECRET_KEY is shorter than 32 characters", () => {
    assert.throws(() => createAppConfig(createEnv({ JWT_SECRET_KEY: "1234" })));
  });

  test("throws on invalid port below range", () => {
    assert.throws(() => createAppConfig(createEnv({ PORT: "0" })));
  });

  test("throws on invalid port above range", () => {
    assert.throws(() => createAppConfig(createEnv({ PORT: "65536" })));
  });

  test("throws on non-numeric port", () => {
    assert.throws(() => createAppConfig(createEnv({ PORT: "invalid" })));
  });
});
