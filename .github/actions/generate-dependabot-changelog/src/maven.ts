// SPDX-License-Identifier: Apache-2.0
import { readFile } from "fs/promises";
import path from "path";

interface MavenVersion {
  major: number;
  minor: number;
  patch: number;
}

export async function getProjectVersion(
  projectPath: string,
): Promise<MavenVersion> {
  const pomPath = path.join(projectPath, "pom.xml");

  const pomContent = await readFile(pomPath, "utf-8").catch((err) => {
    throw new Error(`Error reading pom.xml: ${err.message}`);
  });
  const { XMLParser } = await import("fast-xml-parser");

  const parser = new XMLParser({ parseTagValue: false });
  const pomData = parser.parse(pomContent);

  const revision = pomData.project?.properties?.revision;
  if (!revision) {
    throw new Error(`Revision property not found in pom.xml`);
  }

  return parseVersion(pomData.project.properties.revision);
}

function parseVersion(version: string): MavenVersion {
  const versionParts = version.split(/[.-]/);
  const major = parseInt(versionParts[0], 10);
  const minor = versionParts.length > 1 ? parseInt(versionParts[1], 10) : 0;
  const patch = versionParts.length > 2 ? parseInt(versionParts[2], 10) : 0;
  if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
    throw new Error(`Invalid version format: ${version}`);
  }

  return {
    major: major,
    minor: minor,
    patch: patch,
  };
}
