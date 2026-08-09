import { Hono } from "hono";
import { html } from "hono/html";
import type { AuthenticatedAppVariables } from "#shared/appVariables.ts";
import { Page } from "#shared/page.ts";

export const adminPage = new Hono<{
  Variables: AuthenticatedAppVariables;
}>().get("/", (c) => {
  const username = c.var.account.username;

  const content = html`
      <h1>Admin</h1>
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
