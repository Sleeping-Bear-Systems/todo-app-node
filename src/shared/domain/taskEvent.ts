import type { Event } from "@event-driven-io/emmett";

export type EventMetadata = Readonly<{
  userId: string;
  correlationId: string;
  now: Date;
}>;

export type TaskEvent =
  | Event<
      "TaskAdded",
      {
        taskId: string;
        title: string;
        description: string;
        addedOn: Date;
        userId: string;
      },
      EventMetadata
    >
  | Event<
      "TaskRemoved",
      { taskId: string; removedOn: Date; userId: string },
      EventMetadata
    >
  | Event<
      "TaskCompleted",
      { taskId: string; completedOn: Date; userId: string },
      EventMetadata
    >;
