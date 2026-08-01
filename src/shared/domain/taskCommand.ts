import {
  type Command,
  event,
  IllegalStateError,
} from "@event-driven-io/emmett";
import type { TaskEvent } from "./taskEvent.ts";
import type { TaskState } from "./taskState.ts";

export type CommandMetadata = Readonly<{
  correlationId: string;
  now: Date;
  userId: string;
}>;

export type TaskCommand =
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
      const _exhaustive: never = command;
      throw new Error(`Unhandled TaskCommand type: ${_exhaustive}`);
    }
  }
}
