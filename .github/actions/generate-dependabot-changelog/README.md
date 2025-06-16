<!-- SPDX-License-Identifier: Apache-2.0 -->

# Generate changelog entries action

This action automatically generates changelog entry files for Dependabot commits in the format used by [Log4j Changelog](https://logging.apache.org/log4j/tools/log4j-changelog.html).

## Inputs

### `token`

**Required** The GitHub token. Default `${{ secrets.GITHUB_TOKEN }}`.

### `sha`

**Required** SHA1 of the commit to use. Default `${{ github.sha }}`.

### `changelog-path`

**Required** Base directory where the changelog entries are created. Default `src/changelog`.

## Outputs

### `dependency-count`

Number of changelog entries created.

### `pull-request-number`

Pull request number, if the commit is attached to a PR.

### `pull-request-html-url`

Pull request HTML URL, if the commit is attached to a PR.

## Building

After each change to this action, it needs to be recompiled using:

```shell
npm run test
npm run build
```

