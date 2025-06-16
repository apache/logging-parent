// SPDX-License-Identifier: Apache-2.0
import { UpdatedDependency } from "./dependabot";
import { create } from "xmlbuilder2";

export function createChangelogEntry(
  dependency: UpdatedDependency,
  issueId: number | undefined,
  issueUrl: URL | undefined,
): string {
  const entryBuilder = create({ version: "1.0", encoding: "UTF-8" }).ele(
    "entry",
    {
      xmlns: "https://logging.apache.org/xml/ns",
      "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
      "xsi:schemaLocation":
        "https://logging.apache.org/xml/ns https://logging.apache.org/xml/ns/log4j-changelog-0.xsd",
      type: "updated",
    },
  );
  if (issueId && issueUrl) {
    entryBuilder.ele("issue", { id: issueId, link: issueUrl.toString() });
  }
  entryBuilder
    .ele("description", { format: "asciidoc" })
    .txt(
      `Updated dependency ${dependency.dependencyName} to version ${dependency.newVersion}`,
    )
    .up();

  return entryBuilder
    .end({
      prettyPrint: true,
      width: 120,
    })
    .concat("\n");
}
