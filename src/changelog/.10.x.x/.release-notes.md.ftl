<#--
  ~ Licensed to the Apache Software Foundation (ASF) under one or more
  ~ contributor license agreements.  See the NOTICE file distributed with
  ~ this work for additional information regarding copyright ownership.
  ~ The ASF licenses this file to you under the Apache License, Version 2.0
  ~ (the "License"); you may not use this file except in compliance with
  ~ the License.  You may obtain a copy of the License at
  ~
  ~      http://www.apache.org/licenses/LICENSE-2.0
  ~
  ~ Unless required by applicable law or agreed to in writing, software
  ~ distributed under the License is distributed on an "AS IS" BASIS,
  ~ WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  ~ See the License for the specific language governing permissions and
  ~ limitations under the License.
  -->

# ${release.version}<#if release.date?has_content> (${release.date})</#if>

This minor release contains various improvements that we expect to relieve the load on `pom.xml` and GitHub Actions workflows of Maven-based projects we parent.
This is of particular importance while managing and cutting releases from multiple repositories.
See `README.adoc` for the complete list of features and their usage.

See [this `logging-log4j-tools` GitHub Actions workflow run](https://github.com/apache/logging-log4j-tools/actions/runs/6070379396) demonstrating a successful release cut using a SNAPSHOT version of this `logging-parent` release.
All preparations (release notes, distribution ZIP, vote & announcement emails, etc.) are staged to both Nexus and SVN and waiting the release manager to proceed.

<#include "../.changelog.md.ftl">
