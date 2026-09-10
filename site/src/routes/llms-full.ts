import { docs } from "../data/docs.ts";

export function loader() {
  const content = docs
    .map((document) => `<!-- ${document.pathname} -->\n\n${document.body}`)
    .join("\n\n---\n\n");
  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
