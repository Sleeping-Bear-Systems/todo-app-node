import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { formDataStringEntries } from "./hono.ts";

describe("formDataStringEntries", () => {
  test("returns an object containing each form field as a string value", () => {
    const formData = new FormData();
    formData.append("title", "Buy milk");
    formData.append("owner", "admin");

    const result = formDataStringEntries(formData);

    assert.deepEqual(result, {
      title: "Buy milk",
      owner: "admin",
    });
  });

  test("uses the last value when a field appears more than once", () => {
    const formData = new FormData();
    formData.append("tag", "first");
    formData.append("tag", "second");

    const result = formDataStringEntries(formData);

    assert.deepEqual(result, {
      tag: "second",
    });
  });
});
