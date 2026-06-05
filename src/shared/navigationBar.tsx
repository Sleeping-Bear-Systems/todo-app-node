type NavigationBarProps = Readonly<{
  username: string;
  path: string;
}>;

export function NavigationBar(props: NavigationBarProps) {
  return (
    <nav aria-label="Main navigation">
      <a href="/auth/home">Home</a>
      <a href="/about">About</a>
      <span>{props.username}</span>
      <form method="post" action="/api/logout">
        <button type="submit">Sign out</button>
      </form>
    </nav>
  );
}
