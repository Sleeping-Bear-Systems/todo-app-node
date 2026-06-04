import { Hono } from "hono";
import type { AppVariables } from "#shared/appVariables.js";
import { Page } from "#shared/page.js";

export const loginErrorPage = new Hono<{ Variables: AppVariables }>().get(
  "/",
  (c) => {
    return c.html(
      <Page title="Login Error">
        <div>Invalid credentials.</div>
        <a href="/login">Back to Login</a>
      </Page>,
    );
  },
);
