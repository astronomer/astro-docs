---
title: "Release Notes"
description: "Astronomer Platform Release Notes"
date: 2020-01-24T00:00:00.000Z
slug: "release-notes"
---
## Astronomer v0.12 Release Notes

Release Date: March 9, 2020

### Platform-Wide Changes

#### New Astronomer UI

Astronomer v0.12 ships with a new and freshly designed Astronomer UI. As our company and customer base matures, our front-end team felt ready to re-design the underlying framework of the Astronomer UI to optimize for better reliability, flexibility and scale.

The v0.12 Astronomer UI is largely parallel in functionality as the v0.11 UI but sets a strong foundation for future releases.

To check out our changes, [log into Astronomer Cloud](https://app.gcp0001.us-east4.astronomer.io/login) or your very own Enterprise installation.

#### Bug Fixes and Improvements

A few notable bug fixes and improvements:
- Issue creating Deployment-Level Service Accounts via the Astronomer UI resolved
- Add missing `conn_schema` param to default `airflow_settings.yaml` file

### Enterprise-Only Changes

#### Remove Wildcart SSL Certificate Requirement for Astronomer Installation

As part of our wider effort to lower the barrier to and simplify the Astronomer Enterprise installation process, we've removed the wildcard SSL certificate requirement from our pre-requisites (AWS EKS, GCP GKE, Azure AKS, etc.).

#### Add support for a zero-config platform DB for Astronomer Installation

To futher simplify the Astronomer Enteprise installation process upfront, we've added support for a baked-in Postgres database that requires no configuration.

> **Note:** Our new zero-config database is not intended for use in production. For production environments, we recommend a managed PostgreSQL-compatible database solution external to the Kubernetes Cluster on which Enterprise is installed (e.g. Amazon Aurora).

#### Alert in the Astronomer UI when a new version of Astronomer is available

On Astronomer v0.12 and beyond, Astronomer Enterprise users will now be alerted via the Astronomer UI as soon as a new platform release is available.

#### Bug Fixes and Improvements

- Single Namespace Mode Improvements

## Astronomer v0.11 Release Notes

Release Date: January 24, 2020

### Platform-Wide Changes

#### Support for Airflow 1.10.6 and 1.10.7

Astronomer v0.11 ships with a new set of Docker images for Airflow versions [1.10.6](https://github.com/apache/airflow/releases/tag/1.10.6rc1) and [1.10.7](https://github.com/apache/airflow/releases/tag/1.10.7) in addition to our already-supported Airflow 1.10.5 image.

We've additionally de-coupled Astronomer and Airflow releases, allowing each individual version of the Astronomer Platform to support a variety of Airflow images. For both Cloud and Enterprise users, this adds significant flexibiliy and lowers common incompatibility issues and dependencies across the board.

For a breakdown of supported Airflow Images on v0.11, refer to our [Airflow Versioning Doc](https://github.com/astronomer/docs/blob/v0.11/v0.11/airflow-versioning.md).

#### Support for a Debian-based Docker Image

Astronomer now officially supports a Debian-based Docker image in addition to all Alpine images we've made available.

Alpine is a widely-used lightweight distribution of Linux that keeps our images slim and performant, but nonetheless presents limitations for users looking to leverage Machine Learning Python libraries like `tensorflow` and `scikit-learn` that are often much easier to run on a Debian-based build.

To leverage a Debian Image on Astronomer v0.11, check out our [Airflow Versioning Doc](https://github.com/astronomer/docs/blob/v0.11/v0.11/airflow-versioning.md)

#### Exposed Docker Image Tag in the Astronomer UI

In an effort to expose more metadata on deploys to users, the tag of the latest Docker image pushed up to an Airflow Deployment is now listed in the "Deployment Configure" page of the Astronomer UI in addition to its existing place in CLI-generated output.

Moving forward, every push to Astronomer will generate a `deploy-n` tag (historically `cli-n), "n" representing the "number" of deploys made to that deployment. For example, `deploy-1` would represent a first code push, `deploy-2` the second, `deploy-3` the third, etc.
Users leveraging CI/CD can now verify what version of their code is running on our platform.

#### Allow Astronomer Service Accounts access to the Airflow API

Previously available on Astronomer v0.7.5, we've re-enabled the ability for users to leverage Astronomer Service Accounts to call the Airflow API and Webserver. Now, users can programmatically trigger DAGs via the Airflow API using a long-lasting Service Account instead of an authentication token that expires within 24Hours.

For guidelines, check out [this forum post](https://forum.astronomer.io/t/can-i-use-the-airflow-rest-api-to-externally-trigger-a-dag/162).

#### Bug Fixes & Stability Improvements

A few bug fixes and improvements:
- Improved Search in Astronomer's "Users" tab
- "Back to Earth" link fixed in error page when Airflow is spinning up
- Added a raw URL to the "Confirm your Email" message upon sign-up
- Support for pre-pushing shared image layers to the platform for faster deploys

### Astronomer Enterprise

In addition to platform changes applicable to all Astronomer users, v0.11 shipped with additional features and improvements for those running Astronomer Enterprise.

#### Ability to Customize Platform-Wide User Permissions

We've created a new `USER` role that is synthetically bound to _all_ users within a single cluster and is entirely configurable, allowing Enterprise administrators to customize permissions for non-SysAdmin users across the platform.

For example, Enterprise administrators can now protect resource usage on the cluster by prohibiting non-SysAdmin users from creating Workspaces and provisioning Airflow deployments.

#### Support for Global Service Accounts

Astronomer now supports Global Service Accounts in addition to those that already exist at the Deployment and Workspace levels, empowering Enterprise SysAdmins to automate system-level API calls as needed.

## Prior Releases

To view release notes prior to Astronomer v0.11, refer to [our blog](/blog) or [changelog](https://github.com/astronomer/astronomer/blob/master/CHANGELOG.md) on Github.

Recent product release blog posts:

* [v0.10 Release](/blog/astronomer-v0-10-0-release)
* [v0.9 Release](/blog/astronomer-v0-9-0-release)
* [v0.8 Release](/blog/astronomer-v0-8-0-release)
* [v0.7 Release](/blog/astronomer-v0-7-0-release)
* [v0.6 Release](/blog/astronomer-v0-6-0-release)
* [v0.5 Release](/blog/astronomer-v0-5-0-release)