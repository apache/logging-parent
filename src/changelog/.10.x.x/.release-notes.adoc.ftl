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

[#release-notes-${release.version?replace("[^a-zA-Z0-9]", "-", "r")}]
=== ${release.version}

<#if release.date?has_content>Release date:: ${release.date}</#if>

This minor release focuses on shipping AsciiDoc-based website generation convenience targeting the `src/site` folder.
As a part of this effort, `logging-parent` started publishing https://logging.apache.org/logging-parent[its own website] and `log4j-changelog` support is switched from Markdown to AsciiDoc.

The introduced https://github.com/bndtools/bnd/blob/master/maven-plugins/bnd-maven-plugin[`bnd-maven-plugin`] default auto-generates both OSGi and JPMS descriptors.
Users only need to annotate packages that are to be exported with `org.osgi.annotation.bundle.Export`, plugin will do the rest of the magic.
Hence, no need for custom `.bnd` and/or `module-info.java` files anymore.
In particular, we expect the absence of `module-info.java` files to avoid several IDE and testing related headaches.

<#include "../.changelog.adoc.ftl">
