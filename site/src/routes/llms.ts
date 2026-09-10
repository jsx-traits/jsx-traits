import { docs } from "../data/docs.ts";

export function loader() {
  const links = docs
    .map(
      (document) =>
        `- [${document.title}](https://jsx-traits.com${document.pathname}): ${document.description}`,
    )
    .join("\n");
  return new Response(`# JSX Traits\n\n${links}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
