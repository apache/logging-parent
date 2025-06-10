////
    Licensed to the Apache Software Foundation (ASF) under one or more
    contributor license agreements.  See the NOTICE file distributed with
    this work for additional information regarding copyright ownership.
    The ASF licenses this file to You under the Apache License, Version 2.0
    (the "License"); you may not use this file except in compliance with
    the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
////

////
    ██     ██  █████  ██████  ███    ██ ██ ███    ██  ██████  ██
    ██     ██ ██   ██ ██   ██ ████   ██ ██ ████   ██ ██       ██
    ██  █  ██ ███████ ██████  ██ ██  ██ ██ ██ ██  ██ ██   ███ ██
    ██ ███ ██ ██   ██ ██   ██ ██  ██ ██ ██ ██  ██ ██ ██    ██
     ███ ███  ██   ██ ██   ██ ██   ████ ██ ██   ████  ██████  ██

    IF THIS FILE DOESN'T HAVE A `.ftl` SUFFIX, IT IS AUTO-GENERATED, DO NOT EDIT IT!

    Version-specific release notes (`7.8.0.adoc`, etc.) are generated from `src/changelog/*/.release-notes.adoc.ftl`.
    Auto-generation happens during `generate-sources` phase of Maven.
    Hence, you must always

    1. Find and edit the associated `.release-notes.adoc.ftl`
    2. Run `./mvnw generate-sources`
    3. Commit both `.release-notes.adoc.ftl` and the generated `7.8.0.adoc`
////

[${'#release-notes-' + (release.version?replace("[^a-zA-Z0-9]", "-", "r"))}]
== ${release.version}

<#if release.date?has_content>Release date:: ${release.date}</#if>

This release contains a big revamp to the website build and several other minor enhancements.

[#release-notes-11-0-0-website-build]
=== Website build changes

The website build system is migrated from `asciidoctor-maven-plugin` to Antora.
This implies that `src/site` and `generate-email.sh` files need to be adapted, and `target/site` can be viewed without needing a local web server.

The Maven `site` phase is re-engineered such that _generated sources_ (i.e., `src/site/_release_notes` and `src/site/_constants.adoc`) will be targeted to `target/generated-site` and the website will be built from there.
This avoids the need to commit generated sources to the repository and, hence, works around changelog merge conflict problems.

[#release-notes-11-0-0-website-deployment]
=== Website deployment changes

The newly added `site-deploy-reusable.yaml` GitHub Actions workflow enables to automate the website deployment.
Using the `<source-branch>-site-<environment>-out` branch naming convention, the Maven `site` goal running on

* the `main` branch populates the `main-site-stg-out` branch serving the `logging.staged.apache.org/logging-parent`
* the `main-site-pro` branch populates the `main-site-pro-out` branch serving the `logging.apache.org/logging-parent`
* the `release/<version>` branch populates the `release/<version>-site-stg-out` branch serving the `logging.staged.apache.org/logging-parent-<version>`

Refer to the usage and project release instructions pages for details.

<#include "../.changelog.adoc.ftl">
