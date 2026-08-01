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
};

export function initialState(): TaskDocument {
  return {
    _id: "",
    title: "",
    description: "",
    status: "Unknown",
  };
}

export function evolve(document: TaskDocument, event: TaskEvent): TaskDocument {
  const { data, type } = event;
  switch (document.status) {
    case "Active":
      if (type === "TaskCompleted") {
        return { ...document, status: "Completed" };
      } else if (type === "TaskRemoved") {
        return { ...document, status: "Removed" };
      }
      break;
    case "Unknown":
      if (type === "TaskAdded") {
        return {
          _id: data.taskId,
          title: data.title,
          description: data.description,
          status: "Active",
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

const options: PongoSingleStreamProjectionOptions<TaskDocument, TaskEvent> = {
  collectionName: "tasks",
  canHandle: ["TaskAdded", "TaskRemoved", "TaskCompleted"],
  getDocumentId: (event) => {
    return event.data.taskId;
  },
  initialState,
  evolve,
};

export const taskProjection = pongoSingleStreamProjection(options);
