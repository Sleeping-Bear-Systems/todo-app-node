import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { toEventMetadata } from "./commandMetadata.ts";

const userId = "b8835ccf-58ca-4720-985e-a71168d4e5bc";
const now = new Date("2026-06-09T00:27:19.000Z");
const commandMetadata = {
  userId,
  correlationId: "57c64c56-5034-4918-b9f1-2d56f438b276",
  now,
};

describe("toEventMetadata", () => {
  test("Verify correct mapping", () => {
    const eventMetadata = toEventMetadata(commandMetadata);
    assert.deepEqual(eventMetadata, commandMetadata);
  });
});
