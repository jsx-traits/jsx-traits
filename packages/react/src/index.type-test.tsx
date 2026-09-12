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
  input: React.AnchorHTMLAttributes<HTMLAnchorElement>,
  _props: object,
) {
  return { ...input, internalContext: true };
}

// @ts-expect-error Final context cannot leak to the intrinsic element.
const invalidFinalOutput = <traits.a of={[{ leaksContext }]} />;

function requiresHref(
  input: { href: string },
  _props: object,
) {
  const { href: _href } = input;
  return {};
}

const requiredInitialInput = <traits.a of={[{ requiresHref }]} href="#" />;

// @ts-expect-error The first trait requires an initial href.
const missingInitialInput = <traits.a of={[{ requiresHref }]} />;

function acceptsOptionalHref(input: { href?: string }, _props: object) {
  const { href: _href } = input;
  return {};
}

const invalidInitialInputTag = (
  <traits.div
    // @ts-expect-error href is not a valid initial input for a div.
    of={[{ acceptsOptionalHref }]}
  />
);

function addsRef(input: React.HTMLAttributes<HTMLElement>, _props: object) {
  return {
    ...input,
    ref: (_element: HTMLElement | null) => {},
  };
}

const reusableHtmlRef = <traits.span of={[{ addsRef }]} />;

function acceptsOptionalContext(
  input: React.HTMLAttributes<HTMLElement> & {
    pipelineContext?: string;
  },
  _props: object,
) {
  const { pipelineContext: _pipelineContext, ...elementProps } = input;
  return elementProps;
}

const optionalContextNotRequired = (
  <traits.div of={[{ acceptsOptionalContext }]} />
);

// @ts-expect-error Internal pipeline context is not an intrinsic root prop.
const invalidOptionalContextProp = <traits.div of={[{ acceptsOptionalContext }]} pipelineContext="test" />;

function requiresCustomInput(
  _input: { pipelineContext: string },
  _props: object,
) {
  return {};
}

// @ts-expect-error A required custom input cannot be provided as a root prop.
const invalidRequiredCustomInput = <traits.div of={[{ requiresCustomInput }]} />;

function acceptsKey(_input: { key?: React.Key }, _props: object) {
  return {};
}

// @ts-expect-error React does not pass key to the first trait input.
const invalidKeyInput = <traits.div of={[{ acceptsKey }]} />;

function addsKey(input: React.HTMLAttributes<HTMLElement>, _props: object) {
  return { ...input, key: "internal" };
}

// @ts-expect-error The final trait cannot return React's reserved key.
const invalidFinalKey = <traits.div of={[{ addsKey }]} />;

function removesKey(input: ReturnType<typeof addsKey>, _props: object) {
  const { key: _key, ...elementProps } = input;
  return elementProps;
}

const consumedIntermediateKey = (
  <traits.div of={[{ addsKey }, { removesKey }]} />
);

const keyedElement = <traits.div of={[]} key="identity" />;

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
  invalidInitialInputTag,
  reusableHtmlRef,
  optionalContextNotRequired,
  invalidOptionalContextProp,
  invalidRequiredCustomInput,
  invalidKeyInput,
  invalidFinalKey,
  consumedIntermediateKey,
  keyedElement,
  invalidIntrinsicProp,
];
