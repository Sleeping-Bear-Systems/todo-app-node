import { Hono } from "hono";
import { html } from "hono/html";
import type { AppVariables } from "#shared/appVariables.ts";
import { Page } from "#shared/page.ts";

export const errorPage = new Hono<{ Variables: AppVariables }>().get(
  "/",
  (c) => {
    const content = html`<h1>Error</h1>`;
    return c.html(
      Page({
        type: "unauthenticated",
        children: content,
        title: "Error",
        path: c.req.path,
      }),
    );
  },
);
