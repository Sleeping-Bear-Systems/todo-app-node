import { randomUUID } from "node:crypto";
import {
  type Command,
  CommandHandler,
  event,
  IllegalStateError,
} from "@event-driven-io/emmett";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import type { AuthenticatedAppVariables } from "#shared/appVariables.js";
import type { CommandMetadata } from "#shared/domain/taskCommand.js";
import type { TaskEvent } from "#shared/domain/taskEvent.js";
import {
  evolve,
  initialState,
  type TaskState,
} from "#shared/domain/taskState.js";

const handle = CommandHandler({
  evolve,
  initialState,
  mapToStreamId: (id) => `task-${id}`,
});

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

export function addTask(
  command: AddTaskCommand,
  state: TaskState,
): TaskEvent[] {
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

const addTaskRequestSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
});

export const addTaskApi = new Hono<{
  Variables: AuthenticatedAppVariables;
}>().post("/", zValidator("form", addTaskRequestSchema), async (c) => {
  const requestId = c.var.requestId;
  const userId = c.var.account.userId;
  const now = c.var.clock.now();
  const eventStore = c.var.eventStore;
  const { title, description } = c.req.valid("form");

  const taskId = randomUUID();
  const command: AddTaskCommand = {
    type: "AddTask",
    data: {
      taskId,
      title: title,
      description: description,
    },
    metadata: {
      now,
      userId,
      correlationId: requestId,
    },
  };
  await handle(eventStore, taskId, (state) => addTask(command, state), {
    expectedStreamVersion: "no_stream",
  });
  return c.json({ requestId }, 200);
});
