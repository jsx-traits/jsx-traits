import "./styles.css";

import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root.ts";

export const meta: Route.MetaFunction = () => [
  { title: "JSX Traits" },
  {
    name: "description",
    content: "Ordered, typed behavior composition for React elements.",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <header className="site-header">
          <Link className="brand" to="/">
            JSX Traits
          </Link>
          <nav aria-label="Primary navigation">
            <Link to="/docs/">Docs</Link>
            <a href="https://github.com/jsx-traits/jsx-traits">GitHub</a>
            <a href="https://www.npmjs.com/package/@jsx-traits/react">npm</a>
          </nav>
        </header>
        {children}
        <footer>JSX Traits is available under the MIT License.</footer>
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
    <main className="content">
      <p className="eyebrow">{notFound ? "404" : "Error"}</p>
      <h1>{notFound ? "Page not found" : "Something went wrong"}</h1>
    </main>
  );
}
