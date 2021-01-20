---
title: "Version Compatibility Reference for Astronomer Enterprise"
navTitle: "Version Compatibility Reference"
description: "A reference of all adjecent tooling required to run Astronomer Enterprise and corresponding version compatibility."
---

## Overview

The Astronomer Platform ships with and requires a number of adjacent technologies that support it, including Kubernetes, Helm and Apache Airflow itself. For users looking to install or upgrade Astronomer, we've provided a reference of all required tooling with corresponding versions that are compatible with each long-term support (LTS) version of Astronomer Enterprise. For those running Astronomer Certified (our distribution of Apache Airflow) _without_ our platform, we've included a reference table below as well.

It's worth noting that while the tables below reference the minimum compatible versions, we typically recommend running the _latest_ of all tooling if possible.

## Astronomer Enterprise

| Astronomer Platform  | Kubernetes        | Helm | Terraform | Postgres | Astronomer Certified                             | Python       |
|----------------------|------------------|------|-----------|----------|--------------------------------------------------|---------------|
| v0.16                | 1.16, 1.17, 1.18 | 3    | 0.12, 0.13.5      | 9.6+     | 1.10.5, 1.10.7, 1.10.10, 1.10.12, 1.10.14        | 3.6, 3.7, 3.8 |
| v0.23 (*Coming Soon*)| 1.16, 1.17, 1.18 | 3    | 0.13.5      | 9.6+     | 1.10.5, 1.10.7, 1.10.10, 1.10.12, 1.10.14, 2.0.0 | 3.6, 3.7, 3.8 |

> **Note:** Astronomer v0.16.9+ is required to run Astronomer Certified 1.10.12, and Astronomer v0.16.15+ is required to run Astronomer Certified 1.10.14. For instructions on how to upgrade to the latest version of Astronomer, refer to our ["Enterprise Upgrade Guide"](https://www.astronomer.io/docs/enterprise/v0.16/manage-astronomer/upgrade-patch/).

## Astronomer Certified

| Astronomer Certified    | Postgres | MySQL     | Python        | System Distribution             |
|-------------------------|----------|-----------|---------------|---------------------------------|
| 1.10.5                  | 9.6+     | 5.7, 8.0+ | 3.6, 3.7, 3.8 | Alpine 3.10, Debian 10 (Buster) |
| 1.10.7                  | 9.6+     | 5.7, 8.0+ | 3.6, 3.7, 3.8 | Alpine 3.10, Debian 10 (Buster) |
| 1.10.10                 | 9.6+     | 5.7, 8.0+ | 3.6, 3.7, 3.8 | Alpine 3.10, Debian 10 (Buster) |
| 1.10.12                 | 9.6+     | 5.7, 8.0+ | 3.6, 3.7, 3.8 | Alpine 3.10, Debian 10 (Buster) |
| 1.10.14                 | 9.6+     | 5.7, 8.0+ | 3.6, 3.7, 3.8 | Debian 10 (Buster)              |
| 2.0.0 (*Coming Soon*)   | 9.6+     | 8.0+      | 3.6, 3.7, 3.8 | Debian 10 (Buster)              |

For more detail on each version of Astronomer Certified and instructions on how to upgrade, refer to our ["Manage Airflow Versions" doc](https://www.astronomer.io/docs/enterprise/v0.16/customize-airflow/manage-airflow-versions/).

> **Note:** MySQL 5.7 is compatible with Airflow and Astronomer Certified 2.0 but it does NOT support the ability to run more than 1 Scheduler and is not recommended. If you'd like to leverage Airflow's new Highly-Available Scheduler, make sure you're running MySQL 8.0+.

## Additional Resources

The table above lists long-term support (LTS) versions of Astronomer and does not specify _patch_ versions that our engineering team releases on a regular basis. For more detail on changes between patches, refer to [Astronomer Enterprise Release Notes](https://www.astronomer.io/docs/enterprise/v0.16/resources/release-notes/).

> **Note:** If you're running on a legacy version of Astronomer (pre-v0.16), reach out to [Astronomer Support](https://support.astronomer.io) to schedule an upgrade with our team.

### Kubernetes Upgrade Guides

If you're looking to upgrade Kubernetes versions, make sure to follow the guidelines offered by your managed offering provider.

- [Amazon EKS](https://docs.aws.amazon.com/eks/latest/userguide/update-cluster.html)
- [Azure AKS](https://docs.microsoft.com/en-us/azure/aks/upgrade-cluster)
- [Google GKE](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-upgrades)
- [RedHat OpenShift](https://docs.openshift.com/container-platform/4.6/updating/updating-cluster-between-minor.html)