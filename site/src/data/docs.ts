import { parse } from "yaml";

type Attributes = {
  title: string;
  description: string;
  order: number;
};

function parseDocument(source: string) {
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(source);
  if (!match) return { attributes: undefined, body: source };

  return {
    attributes: parse(match[1] ?? "") as unknown,
    body: match[2] ?? "",
  };
}

function parseAttributes(value: unknown): Attributes {
  if (
    typeof value !== "object" ||
    value === null ||
    !("title" in value) ||
    typeof value.title !== "string" ||
    !("description" in value) ||
    typeof value.description !== "string" ||
    !("order" in value) ||
    typeof value.order !== "number"
  ) {
    throw new TypeError("Documentation front matter is invalid.");
  }

  return {
    title: value.title,
    description: value.description,
    order: value.order,
  };
}

function getPathname(path: string) {
  const relativePath = path.replace(/^\.\.\/\.\.\/\.\.\/docs\//, "");
  const withoutMarkdown = relativePath.replace(/\.md$/, "");
  return `/docs/${withoutMarkdown.replace(/\/index$/, "/")}`;
}

export const docs = Object.entries(
  import.meta.glob("../../../docs/**/*.md", {
    eager: true,
    query: "?raw",
    import: "default",
  }) as Record<string, string>,
)
  .map(([path, source]) => {
    const document = parseDocument(source);
    const isApi = path.includes("/docs/api/");
    const fallbackTitle = path.split("/").at(-1)?.replace(/\.md$/, "") ?? "API";
    const attributes = isApi
      ? {
          title: fallbackTitle,
          description: "Generated API reference.",
          order: 100,
        }
      : parseAttributes(document.attributes);

    return {
      ...attributes,
      body: document.body,
      pathname: getPathname(path),
      sourcePath: path.replace(/^\.\.\/\.\.\/\.\.\//, ""),
    };
  })
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
