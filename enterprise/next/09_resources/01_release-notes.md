---
title: "Release Notes"
navTitle: "Release Notes"
description: "Astronomer Enterprise release notes."
---

### Notice on Astronomer Enterprise Releases

Astronomer v0.23 is the latest available minor version in our long-term support (LTS) release model for Astronomer Enterprise.

For instructions on how to upgrade to a patch version within the Astronomer v0.23 series, refer to [Upgrade to a Patch Version of Astronomer Enterprise](/docs/enterprise/stable/manage-astronomer/upgrade-astronomer/).

We're committed to testing all quarterly Astronomer Enterprise versions for scale, reliability and security on EKS, GKE and AKS. If you have any questions or an issue to report, don't hesitate to [reach out to us](support.astronomer.io).

## Astronomer v0.23

Latest Patch Release: **v0.23.9**

### v0.23.9

Release Date: January 19, 2020

#### New Deployment-level Permissions

Astronomer Enterprise v0.23 introduces deployment-level permissions, a much-awaited feature for teams running multiple Airflow Deployments on Astronomer.

Users can now configure and be assigned 1 of 3 user roles within each Deployment - _Admin_, _Editor_ and _Viewer_. If you have a "Prod" and "Dev" Airflow Deployment, for example, you can restrict a user's access to "Prod" as a _Viewer_ but grant them full access to "Dev" as an _Admin_ - all within the same Workspace. Similarly, the level of access that Workspace _Admins_ have to the Airflow Deployments within that Workpace can now be customized without limiting their ability to manage Workspace user invites, for example.

This new framework comes with support via the Astronomer UI/API and a new set of commands for the Astro CLI. For more information, refer to our re-factored ["User Permissions" doc](https://www.astronomer.io/docs/enterprise/stable/manage-astronomer/workspace-permissions/).

#### Airflow Version Selection & Upgrade in Astronomer UI/CLI

This release formally introduces "Airflow Version" to the Astronomer UI, CLI and API for an enhanced version selection and Airflow upgrade experience.

Users can now see the version of Airflow they're running in the **Settings** page of a Deployment and indicate interest in upgrading to a higher version. Users who initialize the upgrade process via the Astronomer UI or CLI will be instructed to update the Astronomer Certified (AC) Docker image in their Dockerfile and be given feedback along the way.

For more information, refer to ["Manage Airflow Versions"](https://www.astronomer.io/docs/enterprise/stable/customize-airflow/manage-airflow-versions/).

#### Support for Airflow 2.0

For more on Airflow 2.0, check out our blog post, ["Introducing Airflow 2.0"](https://www.astronomer.io/blog/introducing-airflow-2-0/).

#### Support for Multiple Schedulers (_Airflow 2.0+_)

Airflow 2.0 allows users to provision multiple Airflow Schedulers for ultimate high-availability and scale. In tandem with full support for Airflow 2.0 on Astronomer, v0.23 supports the ability to provision up to 4 Schedulers via the Astronomer UI for Airflow Deployments running Airflow 2.0+.

For more information, refer to the "Scale Core Resources" section of [Configure an Airflow Deployment on Astronomer](https://www.astronomer.io/docs/enterprise/v0.16/deploy/configure-deployment#scale-core-resources).

#### A New "Deploment Status" Framework

The biggest change to Astronomer Cloud in v0.21 is the introduction of a new `deploymentStatus` query that allows the platform to more reliably communicate the status of a _deploy_ and the overall health of your Airflow Deployment. We define a _deploy_ as the process that begins when a user triggers a change to an Airflow Deployment (e.g. a code push from the Astronomer CLI or the addition of an Environment Variable) and ends when that change is successfully passed and considered to be live.

While this change largely sets the foundation for new features in later releases, we did include a handful of UX improvements in the meantime.

More specifically, Astronomer v0.21 will include:

- A new banner in the "Deployment" view of the Astronomer UI if a deploy to that Airflow Deployment is in progress.
- Refined logic for "Deployment Health Status" (Unhealthy/Red, Healthy/Green, Deploying/Blue and Unknown/Gray) that's visible as a "bubble" next to all Airflow Deployments in the Astronomer UI.
- A set of error messages to alert you if a deploy has failed or was otherwise _not_ complete.

#### Dynamically available Astronomer Certified Images with updates.astronomer.io

#### Houston API Improvements

Astronomer v0.18 includes standardization of the following 2 mutations to be more strongly typed and reliable:

- `updateDeployment`
- `createDeployment`

If you're calling either of those mutations in your current workflow, Astronomer v0.18 will introduce a breaking change.

As we strive to polish and standardize the schema more generally, our API will undergo rapid and potentially breaking changes over the next few releases. The Astronomer CLI and UI will continue to stay in sync with API changes and is our recommended way to interact with the platform.

If calling our API programmatically is critical to your use case, reference our [Houston API Documentation](/docs/cloud/stable/manage-astronomer/houston-api/) for details and stay in close touch with our team.

#### Bug Fixes & Improvements

- Opt-in users to **Email Alerts** by default
- Default to latest available version of Airflow on Deployment Creation via Astro UI/CLI
- Improved user search in Astro UI
- Updated doc links in Astro UI
- Platform Upgrade to [Prisma 2](https://www.prisma.io/) (Database Toolkit for our Houston API)
- Improvement: Display toast message in Astronomer UI following Deployment deletion
- Improvement: Replace `workspaceUuid` with `deploymentUuid` in arg for `deploymentVariables` Houston API mutation
- Improvement: The 'Create', 'Update' and 'Delete' Deployment operations are now implemented in an event-driven framework optimized for reliability