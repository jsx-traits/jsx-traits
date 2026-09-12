import { Link } from "react-router";
import { pipe } from "remeda";

import { on } from "../css.ts";
import { docs } from "../data/docs.ts";
import { content, eyebrow } from "../styles.ts";
import { serif } from "../typography.ts";

export default function Docs() {
  return (
    <main style={content}>
      <p style={eyebrow}>Documentation</p>
      <h1
        style={{
          fontFamily: serif,
          fontSize: "clamp(2.5em, 6vw, 5em)",
        }}
      >
        Learn JSX Traits
      </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
        }}
      >
        {docs
          .filter((document) => !document.pathname.startsWith("/docs/api/"))
          .map((document) => (
            <Link
              key={document.pathname}
              style={pipe(
                {
                  display: "grid",
                  gap: "8px",
                  padding: "20px",
                  border: "1px solid #d8d2c7",
                  color: "inherit",
                  textDecoration: "none",
                },
                on("@media (min-width: 721px)", { padding: "24px" }),
              )}
              to={document.pathname}
            >
              <strong>{document.title}</strong>
              <span style={{ color: "#5e5868" }}>{document.description}</span>
            </Link>
          ))}
      </div>
    </main>
  );
}
