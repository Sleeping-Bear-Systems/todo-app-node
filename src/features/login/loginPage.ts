import { Hono } from "hono";
import { html } from "hono/html";
import type { AppVariables } from "#shared/appVariables.ts";
import { Page } from "#shared/page.ts";
import { routes } from "#shared/routes.ts";

export const loginPage = new Hono<{ Variables: AppVariables }>().get(
  "/",
  (c) => {
    const content = html`
      <h1>Login</h1>
      <form
        id="login-form"
        data-on:submit="@post('${routes.LOGIN_API}', {contentType: 'form'})"
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
  },
);
