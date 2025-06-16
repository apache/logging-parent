// SPDX-License-Identifier: Apache-2.0
import { getProjectVersion } from "./maven";

jest.mock("fs/promises");
import { readFile } from "fs/promises";
const mockReadFile = readFile as jest.MockedFunction<typeof readFile>;

describe("getProjectVersion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw an error if pom.xml does not exist", async () => {
    mockReadFile.mockRejectedValue(new Error("File not found"));

    await expect(getProjectVersion("/mock/path")).rejects.toThrow(
      "Error reading pom.xml: File not found",
    );
  });

  it("should throw an error if revision property is not found in pom.xml", async () => {
    [
      "project></project>",
      "<project><properties></properties></project>",
      "<project><properties><revision></revision></properties></project>",
    ].forEach((content) => {
      mockReadFile.mockResolvedValue(content);
      expect(getProjectVersion("/mock/path")).rejects.toThrow(
        "Revision property not found in pom.xml",
      );
    });
  });

  it("should throw an error if version format is invalid", async () => {
    mockReadFile.mockResolvedValue(`
            <project>
                <properties>
                    <revision>ABC</revision>
                </properties>
            </project>
        `);

    await expect(getProjectVersion("/mock/path")).rejects.toThrow(
      "Invalid version format: ABC",
    );
  });

  it("should return the parsed version if pom.xml is valid", async () => {
    [
      {
        version: "1.2.3",
        expected: { major: 1, minor: 2, patch: 3 },
      },
      {
        version: "1.2",
        expected: { major: 1, minor: 2, patch: 0 },
      },
      {
        version: "1",
        expected: { major: 1, minor: 0, patch: 0 },
      },
      {
        version: "1.2.3-alpha",
        expected: { major: 1, minor: 2, patch: 3 },
      },
      {
        version: "1.2.3-SNAPSHOT",
        expected: { major: 1, minor: 2, patch: 3 },
      },
    ].forEach((p) => {
      mockReadFile.mockResolvedValue(`
                <project>
                    <properties>
                        <revision>${p.version}</revision>
                    </properties>
                </project>
            `);

      const result = getProjectVersion("/mock/path");
      expect(result).resolves.toEqual(p.expected);
    });
  });
});
