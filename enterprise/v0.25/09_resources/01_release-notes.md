---
title: "Astronomer v0.25 Release Notes"
navTitle: "Release Notes"
description: "Astronomer Enterprise release notes."
---

## Overview

Astronomer v0.25 is the latest available minor version in our long-term support (LTS) release model for Astronomer Enterprise.

If you're looking to upgrade to Astronomer v0.25, refer to [Upgrade to Astronomer v0.25](/docs/enterprise/v0.25/manage-astronomer/upgrade-to-0-25/). For instructions on how to upgrade to a patch version within the Astronomer v0.25 series, refer to [Upgrade to a Patch Version of Astronomer Enterprise](/docs/enterprise/v0.25/manage-astronomer/upgrade-astronomer-patch/).

We're committed to testing all Astronomer Enterprise versions for scale, reliability and security on Amazon EKS, Google GKE and Azure AKS. If you have any questions or an issue to report, don't hesitate to [reach out to us](https://support.astronomer.io).

## v0.25.0

Release Date: April 27, 2021

### Support for NFS Volume-based DAG Deploys

We are pleased to offer an NFS volume-based DAG deploy mechanism on Astronomer. This new deployment method is an alternative to image-based DAG deploys.

With NFS volume-based DAG deploys, you no longer need to rebuild and restart your environment when deploying DAGs. When a DAG is added to an external NFS volume, it automatically appears in your Airflow Deployment a short time later. Compared to image-based deploys, this new mechanism limits downtime and better enables continuous development.

This feature must be explicitly enabled on your platform and requires the use of an external NFS volume. For more information, read [Deploy to an NFS Volume](/docs/enterprise/v0.23/deploy/deploy-nfs).

> **Note:** To take advantage of this feature, your Airflow Deployments must be running on Airflow 2.0 or greater. To upgrade your Deployments, read [Upgrade to Airflow 2.0](docs/enterprise/stable/customize-airflow/upgrade-to-airflow-2).

### Bug Fixes

- Fixed an issue where Grafana pods would not run properly when `global.ssl.mode` was set to `prefer`. ([Source](https://github.com/astronomer/astronomer/pull/1082))
