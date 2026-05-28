import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { pingApi } from "./features/ping/pingApi.js";

const apiRoutes = new Hono().route("/ping", pingApi);

const app = new Hono();

app.route("/api", apiRoutes);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
