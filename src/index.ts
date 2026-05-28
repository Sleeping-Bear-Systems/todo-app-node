import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { pingApi } from "./features/ping/pingApi.js";
import { createAppConfig } from "./shared/appConfig.js";

const appConfig = createAppConfig(process.env);

const apiRoutes = new Hono().route("/ping", pingApi);

const app = new Hono();

app.route("/api", apiRoutes);

serve(
  {
    fetch: app.fetch,
    port: appConfig.port,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
