import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { initialState } from "./taskState.ts";

describe("initialState()", () => {
  test("method returns UnknownTask", () => {
    const state = initialState();
    assert.equal(state.status, "UnknownTask");
  });
});
