import { traits } from "@jsx-traits/react";
import { Link } from "react-router";
import { pipe } from "remeda";

import { mergeStyles, on, or } from "../css.ts";
import { eyebrow } from "../styles.ts";
import { monospace, serif } from "../typography.ts";
import type { Route } from "./+types/home.ts";

export const meta: Route.MetaFunction = () => [
  { title: "JSX Traits for React" },
];

const buttonColor = Symbol("button color");
const originalChildren = Symbol("original children");

type ButtonColor = "violet";
type TraitMetadata = {
  [buttonColor]?: ButtonColor;
  [originalChildren]?: React.ReactNode;
};

const buttonColors = {
  violet: {
    background: "#7950f2",
    hover: "#6741d9",
    shadow: "#b197fc",
  },
} as const;

function button(
  input: React.AnchorHTMLAttributes<HTMLAnchorElement>,
  options: { color: ButtonColor },
) {
  const colors = buttonColors[options.color];
  return {
    ...input,
    [buttonColor]: options.color,
    style: pipe(
      {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        minHeight: 44,
        padding: "12px 16px",
        border: 0,
        borderRadius: 8,
        color: "white",
        background: colors.background,
        fontWeight: 750,
        textDecoration: "none",
        transition: "background 120ms, box-shadow 120ms, transform 75ms",
      },
      mergeStyles(input.style),
      on("&:hover", { background: colors.hover }),
      on("&:active", {
        boxShadow: `0 0 0 1px ${colors.shadow}`,
        transform: "translateY(1px)",
      }),
    ),
  };
}

function tooltip(
  input: React.HTMLAttributes<HTMLElement> & TraitMetadata,
  options: { content?: React.ReactNode; id: string },
) {
  const {
    children,
    style,
    [buttonColor]: inheritedColor,
    [originalChildren]: inheritedContent,
    ...elementProps
  } = input;
  const content = options.content ?? inheritedContent;
  return {
    ...elementProps,
    "aria-describedby": options.id,
    children: (
      <>
        {children}
        <span
          className={inheritedColor === "violet" ? "a" : undefined}
          id={options.id}
          role="tooltip"
          style={pipe(
            {
              position: "absolute",
              zIndex: 2,
              top: "calc(100% + 10.4px)",
              left: "50%",
              width: "max-content",
              maxWidth: "min(288px, 80vw)",
              padding: "8.8px 11.2px",
              borderRadius: 6,
              color: "white",
              background: "#35313d",
              fontSize: "0.82em",
              fontWeight: 600,
              lineHeight: 1.35,
              opacity: 0,
              transform: "translate(-50%, -4px)",
              transition: "opacity 120ms, transform 120ms, visibility 120ms",
              visibility: "hidden",
              whiteSpace: "normal",
            },
            on("&.a", { background: buttonColors.violet.background }),
            on(or(":hover > &", ":focus-visible > &"), {
              opacity: 1,
              transform: "translate(-50%, 0)",
              visibility: "visible",
            }),
          )}
        >
          {content}
        </span>
      </>
    ),
    style: pipe({ position: "relative" }, mergeStyles(style)),
    tabIndex: input.tabIndex ?? 0,
  };
}

function truncate(
  input: React.HTMLAttributes<HTMLElement>,
  options: { lines: number },
) {
  return {
    ...input,
    [originalChildren]: input.children,
    children: (
      <span
        style={{
          display: "-webkit-box",
          overflow: "hidden",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: options.lines,
        }}
      >
        {input.children}
      </span>
    ),
  };
}

const codeStyle = {
  display: "block",
  overflowX: "auto",
  padding: "20px",
  border: "1px solid #403b4a",
  borderRadius: 8,
  color: "#dfd6ff",
  background: "#121019",
  fontFamily: monospace,
  fontSize: "0.82em",
  lineHeight: 1.55,
} as const;

const exampleStyle = pipe(
  {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "clamp(24px, 4vw, 48px)",
    alignItems: "center",
    paddingBlock: "40px",
    borderTop: "1px solid #403b4a",
  },
  on("@media (min-width: 721px)", {
    gridTemplateColumns: "minmax(0, 1.2fr) minmax(256px, 0.8fr)",
  }),
);

export default function Home() {
  return (
    <main>
      <section
        style={{
          width: "min(1120px, calc(100% - 40px))",
          marginInline: "auto",
          padding: "clamp(80px, 12vw, 144px) 0",
        }}
      >
        <p style={eyebrow}>A composition protocol for JSX</p>
        <h1
          style={{
            maxWidth: 900,
            margin: 0,
            fontFamily: serif,
            fontSize: "clamp(3em, 8vw, 7.5em)",
            fontWeight: 500,
            letterSpacing: "-0.06em",
            lineHeight: 0.92,
          }}
        >
          Put behavior on the element, not around it.
        </h1>
        <p
          style={{
            maxWidth: 660,
            margin: "32px 0",
            color: "#5e5868",
            fontSize: "clamp(1.15em, 2vw, 1.45em)",
            lineHeight: 1.55,
          }}
        >
          JSX Traits gives React elements an ordered, typed pipeline of plain
          functions with colocated, namespaced configuration.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12.8px" }}>
          <Link
            style={{
              padding: "12.8px 17.6px",
              border: "1px solid #211f29",
              color: "white",
              background: "#211f29",
              textDecoration: "none",
            }}
            to="/docs/quickstart/react/"
          >
            Get started
          </Link>
          <a
            href="https://github.com/jsx-traits/jsx-traits"
            style={{
              padding: "12.8px 17.6px",
              border: "1px solid #211f29",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            View source
          </a>
        </div>
      </section>

      <section
        aria-labelledby="examples-heading"
        style={{ color: "#f7f3eb", background: "#211f29" }}
      >
        <div
          style={{
            width: "min(1120px, calc(100% - 40px))",
            marginInline: "auto",
            paddingBlock: "clamp(48px, 7vw, 96px)",
          }}
        >
          <p style={pipe(eyebrow, mergeStyles({ color: "#b197fc" }))}>
            Three traits
          </p>
          <h2
            id="examples-heading"
            style={{
              maxWidth: 680,
              margin: "0 0 32px",
              fontFamily: serif,
              fontSize: "clamp(2.25em, 5vw, 4.5em)",
              fontWeight: 500,
              lineHeight: 1,
            }}
          >
            Small behaviors. Useful combinations.
          </h2>

          <article style={exampleStyle}>
            <div>
              <h3 style={{ marginTop: 0, fontSize: "1.35em" }}>
                Button behavior on an anchor
              </h3>
              <pre style={{ margin: 0 }}>
                <code
                  style={codeStyle}
                >{`<traits.a of={[{ button }]} button:color="violet" href="/docs/">
  Get started
</traits.a>`}</code>
              </pre>
            </div>
            <div>
              <traits.a of={[{ button }]} button:color="violet" href="/docs/">
                Get started
              </traits.a>
              <p style={{ color: "#bbb3c7", lineHeight: 1.6 }}>
                Button behavior belongs to the anchor without changing its
                semantics.
              </p>
            </div>
          </article>

          <article style={exampleStyle}>
            <div>
              <h3 style={{ marginTop: 0, fontSize: "1.35em" }}>
                Button with a tooltip
              </h3>
              <pre style={{ margin: 0 }}>
                <code style={codeStyle}>{`<traits.a
  of={[{ button }, { tooltip }]}
  button:color="violet"
  tooltip:content="Read the documentation"
  tooltip:id="docs-tooltip"
  href="/docs/"
>
  Get started
</traits.a>`}</code>
              </pre>
            </div>
            <div>
              <traits.a
                of={[{ button }, { tooltip }]}
                button:color="violet"
                tooltip:content="Read the documentation"
                tooltip:id="docs-tooltip"
                href="/docs/"
              >
                Get started
              </traits.a>
              <p style={{ color: "#bbb3c7", lineHeight: 1.6 }}>
                The tooltip adds real markup and adopts the button color from
                symbol-keyed metadata.
              </p>
            </div>
          </article>

          <article style={exampleStyle}>
            <div>
              <h3 style={{ marginTop: 0, fontSize: "1.35em" }}>
                Truncated text with a tooltip
              </h3>
              <pre style={{ margin: 0 }}>
                <code style={codeStyle}>{`<traits.span
  of={[{ truncate }, { tooltip }]}
  truncate:lines={1}
  tooltip:id="project-name-tooltip"
>
  A very long project name that will not fit
</traits.span>`}</code>
              </pre>
            </div>
            <div style={{ maxWidth: 250 }}>
              <traits.span
                of={[{ truncate }, { tooltip }]}
                truncate:lines={1}
                tooltip:id="project-name-tooltip"
              >
                A very long project name that will not fit
              </traits.span>
              <p style={{ color: "#bbb3c7", lineHeight: 1.6 }}>
                The tooltip reuses the original children published by the
                truncate trait.
              </p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
