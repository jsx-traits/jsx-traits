import { Link } from "react-router";

import { docs } from "../data/docs.ts";

export default function Docs() {
  return (
    <main className="content docs-index">
      <p className="eyebrow">Documentation</p>
      <h1>Learn JSX Traits</h1>
      <div className="doc-grid">
        {docs
          .filter((document) => !document.pathname.startsWith("/docs/api/"))
          .map((document) => (
            <Link key={document.pathname} to={document.pathname}>
              <strong>{document.title}</strong>
              <span>{document.description}</span>
            </Link>
          ))}
      </div>
    </main>
  );
}
