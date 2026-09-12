import ReactMarkdown from "react-markdown";
import { data, Link } from "react-router";
import remarkGfm from "remark-gfm";
import { pipe } from "remeda";

import { on } from "../css.ts";
import { docs } from "../data/docs.ts";
import { monospace, serif } from "../typography.ts";
import type { Route } from "./+types/doc.ts";

export function loader({ params }: Route.LoaderArgs) {
  const pathname = `/docs/${params["*"] ?? ""}`;
  const document = docs.find((candidate) => candidate.pathname === pathname);
  if (!document) throw data("Not found", { status: 404 });
  return document;
}

export function meta({ loaderData: document }: Route.MetaArgs) {
  return document
    ? [
        { title: `${document.title} | JSX Traits` },
        { name: "description", content: document.description },
      ]
    : [];
}

export default function Doc({ loaderData: document }: Route.ComponentProps) {
  return (
    <main
      style={pipe(
        {
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "clamp(32px, 6vw, 96px)",
          width: "min(1120px, calc(100% - 40px))",
          minHeight: "70vh",
          marginInline: "auto",
          paddingBlock: "64px",
        },
        on("@media (min-width: 721px)", {
          gridTemplateColumns: "220px minmax(0, 760px)",
        }),
      )}
    >
      <aside
        style={pipe(
          {
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            paddingBottom: "24px",
            borderBottom: "1px solid #d8d2c7",
          },
          on("@media (min-width: 721px)", {
            paddingBottom: 0,
            borderBottom: 0,
          }),
        )}
      >
        <Link style={{ color: "inherit" }} to="/docs/">
          Documentation
        </Link>
        {docs.map((item) => (
          <Link
            key={item.pathname}
            style={{ color: "inherit" }}
            to={item.pathname}
          >
            {item.title}
          </Link>
        ))}
      </aside>
      <article style={{ lineHeight: 1.7 }}>
        <ReactMarkdown
          components={{
            a: ({ node: _node, ...props }) => (
              <a {...props} style={{ color: "inherit" }} />
            ),
            code: ({ node: _node, ...props }) => (
              <code
                {...props}
                style={{ fontFamily: monospace, fontSize: "0.9em" }}
              />
            ),
            h1: ({ node: _node, ...props }) => (
              <h1
                {...props}
                style={{
                  fontFamily: serif,
                  fontSize: "clamp(2.5em, 6vw, 5em)",
                }}
              />
            ),
            pre: ({ node: _node, ...props }) => (
              <pre
                {...props}
                style={{
                  overflowX: "auto",
                  padding: "24px",
                  color: "#dfd6ff",
                  background: "#121019",
                  lineHeight: 1.6,
                }}
              />
            ),
          }}
          remarkPlugins={[remarkGfm]}
        >
          {document.body}
        </ReactMarkdown>
        <a
          href={`https://github.com/jsx-traits/jsx-traits/edit/next/${document.sourcePath}`}
          style={{
            display: "inline-block",
            marginTop: "48px",
            color: "inherit",
          }}
        >
          Edit this page
        </a>
      </article>
    </main>
  );
}
