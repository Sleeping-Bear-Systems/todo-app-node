import type { Child } from "hono/jsx";

type SharedPageProps = Readonly<{
  title: string;
  children?: Child;
  language?: string;
  description?: string;
}>;

type AuthenticatedPageProps = SharedPageProps &
  Readonly<{
    type: "authenticated";
  }>;

type UnauthenticatedPageProps = SharedPageProps &
  Readonly<{
    type: "unauthenticated";
  }>;

type PageProps = AuthenticatedPageProps | UnauthenticatedPageProps;

export function Page(props: PageProps) {
  const language = props.language ?? "en";

  return (
    <html lang={language}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {props.description !== undefined ? (
          <meta name="description" content={props.description} />
        ) : null}
        <title>{props.title}</title>
      </head>
      <body>{props.children}</body>
    </html>
  );
}
