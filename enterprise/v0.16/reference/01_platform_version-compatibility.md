---
title: "Version Compatibility for Adjacent Tooling"
navTitle: "Version Compatibility for Adjacent Tooling"
description: "A reference of all adjecent tooling required to run Astronomer Enterprise and corresponding version compatibility."
---

## Overview

The Astronomer Platform ships with and requires a number of adjacent technologies that support it, including Kubernetes, Helm and Apache Airflow itself. For users looking to install or upgrade Astronomer, we've provided a reference of all required tooling with corresponding versions that are compatible with each long-term support (LTS) version of Astronomer Enterprise.

## Astronomer Enterprise Version Compatibility Matrix

| Astronomer Platform | Kubernetes             | Helm | Terraform | Postgres | Astronomer Certified                    | Python |
|---------------------|------------------------|------|-----------|----------|-----------------------------------------|--------|
| v0.16               | 1.14, 1.15, 1.16, 1.17 | 3    | 0.12      | 9.6+     | 1.10.5, 1.10.7, 1.10.10, 1.10.12        | 2, 3   |
| v0.22               | 1.15, 1.16, 1.17       | 3    | 0.12      | 9.6+     | 1.10.5, 1.10.7, 1.10.10, 1.10.12, 2.0.0 | 2, 3   |

> **Note:** Astronomer v0.16.9+ is required to run Astronomer Certified 1.10.12. For instructions on how to upgrade, refer to our ["Airflow Versioning" doc](https://www.astronomer.io/docs/enterprise/v0.16/customize-airflow/airflow-versioning/).

## Additional Resources

The table above lists long-term support (LTS) versions of Astronomer and does not specify _patch_ versions that our engineering team releases on a regular basis. For more detail on changes between patches, refer to [Astronomer Enterprise Release Notes](https://www.astronomer.io/docs/enterprise/v0.16/resources/release-notes/).

If you're running on a legacy Astronomer version (pre-v0.16), reach out to [Astronomer Support](https://support.astronomer.io) to schedule an upgrade with our team.

