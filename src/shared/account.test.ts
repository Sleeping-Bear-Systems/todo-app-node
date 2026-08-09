import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { toRole } from "./account.ts";

describe("toRole", () => {
  test("returns admin for the admin role", () => {
    assert.equal(toRole("admin"), "admin");
  });

  test("returns standard for the standard role", () => {
    assert.equal(toRole("standard"), "standard");
  });

  test("returns unknown for unrecognized roles", () => {
    assert.equal(toRole("moderator"), "unknown");
  });

  test("normalizes role input to lowercase", () => {
    assert.equal(toRole("ADMIN"), "admin");
    assert.equal(toRole("Standard"), "standard");
  });
});
