import { randomUUID } from "node:crypto";
import {
  IllegalStateError,
  STREAM_DOES_NOT_EXIST,
} from "@event-driven-io/emmett";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { html } from "hono/html";
import z from "zod";
import type { AuthenticatedAppVariables } from "#shared/appVariables.ts";
import { isDatastarRequest, sseRedirect } from "#shared/datastar.ts";
import { handle, type TaskCommand } from "#shared/domain/taskCommand.ts";
import { routes } from "#shared/routes.ts";

const addTaskRequestSchema = z.object({
  title: z.string().nonempty(),
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

  const command: TaskCommand = {
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
    await handle(eventStore, command.data.taskId, command, {
      expectedStreamVersion: STREAM_DOES_NOT_EXIST,
    });
    if (isDatastarRequest(c)) {
      return sseRedirect(c, routes.HOME_PAGE);
    }
    return c.json({ requestId, taskId: command.data.taskId });
  } catch (error) {
    let errorMessage = "Internal Server Error";
    if (error instanceof IllegalStateError) {
      errorMessage = error.message;
    }
    if (isDatastarRequest(c)) {
      return c.html(html`<div id="errors">${errorMessage}</div>`);
    }
    if (error instanceof IllegalStateError) {
      return c.json({ message: errorMessage }, 400);
    }
    return c.json({ message: errorMessage }, 500);
  }
});
