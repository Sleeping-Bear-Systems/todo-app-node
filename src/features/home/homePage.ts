import { Hono } from "hono";
import { html } from "hono/html";
import type { AuthenticatedAppVariables } from "#shared/appVariables.ts";
import { Page } from "#shared/page.ts";

export const homePage = new Hono<{
  Variables: AuthenticatedAppVariables;
}>().get("/", (c) => {
  const username = c.var.account.username;
  const headContent = html`
    <script src="/scripts/full-calendar/index.global.min.js" defer></script>
    <script src="/scripts/full-calendar/home-calendar.js" defer></script>
  `;
  const content = html`
    <h1>Home</h1>
    <div id="home-calendar"></div>
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
