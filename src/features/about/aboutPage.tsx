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
      <Page title="About">
        <h1>About</h1>
        <div>&copy; {copyrightYears} Sleeping Bear Systems</div>
      </Page>,
    );
  },
);
