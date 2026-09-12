import { createHooks } from "@css-hooks/react";

export { mergeStyles } from "@css-hooks/react";

export const { on, or, styleSheet } = createHooks(
  "&.a",
  "&:hover",
  "&:focus-visible",
  "&:active",
  ":hover > &",
  ":focus-visible > &",
  "@media (min-width: 721px)",
);
