import { describe, test } from "node:test";
import {
  command,
  DeciderSpecification,
  event,
  IllegalStateError,
} from "@event-driven-io/emmett";
import { addDays } from "date-fns";
import type { TaskEvent } from "#shared/domain/taskEvent.js";
import { evolve, initialState } from "#shared/domain/taskState.js";
import { type AddTaskCommand, addTask } from "./addTaskApi.js";

const spec = DeciderSpecification.for({
  decide: addTask,
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

describe("AddTask", () => {
  const addTaskCommand = command<AddTaskCommand>(
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

  test("UnknownTask state uses metadata.now when addedOn is omitted", () => {
    spec([])
      .when(
        command<AddTaskCommand>(
          "AddTask",
          { taskId, title: "title", description: "description" },
          { now, userId, correlationId },
        ),
      )
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

  test("AddedTask state throws IllegalStateError", () => {
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

  test("CompletedTask state throws IllegalStateError", () => {
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

  test("RemovedTask state throws IllegalStateError", () => {
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
