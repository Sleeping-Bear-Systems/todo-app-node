import { zValidator } from "@hono/zod-validator";
import { addDays } from "date-fns";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import z from "zod";
import type { AppVariables } from "#shared/appVariables.js";
import { sseRedirect } from "#shared/datastar.js";
import { routes } from "#shared/routes.js";
import { verifyUser } from "./user.js";

const loginRequestSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
});

export const loginApi = new Hono<{ Variables: AppVariables }>().post(
  "/",
  zValidator("form", loginRequestSchema),
  async (c) => {
    const now = c.var.clock.now();
    const appConfig = c.var.appConfig;
    const { username, password } = c.req.valid("form");
    const user = verifyUser(username, password);
    if (user === undefined) {
      return c.html(<div id="errors">Invalid Credentials</div>);
    }
    const payload = {
      sub: user.id,
      preferred_username: user.username,
      role: user.role,
      iss: "todo-app-node",
      exp: Math.floor(addDays(now, 1).getTime() / 1000),
      iat: Math.floor(now.getTime() / 1000),
    };
    const token = await sign(payload, appConfig.jwt.secretKey, "HS256");
    setCookie(c, appConfig.jwt.cookieName, token, {
      httpOnly: true,
      sameSite: "strict",
      secure: false, // TODO: set flag based on environment,
      expires: addDays(now, 1),
    });
    return await sseRedirect(c, routes.HOME_PAGE);
  },
);
