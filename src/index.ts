import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { pingApi } from "./features/ping/pingApi.js";
import { createAppConfig } from "./shared/appConfig.js";
import type { AppVariables } from "./shared/appVariables.js";
import { createStructuredLogger } from "./shared/structuredLogger.ts";

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
