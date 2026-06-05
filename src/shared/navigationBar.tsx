import { routes } from "./routes.js";

type NavigationBarProps = Readonly<{
  username: string;
  path: string;
}>;

export function NavigationBar(props: NavigationBarProps) {
  return (
    <nav aria-label="Main navigation">
      {props.path === routes.HOME_PAGE ? null : (
        <a href={routes.HOME_PAGE}>Home</a>
      )}
      {props.path === routes.ABOUT_PAGE ? null : (
        <a href={routes.ABOUT_PAGE}>About</a>
      )}
      <span>{props.username}</span>
      <form method="post" action={routes.LOGOUT_API}>
        <button type="submit">Sign out</button>
      </form>
    </nav>
  );
}
