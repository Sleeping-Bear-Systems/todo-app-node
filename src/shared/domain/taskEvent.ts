import type { Event } from "@event-driven-io/emmett";
import type { EventMetadata } from "./eventMetadata.ts";

export type TaskEvent =
  | Event<
      "TaskAdded",
      Readonly<{
        taskId: string;
        title: string;
        description: string;
        addedOn: Date;
        userId: string;
      }>,
      EventMetadata
    >
  | Event<
      "TaskRemoved",
      Readonly<{ taskId: string; removedOn: Date; userId: string }>,
      EventMetadata
    >
  | Event<
      "TaskCompleted",
      Readonly<{ taskId: string; completedOn: Date; userId: string }>,
      EventMetadata
    >;
