import { traits } from "@jsx-traits/react";
import { Link } from "react-router";

import type { Route } from "./+types/home.ts";

export const meta: Route.MetaFunction = () => [
  { title: "JSX Traits for React" },
];

function emphasis(
  input: React.JSX.IntrinsicElements["span"],
  options: { tone: "violet" | "blue" },
) {
  return { ...input, className: `trait-${options.tone}` };
}

export default function Home() {
  return (
    <main>
      <section className="hero">
        <p className="eyebrow">A composition protocol for JSX</p>
        <h1>Put behavior on the element, not around it.</h1>
        <p className="lede">
          JSX Traits gives React elements an ordered, typed pipeline of plain
          functions with colocated, namespaced configuration.
        </p>
        <div className="actions">
          <Link className="button primary" to="/docs/quickstart/react/">
            Get started
          </Link>
          <a
            className="button secondary"
            href="https://github.com/jsx-traits/jsx-traits"
          >
            View source
          </a>
        </div>
      </section>
      <section className="example" aria-labelledby="example-heading">
        <div>
          <p className="eyebrow">The model</p>
          <h2 id="example-heading">Explicit order. Isolated options.</h2>
          <p>
            Traits hand values from left to right. TypeScript checks every
            transition and the final intrinsic props.
          </p>
        </div>
        <pre>
          <code>{`<traits.button
  of={[{ press }, { analytics }]}
  press:onPress={save}
  analytics:event="save"
>
  Save
</traits.button>`}</code>
        </pre>
        <p className="live-example">
          This site also renders a live{" "}
          <traits.span of={[{ emphasis }]} emphasis:tone="violet">
            JSX trait
          </traits.span>
          .
        </p>
      </section>
    </main>
  );
}
