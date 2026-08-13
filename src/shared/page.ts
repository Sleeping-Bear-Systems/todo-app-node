import { html } from "hono/html";
import { NavigationBar } from "./navigationBar.ts";
import type { Role } from "./role.ts";

type HtmlContent = ReturnType<typeof html>;

type SharedPageProps = Readonly<{
  title: string;
  headContent?: HtmlContent;
  children?: HtmlContent;
  language?: string;
  description?: string;
  path: string;
}>;

type AuthenticatedPageProps = SharedPageProps &
  Readonly<{
    type: "authenticated";
    username: string;
    role: Role;
  }>;

type UnauthenticatedPageProps = SharedPageProps &
  Readonly<{
    type: "unauthenticated";
  }>;

type PageProps = AuthenticatedPageProps | UnauthenticatedPageProps;

export function Page(props: PageProps) {
  const language = props.language ?? "en";
  const description =
    props.description === undefined
      ? html``
      : html`<meta name="description" content="${props.description}" />`;
  const navigation =
    props.type === "authenticated"
      ? NavigationBar({
          username: props.username,
          role: props.role,
          path: props.path,
        })
      : html``;

  return html`
    <html lang="${language}">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        ${description}
        <title>${props.title}</title>
        <link rel="stylesheet" href="/styles/app.css" />
        <script src="/scripts/datastar.js" defer type="module"></script>
        ${props.headContent ?? html``}
      </head>
      <body>
        ${navigation}
        ${props.children ?? html``}
      </body>
    </html>
  `;
}
