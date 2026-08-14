import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { toFailure, toSuccess } from "./result.ts";

describe("toSuccess", () => {
  test("creates a success result with its tag", () => {
    assert.deepEqual(toSuccess("created"), {
      type: "Success",
      tag: "created",
    });
  });
});

describe("toFailure", () => {
  test("creates a failure result with the default message", () => {
    assert.deepEqual(toFailure("invalid"), {
      type: "Failure",
      tag: "invalid",
      message: "error",
    });
  });

  test("creates a failure result with a custom message", () => {
    assert.deepEqual(toFailure("invalid", "The task is invalid"), {
      type: "Failure",
      tag: "invalid",
      message: "The task is invalid",
    });
  });
});
