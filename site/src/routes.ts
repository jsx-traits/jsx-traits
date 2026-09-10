import { index, prefix, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  ...prefix("docs", [index("routes/docs.tsx"), route("*", "routes/doc.tsx")]),
  route("llms.txt", "routes/llms.ts"),
  route("llms-full.txt", "routes/llms-full.ts"),
  route("manifest.json", "routes/manifest.ts"),
  route("robots.txt", "routes/robots.ts"),
];
