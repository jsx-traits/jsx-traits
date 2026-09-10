import { exec as execCallback } from "node:child_process";
import fs from "node:fs/promises";
import { promisify } from "node:util";

import semver from "semver";

const exec = promisify(execCallback);
const prefixes = {
  breaking: "breaking:",
  feature: "feat:",
  fix: "fix:",
};

type Commit = { sha: string; message: string };

async function getTags(): Promise<string[]> {
  const { stdout } = await exec("git tag --list 'v[0-9]*.[0-9]*.[0-9]*'");
  return stdout
    .split("\n")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .sort((a, b) => semver.compareBuild(b, a));
}

async function getCommits(sinceRef?: string): Promise<Commit[]> {
  const delimiter = "---END---";
  const range = sinceRef ? ` ${sinceRef}..HEAD` : "";
  const { stdout } = await exec(
    `git log${range} --merges --pretty=format:%H%n%s%n%b%n${delimiter}`,
  );

  return stdout
    .split(delimiter)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((line) => line.trim());
      return { sha: lines.shift() ?? "", message: lines.join("\n").trim() };
    })
    .filter((commit) => !commit.message.startsWith("misc: release latest"));
}

function getBump(
  messages: string[],
  branch: "latest" | "next",
): semver.ReleaseType | null {
  if (messages.some((message) => message.startsWith(prefixes.breaking))) {
    return branch === "latest" ? "major" : "premajor";
  }
  if (messages.some((message) => message.startsWith(prefixes.feature))) {
    return branch === "latest" ? "minor" : "preminor";
  }
  if (messages.some((message) => message.startsWith(prefixes.fix))) {
    return branch === "latest" ? "patch" : "prepatch";
  }
  return branch === "next" ? "prerelease" : null;
}

async function main() {
  const branch = process.argv[2];
  if (branch !== "latest" && branch !== "next") {
    throw new Error("Branch must be `next` or `latest`.");
  }

  const githubOutput = process.env["GITHUB_OUTPUT"];
  if (!githubOutput) throw new Error("GITHUB_OUTPUT is not set.");

  const tags = await getTags();
  const latestTag = tags.find((tag) => !tag.includes("-next."));
  const baselineVersion = latestTag ?? "v0.0.0";
  const commits = await getCommits(latestTag);
  const bump = getBump(
    commits.map((commit) => commit.message),
    branch,
  );

  if (!bump) {
    throw new Error(`No releasable changes since ${baselineVersion}.`);
  }

  let version = semver.inc(baselineVersion, bump, "next");
  while (version && tags.includes(`v${version}`)) {
    version = semver.inc(version, "prerelease", "next");
  }
  if (!version) throw new Error("Could not calculate a version.");

  const previousTag =
    branch === "next"
      ? tags.find((tag) => semver.compareBuild(tag, `v${version}`) < 0)
      : latestTag;
  const releaseCommits = previousTag
    ? previousTag === latestTag
      ? commits
      : await getCommits(previousTag)
    : commits;
  const changes = releaseCommits
    .filter(
      (commit) =>
        branch === "next" ||
        Object.values(prefixes).some((prefix) =>
          commit.message.startsWith(prefix),
        ),
    )
    .map(
      (commit) =>
        `- ${commit.message.split("\n")[0]} (${commit.sha.slice(0, 7)})`,
    )
    .join("\n");
  const body = `## Changes since ${previousTag ?? baselineVersion}\n${changes || "- Initial release"}`;

  await fs.appendFile(githubOutput, `NEW_VERSION=${version}\n`);
  await fs.appendFile(githubOutput, `RELEASE_BODY<<EOT\n${body}\nEOT\n`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
