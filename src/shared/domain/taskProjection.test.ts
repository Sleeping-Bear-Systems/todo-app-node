import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { event } from "@event-driven-io/emmett";
import { addDays } from "date-fns";
import type { TaskEvent } from "#shared/domain/taskEvent.ts";
import { evolve, initialState, type TaskDocument } from "./taskProjection.ts";

const taskId = "3d1b3bf1-33fb-44be-ad48-6850f2c74b20";
const now = new Date("2026-06-09T00:27:19.000Z");
const eventMetadata = {
  userId: "b8835ccf-58ca-4720-985e-a71168d4e5bc",
  correlationId: "57c64c56-5034-4918-b9f1-2d56f438b276",
  now,
};

const unknownDocument: TaskDocument = {
  _id: "",
  title: "",
  description: "",
  status: "Unknown",
  userId: "",
  addedOn: new Date(0),
};

const activeDocument: TaskDocument = {
  _id: taskId,
  title: "title",
  description: "description",
  status: "Active",
  userId: eventMetadata.userId,
  addedOn: now,
};

describe("evolve()", () => {
  test("TaskAdded transitions Unknown to Active", () => {
    const result = evolve(
      unknownDocument,
      event<TaskEvent>(
        "TaskAdded",
        {
          taskId,
          title: "title",
          description: "description",
          addedOn: now,
          userId: eventMetadata.userId,
        },
        eventMetadata,
      ),
    );

    assert.deepEqual(result, {
      _id: taskId,
      title: "title",
      description: "description",
      status: "Active",
      userId: eventMetadata.userId,
      addedOn: now,
    });
  });

  test("TaskAdded does not change non-Unknown state", () => {
    const result = evolve(
      activeDocument,
      event<TaskEvent>(
        "TaskAdded",
        {
          taskId,
          title: "title",
          description: "description",
          addedOn: now,
          userId: eventMetadata.userId,
        },
        eventMetadata,
      ),
    );

    assert.equal(result, activeDocument);
  });

  test("TaskRemoved transitions Active to Removed", () => {
    const removedOn = addDays(now, 1);
    const result = evolve(
      activeDocument,
      event<TaskEvent>(
        "TaskRemoved",
        {
          taskId,
          removedOn,
          userId: eventMetadata.userId,
        },
        eventMetadata,
      ),
    );

    assert.deepEqual(result, {
      ...activeDocument,
      status: "Removed",
      removedOn,
    });
  });

  test("TaskRemoved does not change non-Active state", () => {
    const removedOn = addDays(now, 1);
    const removedDocument: TaskDocument = {
      ...activeDocument,
      status: "Removed",
      removedOn,
    };

    const result = evolve(
      removedDocument,
      event<TaskEvent>(
        "TaskRemoved",
        {
          taskId,
          removedOn,
          userId: eventMetadata.userId,
        },
        eventMetadata,
      ),
    );

    assert.equal(result, removedDocument);
  });

  test("TaskCompleted transitions Active to Completed", () => {
    const completedOn = addDays(now, 1);
    const result = evolve(
      activeDocument,
      event<TaskEvent>(
        "TaskCompleted",
        {
          taskId,
          completedOn,
          userId: eventMetadata.userId,
        },
        eventMetadata,
      ),
    );

    assert.deepEqual(result, {
      ...activeDocument,
      status: "Completed",
      completedOn,
    });
  });

  test("TaskCompleted does not change non-Active state", () => {
    const completedOn = addDays(now, 1);
    const completedDocument: TaskDocument = {
      ...activeDocument,
      status: "Completed",
      completedOn,
    };

    const result = evolve(
      completedDocument,
      event<TaskEvent>(
        "TaskCompleted",
        {
          taskId,
          completedOn,
          userId: eventMetadata.userId,
        },
        eventMetadata,
      ),
    );

    assert.equal(result, completedDocument);
  });
});

describe("initialState()", () => {
  test("returns an Unknown task document with empty fields", () => {
    const state = initialState();

    assert.deepEqual(state, {
      _id: "",
      title: "",
      description: "",
      status: "Unknown",
      userId: "",
      addedOn: new Date(0),
    });
  });
});
