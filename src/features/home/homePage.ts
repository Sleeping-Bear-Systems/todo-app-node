import { command, type HandleOptions } from "@event-driven-io/emmett";
import { Hono } from "hono";
import { html } from "hono/html";
import type { AuthenticatedAppVariables } from "#shared/appVariables.ts";
import { isDatastarRequest, sseRedirect } from "#shared/datastar.ts";
import { handle, type TaskCommand } from "#shared/domain/taskCommand.ts";
import {
  type TaskDocument,
  tasksCollectionName,
} from "#shared/domain/taskProjection.ts";
import { Page } from "#shared/page.ts";
import { routes } from "#shared/routes.ts";

export const homePage = new Hono<{
  Variables: AuthenticatedAppVariables;
}>()
  .get("/", async (c) => {
    const { username } = c.var.account;
    const headContent = html`
      <script src="/scripts/full-calendar/index.global.min.js" defer></script>
      <script src="/scripts/full-calendar/home-calendar.js" defer></script>
    `;

    const content = html`
      <div>
        <h1>Home</h1>
        <a class="button-link" href="${routes.ADD_TASK_PAGE}">Add Task</a>
        <div id="tasks" data-init="@get('${routes.HOME_PAGE}/get-tasks')"></div>

        <div hidden>
          <div id="home-calendar"></div>
        </div>
      </div>
    `;

    return c.html(
      Page({
        type: "authenticated",
        title: "Home",
        path: c.req.path,
        username,
        headContent,
        children: content,
      }),
    );
  })
  .get("/get-tasks", async (c) => {
    if (!isDatastarRequest(c)) {
      return c.json({ message: "Datastar request required" }, 400);
    }
    const { userId } = c.var.account;
    const readStore = c.var.readStore;

    const tasks = await readStore
      .db()
      .collection<TaskDocument>(tasksCollectionName)
      .find({ userId });

    const content = html`
      <div id="tasks">
        <table>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
          ${tasks.map(
            (d) => html`
            <tr>
              <td>${d.title}</td>
              <td>${d.description}</td>
              <td>${d.status}</td>
              <td>
                ${
                  d.status === "Active"
                    ? html`
                      <form data-on:submit="@post('${routes.HOME_PAGE}/complete-task/${d._id}', {contentType: 'form'})">
                        <button type="submit">Complete</button>
                      </form>
                      <form data-on:submit="@post('${routes.HOME_PAGE}/remove-task/${d._id}', {contentType: 'form'})">
                        <button type="submit">Remove</button>
                      </form>
                    `
                    : html``
                }
              </td>
            </tr>`,
          )}
        </table>
      </div>
      `;
    return c.html(content);
  })
  .post("/complete-task/:id", async (c) => {
    // check Datastar request
    if (!isDatastarRequest(c)) {
      return c.json({ message: "Datastar request required" }, 400);
    }

    const taskId = c.req.param("id");
    const userId = c.var.account.userId;
    const requestId = c.var.requestId;
    const now = c.var.clock.now();
    const logger = c.var.logger;
    const eventStore = c.var.eventStore;

    const completeTaskCommand: TaskCommand = command<TaskCommand>(
      "CompleteTask",
      {
        taskId,
        completedOn: now,
      },
      {
        now,
        correlationId: requestId,
        userId,
      },
    );
    try {
      await handle(eventStore, taskId, completeTaskCommand, {});
      return sseRedirect(c, routes.HOME_PAGE);
    } catch (error) {
      logger.error(error);
      return c.json({ message: "Internal server error" }, 500);
    }
  })
  .post("/remove-task/:id", async (c) => {
    // check Datastar request
    if (!isDatastarRequest(c)) {
      return c.json({ message: "Datastar request required" }, 400);
    }

    const taskId = c.req.param("id");
    const userId = c.var.account.userId;
    const requestId = c.var.requestId;
    const now = c.var.clock.now();
    const logger = c.var.logger;
    const eventStore = c.var.eventStore;

    const removeTaskCommand: TaskCommand = command<TaskCommand>(
      "RemoveTask",
      {
        taskId,
        removedOn: now,
      },
      {
        now,
        correlationId: requestId,
        userId,
      },
    );
    try {
      await handle(eventStore, taskId, removeTaskCommand, {});
      return sseRedirect(c, routes.HOME_PAGE);
    } catch (error) {
      logger.error(error);
      return c.json({ message: "Internal server error" }, 500);
    }
  });
