import type { Event } from "@event-driven-io/emmett";

export type TaskEvent =
  | Event<
      "TaskAdded",
      {
        taskId: string;
        title: string;
        description: string;
        addedOn: Date;
        userId: string;
      }
    >
  | Event<"TaskRemoved", { taskId: string; removedOn: Date; userId: string }>
  | Event<
      "TaskCompleted",
      { taskId: string; completedOn: Date; userId: string }
    >;
