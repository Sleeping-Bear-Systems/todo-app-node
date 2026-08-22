import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { createAppConfig } from "./appConfig.ts";

const validJwtSecretKey =
  "1234567890123456789012345678901234567890123456789012345678901234";

const version = "1.2.3";

function createEnv(overrides: Record<string, string | undefined> = {}) {
  return {
    JWT_SECRET_KEY: validJwtSecretKey,
    POSTGRES_URI: "postgres://postgres:password@localhost:5432/todo-app",
    ...overrides,
  };
}

describe("createAppConfig", () => {
  test("validates behavior", () => {
    const env = createEnv({ PORT: "1234" });
    const appConfig = createAppConfig(env, version);
    assert.equal(appConfig.port, 1234);
  });

  test("port defaults to 3000", () => {
    const appConfig = createAppConfig(createEnv(), version);
    assert.equal(appConfig.port, 3000);
  });

  test("version combines package version with default build number", () => {
    const appConfig = createAppConfig(createEnv(), version);
    assert.equal(appConfig.version, "1.2.3.0");
  });

  test("version reflects BUILD_NUMBER when set", () => {
    const appConfig = createAppConfig(
      createEnv({ BUILD_NUMBER: "42" }),
      version,
    );
    assert.equal(appConfig.version, "1.2.3.42");
  });

  test("throws when BUILD_NUMBER is negative", () => {
    assert.throws(() =>
      createAppConfig(createEnv({ BUILD_NUMBER: "-1" }), version),
    );
  });

  test("throws when BUILD_NUMBER is not an integer", () => {
    assert.throws(() =>
      createAppConfig(createEnv({ BUILD_NUMBER: "3.14" }), version),
    );
  });

  test("throws when BUILD_NUMBER is not numeric", () => {
    assert.throws(() =>
      createAppConfig(createEnv({ BUILD_NUMBER: "abc" }), version),
    );
  });

  test("environment defaults to development", () => {
    const appConfig = createAppConfig(createEnv(), version);
    assert.equal(appConfig.environment, "development");
  });

  test("environment reflects NODE_ENV when set to production", () => {
    const appConfig = createAppConfig(
      createEnv({ NODE_ENV: "production" }),
      version,
    );
    assert.equal(appConfig.environment, "production");
  });

  test("environment reflects NODE_ENV when set to test", () => {
    const appConfig = createAppConfig(createEnv({ NODE_ENV: "test" }), version);
    assert.equal(appConfig.environment, "test");
  });

  test("throws when NODE_ENV is unsupported", () => {
    assert.throws(() =>
      createAppConfig(createEnv({ NODE_ENV: "staging" }), version),
    );
  });

  test("seq apiKey is undefined when not set", () => {
    const appConfig = createAppConfig(createEnv(), version);
    assert.equal(appConfig.seq.apiKey, undefined);
  });

  test("seq apiKey reflects SEQ_API_KEY", () => {
    const appConfig = createAppConfig(
      createEnv({ SEQ_API_KEY: "my-api-key" }),
      version,
    );
    assert.equal(appConfig.seq.apiKey, "my-api-key");
  });

  test("seq url is undefined when not set", () => {
    const appConfig = createAppConfig(createEnv(), version);
    assert.equal(appConfig.seq.url, undefined);
  });

  test("seq url reflects SEQ_URL", () => {
    const appConfig = createAppConfig(
      createEnv({ SEQ_URL: "https://seq.example.com" }),
      version,
    );
    assert.equal(appConfig.seq.url, "https://seq.example.com");
  });

  test("jwt secretKey reflects JWT_SECRET_KEY", () => {
    const appConfig = createAppConfig(
      createEnv({ JWT_SECRET_KEY: validJwtSecretKey }),
      version,
    );
    assert.equal(appConfig.jwt.secretKey, validJwtSecretKey);
  });

  test("jwt cookieName uses the application default", () => {
    const appConfig = createAppConfig(createEnv(), version);
    assert.equal(appConfig.jwt.cookieName, "todo-app-node");
  });

  test("postgres uri reflects POSTGRES_URI", () => {
    const appConfig = createAppConfig(
      createEnv({ POSTGRES_URI: "postgresql://localhost:5432/todo-app" }),
      version,
    );
    assert.equal(
      appConfig.postgres.uri,
      "postgresql://localhost:5432/todo-app",
    );
  });

  test("throws when JWT_SECRET_KEY is missing", () => {
    assert.throws(() =>
      createAppConfig(createEnv({ JWT_SECRET_KEY: undefined }), version),
    );
  });

  test("throws when POSTGRES_URI is missing", () => {
    assert.throws(() =>
      createAppConfig(createEnv({ POSTGRES_URI: undefined }), version),
    );
  });

  test("throws when POSTGRES_URI is not a url", () => {
    assert.throws(() =>
      createAppConfig(createEnv({ POSTGRES_URI: "not-a-url" }), version),
    );
  });

  test("throws when POSTGRES_URI protocol is not postgres", () => {
    assert.throws(() =>
      createAppConfig(
        createEnv({ POSTGRES_URI: "https://example.com/db" }),
        version,
      ),
    );
  });

  test("throws when JWT_SECRET_KEY is shorter than 64 characters", () => {
    assert.throws(() =>
      createAppConfig(
        {
          ...createEnv(),
          JWT_SECRET_KEY:
            "123456789012345678901234567890123456789012345678901234567890123",
        },
        version,
      ),
    );
  });

  test("throws on invalid port below range", () => {
    assert.throws(() => createAppConfig(createEnv({ PORT: "0" }), version));
  });

  test("throws on invalid port above range", () => {
    assert.throws(() => createAppConfig(createEnv({ PORT: "65536" }), version));
  });

  test("throws on non-numeric port", () => {
    assert.throws(() =>
      createAppConfig(createEnv({ PORT: "invalid" }), version),
    );
  });
});
