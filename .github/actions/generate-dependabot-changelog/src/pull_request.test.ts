// SPDX-License-Identifier: Apache-2.0
import { getAssociatedPullRequest } from "./pull_request";
import { graphql } from "@octokit/graphql";

jest.mock("@octokit/graphql");

describe("getAssociatedPullRequest", () => {
  const mockGraphql = graphql.defaults as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return the associated pull request when the query is successful", async () => {
    const mockResponse = {
      repository: {
        object: {
          associatedPullRequests: {
            nodes: [
              {
                number: 123,
                url: "https://github.com/owner/repo/pull/123",
              },
            ],
          },
        },
      },
    };

    mockGraphql.mockReturnValueOnce(jest.fn().mockResolvedValue(mockResponse));

    const owner = "owner";
    const repo = "repo";
    const sha = "abc123";
    const token = "test-token";

    const result = await getAssociatedPullRequest(owner, repo, sha, token);

    expect(result).toEqual({
      number: 123,
      url: new URL("https://github.com/owner/repo/pull/123"),
    });
  });

  it("should throw an error when the query fails", async () => {
    const mockError = new Error("GraphQL query failed");
    mockGraphql.mockReturnValueOnce(jest.fn().mockRejectedValue(mockError));

    const owner = "owner";
    const repo = "repo";
    const sha = "abc123";
    const token = "test-token";

    await expect(
      getAssociatedPullRequest(owner, repo, sha, token),
    ).rejects.toThrow("GraphQL query failed");
  });

  it("should return null if there are no PRs associated", async () => {
    [
      null,
      // Wrong `owner` or `repo` values
      {
        repository: null,
      },
      // Wrong `sha` value
      {
        repository: {
          object: null,
        },
      },
      // Sha is not a commit
      {
        repository: {
          object: {},
        },
      },
      // No associated PRs
      {
        repository: {
          object: {
            associatedPullRequests: {
              nodes: [],
            },
          },
        },
      },
    ].forEach(async (mockResponse) => {
      mockGraphql.mockReturnValueOnce(
        jest.fn().mockResolvedValue(mockResponse),
      );

      const owner = "owner";
      const repo = "repo";
      const sha = "abc123";
      const token = "test-token";

      const result = await getAssociatedPullRequest(owner, repo, sha, token);
      expect(result).toEqual(null);
    });
  });
});
