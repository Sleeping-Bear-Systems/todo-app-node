import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { createAppConfig } from "./appConfig.ts";

const validJwtSecretKey =
  "1234567890123456789012345678901234567890123456789012345678901234";

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

  test("environment reflects NODE_ENV when set to production", () => {
    const appConfig = createAppConfig(createEnv({ NODE_ENV: "production" }));
    assert.equal(appConfig.environment, "production");
  });

  test("environment reflects NODE_ENV when set to test", () => {
    const appConfig = createAppConfig(createEnv({ NODE_ENV: "test" }));
    assert.equal(appConfig.environment, "test");
  });

  test("throws when NODE_ENV is unsupported", () => {
    assert.throws(() => createAppConfig(createEnv({ NODE_ENV: "staging" })));
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

  test("jwt cookieName uses the application default", () => {
    const appConfig = createAppConfig(createEnv());
    assert.equal(appConfig.jwt.cookieName, "todo-app-node");
  });

  test("postgres uri reflects POSTGRES_URI", () => {
    const appConfig = createAppConfig(
      createEnv({ POSTGRES_URI: "postgresql://localhost:5432/todo-app" }),
    );
    assert.equal(
      appConfig.postgres.uri,
      "postgresql://localhost:5432/todo-app",
    );
  });

  test("throws when JWT_SECRET_KEY is missing", () => {
    assert.throws(() =>
      createAppConfig(createEnv({ JWT_SECRET_KEY: undefined })),
    );
  });

  test("throws when POSTGRES_URI is missing", () => {
    assert.throws(() =>
      createAppConfig(createEnv({ POSTGRES_URI: undefined })),
    );
  });

  test("throws when POSTGRES_URI is not a url", () => {
    assert.throws(() =>
      createAppConfig(createEnv({ POSTGRES_URI: "not-a-url" })),
    );
  });

  test("throws when POSTGRES_URI protocol is not postgres", () => {
    assert.throws(() =>
      createAppConfig(createEnv({ POSTGRES_URI: "https://example.com/db" })),
    );
  });

  test("throws when JWT_SECRET_KEY is shorter than 64 characters", () => {
    assert.throws(() =>
      createAppConfig({
        ...createEnv(),
        JWT_SECRET_KEY:
          "123456789012345678901234567890123456789012345678901234567890123",
      }),
    );
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
