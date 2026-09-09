import { Hono } from "hono";
import { deleteCookie } from "hono/cookie";
import type { AppVariables } from "#shared/appVariables.ts";
import { isDatastarRequest, sseRedirect } from "#shared/datastar.ts";
import { routes } from "#shared/routes.ts";

export const logoutApi = new Hono<{ Variables: AppVariables }>().post(
  "/",
  async (c) => {
    const cookieName = c.var.appConfig.jwt.cookieName;
    deleteCookie(c, cookieName);
    if (isDatastarRequest(c)) {
      return await sseRedirect(c, routes.LOGIN_PAGE);
    }
    return c.redirect(routes.LOGIN_PAGE);
  },
);
