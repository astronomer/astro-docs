---
title: "Release Notes"
navTitle: "Release Notes"
description: "Astronomer Enterprise release notes."
---

### Notice on Astronomer Enterprise Releases

Astronomer v0.23 is the latest available minor version in our long-term support (LTS) release model for Astronomer Enterprise.

For instructions on how to upgrade to a patch version within the Astronomer v0.23 series, refer to [Upgrade to a Patch Version of Astronomer Enterprise](/docs/enterprise/stable/manage-astronomer/upgrade-astronomer/). If you're running Astronomer v0.16 or below, refer to [Upgrade to Astronomer v0.23](/docs/enterprise/stable/manage-astronomer/upgrade-to-0-23/).

We're committed to testing all Astronomer Enterprise versions for scale, reliability and security on Amazon EKS, Google GKE and Azure AKS. If you have any questions or an issue to report, don't hesitate to [reach out to us](support.astronomer.io).

## Astronomer v0.23

Latest Patch Release: **v0.23.9**

### v0.23.9

Release Date: January 19, 2020

#### Platform Support for Airflow 2.0

Astronomer v0.23.9 offers full support for [Airflow 2.0](https://www.astronomer.io/blog/introducing-airflow-2-0/) on Astronomer. Already available for local development, Airflow 2.0 is a momentous open-source release that includes a refactored Scheduler, over 30 UI/UX improvements, a new REST API and much more.

In support of Airflow 2.0, Astronomer v0.23.9 includes:

- Support for Multiple Schedulers
- Enforcement for users to migrate to Airflow 1.10.14 prior to upgrading to 2.0
- Support for Airflow's ["upgrade check"](https://airflow.apache.org/docs/apache-airflow/stable/upgrade-check.html) in the Astronomer CLI (`$ astro dev upgrade-check`)

For local guidelines, read [Get Started with Airflow 2.0](https://www.astronomer.io/guides/get-started-airflow-2).

#### Support for Multiple Schedulers (_Airflow 2.0+_)

As mentioned above, Airflow 2.0 allows users to provision multiple Airflow Schedulers for ultimate high-availability and scale. In tandem with full support for Airflow 2.0 on Astronomer, v0.23 supports the ability to provision up to 4 Schedulers via the Astronomer UI for Airflow Deployments running Airflow 2.0+.

For guidelines, refer to [Configure an Airflow Deployment on Astronomer](https://www.astronomer.io/docs/enterprise/v0.16/deploy/configure-deployment#scale-core-resources). For Scheduler performance benchmarks and technical deep-dive into Airflow's critical component, read ["The Airflow 2.0 Scheduler"](https://www.astronomer.io/blog/airflow-2-scheduler).

#### Airflow Version Selection & Upgrade in Astronomer UI/CLI

Astronomer v0.23 formally introduces **Airflow Version** to the Astronomer UI, CLI and API for an enhanced version selection and Airflow upgrade experience.

To see version of Airflow your Deployment is running, refer to the corresponding **Settings** page of the Astronomer UI. If you're interested in upgrading versions, you can initialize the upgrade process via the Astronomer UI or CLI for a guided experience. From there, you'll receive instructions to update the Astronomer Certified (AC) image in your Dockerfile and complete the process.

For more information, refer to [Manage Airflow Versions](https://www.astronomer.io/docs/enterprise/stable/customize-airflow/manage-airflow-versions/).

#### Real-time Support for Latest Astronomer Certified Versions

In contrast with Astronomer v0.16, Astronomer v0.23+ does not require that a release be shipped with explicit support for any Astronomer Certified version or set of Docker images.

As soon as a version of Astronomer Certified is published to our [updates service](http://updates.astronomer.io/astronomer-certified), all corresponding Astronomer Certified images and tags will immediately become available for selection in the Astronomer UI and CLI.

For more information, refer to [Manage Airflow Versions](https://www.astronomer.io/docs/enterprise/stable/customize-airflow/manage-airflow-versions/).

#### New Deployment-level Permissions

Astronomer Enterprise v0.23 introduces Deployment-level permissions, a much-awaited feature for large teams running multiple Airflow Deployments on Astronomer.

Users can now configure and be assigned 1 of 3 user roles within each individual Airflow Deployment - _Admin_, _Editor_ and _Viewer_. If you operate with production and development environments, for example, you can restrict a user's access to your production Airflow Deployment as a _Viewer_ but grant them full access to your development Airflow Deployment as an _Admin_ - all within the same Workspace. Users who exclusively need Workspace permissions do not require permissions to any or all Airflow Deployments within it.

This new permissions framework comes with support via the Astronomer UI/API and a new set of commands for the Astronomer CLI. For more information, refer to [User Permissions](https://www.astronomer.io/docs/enterprise/stable/manage-astronomer/workspace-permissions/).

#### A New "Deploment Status" Framework

A significant infrastructural change in Astronomer v0.23 is the introduction of a new `deploymentStatus` query that allows the platform to more reliably communicate the status of a _deploy_ and the overall health of your Airflow Deployment. We define a _deploy_ as the process that begins when a user triggers a change to an Airflow Deployment (e.g. a code push from the Astronomer CLI or the addition of an Environment Variable) and ends when that change is successfully passed and considered to be live.

While this change largely sets the foundation for new features in later releases, Astronomer v0.23 includes:

- A new banner in the **Deployment** view of the Astronomer UI if a deploy to that Airflow Deployment is in progress.
- Refined logic for **Deployment Health Status** (Unhealthy/Red, Healthy/Green, Deploying/Blue and Unknown/Gray) that's visible as a "bubble" next to all Airflow Deployments in the Astronomer UI.
- A set of error messages to alert you if a deploy has failed or was otherwise _not_ complete.

#### Houston API Improvements

Astronomer v0.23 includes standardization of the following 2 mutations to be more strongly typed and reliable:

- `updateDeployment`
- `createDeployment`

If you're calling either of those mutations in your current workflow, Astronomer v0.23 will introduce a breaking change.

As we strive to polish and standardize the schema more generally, our API will undergo rapid and potentially breaking changes over the next few releases. The Astronomer CLI and UI will continue to stay in sync with API changes and is our recommended way to interact with the platform.

If calling our API programmatically is critical to your use case, reference our [Houston API Documentation](/docs/enterprise/stable/manage-astronomer/houston-api/) for details and stay in close touch with our team.

#### Support for v0.23.3 of the Astronomer CLI

Astronomer v0.23.9 is fully compatible with the latest version of the Astronomer CLI, v0.23.3.

In addition to bug fixes already addressed in v0.16 versions, v0.23.3 of the Astronomer CLI includes:

 - Improvement: Add email validation to `$ astro workspace user add` command in Astro CLI
- BugFix: Variables and Connections declared in `airflow_settings.yaml` are not properly passed to Airflow's Metadata Database via the Astro CLI
- BugFix: Inaccurate CLI version output on `$ astro upgrade`
- BugFix: Correct Astro CLI output for `deployment service-account create --help` subcommand to read `--deployment-id`

For a full reference of Astronomer CLI releases, go to [Astronomer's corresponding GitHub repo](https://github.com/astronomer/astro-cli/releases).

#### Bug Fixes & Improvements

- Opt-in users to **Email Alerts** by default
- Default to latest available version of Airflow on Deployment Creation via Astronomer UI/CLI
- Improved user search in Astronomer UI
- Updated doc links in Astronomer UI
- Platform Upgrade to [Prisma 2](https://www.prisma.io/) (Database Toolkit for our Houston API)
- Display toast message in Astronomer UI following Deployment deletion
- Replace `workspaceUuid` with `deploymentUuid` in arg for `deploymentVariables` Houston API mutation
- Ability to search Deployment users by role via Houston API
- Houston and Commander Images now created with a non-root user
- Support for new configuration options in Fluentd S3 Plugin (S3 path where Airflow logs are stored and server side encryption)