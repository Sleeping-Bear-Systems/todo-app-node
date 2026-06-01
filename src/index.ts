import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { secureHeaders } from "hono/secure-headers";
import { aboutPage } from "#features/about/aboutPage.js";
import { loginApi } from "#features/login/loginApi.js";
import { loginPage } from "#features/login/loginPage.js";
import { logoutApi } from "#features/login/logoutApi.js";
import { getOrCreateUser } from "#features/login/user.js";
import { pingApi } from "#features/ping/pingApi.js";
import { createAppConfig } from "#shared/appConfig.js";
import type { AppVariables } from "#shared/appVariables.js";
import { systemClock } from "#shared/clock.js";
import { createStructuredLogger } from "#shared/structuredLogger.js";

const appConfig = createAppConfig(process.env);
const logger = createStructuredLogger(appConfig);

// create mock admin user
getOrCreateUser("admin", "password1234", "admin");

// map API routes
const apiRoutes = new Hono<{ Variables: AppVariables }>()
  .route("/ping", pingApi)
  .route("/login", loginApi)
  .route("/logout", logoutApi);

// map page routes
const pageRoutes = new Hono<{ Variables: AppVariables }>()
  .route("/about", aboutPage)
  .route("/login", loginPage);

// create application
const app = new Hono<{ Variables: AppVariables }>();

// add security middlewares
app.use(secureHeaders());
app.use("/api/*", cors()); // TODO: add allowlist
app.use(csrf());

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
app.route("/api", apiRoutes);
app.route("/", pageRoutes);
app.get("/", (c) => {
  return c.redirect("/about");
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
