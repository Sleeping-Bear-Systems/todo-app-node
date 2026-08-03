import {
  type Command,
  DeciderCommandHandler,
  event,
  IllegalStateError,
} from "@event-driven-io/emmett";
import type { TaskEvent } from "./taskEvent.ts";
import { evolve, initialState, type TaskState } from "./taskState.ts";

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
    >
  | Command<
      "AddTask",
      {
        taskId: string;
        title: string;
        description: string;
        addedOn?: Date;
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
            taskId: command.data.taskId,
            title: command.data.title,
            description: command.data.description,
            addedOn: command.data.addedOn ?? command.metadata.now,
            userId: command.metadata.userId,
          },
          {
            userId: command.metadata.userId,
            correlationId: command.metadata.correlationId,
            now: command.metadata.now,
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
      const _exhaustive: never = command;
      return _exhaustive;
    }
  }
}

export const handle = DeciderCommandHandler<
  TaskState,
  TaskCommand,
  TaskEvent,
  TaskEvent
>({
  evolve,
  initialState,
  decide,
  mapToStreamId: (id: string): string => `task-${id}`,
});
