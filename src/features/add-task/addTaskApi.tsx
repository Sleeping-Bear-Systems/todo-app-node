import { randomUUID } from "node:crypto";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import type { AuthenticatedAppVariables } from "#shared/appVariables.js";
import { decide, type TaskCommand } from "#shared/domain/taskCommand.js";
import { initialState } from "#shared/domain/taskState.js";

const addTaskRequestSchema = z.object({
  title: z.string(),
  description: z.string().optional().default(""),
});

export type addTaskRequest = z.infer<typeof addTaskRequestSchema>;

export const addTaskApi = new Hono<{
  Variables: AuthenticatedAppVariables;
}>().post("/", zValidator("form", addTaskRequestSchema), (c) => {
  const requestId = c.var.requestId;
  const userId = c.var.account.userId;
  const now = c.var.clock.now();
  const request = c.req.valid("form");

  var command: TaskCommand = {
    type: "AddTask",
    data: {
      taskId: randomUUID(),
      title: request.title,
      description: request.description,
    },
    metadata: {
      now,
      userId,
      correlationId: requestId,
    },
  };
  const state = initialState();
  var events = decide(command, state);
  return c.json({ requestId, events }, 200);
});
