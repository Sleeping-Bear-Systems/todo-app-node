import { rebuildPostgreSQLProjections } from "@event-driven-io/emmett-postgresql";
import { Hono } from "hono";
import { html } from "hono/html";
import type { AuthenticatedAppVariables } from "#shared/appVariables.ts";
import { isDatastarRequest, sseRedirect } from "#shared/datastar.ts";
import { taskProjection } from "#shared/domain/taskProjection.ts";
import { Page } from "#shared/page.ts";
import { routes } from "#shared/routes.ts";

export const adminPage = new Hono<{
  Variables: AuthenticatedAppVariables;
}>()
  .get("/", (c) => {
    const { username, role } = c.var.account;
    if (role !== "admin") {
      c.redirect(routes.FORBIDDEN_PAGE);
    }

    const content = html`
      <h1>Admin</h1>
      <form data-on:submit="@post('${routes.ADMIN_PAGE}/rebuild-projections', {contentType: 'form'})">
        <button class="icon-button" type="submit" aria-label="Rebuild projections">
          Rebuild Projections
        </button>
      </form>
      <div id="errors"></div>
    `;

    return c.html(
      Page({
        type: "authenticated",
        title: "Admin",
        path: c.req.path,
        children: content,
        username,
        role,
      }),
    );
  })
  .post("/rebuild-projections", async (c) => {
    if (!isDatastarRequest(c)) {
      return c.json({ message: "Datastar request required" }, 400);
    }
    const { role } = c.var.account;
    if (role !== "admin") {
      return sseRedirect(c, routes.FORBIDDEN_PAGE);
    }

    const uri = c.var.appConfig.postgres.uri;
    const logger = c.var.logger;

    try {
      const consumer = rebuildPostgreSQLProjections({
        connectionString: uri,
        projection: taskProjection,
      });
      logger.info("Rebuilding projections");
      await consumer.start();
      logger.info("Projections rebuilt");
      return sseRedirect(c, routes.ADMIN_PAGE);
    } catch (error) {
      logger.error(error);
      return c.html(html`<div id="errors">Internal server error</div>`);
    }
  });
