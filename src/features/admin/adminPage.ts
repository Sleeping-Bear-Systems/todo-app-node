import { rebuildPostgreSQLProjections } from "@event-driven-io/emmett-postgresql";
import { Hono } from "hono";
import { html } from "hono/html";
import type winston from "winston";
import type { AuthenticatedAppVariables } from "#shared/appVariables.ts";
import { sseRedirect } from "#shared/datastar.ts";
import { taskProjection } from "#shared/domain/taskProjection.ts";
import { userProjection } from "#shared/domain/userProjection.ts";
import { Page } from "#shared/page.ts";
import { type Result, toFailure, toSuccess } from "#shared/result.ts";
import { routes } from "#shared/routes.ts";

export const adminPage = new Hono<{
  Variables: AuthenticatedAppVariables;
}>()
  .get("/", (c) => {
    const { username, role } = c.var.account;
    if (role !== "admin") {
      return c.redirect(routes.FORBIDDEN_PAGE);
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
    if (!c.var.isDatastarRequest) {
      return c.redirect(routes.ERROR_PAGE, 303);
    }
    const { role } = c.var.account;
    if (role !== "admin") {
      return sseRedirect(c, routes.FORBIDDEN_PAGE);
    }

    const uri = c.var.appConfig.postgres.uri;
    const logger = c.var.logger;

    try {
      logger.info("Rebuilding projections");
      await rebuildTaskProjections(uri, logger);
      await rebuildUserProjections(uri, logger);
      logger.info("Projections rebuilt");
      return sseRedirect(c, routes.ADMIN_PAGE);
    } catch (error) {
      logger.error(error);
      return c.html(html`<div id="errors">Internal server error</div>`);
    }
  });

async function rebuildTaskProjections(
  uri: string,
  logger: Logger,
): Promise<Result> {
  try {
    const consumer = rebuildPostgreSQLProjections({
      connectionString: uri,
      projection: taskProjection,
    });
    await consumer.start();
    return toSuccess("Users", undefined);
  } catch (error) {
    logger.error(error);
    const message =
      error instanceof Error ? error.message : "An error occurred";
    return toFailure("Users", message);
  }
}

async function rebuildUserProjections(
  uri: string,
  logger: winston.Logger,
): Promise<Result> {
  try {
    const consumer = rebuildPostgreSQLProjections({
      connectionString: uri,
      projection: userProjection,
    });
    await consumer.start();
    return toSuccess("Tasks", undefined);
  } catch (error) {
    logger.error(error);
    const message =
      error instanceof Error ? error.message : "An error occurred";
    return toFailure("Tasks", message);
  }
}
