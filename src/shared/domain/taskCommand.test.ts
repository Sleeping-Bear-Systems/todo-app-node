import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  command,
  DeciderSpecification,
  event,
  IllegalStateError,
} from "@event-driven-io/emmett";
import { addDays } from "date-fns";
import { toEventMetadata } from "./commandMetadata.ts";
import { decide, type TaskCommand } from "./taskCommand.ts";
import type { TaskEvent } from "./taskEvent.ts";
import { evolve, initialState } from "./taskState.ts";

const spec = DeciderSpecification.for({
  decide,
  evolve,
  initialState,
});

const taskId = "3d1b3bf1-33fb-44be-ad48-6850f2c74b20";
const now = new Date("2026-06-09T00:27:19.000Z");
const userId = "b8835ccf-58ca-4720-985e-a71168d4e5bc";
const correlationId = "57c64c56-5034-4918-b9f1-2d56f438b276";
const otherUserId = "a1229a75-5d8e-4b9c-8bd5-6bca5a99f1d0";
const commandMetadata = {
  userId,
  correlationId,
  now,
};
const eventMetadata = toEventMetadata(commandMetadata);

describe("toEventMetadata", () => {
  test("maps command metadata fields to event metadata", () => {
    assert.deepEqual(toEventMetadata({ now, userId, correlationId }), {
      now,
      userId,
      correlationId,
    });
  });

  test("returns metadata containing only expected fields", () => {
    const metadata = toEventMetadata({ now, userId, correlationId });

    assert.deepEqual(Object.keys(metadata).sort(), [
      "correlationId",
      "now",
      "userId",
    ]);
  });
});

describe("AddTask", () => {
  const addTaskCommand = command<TaskCommand>(
    "AddTask",
    { taskId, title: "title", description: "description", addedOn: now },
    commandMetadata,
  );

  test("returns TaskAdded event when state is UnknownTask", () => {
    spec([])
      .when(addTaskCommand)
      .then(
        event<TaskEvent>(
          "TaskAdded",
          {
            taskId,
            title: "title",
            description: "description",
            addedOn: now,
            userId,
          },
          eventMetadata,
        ),
      );
  });

  test("throws IllegalStateError when state is AddedTask", () => {
    spec([
      event<TaskEvent>(
        "TaskAdded",
        {
          taskId,
          title: "title",
          description: "description",
          userId,
          addedOn: addDays(now, -1),
        },
        eventMetadata,
      ),
    ])
      .when(addTaskCommand)
      .thenThrows(
        IllegalStateError,
        (error) => error.message === "State is not UnknownTask",
      );
  });

  test("throws IllegalStateError when state is CompletedTask", () => {
    spec([
      event<TaskEvent>(
        "TaskAdded",
        {
          taskId,
          title: "title",
          description: "description",
          userId,
          addedOn: addDays(now, -2),
        },
        eventMetadata,
      ),
      event<TaskEvent>(
        "TaskCompleted",
        {
          taskId,
          completedOn: addDays(now, -1),
          userId,
        },
        eventMetadata,
      ),
    ])
      .when(addTaskCommand)
      .thenThrows(
        IllegalStateError,
        (error) => error.message === "State is not UnknownTask",
      );
  });

  test("throws IllegalStateError when state is RemovedTask", () => {
    spec([
      event<TaskEvent>(
        "TaskAdded",
        {
          taskId,
          title: "title",
          description: "description",
          userId,
          addedOn: addDays(now, -2),
        },
        eventMetadata,
      ),
      event<TaskEvent>(
        "TaskRemoved",
        {
          taskId,
          removedOn: addDays(now, -1),
          userId,
        },
        eventMetadata,
      ),
    ])
      .when(addTaskCommand)
      .thenThrows(
        IllegalStateError,
        (error) => error.message === "State is not UnknownTask",
      );
  });
});

describe("RemoveTask", () => {
  const removeTaskCommand = command<TaskCommand>(
    "RemoveTask",
    { taskId, removedOn: now },
    commandMetadata,
  );

  test("returns TaskRemoved event when state is AddedTask", () => {
    spec([
      event<TaskEvent>(
        "TaskAdded",
        {
          taskId,
          title: "title",
          description: "description",
          userId,
          addedOn: addDays(now, -1),
        },
        eventMetadata,
      ),
    ])
      .when(removeTaskCommand)
      .then(
        event<TaskEvent>(
          "TaskRemoved",
          {
            taskId,
            removedOn: now,
            userId,
          },
          eventMetadata,
        ),
      );
  });

  test("throws IllegalStateError when another user owns the task", () => {
    spec([
      event<TaskEvent>(
        "TaskAdded",
        {
          taskId,
          title: "title",
          description: "description",
          userId: otherUserId,
          addedOn: addDays(now, -1),
        },
        toEventMetadata({ ...commandMetadata, userId: otherUserId }),
      ),
    ])
      .when(removeTaskCommand)
      .thenThrows(
        IllegalStateError,
        (error) => error.message === "User does not own task",
      );
  });

  test("throws IllegalStateError when state is UnknownTask", () => {
    spec([])
      .when(removeTaskCommand)
      .thenThrows(
        IllegalStateError,
        (error) => error.message === "Task is not active",
      );
  });

  test("throws IllegalStateError when state is CompletedTask", () => {
    spec([
      event<TaskEvent>(
        "TaskAdded",
        {
          taskId,
          title: "title",
          description: "description",
          userId,
          addedOn: addDays(now, -2),
        },
        eventMetadata,
      ),
      event<TaskEvent>(
        "TaskCompleted",
        {
          taskId,
          completedOn: addDays(now, -1),
          userId,
        },
        eventMetadata,
      ),
    ])
      .when(removeTaskCommand)
      .thenThrows(
        IllegalStateError,
        (error) => error.message === "Task is not active",
      );
  });

  test("throws IllegalStateError when state is RemovedTask", () => {
    spec([
      event<TaskEvent>(
        "TaskAdded",
        {
          taskId,
          title: "title",
          description: "description",
          userId,
          addedOn: addDays(now, -2),
        },
        eventMetadata,
      ),
      event<TaskEvent>(
        "TaskRemoved",
        {
          taskId,
          removedOn: addDays(now, -1),
          userId,
        },
        eventMetadata,
      ),
    ])
      .when(removeTaskCommand)
      .thenThrows(
        IllegalStateError,
        (error) => error.message === "Task is not active",
      );
  });
});

describe("CompleteTask", () => {
  const completeTaskCommand = command<TaskCommand>(
    "CompleteTask",
    { taskId, completedOn: now },
    { now, userId, correlationId },
  );

  test("returns TaskCompleted event when state is AddedTask", () => {
    spec([
      event<TaskEvent>(
        "TaskAdded",
        {
          taskId,
          title: "title",
          description: "description",
          userId,
          addedOn: addDays(now, -1),
        },
        eventMetadata,
      ),
    ])
      .when(completeTaskCommand)
      .then(
        event<TaskEvent>(
          "TaskCompleted",
          {
            taskId,
            completedOn: now,
            userId,
          },
          eventMetadata,
        ),
      );
  });

  test("throws IllegalStateError when another user owns the task", () => {
    spec([
      event<TaskEvent>(
        "TaskAdded",
        {
          taskId,
          title: "title",
          description: "description",
          userId: otherUserId,
          addedOn: addDays(now, -1),
        },
        toEventMetadata({ ...commandMetadata, userId: otherUserId }),
      ),
    ])
      .when(completeTaskCommand)
      .thenThrows(
        IllegalStateError,
        (error) => error.message === "User does not own task",
      );
  });

  test("throws IllegalStateError when state is UnknownTask", () => {
    spec([])
      .when(completeTaskCommand)
      .thenThrows(
        IllegalStateError,
        (error) => error.message === "Task is not active",
      );
  });

  test("throws IllegalStateError when state is CompletedTask", () => {
    spec([
      event<TaskEvent>(
        "TaskAdded",
        {
          taskId,
          title: "title",
          description: "description",
          userId,
          addedOn: addDays(now, -2),
        },
        eventMetadata,
      ),
      event<TaskEvent>(
        "TaskCompleted",
        {
          taskId,
          completedOn: addDays(now, -1),
          userId,
        },
        eventMetadata,
      ),
    ])
      .when(completeTaskCommand)
      .thenThrows(
        IllegalStateError,
        (error) => error.message === "Task is not active",
      );
  });

  test("throws IllegalStateError when state is RemovedTask", () => {
    spec([
      event<TaskEvent>(
        "TaskAdded",
        {
          taskId,
          title: "title",
          description: "description",
          userId,
          addedOn: addDays(now, -2),
        },
        eventMetadata,
      ),
      event<TaskEvent>(
        "TaskRemoved",
        {
          taskId,
          removedOn: addDays(now, -1),
          userId,
        },
        eventMetadata,
      ),
    ])
      .when(completeTaskCommand)
      .thenThrows(
        IllegalStateError,
        (error) => error.message === "Task is not active",
      );
  });
});
