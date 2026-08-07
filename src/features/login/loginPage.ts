import { zValidator } from "@hono/zod-validator";
import { addDays } from "date-fns";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { html } from "hono/html";
import { sign } from "hono/jwt";
import z from "zod";
import type { AppVariables } from "#shared/appVariables.ts";
import { isDatastarRequest, sseRedirect } from "#shared/datastar.ts";
import { Page } from "#shared/page.ts";
import { routes } from "#shared/routes.ts";
import { verifyUser } from "./user.ts";

const loginRequestSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
});

export const loginPage = new Hono<{ Variables: AppVariables }>()
  .get("/", (c) => {
    const content = html`
      <h1>Login</h1>
      <form
        id="login-form"
        data-on:submit="@post('${routes.LOGIN_PAGE}', {contentType: 'form'})"
      >
        <div>
          <label for="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            required
            minLength="3"
            autoComplete="username"
          />
        </div>
        <div>
          <label for="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength="8"
            autoComplete="current-password"
          />
        </div>
        <button type="submit">Sign in</button>
      </form>
      <div id="errors"></div>
    `;

    return c.html(
      Page({
        type: "unauthenticated",
        title: "Login",
        path: c.req.path,
        children: content,
      }),
    );
  })
  .post("/", zValidator("form", loginRequestSchema), async (c) => {
    if (!isDatastarRequest(c)) {
      return c.json({ message: "Datastar request required" }, 400);
    }
    const now = c.var.clock.now();
    const appConfig = c.var.appConfig;
    const { username, password } = c.req.valid("form");
    const logger = c.var.logger;

    try {
      const user = verifyUser(username, password);
      if (user === undefined) {
        return c.html(html`<div id="errors">Invalid Credentials</div>`);
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
    } catch (error) {
      logger.error(error);
      return c.html(html`<div id="errors">Internal server error</div>`);
    }
  });
