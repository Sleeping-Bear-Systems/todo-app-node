import { Hono } from "hono";
import type { AuthenticatedAppVariables } from "#shared/appVariables.ts";

export const completeTaskApi = new Hono<{
  Variables: AuthenticatedAppVariables;
}>().post("/:id", (c) => {
  const requestId = c.var.requestId;
  const userId = c.var.account.userId;
  const now = c.var.clock.now();

  return c.json({ requestId, userId, now }, 200);
});
