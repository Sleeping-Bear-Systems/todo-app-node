import { Hono } from "hono";
import { html } from "hono/html";
import type { AuthenticatedAppVariables } from "#shared/appVariables.ts";
import { Page } from "#shared/page.ts";
import { routes } from "#shared/routes.ts";

export const addTaskPage = new Hono<{
  Variables: AuthenticatedAppVariables;
}>().get("/", (c) => {
  const username = c.var.account.username;

  const content = html`
  <h1>Add Task</h1>
  <form
    id="add-task-form"
    data-on:submit="@post('${routes.ADD_TASK_API}', {contentType: 'form'})"
  >
    <div>
      <label for="title">Title</label>
      <input
        id="title"
        name="title"
        type="text"
        required
        autoComplete="Title"
      >
      </input>
    </div>
    <div>
      <label for="description">Description</label>
      <input
        id="description"
        name="description"
        type="text"
      >
      </input>
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
});
