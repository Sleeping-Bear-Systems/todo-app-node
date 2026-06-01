import { Hono } from "hono";
import type { AppVariables } from "#shared/appVariables.js";
import { Page } from "#shared/page.js";

export const loginPage = new Hono<{ Variables: AppVariables }>().get(
  "/",
  (c) => {
    return c.html(
      <Page title="Login">
        <h1>Login</h1>
      </Page>,
    );
  },
);
