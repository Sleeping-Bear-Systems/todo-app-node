import type { TaskEvent } from "./taskEvent.js";

export type TaskState =
  | {
      status: "UnknownTask";
    }
  | {
      status: "AddedTask";
      taskId: string;
      title: string;
      description: string;
      addedOn: Date;
      userId: string;
    }
  | {
      status: "RemovedTask";
      taskId: string;
      removedOn: Date;
      userId: string;
    }
  | {
      status: "CompletedTask";
      taskId: string;
      completedOn: Date;
      userId: string;
    };

export function initialState(): TaskState {
  return {
    status: "UnknownTask",
  };
}

export function evolve(state: TaskState, event: TaskEvent): TaskState {
  switch (state.status) {
    case "UnknownTask":
      {
        if (event.type === "TaskAdded") {
          return {
            status: "AddedTask",
            taskId: event.data.taskId,
            title: event.data.title,
            description: event.data.description,
            addedOn: event.data.addedOn,
            userId: event.data.userId,
          };
        }
      }
      break;
    case "AddedTask":
      {
        if (event.type === "TaskRemoved") {
          return {
            status: "RemovedTask",
            taskId: event.data.taskId,
            removedOn: event.data.removedOn,
            userId: event.data.userId,
          };
        } else if (event.type === "TaskCompleted") {
          return {
            status: "CompletedTask",
            taskId: event.data.taskId,
            completedOn: event.data.completedOn,
            userId: event.data.userId,
          };
        }
      }
      break;
    case "RemovedTask":
      {
      }
      break;
    case "CompletedTask":
      {
      }
      break;
    default: {
      const _unknownState: never = state;
      return _unknownState;
    }
  }
  return state;
}
