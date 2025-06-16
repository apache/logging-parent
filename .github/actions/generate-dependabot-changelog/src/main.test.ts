// SPDX-License-Identifier: Apache-2.0
import * as core from "@actions/core";
import * as github from "@actions/github";
import { run } from "./main";
import { getAssociatedPullRequest } from "./pull_request";
import { getProjectVersion } from "./maven";
import { extractDependabotMetadata } from "./dependabot";
import { writeFile } from "fs/promises";

jest.mock("@actions/core");
jest.mock("@actions/github");
jest.mock("./pull_request");
jest.mock("./maven");
jest.mock("./dependabot");
jest.mock("fs/promises");

describe("run", () => {
  const mockSetFailed = jest.spyOn(core, "setFailed");
  const mockSetOutput = jest.spyOn(core, "setOutput");
  const mockInfo = jest.spyOn(core, "info");

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(core, "getInput").mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        token: "fake-token",
        sha: "fake-sha",
        "changelog-path": "src/changelog",
      };
      return inputs[name];
    });
    /* eslint-disable @typescript-eslint/no-explicit-any */
    (github.context.repo as any) = { owner: "owner", repo: "repo" };
  });

  it("should fail if no token is provided", async () => {
    jest.spyOn(core, "getInput").mockReturnValueOnce("");
    await run();
    expect(mockSetFailed).toHaveBeenCalledWith(
      "No GitHub token provided. Please set the 'token' input.",
    );
  });

  it("should fail if no SHA is provided", async () => {
    jest
      .spyOn(core, "getInput")
      .mockImplementation((name: string) => (name === "sha" ? "" : "value"));
    await run();
    expect(mockSetFailed).toHaveBeenCalledWith(
      "No SHA provided. Please set the 'sha' input.",
    );
  });

  it("should fail if no changelog path is provided", async () => {
    jest
      .spyOn(core, "getInput")
      .mockImplementation((name: string) =>
        name === "changelog-path" ? "" : "value",
      );
    await run();
    expect(mockSetFailed).toHaveBeenCalledWith(
      "No changelog path provided. Please set the 'changelog-path' input.",
    );
  });

  it("should fail if no commit is found", async () => {
    (getAssociatedPullRequest as jest.Mock).mockResolvedValue(null);
    (getProjectVersion as jest.Mock).mockResolvedValue({ major: 1, minor: 0 });
    (github.getOctokit as jest.Mock).mockReturnValue({
      rest: {
        repos: {
          getCommit: jest.fn().mockResolvedValue(null),
        },
      },
    });

    await run();

    expect(mockSetFailed).toHaveBeenCalledWith(
      "No commit found for SHA: fake-sha",
    );
    expect(mockSetOutput).toHaveBeenCalledWith("dependency-count", 0);
  });

  it("should handle no associated pull request", async () => {
    (getAssociatedPullRequest as jest.Mock).mockResolvedValue(null);
    (getProjectVersion as jest.Mock).mockResolvedValue({ major: 1, minor: 0 });
    (github.getOctokit as jest.Mock).mockReturnValue({
      rest: {
        repos: {
          getCommit: jest.fn().mockResolvedValue({
            data: { commit: { message: "commit message" } },
          }),
        },
      },
    });
    (extractDependabotMetadata as jest.Mock).mockResolvedValue([
      { dependencyName: "dep1", newVersion: "1.0.0" },
      { dependencyName: "dep2", newVersion: "2.0.0" },
    ]);

    await run();

    expect(mockInfo).toHaveBeenCalledWith(
      "No associated pull request found for SHA: fake-sha",
    );
    expect(mockInfo).toHaveBeenCalledWith(
      "Creating changelog entry for: dep1, new version: 1.0.0",
    );
    expect(mockInfo).toHaveBeenCalledWith(
      "Creating changelog entry for: dep2, new version: 2.0.0",
    );
    expect(writeFile).toHaveBeenCalledTimes(2);
    expect(mockSetOutput).toHaveBeenCalledWith("dependency-count", 2);
  });

  it("should write changelog entries to the specified path", async () => {
    const cases = [
      {
        version: { major: 1, minor: 2, patch: 3 },
        expectedPath: "src/changelog/.1.x.x",
      },
      {
        version: { major: 0, minor: 1, patch: 2 },
        expectedPath: "src/changelog/.0.1.x",
      },
    ];

    for (const c of cases) {
      (getProjectVersion as jest.Mock).mockResolvedValue(c.version);
      (github.getOctokit as jest.Mock).mockReturnValue({
        rest: {
          repos: {
            getCommit: jest.fn().mockResolvedValue({
              data: { commit: { message: "commit message" } },
            }),
          },
        },
      });
      (extractDependabotMetadata as jest.Mock).mockResolvedValue([
        { dependencyName: "dependency", newVersion: "1.0.0" },
      ]);

      await run();
      expect(writeFile).toHaveBeenCalledWith(
        `${c.expectedPath}/dependency.xml`,
        expect.any(String),
        {
          encoding: "utf-8",
        },
      );
    }
  });

  it("should create changelog entries for dependencies", async () => {
    (getAssociatedPullRequest as jest.Mock).mockResolvedValue({
      number: 123,
      url: "http://example.com/pr",
    });
    (getProjectVersion as jest.Mock).mockResolvedValue({ major: 1, minor: 0 });
    (github.getOctokit as jest.Mock).mockReturnValue({
      rest: {
        repos: {
          getCommit: jest.fn().mockResolvedValue({
            data: { commit: { message: "commit message" } },
          }),
        },
      },
    });
    (extractDependabotMetadata as jest.Mock).mockResolvedValue([
      { dependencyName: "dep1", newVersion: "1.0.0" },
      { dependencyName: "dep2", newVersion: "2.0.0" },
    ]);

    await run();

    expect(mockInfo).toHaveBeenCalledWith(
      "Creating changelog entry for: dep1, new version: 1.0.0",
    );
    expect(mockInfo).toHaveBeenCalledWith(
      "Creating changelog entry for: dep2, new version: 2.0.0",
    );
    expect(writeFile).toHaveBeenCalledTimes(2);
    expect(mockSetOutput).toHaveBeenCalledWith("dependency-count", 2);
    expect(mockSetOutput).toHaveBeenCalledWith("pull-request-number", 123);
    expect(mockSetOutput).toHaveBeenCalledWith(
      "pull-request-html-url",
      "http://example.com/pr",
    );
  });

  it("should fail if an error occurs", async () => {
    const errors = [
      { error: new Error("Test error"), expected: "Test error" },
      { error: "Test error", expected: "An unknown error occurred." },
    ];
    for (const c of errors) {
      (getAssociatedPullRequest as jest.Mock).mockRejectedValue(c.error);
      await run();
      expect(mockSetFailed).toHaveBeenCalledWith(c.expected);
    }
  });
});
