// SPDX-License-Identifier: Apache-2.0
import { graphql } from "@octokit/graphql";

export interface PullRequest {
  number: number;
  url: URL;
}

interface QueryResponse {
  repository: {
    object: {
      associatedPullRequests: {
        nodes: Array<{
          number: number;
          url: string;
        }>;
      } | null;
    } | null;
  } | null;
}

export async function getAssociatedPullRequest(
  owner: string,
  repo: string,
  sha: string,
  token: string,
): Promise<PullRequest | null> {
  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${token}`,
    },
  });
  const query = `
        query($owner: String!, $repo: String!, $sha: GitObjectID!) {
            repository(owner: $owner, name: $repo) {
                object(oid: $sha) {
                    ... on Commit {
                        associatedPullRequests(first: 1) {
                            nodes {
                                number
                                url
                            }
                        }
                    }
                }
            }
    }`;
  const variables = {
    owner: owner,
    repo: repo,
    sha: sha,
  };
  const response: QueryResponse = await graphqlWithAuth(query, variables);
  const pullRequests =
    response?.repository?.object?.associatedPullRequests?.nodes || [];
  return pullRequests.length === 0
    ? null
    : {
        number: pullRequests[0].number,
        url: new URL(pullRequests[0].url),
      };
}
