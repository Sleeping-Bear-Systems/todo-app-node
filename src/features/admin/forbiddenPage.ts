import { Hono } from "hono";
import { html } from "hono/html";
import type { AppVariables } from "#shared/appVariables.ts";
import { Page } from "#shared/page.ts";

export const forbiddenPage = new Hono<{ Variables: AppVariables }>().get(
  "/",
  (c) => {
    var content = html`
    <h1>Forbidden</h1>
  `;
    return c.html(
      Page({
        type: "unauthenticated",
        title: "Forbidden",
        children: content,
        path: c.req.path,
      }),
    );
  },
);
