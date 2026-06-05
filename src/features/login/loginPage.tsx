import { Hono } from "hono";
import type { AppVariables } from "#shared/appVariables.js";
import { Page } from "#shared/page.js";

export const loginPage = new Hono<{ Variables: AppVariables }>().get(
  "/",
  (c) => {
    return c.html(
      <Page type="unauthenticated" title="Login" path={c.req.path}>
        <h1>Login</h1>
        <form method="post" action="/api/login">
          <div>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              minLength={3}
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
            />
          </div>
          <button type="submit">Sign in</button>
        </form>
      </Page>,
    );
  },
);
