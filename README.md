<div align="center">
  <a id="wordmark" href="https://jsx-traits.com"><strong>JSX Traits</strong></a>
</div>

<div align="center" id="badges">
  <a href="https://github.com/jsx-traits/jsx-traits/tree/v0.1.0"><img src="https://img.shields.io/badge/tag-v0.1.0-2563eb" alt="tag v0.1.0"></a>
  <a href="https://www.npmjs.com/package/@jsx-traits/react/v/0.1.0"><img src="https://img.shields.io/npm/v/@jsx-traits/react/latest.svg?label=npm&color=2563eb" alt="npm version"></a>
  <a href="https://github.com/jsx-traits/jsx-traits/blob/v0.1.0/LICENSE"><img src="https://img.shields.io/badge/license-MIT-2563eb" alt="license"></a>
</div>

JSX Traits provides ordered, typed behavior composition directly on React
intrinsic elements.

```tsx
import { traits } from "@jsx-traits/react";

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
  const { button: buttonContext, ...props } = input;
  return {
    ...props,
    title: buttonContext
      ? `${props.content} (${buttonContext.variant})`
      : props.content,
  };
}

<traits.a
  of={[{ button }, { tooltip }]}
  button:variant="primary"
  tooltip:content="Click me"
  href="#"
>
  Click me
</traits.a>;
```

See the [documentation](https://jsx-traits.com/docs/) to learn more.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
