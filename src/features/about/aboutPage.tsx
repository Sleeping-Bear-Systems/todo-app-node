import { Hono } from "hono";
import type { AppVariables } from "#shared/appVariables.js";
import { Page } from "#shared/page.js";

export const aboutPage = new Hono<{ Variables: AppVariables }>().get(
  "/",
  (c) => {
    const now = c.var.clock.now();
    const currentYear = now.getFullYear();
    const copyrightYears = currentYear > 2026 ? `2026-${currentYear}` : "2026";

    return c.html(
      <Page type="unauthenticated" title="About" path={c.req.path}>
        <h1>About</h1>
        <img
          src="/images/sleeping_bear_logo.svg"
          alt="Sleeping Bear Systems logo"
          width="200"
          height="200"
        />
        <div>&copy; {copyrightYears} Sleeping Bear Systems</div>
      </Page>,
    );
  },
);
