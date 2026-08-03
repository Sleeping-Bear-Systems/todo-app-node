import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { mapToStreamId } from "./utility.ts";

describe("mapToStreamId()", () => {
  test("prefixes task id with task-", () => {
    const taskId = "3d1b3bf1-33fb-44be-ad48-6850f2c74b20";

    const streamId = mapToStreamId(taskId);

    assert.equal(streamId, `task-${taskId}`);
  });

  test("returns task- for empty task id", () => {
    const streamId = mapToStreamId("");

    assert.equal(streamId, "task-");
  });
});
