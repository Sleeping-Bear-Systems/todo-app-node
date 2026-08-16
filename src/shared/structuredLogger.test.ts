import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { AppConfig } from "./appConfig.ts";
import { createStructuredLogger } from "./structuredLogger.ts";

const baseConfig: AppConfig = {
  port: 3000,
  environment: "test",
  seq: {
    apiKey: undefined,
    url: undefined,
  },
  jwt: {
    secretKey: "fake_jwt_secret_key",
    cookieName: "todo-app-node",
  },
  postgres: {
    uri: "postgresql://user:password@host:5432/database",
  },
  admin: { username: "admin", password: "password" },
};

describe("createStructuredLogger", () => {
  test("returns a logger instance", () => {
    const logger = createStructuredLogger(baseConfig);
    assert.ok(logger);
  });

  test("logger has info level", () => {
    const logger = createStructuredLogger(baseConfig);
    assert.equal(logger.level, "info");
  });

  test("logger includes console transport when seq is not configured", () => {
    const logger = createStructuredLogger(baseConfig);
    assert.equal(logger.transports.length, 1);
  });

  test("logger includes seq transport when seq is fully configured", () => {
    const config: AppConfig = {
      ...baseConfig,
      seq: {
        apiKey: "test-api-key",
        url: "https://seq.example.com",
      },
    };
    const logger = createStructuredLogger(config);
    assert.equal(logger.transports.length, 2);
  });

  test("logger does not add seq transport when only apiKey is set", () => {
    const config: AppConfig = {
      ...baseConfig,
      seq: {
        apiKey: "test-api-key",
        url: undefined,
      },
    };
    const logger = createStructuredLogger(config);
    assert.equal(logger.transports.length, 1);
  });

  test("logger does not add seq transport when only url is set", () => {
    const config: AppConfig = {
      ...baseConfig,
      seq: {
        apiKey: undefined,
        url: "https://seq.example.com",
      },
    };
    const logger = createStructuredLogger(config);
    assert.equal(logger.transports.length, 1);
  });
});
