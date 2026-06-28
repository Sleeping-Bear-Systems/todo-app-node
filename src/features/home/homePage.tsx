import { Hono } from "hono";
import type { AuthenticatedAppVariables } from "#shared/appVariables.js";
import { Page } from "#shared/page.js";

export const homePage = new Hono<{
  Variables: AuthenticatedAppVariables;
}>().get("/", (c) => {
  const username = c.var.account.username;
  return c.html(
    <Page
      type="authenticated"
      title="Home"
      path={c.req.path}
      username={username}
      headContent={
        <>
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.19/index.global.min.css"
          />
          <script
            src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.19/index.global.min.js"
            defer
          />
          <script src="/scripts/homeCalendar.js" defer />
        </>
      }
    >
      <h1>Home</h1>
      <div id="home-calendar" />
    </Page>,
  );
});
