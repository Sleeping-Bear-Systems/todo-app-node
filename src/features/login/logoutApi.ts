import { Hono } from "hono";
import { deleteCookie } from "hono/cookie";
import type { AppVariables } from "#shared/appVariables.ts";
import { routes } from "#shared/routes.ts";

export const logoutApi = new Hono<{ Variables: AppVariables }>().post(
  "/",
  (c) => {
    const cookieName = c.var.appConfig.jwt.cookieName;
    deleteCookie(c, cookieName);
    return c.redirect(routes.LOGIN_PAGE);
  },
);
