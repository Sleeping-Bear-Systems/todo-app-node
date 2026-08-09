import {
  type PongoSingleStreamProjectionOptions,
  pongoSingleStreamProjection,
} from "@event-driven-io/emmett-postgresql";
import type { TaskEvent } from "#shared/domain/taskEvent.ts";

export type TaskDocument = {
  _id: string;
  title: string;
  description: string;
  status: "Unknown" | "Active" | "Removed" | "Completed";
  userId: string;
  addedOn: Date;
  completedOn?: Date;
  removedOn?: Date;
};

export function initialState(): TaskDocument {
  return {
    _id: "",
    title: "",
    description: "",
    status: "Unknown",
    userId: "",
    addedOn: new Date(0),
  };
}

export function evolve(document: TaskDocument, event: TaskEvent): TaskDocument {
  const { data, type } = event;
  switch (document.status) {
    case "Active":
      if (type === "TaskCompleted") {
        return {
          ...document,
          status: "Completed",
          completedOn: data.completedOn,
        };
      } else if (type === "TaskRemoved") {
        return { ...document, status: "Removed", removedOn: data.removedOn };
      }
      break;
    case "Unknown":
      if (type === "TaskAdded") {
        return {
          _id: data.taskId,
          title: data.title,
          description: data.description,
          status: "Active",
          userId: data.userId,
          addedOn: data.addedOn,
        };
      }
      break;
    case "Completed":
      break;
    case "Removed":
      break;
    default: {
      const _exhaustive: never = document.status;
      return _exhaustive;
    }
  }
  return document;
}

export const tasksCollectionName: string = "tasks";

const options: PongoSingleStreamProjectionOptions<TaskDocument, TaskEvent> = {
  collectionName: tasksCollectionName,
  canHandle: ["TaskAdded", "TaskRemoved", "TaskCompleted"],
  getDocumentId: (event) => {
    return event.data.taskId;
  },
  initialState,
  evolve,
};

export const taskProjection = pongoSingleStreamProjection(options);
