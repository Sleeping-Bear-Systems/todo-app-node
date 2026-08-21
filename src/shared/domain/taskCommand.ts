import {
  type Command,
  DeciderCommandHandler,
  event,
  skipOn,
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
      {
        taskId: string;
        removedOn: Date;
      },
      CommandMetadata
    >
  | Command<
      "CompleteTask",
      {
        taskId: string;
        completedOn: Date;
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

export function decide(
  command: TaskCommand,
  state: TaskState,
): TaskEvent | TaskEvent[] {
  const { type, data, metadata } = command;
  const eventMetadata = toEventMetadata(metadata);
  switch (type) {
    case "AddTask": {
      if (state.status !== "UnknownTask") {
        return [
          event<TaskEvent>(
            "TaskExists",
            { taskId: data.taskId },
            eventMetadata,
          ),
        ];
      }
      return event<TaskEvent>(
        "TaskAdded",
        {
          taskId: data.taskId,
          title: data.title,
          description: data.description,
          addedOn: data.addedOn ?? metadata.now,
          userId: metadata.userId,
        },
        eventMetadata,
      );
    }
    case "RemoveTask": {
      if (state.status !== "AddedTask") {
        return event<TaskEvent>(
          "TaskIsNotActive",
          { taskId: data.taskId },
          eventMetadata,
        );
      }
      if (state.userId !== metadata.userId) {
        return event<TaskEvent>(
          "UserDoesNotOwnTask",
          { taskId: data.taskId },
          eventMetadata,
        );
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
        return event<TaskEvent>(
          "TaskIsNotActive",
          { taskId: data.taskId },
          eventMetadata,
        );
      }
      if (state.userId !== metadata.userId) {
        return event<TaskEvent>(
          "UserDoesNotOwnTask",
          { taskId: data.taskId },
          eventMetadata,
        );
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
  middleware: [
    skipOn((event) => {
      switch (event.type) {
        case "TaskExists":
        case "TaskIsNotActive":
        case "UserDoesNotOwnTask":
          return true;
        default:
          return false;
      }
    }),
  ],
});
