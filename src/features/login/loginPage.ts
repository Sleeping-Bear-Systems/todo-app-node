import { zValidator } from "@hono/zod-validator";
import bcrypt from "bcrypt";
import { addDays } from "date-fns";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { html } from "hono/html";
import { sign, verify } from "hono/jwt";
import z from "zod";
import type { AppVariables } from "#shared/appVariables.ts";
import { sseRedirect } from "#shared/datastar.ts";
import {
  type UserDocument,
  usersCollectionName,
} from "#shared/domain/userProjection.ts";
import { Page } from "#shared/page.ts";
import { routes } from "#shared/routes.ts";

const loginRequestSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
});

export const loginPage = new Hono<{ Variables: AppVariables }>()
  .get("/", async (c) => {
    const appConfig = c.var.appConfig;
    const token = getCookie(c, appConfig.jwt.cookieName);

    if (token) {
      try {
        await verify(token, appConfig.jwt.secretKey, "HS256");
        return c.redirect(routes.HOME_PAGE);
      } catch {
        // fall through to render the login form
      }
    }

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
    if (!c.var.isDatastarRequest) {
      return c.redirect(routes.ERROR_PAGE, 303);
    }
    const now = c.var.clock.now();
    const appConfig = c.var.appConfig;
    const { username, password } = c.req.valid("form");
    const logger = c.var.logger;
    const readStore = c.var.readStore;

    try {
      const normalizedUsername = username.toLocaleLowerCase().trim();
      const userDocument = await readStore
        .db()
        .collection<UserDocument>(usersCollectionName)
        .findOne({ username: normalizedUsername });
      if (userDocument === null) {
        return c.html(html`<div id="errors">Invalid Credentials</div>`);
      }
      const passwordCheck = await bcrypt.compare(
        password,
        userDocument.passwordHash,
      );
      if (!passwordCheck) {
        return c.html(html`<div id="errors">Invalid Credentials</div>`);
      }
      const payload = {
        sub: userDocument._id,
        preferred_username: userDocument.username,
        role: userDocument.role,
        iss: "todo-app-node",
        exp: Math.floor(addDays(now, 1).getTime() / 1000),
        iat: Math.floor(now.getTime() / 1000),
      };
      const token = await sign(payload, appConfig.jwt.secretKey, "HS256");
      setCookie(c, appConfig.jwt.cookieName, token, {
        httpOnly: true,
        sameSite: "strict",
        secure: appConfig.environment === "production",
        expires: addDays(now, 1),
      });
      return await sseRedirect(c, routes.HOME_PAGE);
    } catch (error) {
      logger.error(error);
      return c.html(html`<div id="errors">Internal server error</div>`);
    }
  });
