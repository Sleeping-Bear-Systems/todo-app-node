import { html } from "hono/html";
import type { Role } from "./role.ts";
import { routes } from "./routes.ts";

type NavigationBarProps = Readonly<{
  username: string;
  role: Role;
  path: string;
}>;

export function NavigationBar(props: NavigationBarProps) {
  const homeLink =
    props.path === routes.HOME_PAGE
      ? html``
      : html`<a class="nav-link" href="${routes.HOME_PAGE}">Home</a>`;
  const aboutLink =
    props.path === routes.ABOUT_PAGE
      ? html``
      : html`<a class="nav-link" href="${routes.ABOUT_PAGE}">About</a>`;
  const adminLink =
    props.path === routes.ADMIN_PAGE || props.role !== "admin"
      ? html``
      : html`<a class="nav-link" href="${routes.ADMIN_PAGE}">Admin</a>`;

  return html`
    <nav aria-label="Main navigation">
      <div class="nav-links">${homeLink} ${adminLink} ${aboutLink}</div>
      <div class="nav-user">
        <span class="nav-username">${props.username}</span>
        <button data-on:click="@post('${routes.LOGOUT_API}')">Logout</button>
      </div>
    </nav>
  `;
}
