---
title: "Astronomer v0.25 Release Notes"
navTitle: "Release Notes"
description: "Astronomer Enterprise release notes."
---

## Overview

Astronomer v0.25 is the latest available minor version in our long-term support (LTS) release model for Astronomer Enterprise.

If you're looking to upgrade to Astronomer v0.25, refer to [Upgrade to Astronomer v0.25](/docs/enterprise/v0.25/manage-astronomer/upgrade-to-0-25/). For instructions on how to upgrade to a patch version within the Astronomer v0.25 series, refer to [Upgrade to a Patch Version of Astronomer Enterprise](/docs/enterprise/v0.25/manage-astronomer/upgrade-astronomer-patch/).

We're committed to testing all Astronomer Enterprise versions for scale, reliability and security on Amazon EKS, Google GKE and Azure AKS. If you have any questions or an issue to report, don't hesitate to [reach out to us](https://support.astronomer.io).

## v0.25.3

Release Date: June 25, 2021

### Support for Kubernetes 1.19 and 1.2

The Astronomer platform is now compatible with Kubernetes 1.19 and 1.2. Enterprise users can now configure their clusters to take advantage of the latest Kubernetes features as described in the [official documentation](https://kubernetes.io/blog/2020/12/08/kubernetes-1-20-release-announcement/).

To learn more about what versions of key platform components are supported for any given release, read [Version Compatibility Reference](/docs/enterprise/v0.25/resources/version-compatibility-reference).

### Bypass User Invite Emails via Houston API

The Houston API `workspaceAddUser` mutation now includes a `bypassInvite` field. When this field is set to true, users invited to a Workspace no longer need to first verify their email addresses before accessing the Workspace. This type of query can be useful to minimize friction when programmatically inviting many users to your platform. For more information, see [Sample Mutations](/docs/enterprise/v0.25/manage-astronomer/houston-api#sample-mutations).

### Minor Bug Fixes and Improvements

- Workspace Admins can now perform CRUD operations on any Deployment within their Workspace, even if they don't have Deployment Admin permissions for the given Deployment.
- Added the ability to use non-RFC address spaces for Alertmanager.
- Changed sidecar naming convention from `nginx` to `auth-proxy`.
- Added `fsGroup` to the Webserver `securityContext` to enable [role assumption](https://docs.aws.amazon.com/eks/latest/userguide/security_iam_service-with-iam.html) for EKS 1.17.
- Fixed an issue where private root CA's did not work due to an unmounted certificate.
- Fixed broken links to Deployments in alert emails.
- Fixed an issue where longer task execution logs did not appear in the Airflow UI.
- Fixed a visual bug where non-Workspace Admins had access to a non-functional Invite Users button in the Astronomer UI.

## v0.25.2

Release Date: May 18, 2021

### Bug Fixes

- Fixed an API issue that caused the migration script from Astronomer v0.23 to v0.25 to fail if the NFS volume-based deployment mechanism was not enabled.

## v0.25.1

Release Date: May 11, 2021

### Support for NFS Volume-based DAG Deploys

We are pleased to offer an NFS volume-based DAG deploy mechanism on Astronomer. This new deployment method is an alternative to image-based DAG deploys.

With NFS volume-based DAG deploys, you no longer need to rebuild and restart your environment when deploying changes to your DAGs. When a DAG is added to an external NFS volume, such as Azure File Storage or Google Cloud Filestore, it automatically appears in your Airflow Deployment a short time later. Compared to image-based deploys, this new mechanism limits downtime and better enables continuous development.

This feature must be explicitly enabled on your platform and requires the use of an external NFS volume. For more information, read [Deploy to an NFS Volume](/docs/enterprise/v0.25/deploy/deploy-nfs).

> **Note:** To take advantage of this feature, your Airflow Deployments must be running on Airflow 2.0 or greater. To upgrade your Deployments, read [Manage Airflow Versions](docs/enterprise/v0.25/customize-airflow/manage-airflow-versions).

### Bug Fixes

- Fixed an issue where Grafana pods did not run properly when `global.ssl.mode` was set to `prefer`. ([Source](https://github.com/astronomer/astronomer/pull/1082))
