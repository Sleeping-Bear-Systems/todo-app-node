import {
  type Command,
  type Decider,
  event,
  IllegalStateError,
} from "@event-driven-io/emmett";
import type { TaskEvent } from "./taskEvent.js";
import { evolve, initialState, type TaskState } from "./taskState.js";

export type CommandMetadata = Readonly<{
  correlationId: string;
  now: Date;
  userId: string;
}>;

export type TaskCommand =
  | Command<
      "AddTask",
      {
        taskId: string;
        title: string;
        description: string;
        addedOn?: Date;
      },
      CommandMetadata
    >
  | Command<
      "RemoveTask",
      {
        taskId: string;
        removedOn?: Date;
      },
      CommandMetadata
    >
  | Command<
      "CompleteTask",
      {
        taskId: string;
        completedOn?: Date;
      },
      CommandMetadata
    >;

export function decide(command: TaskCommand, state: TaskState): TaskEvent[] {
  const { type, data, metadata } = command;
  switch (type) {
    case "AddTask": {
      if (state.status !== "UnknownTask") {
        throw new IllegalStateError("State is not UnknownTask");
      }
      return [
        event<TaskEvent>(
          "TaskAdded",
          {
            taskId: data.taskId,
            title: data.title,
            description: data.description,
            addedOn: data.addedOn ?? metadata.now,
            userId: metadata.userId,
          },
          {
            userId: metadata.userId,
            correlationId: metadata.correlationId,
            now: metadata.now,
          },
        ),
      ];
    }
    case "RemoveTask": {
      if (state.status !== "AddedTask") {
        throw new IllegalStateError("State is not AddedTask");
      }
      return [
        event<TaskEvent>(
          "TaskRemoved",
          {
            taskId: data.taskId,
            removedOn: data.removedOn ?? metadata.now,
            userId: metadata.userId,
          },
          {
            userId: metadata.userId,
            correlationId: metadata.correlationId,
            now: metadata.now,
          },
        ),
      ];
    }
    case "CompleteTask": {
      if (state.status !== "AddedTask") {
        throw new IllegalStateError("State is not AddedTask");
      }
      return [
        event<TaskEvent>(
          "TaskCompleted",
          {
            taskId: data.taskId,
            completedOn: data.completedOn ?? metadata.now,
            userId: metadata.userId,
          },
          {
            userId: metadata.userId,
            correlationId: metadata.correlationId,
            now: metadata.now,
          },
        ),
      ];
    }
    default: {
      const _unknownCommand: never = command;
      return _unknownCommand;
    }
  }
}

export const taskDecider: Decider<TaskState, TaskCommand, TaskEvent> = {
  decide,
  evolve,
  initialState,
};
