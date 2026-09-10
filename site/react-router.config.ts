import type { Config } from "@react-router/dev/config";

import { docs } from "./src/data/docs.ts";

export default {
  ssr: true,
  appDirectory: "src",
  routeDiscovery: { mode: "initial" },
  prerender: async ({ getStaticPaths }) => [
    ...getStaticPaths(),
    ...docs.map((document) => document.pathname),
  ],
} satisfies Config;
