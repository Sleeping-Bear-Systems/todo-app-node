import { Hono } from "hono";
import { html } from "hono/html";
import type { AuthenticatedAppVariables } from "#shared/appVariables.js";
import { Page } from "#shared/page.js";

export const aboutPage = new Hono<{
  Variables: AuthenticatedAppVariables;
}>().get("/", (c) => {
  const now = c.var.clock.now();
  const currentYear = now.getFullYear();
  const copyrightYears = currentYear > 2026 ? `2026-${currentYear}` : "2026";
  const content = html`
    <h1>About</h1>
    <img
      src="/images/sleeping_bear_logo.svg"
      alt="Sleeping Bear Systems logo"
      width="200"
      height="200"
    />
    <div>&copy; ${copyrightYears} Sleeping Bear Systems</div>
  `;

  return c.html(
    Page({
      type: "authenticated",
      title: "About",
      path: c.req.path,
      username: c.var.account.username,
      children: content,
    }),
  );
});
