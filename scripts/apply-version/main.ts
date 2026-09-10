import { exec as execCallback } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import * as v from "valibot";

const exec = promisify(execCallback);
const directory = dirname(fileURLToPath(import.meta.url));
const root = resolve(directory, "../../");

async function main() {
  const version = process.argv.find((argument) => /^[0-9]/.test(argument));
  if (!version) throw new Error("Usage: node main.ts <new-version>");

  await exec(
    `npm version ${version} --no-git-tag-version --workspaces --include-workspace-root`,
    { cwd: root },
  );

  const { stdout } = await exec("npm query .workspace", { cwd: root });
  const workspaces = v.parse(
    v.pipe(
      v.string(),
      v.parseJson(),
      v.array(v.object({ name: v.string(), location: v.string() })),
    ),
    stdout,
  );
  const internalNames = new Set(workspaces.map((workspace) => workspace.name));
  const manifests = [
    resolve(root, "package.json"),
    ...workspaces.map((workspace) =>
      resolve(root, workspace.location, "package.json"),
    ),
  ];

  await Promise.all(
    manifests.map(async (manifest) => {
      const packageJson = JSON.parse(await readFile(manifest, "utf8"));
      let changed = false;

      for (const field of [
        "dependencies",
        "devDependencies",
        "peerDependencies",
      ]) {
        for (const name of Object.keys(packageJson[field] ?? {})) {
          if (internalNames.has(name)) {
            packageJson[field][name] = version;
            changed = true;
          }
        }
      }

      if (changed) {
        await writeFile(manifest, `${JSON.stringify(packageJson, null, 2)}\n`);
      }
    }),
  );

  await exec("npm install --package-lock-only", { cwd: root });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
