import { pingApi } from "@features/ping/pingApi.js";
import { serve } from "@hono/node-server";
import { createAppConfig } from "@shared/appConfig.js";
import type { AppVariables } from "@shared/appVariables.js";
import { systemClock } from "@shared/clock.js";
import { createStructuredLogger } from "@shared/structuredLogger.js";
import { Hono } from "hono";

const appConfig = createAppConfig(process.env);
const logger = createStructuredLogger(appConfig);

const apiRoutes = new Hono<{ Variables: AppVariables }>().route(
  "/ping",
  pingApi,
);

const app = new Hono<{ Variables: AppVariables }>();

// add services
app.use("*", async (c, next) => {
  c.set("appConfig", appConfig);
  c.set("logger", logger);
  c.set("clock", systemClock);
  await next();
});

// add routes
app.route("/api", apiRoutes);

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
