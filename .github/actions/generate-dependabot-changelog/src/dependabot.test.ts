// SPDX-License-Identifier: Apache-2.0
import { extractDependabotMetadata } from "./dependabot";

describe("extractDependabotMetadata", () => {
  it("should extract updated dependencies from a valid commit message", async () => {
    const commitMessage = `
---
updated-dependencies:
- dependency-name: com.fasterxml.jackson:jackson-bom
  dependency-version: 2.19.0
  dependency-type: direct:production
  update-type: version-update:semver-minor
  dependency-group: all-dependencies
...
        `;
    const result = await extractDependabotMetadata(commitMessage);

    expect(result).toEqual([
      {
        dependencyName: "com.fasterxml.jackson:jackson-bom",
        newVersion: "2.19.0",
      },
    ]);
  });

  it("should return an empty array if no updated dependencies are found", async () => {
    const commitMessage = `
---
some-other-data:
  - key: "value"
...
        `;
    const result = await extractDependabotMetadata(commitMessage);

    expect(result).toEqual([]);
  });

  it("should return an empty array if the commit message does not contain YAML", async () => {
    const commitMessage = `This is a plain text commit message without YAML.`;
    const result = await extractDependabotMetadata(commitMessage);

    expect(result).toEqual([]);
  });
});
