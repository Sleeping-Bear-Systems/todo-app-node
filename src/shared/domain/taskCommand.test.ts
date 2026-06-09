import { describe, test } from "node:test";
import { command, DeciderSpecification, event } from "@event-driven-io/emmett";
import { addDays } from "date-fns";
import { decide, type TaskCommand } from "./taskCommand.js";
import type { TaskEvent } from "./taskEvent.js";
import { evolve, initialState } from "./taskState.js";

describe("AddTask", () => {
  const spec = DeciderSpecification.for({
    decide,
    evolve,
    initialState,
  });

  const taskId = "3d1b3bf1-33fb-44be-ad48-6850f2c74b20";
  const now = new Date("2026-06-09T00:27:19.000Z");
  const userId = "b8835ccf-58ca-4720-985e-a71168d4e5bc";
  const correlationId = "57c64c56-5034-4918-b9f1-2d56f438b276";
  const eventMetadata = {
    userId,
    correlationId,
    now,
  };

  const addTaskCommand = command<TaskCommand>(
    "AddTask",
    { taskId, title: "title", description: "description", addedOn: now },
    { now, userId, correlationId },
  );

  test("UnknownTask state returns TaskAdded event", () => {
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

  test("AddedTask state returns no events", () => {
    spec([
      event<TaskEvent>(
        "TaskAdded",
        {
          taskId,
          title: "title",
          description: "description",
          userId,
          addedOn: now,
        },
        eventMetadata,
      ),
    ])
      .when(addTaskCommand)
      .then([]);
  });

  test("CompletedTask state returns no events", () => {
    spec([
      event<TaskEvent>(
        "TaskAdded",
        {
          taskId,
          title: "title",
          description: "description",
          userId,
          addedOn: now,
        },
        eventMetadata,
      ),
      event<TaskEvent>(
        "TaskCompleted",
        {
          taskId,
          completedOn: addDays(now, 1),
          userId,
        },
        eventMetadata,
      ),
    ])
      .when(addTaskCommand)
      .then([]);
  });

  test("RemovedTask state returns no events", () => {
    spec([
      event<TaskEvent>(
        "TaskAdded",
        {
          taskId,
          title: "title",
          description: "description",
          userId,
          addedOn: now,
        },
        eventMetadata,
      ),
      event<TaskEvent>(
        "TaskRemoved",
        {
          taskId,
          removedOn: addDays(now, 1),
          userId,
        },
        eventMetadata,
      ),
    ])
      .when(addTaskCommand)
      .then([]);
  });
});
