// SPDX-License-Identifier: Apache-2.0
import * as core from "@actions/core";
import * as github from "@actions/github";
import { writeFile } from "fs/promises";
import { getAssociatedPullRequest } from "./pull_request";
import { getProjectVersion } from "./maven";
import { createChangelogEntry } from "./changelog";
import { extractDependabotMetadata } from "./dependabot";

export async function run(): Promise<void> {
  const token = core.getInput("token");
  if (!token) {
    core.setFailed("No GitHub token provided. Please set the 'token' input.");
    return;
  }
  const sha = core.getInput("sha");
  if (!sha) {
    core.setFailed("No SHA provided. Please set the 'sha' input.");
    return;
  }
  const changelogPath = core.getInput("changelog-path");
  if (!changelogPath) {
    core.setFailed(
      "No changelog path provided. Please set the 'changelog-path' input.",
    );
    return;
  }

  try {
    const context = github.context;
    const owner = context.repo.owner;
    const repo = context.repo.repo;
    // Initialize output
    core.setOutput("dependency-count", 0);

    // Get the PR associated with the SHA
    core.info(`Getting associated pull request for SHA: ${sha}`);
    const pullRequest = await getAssociatedPullRequest(owner, repo, sha, token);
    if (pullRequest) {
      core.setOutput("pull-request-number", pullRequest.number);
      core.setOutput("pull-request-html-url", pullRequest.url.toString());
      core.info(`Associated pull request found: ${pullRequest.number}`);
    } else {
      core.info(`No associated pull request found for SHA: ${sha}`);
    }

    // Get the project version
    core.info(`Getting project version`);
    const projectVersion = await getProjectVersion(".");
    const releasePath =
      projectVersion.major === 0
        ? `.0.${projectVersion.minor}.x`
        : `.${projectVersion.major}.x.x`;

    // Extract the Dependabot metadata
    core.info(`Extracting Dependabot metadata`);
    const client = github.getOctokit(token);
    const commit = await client.rest.repos.getCommit({
      owner,
      repo,
      ref: sha,
    });
    if (!commit) {
      core.setFailed(`No commit found for SHA: ${sha}`);
      return;
    }
    const commitMessage = commit.data.commit.message;
    const dependencies = await extractDependabotMetadata(commitMessage);

    await Promise.all(
      dependencies.map(async (dependency) => {
        core.info(
          `Creating changelog entry for: ${dependency.dependencyName}, new version: ${dependency.newVersion}`,
        );
        const entry = createChangelogEntry(
          dependency,
          pullRequest?.number,
          pullRequest?.url,
        );
        const fileName = `${changelogPath}/${releasePath}/${fileSystemSafePath(dependency.dependencyName)}.xml`;
        await writeFile(fileName, entry, { encoding: "utf-8" });
      }),
    );
    core.info(`Changelog entries created successfully.`);
    core.setOutput("dependency-count", dependencies.length);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed("An unknown error occurred.");
    }
  }
}

function fileSystemSafePath(path: string): string {
  return path.replace(/[^a-zA-Z0-9_.-]/g, "_");
}

run();
