const stack = (fonts: string[], fallback: string) =>
  [...fonts].reverse().reduce((stack, font) => `"${font}",${stack}`, fallback);

export const sansSerif = stack(
  [
    /* Modern systems */
    "Inter",

    /* macOS/iOS */
    "-apple-system",
    "BlinkMacSystemFont",

    /* Windows */
    "Segoe UI",

    /* Android/ChromeOS */
    "Roboto",

    /* Linux/Generic */
    "Helvetica Neue",
    "Arial",
  ],
  "sans-serif",
);

export const serif = stack(
  [
    /* macOS/iOS */
    "New York",
    "Iowan Old Style",

    /* Windows */
    "Sitka Text",
    "Cambria",

    /* Android/ChromeOS */
    "Noto Serif",

    /* Linux */
    "Liberation Serif",

    /* Cross-platform fallback */
    "Georgia",
  ],
  "serif",
);

export const monospace = stack(
  [
    /* Windows */
    "Consolas",

    /* macOS/iOS */
    "Menlo",
    "Monaco",

    /* Android/ChromeOS */
    "Roboto Mono",

    /* Linux */
    "Liberation Mono",

    /* Generic */
    "Lucida Console",
    "Courier New",
  ],
  "monospace",
);
