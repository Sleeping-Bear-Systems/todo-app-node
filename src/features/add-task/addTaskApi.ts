import { randomUUID } from "node:crypto";
import {
  IllegalStateError,
  STREAM_DOES_NOT_EXIST,
} from "@event-driven-io/emmett";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import type { AuthenticatedAppVariables } from "#shared/appVariables.ts";
import { type AddTaskCommand, decide, handle } from "./addTaskCommand.ts";

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

  const command: AddTaskCommand = {
    type: "AddTask",
    data: {
      taskId: randomUUID(),
      title: title,
      description: description,
    },
    metadata: {
      now,
      userId,
      correlationId: requestId,
    },
  };
  try {
    await handle(
      eventStore,
      command.data.taskId,
      (state) => decide(command, state),
      {
        expectedStreamVersion: STREAM_DOES_NOT_EXIST,
      },
    );
    return c.json({ requestId, taskId: command.data.taskId }, 200);
  } catch (error) {
    if (error instanceof IllegalStateError) {
      return c.json({ message: error.message }, 400);
    }
    return c.json({ message: "Internal Server Error" }, 500);
  }
});
