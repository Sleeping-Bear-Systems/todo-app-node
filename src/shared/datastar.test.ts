import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { Context } from "hono";
import { isDatastarRequest } from "./datastar.ts";

function createContext(headerValue: string | undefined): Context {
  return {
    req: {
      header: (name: string) =>
        name === "Datastar-Request" ? headerValue : undefined,
    },
  } as unknown as Context;
}

describe("isDatastarRequest", () => {
  test("returns true when Datastar-Request header is true", () => {
    const context = createContext("true");

    assert.equal(isDatastarRequest(context), true);
  });

  test("returns false when Datastar-Request header is missing", () => {
    const context = createContext(undefined);

    assert.equal(isDatastarRequest(context), false);
  });

  test("returns false when Datastar-Request header is not true", () => {
    const context = createContext("false");

    assert.equal(isDatastarRequest(context), false);
  });

  test("returns false when Datastar-Request header casing does not match", () => {
    const context = createContext("True");

    assert.equal(isDatastarRequest(context), false);
  });
});
