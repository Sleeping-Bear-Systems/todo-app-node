import { zValidator } from "@hono/zod-validator";
import { addDays } from "date-fns";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { html } from "hono/html";
import { sign } from "hono/jwt";
import z from "zod";
import type { AppVariables } from "#shared/appVariables.ts";
import { isDatastarRequest, sseRedirect } from "#shared/datastar.ts";
import { routes } from "#shared/routes.ts";
import { verifyUser } from "./user.ts";

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
      if (isDatastarRequest(c)) {
        return c.html(html`<div id="errors">Invalid Credentials</div>`);
      }
      return c.json({ message: "Invalid credentials" }, 401);
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
    if (isDatastarRequest(c)) {
      return await sseRedirect(c, routes.HOME_PAGE);
    }
    return c.json({ message: "Success" }, 200);
  },
);
