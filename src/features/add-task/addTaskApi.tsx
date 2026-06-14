import { Hono } from "hono";
import type { AuthenticatedAppVariables } from "#shared/appVariables.js";

export const addTaskApi = new Hono<{
  Variables: AuthenticatedAppVariables;
}>().post("/", (c) => {
  return c.json({}, 200);
});
