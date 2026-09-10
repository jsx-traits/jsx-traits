import { exec as execCallback } from "node:child_process";
import fs from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import * as v from "valibot";

const exec = promisify(execCallback);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../");
const rootReadme = resolve(root, "README.md");

function updateBadges(readme: string, packageName: string, ref: string) {
  const stable = ref === "latest" || /^v\d+\.\d+\.\d+$/.test(ref);
  const color = stable ? "2563eb" : "7c3aed";
  const refType = /^v\d/.test(ref) ? "tag" : "branch";
  const npmRef = ref.startsWith("v") ? ref.slice(1) : ref;
  const badges = [
    `<a href="https://github.com/jsx-traits/jsx-traits/tree/${ref}"><img src="https://img.shields.io/badge/${refType}-${ref.replaceAll("-", "--")}-${color}" alt="${refType} ${ref}"></a>`,
    `<a href="https://www.npmjs.com/package/${packageName}/v/${npmRef}"><img src="https://img.shields.io/npm/v/${packageName}/${ref.startsWith("v") ? "latest" : ref}.svg?label=npm&color=${color}" alt="npm version"></a>`,
    `<a href="https://github.com/jsx-traits/jsx-traits/blob/${ref}/LICENSE"><img src="https://img.shields.io/badge/license-MIT-${color}" alt="license"></a>`,
  ].join("\n  ");

  return readme.replace(
    /<div align="center" id="badges">[\s\S]*?<\/div>/,
    `<div align="center" id="badges">\n  ${badges}\n</div>`,
  );
}

async function main() {
  const refIndex = process.argv.indexOf("--ref");
  const ref = process.argv[refIndex + 1];
  if (refIndex === -1 || !ref) throw new Error("Provide --ref <name>.");

  const { stdout } = await exec("npm query .workspace", { cwd: root });
  const workspaces = v.parse(
    v.pipe(
      v.string(),
      v.parseJson(),
      v.array(v.object({ name: v.string(), location: v.string() })),
    ),
    stdout,
  );
  const packages = workspaces.filter((workspace) =>
    workspace.name.startsWith("@jsx-traits/"),
  );
  const readme = await fs.readFile(rootReadme, "utf8");

  if (process.argv.includes("--npm")) {
    await Promise.all(
      packages.map((packageInfo) =>
        fs.writeFile(
          resolve(root, packageInfo.location, "README.md"),
          updateBadges(readme, packageInfo.name, ref),
        ),
      ),
    );
  } else {
    await fs.writeFile(
      rootReadme,
      updateBadges(readme, "@jsx-traits/react", ref),
    );
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
