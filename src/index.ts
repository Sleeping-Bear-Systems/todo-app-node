import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { type Context, Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { jwt } from "hono/jwt";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import z from "zod";
import { aboutPage } from "#features/about/aboutPage.js";
import { addTaskApi } from "#features/add-task/addTaskApi.js";
import { homePage } from "#features/home/homePage.js";
import { loginApi } from "#features/login/loginApi.js";
import { loginPage } from "#features/login/loginPage.js";
import { logoutApi } from "#features/login/logoutApi.js";
import { createMockUsers } from "#features/login/user.js";
import { pingApi } from "#features/ping/pingApi.js";
import { createAppConfig } from "#shared/appConfig.js";
import type {
  AppVariables,
  AuthenticatedAppVariables,
} from "#shared/appVariables.js";
import { systemClock } from "#shared/clock.js";
import { routes } from "#shared/routes.js";
import { createStructuredLogger } from "#shared/structuredLogger.js";

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
});

async function validateJwt(c: Context) {
  await appJwt(c, async () => {});
  const jwtPayload = jwtPayloadSchema.parse(c.var.jwtPayload);
  c.set("account", {
    userId: jwtPayload.sub,
    username: jwtPayload.preferred_username,
  });
}

// create mock users
createMockUsers();

// map API routes
const apiRoutes = new Hono<{ Variables: AppVariables }>()
  .route("/ping", pingApi)
  .route("/login", loginApi)
  .route("/logout", logoutApi);

// map authenticated API route
const authenticatedApiRoutes = new Hono<{
  Variables: AuthenticatedAppVariables;
}>()
  .use("/*", async (c, next) => {
    await validateJwt(c);
    await next();
    return;
  })
  .route("/add-task", addTaskApi);

// map page routes
const pageRoutes = new Hono<{ Variables: AppVariables }>().route(
  "/login",
  loginPage,
);

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
  .route("/home", homePage);

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
