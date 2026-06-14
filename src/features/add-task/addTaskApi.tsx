import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import type { AuthenticatedAppVariables } from "#shared/appVariables.js";

const addTaskRequestSchema = z.object({
  title: z.string(),
  description: z.string().optional().default(""),
});

export type addTaskRequest = z.infer<typeof addTaskRequestSchema>;

export const addTaskApi = new Hono<{
  Variables: AuthenticatedAppVariables;
}>().post("/", zValidator("form", addTaskRequestSchema), (c) => {
  return c.json({}, 200);
});
