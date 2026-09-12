import type { ComponentType } from "react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { traits } from "./index.ts";

function button(
  input: React.HTMLAttributes<HTMLElement>,
  props: { variant: "primary" | "secondary" },
) {
  return {
    ...input,
    className: `button-${props.variant}`,
    button: { variant: props.variant },
  };
}

function tooltip(
  input: React.HTMLAttributes<HTMLElement> & {
    button?: ReturnType<typeof button>["button"];
  },
  props: { content: string },
): React.HTMLAttributes<HTMLElement> {
  const { button: buttonContext, ...elementProps } = input;
  return {
    ...elementProps,
    title: buttonContext
      ? `${props.content} (${buttonContext.variant})`
      : props.content,
  };
}

describe("traits", () => {
  it("passes values through an ordered pipeline", () => {
    const markup = renderToStaticMarkup(
      <traits.a
        of={[{ button }, { tooltip }]}
        button:variant="primary"
        tooltip:content="Click me"
        href="#"
      >
        Click me
      </traits.a>,
    );

    expect(markup).toBe(
      '<a href="#" class="button-primary" title="Click me (primary)">Click me</a>',
    );
  });

  it("supports a trait without earlier pipeline context", () => {
    expect(
      renderToStaticMarkup(
        <traits.a
          of={[{ tooltip }]}
          tooltip:content="Read the documentation"
          href="/docs"
        >
          Documentation
        </traits.a>,
      ),
    ).toBe('<a href="/docs" title="Read the documentation">Documentation</a>');
  });

  it("passes symbol metadata between traits", () => {
    const metadata = Symbol("metadata");

    function provide(
      input: React.HTMLAttributes<HTMLDivElement>,
      _props: object,
    ) {
      return { ...input, [metadata]: "available" };
    }

    function consume(input: ReturnType<typeof provide>, _props: object) {
      const { [metadata]: value, ...elementProps } = input;
      return { ...elementProps, "data-metadata": value };
    }

    expect(
      renderToStaticMarkup(<traits.div of={[{ provide }, { consume }]} />),
    ).toBe('<div data-metadata="available"></div>');
  });

  it("relies on React to omit final symbol metadata", () => {
    const metadata = Symbol("metadata");

    function provide(
      input: React.HTMLAttributes<HTMLDivElement>,
      _props: object,
    ) {
      return { ...input, [metadata]: "internal" };
    }

    const element = traits.div({ of: [{ provide }] });

    expect(Object.getOwnPropertySymbols(element.props)).toEqual([]);
    expect(renderToStaticMarkup(element)).toBe("<div></div>");
  });

  it("uses aliases as prop namespaces", () => {
    function marker(
      input: React.HTMLAttributes<HTMLDivElement>,
      props: { value: string },
    ) {
      return { ...input, "data-marker": props.value };
    }

    expect(
      renderToStaticMarkup(
        <traits.div of={[{ custom: marker }]} custom:value="aliased" />,
      ),
    ).toBe('<div data-marker="aliased"></div>');
  });

  it("passes props through an empty pipeline", () => {
    expect(renderToStaticMarkup(<traits.div of={[]} id="plain" />)).toBe(
      '<div id="plain"></div>',
    );
  });

  it("returns stable component identities", () => {
    expect(traits.a).toBe(traits.a);
    expect(traits.a).not.toBe(traits.div);
  });

  it("rejects malformed entries", () => {
    const UnsafeDiv = traits.div as unknown as ComponentType<
      Record<string, unknown>
    >;
    const noOp = () => ({});

    expect(() =>
      renderToStaticMarkup(
        createElement(UnsafeDiv, {
          of: [{ first: noOp, second: noOp }],
        }),
      ),
    ).toThrow("must contain exactly one trait");
  });

  it("rejects unknown namespaced props", () => {
    const UnsafeDiv = traits.div as unknown as ComponentType<
      Record<string, unknown>
    >;

    expect(() =>
      renderToStaticMarkup(
        createElement(UnsafeDiv, { of: [], "missing:value": "test" }),
      ),
    ).toThrow(
      'Namespaced prop "missing:value" has no matching trait in the pipeline.',
    );
  });
});
