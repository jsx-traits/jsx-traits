import ReactMarkdown from "react-markdown";
import { data, Link } from "react-router";
import remarkGfm from "remark-gfm";

import { docs } from "../data/docs.ts";
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
    <main className="docs-layout">
      <aside>
        <Link to="/docs/">Documentation</Link>
        {docs.map((item) => (
          <Link key={item.pathname} to={item.pathname}>
            {item.title}
          </Link>
        ))}
      </aside>
      <article>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {document.body}
        </ReactMarkdown>
        <a
          className="edit-link"
          href={`https://github.com/jsx-traits/jsx-traits/edit/next/${document.sourcePath}`}
        >
          Edit this page
        </a>
      </article>
    </main>
  );
}
