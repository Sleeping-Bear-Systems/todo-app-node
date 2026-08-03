import {
  type Command,
  CommandHandler,
  type Decider,
  event,
  IllegalStateError,
} from "@event-driven-io/emmett";
import {
  type CommandMetadata,
  mapToStreamId,
} from "#shared/domain/taskCommand.ts";
import type { TaskEvent } from "#shared/domain/taskEvent.ts";
import {
  evolve,
  initialState,
  type TaskState,
} from "#shared/domain/taskState.ts";

export type AddTaskCommand = Command<
  "AddTask",
  {
    taskId: string;
    title: string;
    description: string;
    addedOn?: Date;
  },
  CommandMetadata
>;

export function decide(command: AddTaskCommand, state: TaskState): TaskEvent[] {
  if (state.status !== "UnknownTask") {
    throw new IllegalStateError("State is not UnknownTask");
  }
  return [
    event<TaskEvent>(
      "TaskAdded",
      {
        taskId: command.data.taskId,
        title: command.data.title,
        description: command.data.description,
        addedOn: command.data.addedOn ?? command.metadata.now,
        userId: command.metadata.userId,
      },
      {
        userId: command.metadata.userId,
        correlationId: command.metadata.correlationId,
        now: command.metadata.now,
      },
    ),
  ];
}

const addTaskDecider: Decider<TaskState, AddTaskCommand, TaskEvent> = {
  evolve,
  initialState,
  decide,
};

export const handle = CommandHandler({
  ...addTaskDecider,
  mapToStreamId,
});
