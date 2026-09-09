import { command, IllegalStateError } from "@event-driven-io/emmett";
import { Hono } from "hono";
import { html } from "hono/html";
import type { AuthenticatedAppVariables } from "#shared/appVariables.ts";
import { sseRedirect } from "#shared/datastar.ts";
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
    const { username, role } = c.var.account;
    const headContent = html`
      <script src="/scripts/full-calendar/index.global.min.js" defer></script>
      <script src="/scripts/full-calendar/home-calendar.js" defer></script>
    `;

    const content = html`
      <div>
        <h1>Home</h1>
        <a class="button-link" href="${routes.ADD_TASK_PAGE}">Add Task</a>
        <div id="tasks" data-init="@get('${routes.HOME_PAGE}/get-tasks')"></div>
        <div id="errors"></div>

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
        role,
        headContent,
        children: content,
      }),
    );
  })
  .get("/get-tasks", async (c) => {
    if (!c.var.isDatastarRequest) {
      return c.redirect(routes.ERROR_PAGE, 303);
    }
    const { userId } = c.var.account;
    const readStore = c.var.readStore;

    const tasks = await readStore
      .db()
      .collection<TaskDocument>(tasksCollectionName)
      .find({ userId });

    const content = html`
      <div id="tasks">
        <table class="tasks-grid">
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Added On</th>
            <th></th>
          </tr>
          ${tasks.map(
            (d) => html`
            <tr>
              <td>${d.title}</td>
              <td>${d.description}</td>
              <td><span class="task-status task-status-${d.status.toLowerCase()}">${d.status}</span></td>
              <td>${d.addedOn}</td>
              <td class="task-actions">
                ${
                  d.status === "Active"
                    ? html`
                      <button
                        class="icon-button"
                        aria-label="Complete task"
                        data-on:click="@post('${routes.HOME_PAGE}/complete-task/${d._id}')"
                      >
                        <img
                          class="button-icon"
                          src="/images/Check-Thick--Streamline-Plump.svg"
                          alt=""
                        />
                      </button>
                      <button
                        class="icon-button"
                        aria-label="Remove task"
                        data-on:click="@post('${routes.HOME_PAGE}/remove-task/${d._id}')"
                      >
                        <img
                          class="button-icon"
                          src="/images/Recycle-Bin-2--Streamline-Plump.svg"
                          alt=""
                        />
                      </button>
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
    if (!c.var.isDatastarRequest) {
      return c.redirect(routes.ERROR_PAGE, 303);
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
      await handle(eventStore, taskId, completeTaskCommand);
      return sseRedirect(c, routes.HOME_PAGE);
    } catch (error) {
      logger.error(error);
      if (error instanceof IllegalStateError) {
        return c.html(html`<div id="errors">${error.message}</div>`);
      }
      return c.html(html`<div id="errors">Internal server error</div>`);
    }
  })
  .post("/remove-task/:id", async (c) => {
    if (!c.var.isDatastarRequest) {
      return c.redirect(routes.ERROR_PAGE, 303);
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
      await handle(eventStore, taskId, removeTaskCommand);
      return sseRedirect(c, routes.HOME_PAGE);
    } catch (error) {
      logger.error(error);
      if (error instanceof IllegalStateError) {
        return c.html(html`<div id="errors">${error.message}</div>`);
      }
      return c.html(html`<div id="errors">Internal server error</div>`);
    }
  });
