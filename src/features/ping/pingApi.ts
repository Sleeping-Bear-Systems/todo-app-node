import { Hono } from "hono";

export const pingApi = new Hono().get("/", (c) => {
  return c.json({ message: "ok" }, 200);
});
