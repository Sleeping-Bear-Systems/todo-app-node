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
  const { type, data } = event;
  switch (state.status) {
    case "UnknownTask":
      {
        if (type === "TaskAdded") {
          return {
            status: "AddedTask",
            taskId: data.taskId,
            title: data.title,
            description: data.description,
            addedOn: data.addedOn,
            userId: data.userId,
          };
        }
      }
      break;
    case "AddedTask":
      {
        if (type === "TaskRemoved") {
          return {
            status: "RemovedTask",
            taskId: data.taskId,
            removedOn: data.removedOn,
            userId: data.userId,
          };
        } else if (type === "TaskCompleted") {
          return {
            status: "CompletedTask",
            taskId: data.taskId,
            completedOn: data.completedOn,
            userId: data.userId,
          };
        }
      }
      break;
    case "RemovedTask":
      break;
    case "CompletedTask":
      break;
    default: {
      const _unknownState: never = state;
      return _unknownState;
    }
  }
  return state;
}
