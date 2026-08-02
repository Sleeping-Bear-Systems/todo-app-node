import { Hono } from "hono";
import { html } from "hono/html";
import type { AuthenticatedAppVariables } from "#shared/appVariables.ts";
import {
  type TaskDocument,
  tasksCollectionName,
} from "#shared/domain/taskProjection.ts";
import { Page } from "#shared/page.ts";
import { routes } from "#shared/routes.ts";

export const homePage = new Hono<{
  Variables: AuthenticatedAppVariables;
}>().get("/", async (c) => {
  const { username, userId } = c.var.account;
  const headContent = html`
    <script src="/scripts/full-calendar/index.global.min.js" defer></script>
    <script src="/scripts/full-calendar/home-calendar.js" defer></script>
  `;
  const readStore = c.var.readStore;

  const tasks = await readStore
    .db()
    .collection<TaskDocument>(tasksCollectionName)
    .find({ userId });

  const content = html`
    <h1>Home</h1>
    <a class="button-link" href="${routes.ADD_TASK_PAGE}">Add Task</a>
    <table>
      <tr>
        <th>Title</th>
        <th>Description</th>
        <th>Status</th>
      </tr>
      ${tasks.map(
        (d) => html`
        <tr>
          <td>${d.title}</td>
          <td>${d.description}</td>
          <td>${d.status}</td>
        </tr>`,
      )}
    </table>

    <div hidden>
      <div id="home-calendar"></div>
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
});
