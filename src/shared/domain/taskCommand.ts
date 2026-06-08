import type { Command, Decider } from "@event-driven-io/emmett";
import type { TaskEvent } from "./taskEvent.js";
import { evolve, initialState, type TaskState } from "./taskState.js";

export type CommandMetadata = {
  correlationId: string;
  now: Date;
  userId: string;
};

export type TaskCommand =
  | Command<
      "AddTask",
      {
        taskId: string;
        title: string;
        description: string;
        addedOn: Date;
      },
      CommandMetadata
    >
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
    >;

export function decide(command: TaskCommand, state: TaskState): TaskEvent[] {
  switch (command.type) {
    case "AddTask":
      {
        if (state.status === "UnknownTask") {
          return [
            {
              type: "TaskAdded",
              data: {
                taskId: command.data.taskId,
                title: command.data.title,
                description: command.data.description,
                addedOn: command.data.addedOn,
                userId: command.metadata.userId,
              },
            },
          ];
        }
      }
      break;
    case "RemoveTask":
      {
        if (state.status === "AddedTask") {
          return [
            {
              type: "TaskRemoved",
              data: {
                taskId: command.data.taskId,
                removedOn: command.data.removedOn,
                userId: command.metadata.userId,
              },
            },
          ];
        }
      }
      break;
    case "CompleteTask":
      {
        if (state.status === "AddedTask") {
          return [
            {
              type: "TaskCompleted",
              data: {
                taskId: command.data.taskId,
                completedOn: command.data.completedOn,
                userId: command.metadata.userId,
              },
            },
          ];
        }
      }
      break;
    default: {
      const _unknownCommand: never = command;
      return _unknownCommand;
    }
  }
  return [];
}

export const taskDecider: Decider<TaskState, TaskCommand, TaskEvent> = {
  decide,
  evolve,
  initialState,
};
