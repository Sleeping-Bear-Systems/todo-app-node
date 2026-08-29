import { Hono } from "hono";
import { html } from "hono/html";
import type { AuthenticatedAppVariables } from "#shared/appVariables.ts";
import { Page } from "#shared/page.ts";

export const aboutPage = new Hono<{
  Variables: AuthenticatedAppVariables;
}>().get("/", (c) => {
  const { username, role } = c.var.account;
  const now = c.var.clock.now();
  const currentYear = now.getFullYear();
  const copyrightYears = currentYear > 2026 ? `2026-${currentYear}` : "2026";
  const version = c.var.appConfig.application.version;

  const content = html`
    <h1>About</h1>
    <div class="about-layout">
      <section class="about-panel">
        <p>Version: ${version}</p>
        <h2>Powered by</h2>
        <div class="technology-list">
          <a
            class="technology-link"
            href="https://event-driven-io.github.io/emmett/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/images/emmett-logo-square.png"
              alt=""
              width="60"
              height="60"
            />
            <span>Emmett</span>
          </a>
          <a
            class="technology-link"
            href="https://hono.dev/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/images/hono.svg"
              alt=""
              width="60"
              height="60"
            />
            <span>Hono</span>
          </a>
          <a
            class="technology-link"
            href="https://data-star.dev/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/images/datastar.jpg"
              alt=""
              width="60"
              height="60"
            />
            <span>Datastar</span>
          </a>
        </div>
      </section>

      <aside class="about-brand">
        <img
          src="/images/sleeping_bear_logo.svg"
          alt=""
          width="30"
          height="30"
        />
        <div>&copy; ${copyrightYears} Sleeping Bear Systems</div>
      </aside>
    </div>
  `;

  return c.html(
    Page({
      type: "authenticated",
      title: "About",
      path: c.req.path,
      username,
      role,
      children: content,
    }),
  );
});
