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
import { sseRedirect } from "#shared/datastar.ts";
import { routes } from "#shared/routes.ts";
import { type AddTaskCommand, decide, handle } from "./addTaskCommand.ts";

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
    return sseRedirect(c, routes.HOME_PAGE);
  } catch (error) {
    let errorMessage = "";
    if (error instanceof IllegalStateError) {
      errorMessage = error.message;
    } else {
      errorMessage = "Internal Server Error";
    }
    return c.html(html`<div id="errors">${errorMessage}</div>`);
  }
});
