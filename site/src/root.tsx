import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { pipe } from "remeda";

import type { Route } from "./+types/root.ts";
import { on, styleSheet } from "./css.ts";
import { content, eyebrow } from "./styles.ts";
import { sansSerif, serif } from "./typography.ts";

export const meta: Route.MetaFunction = () => [
  { title: "JSX Traits" },
  {
    name: "description",
    content: "Ordered, typed behavior composition for React elements.",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      style={{
        color: "#211f29",
        background: "#f4f1ea",
        fontFamily: sansSerif,
        fontSynthesis: "none",
      }}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <style dangerouslySetInnerHTML={{ __html: styleSheet() }} />
      </head>
      <body style={{ minWidth: 320, margin: 0 }}>
        <header
          style={pipe(
            {
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              padding: "20px clamp(20px, 4vw, 64px)",
              borderBottom: "1px solid #d8d2c7",
            },
            on("@media (min-width: 721px)", { alignItems: "center" }),
          )}
        >
          <Link
            style={{
              color: "inherit",
              fontFamily: serif,
              fontSize: "1.4em",
              fontWeight: 700,
              textDecoration: "none",
            }}
            to="/"
          >
            JSX Traits
          </Link>
          <nav
            aria-label="Primary navigation"
            style={pipe(
              { display: "flex", gap: "12px", fontSize: "0.9em" },
              on("@media (min-width: 721px)", {
                gap: "20px",
                fontSize: "inherit",
              }),
            )}
          >
            <Link style={{ color: "inherit" }} to="/docs/">
              Docs
            </Link>
            <a
              style={{ color: "inherit" }}
              href="https://github.com/jsx-traits/jsx-traits"
            >
              GitHub
            </a>
            <a
              style={{ color: "inherit" }}
              href="https://www.npmjs.com/package/@jsx-traits/react"
            >
              npm
            </a>
          </nav>
        </header>
        {children}
        <footer
          style={{
            padding: "32px clamp(20px, 4vw, 64px)",
            borderTop: "1px solid #d8d2c7",
            color: "#5e5868",
          }}
        >
          JSX Traits is available under the MIT License.
        </footer>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main style={content}>
      <p style={eyebrow}>{notFound ? "404" : "Error"}</p>
      <h1>{notFound ? "Page not found" : "Something went wrong"}</h1>
    </main>
  );
}
