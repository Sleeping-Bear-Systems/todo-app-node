import { randomUUID } from "node:crypto";
import { STREAM_DOES_NOT_EXIST } from "@event-driven-io/emmett";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { html } from "hono/html";
import z from "zod";
import type { AuthenticatedAppVariables } from "#shared/appVariables.ts";
import { isDatastarRequest, sseRedirect } from "#shared/datastar.ts";
import { handle, type TaskCommand } from "#shared/domain/taskCommand.ts";
import { Page } from "#shared/page.ts";
import { routes } from "#shared/routes.ts";

const addTaskRequestSchema = z.object({
  title: z.string().nonempty(),
  description: z.string().default(""),
});

export const addTaskPage = new Hono<{
  Variables: AuthenticatedAppVariables;
}>()
  .get("/", (c) => {
    const username = c.var.account.username;

    const content = html`
      <h1>Add Task</h1>
      <form
        id="add-task-form"
        data-on:submit="@post('${routes.ADD_TASK_PAGE}', {contentType: 'form'})"
      >
        <div>
          <label for="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            required
          />
        </div>
        <div>
          <label for="description">Description</label>
          <input
            id="description"
            name="description"
            type="text"
          />
        </div>
        <button type="submit">Add</button>
      </form>
      <div id="errors"></div>`;

    return c.html(
      Page({
        type: "authenticated",
        title: "Add Task",
        path: c.req.path,
        children: content,
        username,
      }),
    );
  })
  .post("/", zValidator("form", addTaskRequestSchema), async (c) => {
    if (!isDatastarRequest(c)) {
      return c.json(400);
    }

    const requestId = c.var.requestId;
    const userId = c.var.account.userId;
    const now = c.var.clock.now();
    const eventStore = c.var.eventStore;
    const logger = c.var.logger;
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
      return sseRedirect(c, routes.HOME_PAGE);
    } catch (error) {
      logger.error(error);
      return c.html(html`<div id="errors">Internal server error</div>`);
    }
  });
