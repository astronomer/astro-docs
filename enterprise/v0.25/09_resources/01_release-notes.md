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

### Support for NFS Volume-based DAG Deployment

We are pleased to offer NFS volume-based DAG deployment on Astronomer. This new deployment method is an alternative to image-based DAG deployment.

With NFS volume-based DAG deployment, you no longer need to rebuild your environment when deploying DAGs. When a DAG is added to an external NFS volume, it automatically appears in your Airflow Deployment a short time later. This new ability to continuously deploy DAGs without disruption makes it possible to achieve more with your Deployments.

NFS volume-based DAG deployment must be explicitly enabled on your platform. You must also create an external NFS volume and specify the location of the volume in Astronomer. For more information, read [Deploy to an NFS Volume](/docs/enterprise/v0.23/deploy/deploy-nfs).

> **Note:** To take advantage of this feature, your Airflow Deployments must be running on Airflow 2.0 or greater. To upgrade your Deployments, ready [Upgrade to Airflow 2.0](docs/enterprise/stable/customize-airflow/upgrade-to-airflow-2).

### Minor Improvements and Bug Fixes

-
