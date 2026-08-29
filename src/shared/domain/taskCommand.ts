import {
  type Command,
  DeciderCommandHandler,
  event,
  IllegalStateError,
} from "@event-driven-io/emmett";
import { type CommandMetadata, toEventMetadata } from "./commandMetadata.ts";
import type { TaskEvent } from "./taskEvent.ts";
import { evolve, initialState, type TaskState } from "./taskState.ts";

/**
 * Task commands.
 */
export type TaskCommand =
  | Command<
      "RemoveTask",
      Readonly<{
        taskId: string;
        removedOn: Date;
      }>,
      CommandMetadata
    >
  | Command<
      "CompleteTask",
      Readonly<{
        taskId: string;
        completedOn: Date;
      }>,
      CommandMetadata
    >
  | Command<
      "AddTask",
      Readonly<{
        taskId: string;
        title: string;
        description: string;
        addedOn: Date;
      }>,
      CommandMetadata
    >;

export function decide(
  command: TaskCommand,
  state: TaskState,
): TaskEvent | TaskEvent[] {
  const { type, data, metadata } = command;
  const eventMetadata = toEventMetadata(metadata);
  switch (type) {
    case "AddTask": {
      if (state.status !== "UnknownTask") {
        throw new IllegalStateError("State is not UnknownTask");
      }
      return event<TaskEvent>(
        "TaskAdded",
        {
          taskId: data.taskId,
          title: data.title,
          description: data.description,
          addedOn: data.addedOn,
          userId: metadata.userId,
        },
        eventMetadata,
      );
    }
    case "RemoveTask": {
      if (state.status !== "AddedTask") {
        throw new IllegalStateError("Task is not active");
      }
      if (state.userId !== metadata.userId) {
        throw new IllegalStateError("User does not own task");
      }
      return event<TaskEvent>(
        "TaskRemoved",
        {
          taskId: data.taskId,
          removedOn: data.removedOn,
          userId: metadata.userId,
        },
        eventMetadata,
      );
    }
    case "CompleteTask": {
      if (state.status !== "AddedTask") {
        throw new IllegalStateError("Task is not active");
      }
      if (state.userId !== metadata.userId) {
        throw new IllegalStateError("User does not own task");
      }
      return event<TaskEvent>(
        "TaskCompleted",
        {
          taskId: data.taskId,
          completedOn: data.completedOn,
          userId: metadata.userId,
        },
        eventMetadata,
      );
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
