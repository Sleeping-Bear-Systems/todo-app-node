import { describe, test } from "node:test";
import {
  command,
  DeciderSpecification,
  event,
  IllegalStateError,
} from "@event-driven-io/emmett";
import { addDays } from "date-fns";
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
const eventMetadata = {
  userId,
  correlationId,
  now,
};

describe("AddTask", () => {
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

  test("UnknownTask state uses metadata.now when addedOn is omitted", () => {
    spec([])
      .when(
        command<TaskCommand>(
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

describe("RemoveTask", () => {
  const removeTaskCommand = command<TaskCommand>(
    "RemoveTask",
    { taskId, removedOn: now },
    { now, userId, correlationId },
  );

  test("AddedTask state returns TaskRemoved event", () => {
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

  test("AddedTask state uses metadata.now when removedOn is omitted", () => {
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
      .when(
        command<TaskCommand>(
          "RemoveTask",
          { taskId },
          { now, userId, correlationId },
        ),
      )
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

  test("UnknownTask state throws IllegalStateError", () => {
    spec([])
      .when(removeTaskCommand)
      .thenThrows(
        IllegalStateError,
        (error) => error.message === "State is not AddedTask",
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
      .when(removeTaskCommand)
      .thenThrows(
        IllegalStateError,
        (error) => error.message === "State is not AddedTask",
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
      .when(removeTaskCommand)
      .thenThrows(
        IllegalStateError,
        (error) => error.message === "State is not AddedTask",
      );
  });
});

describe("CompleteTask", () => {
  const completeTaskCommand = command<TaskCommand>(
    "CompleteTask",
    { taskId, completedOn: now },
    { now, userId, correlationId },
  );

  test("AddedTask state returns TaskCompleted event", () => {
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

  test("AddedTask state uses metadata.now when completedOn is omitted", () => {
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
      .when(
        command<TaskCommand>(
          "CompleteTask",
          { taskId },
          { now, userId, correlationId },
        ),
      )
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

  test("UnknownTask state throws IllegalStateError", () => {
    spec([])
      .when(completeTaskCommand)
      .thenThrows(
        IllegalStateError,
        (error) => error.message === "State is not AddedTask",
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
      .when(completeTaskCommand)
      .thenThrows(
        IllegalStateError,
        (error) => error.message === "State is not AddedTask",
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
      .when(completeTaskCommand)
      .thenThrows(
        IllegalStateError,
        (error) => error.message === "State is not AddedTask",
      );
  });
});
