import { inlineProjections } from "@event-driven-io/emmett";
import { getPostgreSQLEventStore } from "@event-driven-io/emmett-postgresql";
import { pongoClient } from "@event-driven-io/pongo";
import { pgDriver } from "@event-driven-io/pongo/pg";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { type Context, Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { jwt } from "hono/jwt";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import z from "zod";
import { aboutPage } from "#features/about/aboutPage.ts";
import { addTaskPage } from "#features/add-task/addTaskPage.ts";
import { adminPage } from "#features/admin/adminPage.ts";
import { forbiddenPage } from "#features/admin/forbiddenPage.ts";
import { homePage } from "#features/home/homePage.ts";
import { loginPage } from "#features/login/loginPage.ts";
import { logoutApi } from "#features/login/logoutApi.ts";
import { createMockUsers } from "#features/login/user.ts";
import { pingApi } from "#features/ping/pingApi.ts";
import { toRole } from "#shared/account.ts";
import { createAppConfig } from "#shared/appConfig.ts";
import type {
  AppVariables,
  AuthenticatedAppVariables,
} from "#shared/appVariables.ts";
import { systemClock } from "#shared/clock.ts";
import { taskProjection } from "#shared/domain/taskProjection.ts";
import { routes } from "#shared/routes.ts";
import { createStructuredLogger } from "#shared/structuredLogger.ts";

const appConfig = createAppConfig(process.env);
const logger = createStructuredLogger(appConfig);

const appJwt = jwt({
  secret: appConfig.jwt.secretKey,
  alg: "HS256",
  cookie: appConfig.jwt.cookieName,
});

const jwtPayloadSchema = z.object({
  sub: z.string(),
  preferred_username: z.string(),
  role: z.string(),
});

async function validateJwt(
  c: Context<{ Variables: AuthenticatedAppVariables }>,
) {
  await appJwt(c, async () => {});
  const jwtPayload = jwtPayloadSchema.parse(c.var.jwtPayload);
  c.set("account", {
    userId: jwtPayload.sub,
    username: jwtPayload.preferred_username,
    role: toRole(jwtPayload.role),
  });
}

// create mock users
createMockUsers();

// create event store
const eventStore = getPostgreSQLEventStore(appConfig.postgres.uri, {
  projections: inlineProjections([taskProjection]),
});

// create read store
const readStore = pongoClient({
  driver: pgDriver,
  connectionString: appConfig.postgres.uri,
});

// map API routes
const apiRoutes = new Hono<{ Variables: AppVariables }>()
  .route("/logout", logoutApi)
  .route("/ping", pingApi);

// map authenticated API route
const authenticatedApiRoutes = new Hono<{
  Variables: AuthenticatedAppVariables;
}>().use("/*", async (c, next) => {
  try {
    await validateJwt(c);
  } catch {
    return c.json({ message: "Unauthorized" }, 401);
  }
  await next();
  return;
});

// map page routes
const pageRoutes = new Hono<{ Variables: AppVariables }>()
  .route("/login", loginPage)
  .route("/forbidden", forbiddenPage);

// map authenticated page routes
const authenticatedPageRoutes = new Hono<{
  Variables: AuthenticatedAppVariables;
}>()
  .use("/*", async (c, next) => {
    try {
      await validateJwt(c);
    } catch {
      return c.redirect(routes.LOGIN_PAGE);
    }
    await next();
    return;
  })
  .route("/about", aboutPage)
  .route("/add-task", addTaskPage)
  .route("/home", homePage)
  .route("/admin", adminPage);

// create application
const app = new Hono<{ Variables: AppVariables }>();

// add security middlewares
app.use(secureHeaders());
app.use("/api/*", cors()); // TODO: add allowlist
app.use(csrf());

// add request ID middleware
app.use(requestId());

// add services
app.use("*", async (c, next) => {
  c.set("appConfig", appConfig);
  c.set("logger", logger);
  c.set("clock", systemClock);
  c.set("eventStore", eventStore);
  c.set("readStore", readStore);
  await next();
});

// serve static assets
app.use("/*", serveStatic({ root: "./public" }));

// add routes
app.route("/api/auth", authenticatedApiRoutes);
app.route("/api", apiRoutes);
app.route("/auth", authenticatedPageRoutes);
app.route("/", pageRoutes);
app.get("/", (c) => {
  return c.redirect(routes.HOME_PAGE);
});

// run application
serve(
  {
    fetch: app.fetch,
    port: appConfig.port,
  },
  (info) => {
    logger.info(`Server is running on http://localhost:${info.port}`);
  },
);
