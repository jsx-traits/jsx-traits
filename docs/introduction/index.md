---
title: Introduction
description: Ordered, typed behavior composition for JSX elements.
order: 1
---

# JSX Traits

JSX Traits composes behavior directly on intrinsic elements through an ordered
pipeline of plain functions. Each trait receives the previous value and its own
namespaced props, then returns the value passed to the next trait.

```tsx
<traits.button
  of={[{ press }, { analytics }]}
  press:onPress={save}
  analytics:event="save"
>
  Save
</traits.button>
```

Array order is execution order. JSX namespaces isolate each trait's options, and
TypeScript checks the handoff between adjacent traits. Unnamespaced intrinsic
props form the pipeline's initial value; React's reserved `key` is not passed to
the first trait.
