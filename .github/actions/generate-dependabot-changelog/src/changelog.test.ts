// SPDX-License-Identifier: Apache-2.0
import { UpdatedDependency } from "./dependabot";
import { createChangelogEntry } from "./changelog";

describe("createChangelogEntry", () => {
  it("should create a valid changelog entry with an issue number", () => {
    const dependency: UpdatedDependency = {
      dependencyName: "example-library",
      newVersion: "1.1.0",
    };
    const issueId = 123;
    const issueUrl = new URL("https://example.com/issues/123");

    const result = createChangelogEntry(dependency, issueId, issueUrl);

    const expectedXML = `<?xml version="1.0" encoding="UTF-8"?>
<entry xmlns="https://logging.apache.org/xml/ns" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="https://logging.apache.org/xml/ns https://logging.apache.org/xml/ns/log4j-changelog-0.xsd"
  type="updated">
  <issue id="123" link="https://example.com/issues/123"/>
  <description format="asciidoc">Updated dependency example-library to version 1.1.0</description>
</entry>
`;
    expect(result).toEqual(expectedXML);
  });

  it("should create a valid changelog entry without an issue number", () => {
    const dependency: UpdatedDependency = {
      dependencyName: "example-library",
      newVersion: "1.1.0",
    };

    const result = createChangelogEntry(dependency, undefined, undefined);

    const expectedXML = `<?xml version="1.0" encoding="UTF-8"?>
<entry xmlns="https://logging.apache.org/xml/ns" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="https://logging.apache.org/xml/ns https://logging.apache.org/xml/ns/log4j-changelog-0.xsd"
  type="updated">
  <description format="asciidoc">Updated dependency example-library to version 1.1.0</description>
</entry>
`;
    expect(result).toEqual(expectedXML);
  });
});
