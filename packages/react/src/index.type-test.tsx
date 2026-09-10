import { traits } from "./index.ts";

function button(
  input: React.HTMLAttributes<HTMLElement>,
  props: {
    variant: "primary" | "secondary";
    disabled?: boolean;
  },
) {
  return {
    ...input,
    "aria-disabled": props.disabled,
    button: { variant: props.variant },
  };
}

function tooltip(
  input: React.HTMLAttributes<HTMLElement> & {
    button?: ReturnType<typeof button>["button"];
  },
  props: { content: string },
): React.HTMLAttributes<HTMLElement> {
  const { button: _buttonContext, ...elementProps } = input;
  return { ...elementProps, title: props.content };
}

const valid = (
  <traits.a
    of={[{ button }, { tooltip }]}
    button:variant="primary"
    button:disabled
    tooltip:content="Details"
    href="#"
  />
);

const aliased = (
  <traits.a
    of={[{ action: button }, { hint: tooltip }]}
    action:variant="secondary"
    hint:content="Details"
  />
);

const storedPipeline = [{ button }, { tooltip }] as const;
const stored = (
  <traits.a
    of={storedPipeline}
    button:variant="primary"
    tooltip:content="Stored"
  />
);

// @ts-expect-error The trait constrains the variant value.
const invalidOwnProp = <traits.a of={[{ button }, { tooltip }]} button:variant="tertiary" tooltip:content="Details" />;

// @ts-expect-error tooltip:content is required by the selected trait.
const missingOwnProp = <traits.a of={[{ button }, { tooltip }]} button:variant="primary" />;

// @ts-expect-error The namespace must be selected by the pipeline.
const unknownNamespace = <traits.a of={[{ button }]} button:variant="primary" tooltip:content="Details" />;

// @ts-expect-error Each entry must contain exactly one trait.
const ambiguousEntry = <traits.a of={[{ button, tooltip }]} button:variant="primary" tooltip:content="Details" />;

// @ts-expect-error Duplicate aliases are not valid.
const duplicateNamespace = <traits.a of={[{ action: button }, { action: tooltip }]} action:variant="primary" />;

function incompatible(
  _input: { unavailable: true },
  _props: object,
): React.JSX.IntrinsicElements["a"] {
  return {};
}

// @ts-expect-error Adjacent trait types are incompatible.
const invalidChain = <traits.a of={[{ button }, { incompatible }]} button:variant="primary" />;

function leaksContext(
  input: React.JSX.IntrinsicElements["a"],
  _props: object,
) {
  return { ...input, internalContext: true };
}

// @ts-expect-error Final context cannot leak to the intrinsic element.
const invalidFinalOutput = <traits.a of={[{ leaksContext }]} />;

function requiresHref(
  input: React.JSX.IntrinsicElements["a"] & { href: string },
  _props: object,
) {
  return input;
}

const requiredInitialInput = <traits.a of={[{ requiresHref }]} href="#" />;

// @ts-expect-error The first trait requires an initial href.
const missingInitialInput = <traits.a of={[{ requiresHref }]} />;

// @ts-expect-error src is not a valid anchor or first-trait input prop.
const invalidIntrinsicProp = <traits.a of={[{ button }, { tooltip }]} button:variant="primary" tooltip:content="Details" src="image.png" />;

void [
  valid,
  aliased,
  stored,
  invalidOwnProp,
  missingOwnProp,
  unknownNamespace,
  ambiguousEntry,
  duplicateNamespace,
  invalidChain,
  invalidFinalOutput,
  requiredInitialInput,
  missingInitialInput,
  invalidIntrinsicProp,
];
