import { Hono } from "hono";
import type { AuthenticatedAppVariables } from "#shared/appVariables.js";
import { Page } from "#shared/page.js";

export const homePage = new Hono<{
  Variables: AuthenticatedAppVariables;
}>().get("/", (c) => {
  const username = c.var.account.username;
  return c.html(
    <Page type="authenticated" title="Home">
      <h1>Home</h1>
      <h2>{username}</h2>
      <form method="post" action="/api/logout">
        <button type="submit">Sign out</button>
      </form>
    </Page>,
  );
});
