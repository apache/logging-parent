// SPDX-License-Identifier: Apache-2.0
import YAML from "yaml";

export interface UpdatedDependency {
  dependencyName: string;
  newVersion: string;
}

export async function extractDependabotMetadata(
  commitMessage: string,
): Promise<UpdatedDependency[]> {
  const yamlFragment = commitMessage.match(
    /^-{3}\n(?<dependencies>[\S|\s]*?)\n^\.{3}\n/m,
  );
  if (yamlFragment?.groups) {
    const data = YAML.parse(yamlFragment.groups.dependencies);
    if (data["updated-dependencies"]) {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      return Promise.all(
        data["updated-dependencies"].map(async (dependency: any) => {
          const dependencyName = dependency["dependency-name"];
          const newVersion = dependency["dependency-version"];
          return {
            dependencyName,
            newVersion,
          };
        }),
      );
    }
  }
  return Promise.resolve([]);
}
