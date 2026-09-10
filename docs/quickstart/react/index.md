---
title: React quickstart
description: Install and use JSX Traits with React 19.
order: 2
---

# React quickstart

Install the React adapter:

```sh
npm install @jsx-traits/react
```

Import `traits`, define plain transformation functions, and select them on an
intrinsic element:

```tsx
import { traits } from "@jsx-traits/react";

function labelled(
  input: React.JSX.IntrinsicElements["button"],
  options: { label: string },
) {
  return { ...input, "aria-label": options.label };
}

export function SaveButton() {
  return (
    <traits.button of={[{ labelled }]} labelled:label="Save changes">
      Save
    </traits.button>
  );
}
```
