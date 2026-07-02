import { html } from "hono/html";
import { routes } from "./routes.ts";

type NavigationBarProps = Readonly<{
  username: string;
  path: string;
}>;

export function NavigationBar(props: NavigationBarProps) {
  const homeLink =
    props.path === routes.HOME_PAGE
      ? html``
      : html`<a href="${routes.HOME_PAGE}">Home</a>`;
  const aboutLink =
    props.path === routes.ABOUT_PAGE
      ? html``
      : html`<a href="${routes.ABOUT_PAGE}">About</a>`;

  return html`
    <nav aria-label="Main navigation">
      ${homeLink}
      ${aboutLink}
      <span>${props.username}</span>
      <form method="post" action="${routes.LOGOUT_API}">
        <button type="submit">Sign out</button>
      </form>
    </nav>
  `;
}
