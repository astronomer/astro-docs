---
title: "Astronomer v0.23 Release Notes"
navTitle: "Release Notes"
description: "Astronomer Enterprise release notes."
---

## Overview

Astronomer v0.23 is the latest available minor version in our long-term support (LTS) release model for Astronomer Enterprise.

If you're looking to upgrade to Astronomer v0.23 from Astronomer v0.16, refer to [Upgrade to Astronomer v0.23](/docs/enterprise/v0.23/manage-astronomer/upgrade-to-0-23/). For instructions on how to upgrade to a patch version within the Astronomer v0.23 series, refer to [Upgrade to a Patch Version of Astronomer Enterprise](/docs/enterprise/v0.23/manage-astronomer/upgrade-astronomer-patch/).

We're committed to testing all Astronomer Enterprise versions for scale, reliability and security on Amazon EKS, Google GKE and Azure AKS. If you have any questions or an issue to report, don't hesitate to [reach out to us](https://support.astronomer.io).

> **Note:** The perceived version gap between Astronomer Enterprise v0.16 and v0.23 is due to the nature of Astronomer's release schedule. To optimize for security and reliability, Astronomer Cloud releases are made available to Enterprise users only after they've passed a dedicated testing process. Astronomer Enterprise v0.23 includes _all_ changes made available on Astronomer Cloud between v0.16 and v0.23, in addition to Enterprise-only functionality.

## v0.23.12

Release Date: March 30, 2021

### Platform Support for Ingress Annotations

In Astronomer Enterprise 0.23.12, you can now configure the behavior of Ingress resources by specifying an [annotation](https://docs.nginx.com/nginx-ingress-controller/configuration/ingress-resources/advanced-configuration-with-annotations/) in your Astronomer Helm Chart. For example, you can now upgrade from the Classic Load Balancer to the Network Load Balancer on Amazon EKS by adding the following to your [`config.yaml` file](https://github.com/astronomer/astronomer/blob/e4e5705df9b778a002a6fce2d53e5170292792ba/values.yaml#L202):

```
  ingressAnnotations: {service.beta.kubernetes.io/aws-load-balancer-type: nlb}
```

Then, push the changes to your platform as described in [Apply a Config Change](/docs/enterprise/stable/manage-astronomer/apply-platform-config).

### Platform Support for Disabling Alertmanager Clustering

In private networks, you might want to disable Alertmanager clustering to avoid failures due to a gossip protocol. To do so, you can now configure `alertmanager.disableClustering` in your `config.yaml` file and push the change to your platform as described in [Apply a Config Change](/docs/enterprise/stable/manage-astronomer/apply-platform-config).

### Support for Airflow 1.10.15

[Airflow 1.10.15](https://github.com/apache/airflow/releases/tag/1.10.15) comes with a suite of enhancements and bug fixes that follow [Airflow 1.10.14](https://github.com/apache/airflow/releases/tag/1.10.14), which was released in December of 2020 to make the migration to [Airflow 2.0](https://www.astronomer.io/blog/introducing-airflow-2-0) as easy as possible. If you haven't migrated to Airflow 2.0 yet, you _must_ upgrade to Airflow 1.10.14+ first.

Specifically, Airflow 1.10.15 includes the following changes:

- Fix sync-perm to work correctly when update_fab_perms = False [(commit)](https://github.com/astronomer/airflow/commit/950028f93e1220d49629aea10dfbaf1173b8910b)
- Pin SQLAlchemy to <1.4 due to breakage of sqlalchemy-utils [(commit)](https://github.com/astronomer/airflow/commit/331f0d23260a77212e7b15707e04bee02bdab1f2)
- Enable DAG Serialization by default [(commit)](https://github.com/apache/airflow/commit/cd1961873783389ee51748f7f2a481900cce85b9)
- Stop showing Import Errors for Plugins in Webserver [(commit)](https://github.com/apache/airflow/commit/a386fd542fe1c46bd3e345371eed10a9c230f690)
- Add role-based authentication backend [(commit)](https://github.com/apache/airflow/commit/16461c3c8dcb1d1d2766844d32f3cdec31c89e69)
- Show a "Warning" to Users with duplicate connections [(commit)](https://github.com/apache/airflow/commit/c037d48c9e383a6fd0b1b0d88407489d0ed02194)
- `KubernetesExecutor` should accept images from `executor_config` [(commit)](https://github.com/apache/airflow/pull/13074)
- Fixed inability to import Airflow plugins on Python 3.8 [(commit)](https://github.com/apache/airflow/pull/12859)
- Fixed Scheduler not acknowledging active runs properly [(commit)](https://github.com/apache/airflow/pull/13803)

For detailed guidelines on how to upgrade Airflow on Astronomer, read [Upgrade Airflow](https://www.astronomer.io/docs/enterprise/v0.23/customize-airflow/manage-airflow-versions). For more information on 1.10.15, check out the [Airflow Release](https://airflow.apache.org/docs/apache-airflow/1.10.15/changelog.html) or the corresponding [AC 1.10.15 changelog](https://github.com/astronomer/ap-airflow/blob/master/1.10.15/CHANGELOG.md).

### Bug fixes

- Addressed CVEs found in the following platform images: `ap-curator`, `ap-db-bootstrapper`, `ap-elasticsearch`, `ap-fluentd`, `ap-grafana`, `ap-kibana`, `ap-nats-server`, `ap-nginx`, `ap-nginx-es`, `ap-postgres-exporter`, `ap-registry`, and `ap-vendor/fluentd`.
- When two or more Fluentd parameters are set in Astronomer's `config.yaml` file, the resulting Fluentd configmap values are now properly concatenated. ([Source](https://github.com/astronomer/astronomer/pull/1031))
- The value for an Environment Variable that exists with the same name in 2+ Airflow Deployments now renders correctly when navigating between those Deployments in the Astronomer UI.
- Airflow task logs are no longer missing in the Airflow UI for users running Astronomer v0.23.9 on IKS. ([Source](https://github.com/astronomer/astronomer/pull/1023))
- Setting `AIRFLOW__KUBERNETES__FS_GROUP:50000` in the Astronomer UI now properly forces the `fsGroup` setting in the pod template file. ([Source](https://github.com/astronomer/airflow-chart/pull/190))
- Nginx ingress scraping for Prometheus now scrapes and reports metrics for all `nginx` replicas in aggregate, as opposed to one pod at a time. ([Source](https://github.com/astronomer/astronomer/pull/1010))
- Fixed an issue where Airflow Schedulers were unable to adopt running Kubernetes Executor tasks due to a permissions error, causing those tasks to be queued and then terminated. ([Source](https://github.com/astronomer/airflow-chart/pull/191))

## v0.23.11

Release Date: February 11, 2021

### Bug Fixes & Improvements

- BugFix: Connections, Pools, and Variables in `airflow_settings.yaml` not built into image via Astronomer CLI if Airflow 2.0 image (*Resolved in CLI v0.23.3*)
- BugFix: Houston API does not pull latest available Airflow patch on deploy (e.g. Airflow `2.0.0-1` if Airflow `2.0.0-2` is available)
- BugFix: A SysAdmin Service Account created via the Houston API does not have right to see all Workspaces and can only be seen by a SysAdmin user in the Workspace(s) they're a part of.
- BugFix: Workspace Service Account suddenly only available as a Deployment Service account (Error: `Insufficient Permissions`)
- BugFix: The Houston DB migration pod stuck in interactive mode on upgrade to Astronomer v0.23
- BugFix: Upgrade from Airflow 2.0.0 to Airflow 2.0.1 via the Astronomer CLI fails

## v0.23.9

Release Date: January 20, 2021

### Platform Support for Airflow 2.0

Astronomer Enterprise v0.23 offers full support for [Airflow 2.0](https://www.astronomer.io/blog/introducing-airflow-2-0/). Already available for local development, Airflow 2.0 is a momentous open-source release that includes a refactored Scheduler, over 30 UI/UX improvements, a new REST API and much more.

In support of Airflow 2.0, Astronomer v0.23 includes:

- Support for Multiple Schedulers
- A mechanism to ensure that users migrate to Airflow 1.10.14 prior to upgrading to 2.0
- Support for Airflow's ["upgrade check"](https://airflow.apache.org/docs/apache-airflow/v0.23/upgrade-check.html) in the Astronomer CLI (`$ astro dev upgrade-check`)

For local development guidelines, read [Get Started with Airflow 2.0](https://www.astronomer.io/guides/get-started-airflow-2).

### Support for Multiple Schedulers (_Airflow 2.0+_)

Airflow 2.0 allows users to provision multiple Airflow Schedulers for ultimate high-availability and scale. In tandem with full support for Airflow 2.0 on Astronomer, v0.23 supports the ability to provision up to 4 Schedulers via the Astronomer UI for Airflow Deployments running Airflow 2.0+.

For guidelines, refer to [Configure an Airflow Deployment on Astronomer](https://www.astronomer.io/docs/enterprise/v0.16/deploy/configure-deployment#scale-core-resources). For Scheduler performance benchmarks and a technical deep-dive into Airflow's critical component, read ["The Airflow 2.0 Scheduler"](https://www.astronomer.io/blog/airflow-2-scheduler).

### Airflow Version Selection & Upgrade in Astronomer UI/CLI

Astronomer v0.23 formally introduces **Airflow Version** to the Astronomer UI, CLI, and API for an enhanced version selection and Airflow upgrade experience.

To see the version of Airflow your Deployment is running, refer to its **Settings** page in the Astronomer UI. If you're interested in upgrading versions, you can now initialize the upgrade process via the Astronomer UI or CLI for a guided experience. From there, you'll receive instructions to complete the process by updating the Astronomer Certified (AC) image in your `Dockerfile`.

For more information, refer to [Manage Airflow Versions](https://www.astronomer.io/docs/enterprise/v0.23/customize-airflow/manage-airflow-versions/).

### Real-time Support for Latest Astronomer Certified Versions

In contrast with v0.16, Astronomer Enterprise v0.23 does not require that a release be shipped with explicit support for any Astronomer Certified version or set of Docker images. Decoupling these components helps you stay current with less overhead.

As soon as a version of Astronomer Certified is published to our [updates service](http://updates.astronomer.io/astronomer-certified), all corresponding Astronomer Certified images and tags will become available for selection in the Astronomer UI and CLI within 24 hours.

For more information, refer to [Manage Airflow Versions](https://www.astronomer.io/docs/enterprise/v0.23/customize-airflow/manage-airflow-versions/).

### New Deployment-level Permissions

Astronomer Enterprise v0.23 introduces Deployment-level permissions, a much-awaited feature for large teams running multiple Airflow Deployments on Astronomer.

Within each individual Airflow Deployment, users can now configure and be assigned 1 of 3 user roles:  _Admin_, _Editor_, or _Viewer_. If you operate with production and development environments, for example, you can restrict a user's access to your production Airflow Deployment as a _Viewer_ but grant them full access to your development Airflow Deployment as an _Admin_ all within the same Workspace. Users who exclusively need Workspace permissions do not require permissions to any or all Airflow Deployments within it.

This new permissions framework comes with support via the Astronomer UI/API and a new set of commands for the Astronomer CLI. For more information, refer to [User Permissions](https://www.astronomer.io/docs/enterprise/v0.23/manage-astronomer/workspace-permissions/).

### A New "Deployment Status" Framework

A significant infrastructural change in Astronomer v0.23 is the introduction of a new `deploymentStatus` query that allows the platform to more reliably communicate the status of a _deploy_ and the overall health of your Airflow Deployment. We define a _deploy_ as the process that begins when a user triggers a change to an Airflow Deployment (e.g. a code push from the Astronomer CLI or the addition of an Environment Variable) and ends when that change is successfully passed and considered to be live.

While this change largely sets the foundation for new features in later releases, Astronomer v0.23 includes:

- A new banner in the **Deployment** view of the Astronomer UI that indicates if a deploy is in progress.
- Refined logic for **Deployment Health Status** (Unhealthy/Red, Healthy/Green, Deploying/Blue and Unknown/Gray) that's visible as a "bubble" next to all Airflow Deployments in the Astronomer UI.
- A set of error messages to alert you if a deploy failed or was otherwise not completed.

### Improved Celery Worker Update Strategy

Astronomer Enterprise v0.23 includes an improvement to the process by which new Celery Workers are created and begin to pick up tasks following a deploy to an Airflow Deployment on Astronomer.

Previously, the number of Celery Worker replicas that could be immediately created following a deploy was restricted to 25% of the total number of desired Celery Workers, until the original Workers shut down. This meant that it took longer for replacement Celery Workers to be created and start picking up Airflow tasks. Defined as `maxSurge`, that percentage is now set to 100%, allowing the maximum number of Celery Worker replicas to exist and push your data pipelines forward.

For users, this change will result in a quicker, more efficient, and more graceful deploy process.

> **Note:** This improvement applies only to those running Airflow with the Celery Executor on Astronomer. For more information on Airflow Executors, refer to ["Airflow Executors Explained"](https://www.astronomer.io/guides/airflow-executors-explained) or [Configure an Airflow Deployment on Astronomer](https://www.astronomer.io/docs/enterprise/v0.23/deploy/configure-deployment).

### Houston API Improvements

Astronomer v0.23 includes standardization of the following two mutations to be more strongly typed and reliable:

- `updateDeployment`
- `createDeployment`

If you're calling either of those mutations in your current workflow, Astronomer v0.23 will introduce a breaking change.

As we strive to polish and standardize the schema more generally, our API will undergo rapid and potentially breaking changes over the next few releases. The Astronomer CLI and UI will continue to stay in sync with API changes and is our recommended way to interact with the platform.

If calling our API programmatically is critical to your use case, reference our [Houston API Documentation](/docs/enterprise/v0.23/manage-astronomer/houston-api/) for details and stay in close touch with our team.

### Support for v0.23 of the Astronomer CLI

Astronomer Enterprise v0.23 is fully compatible with the latest version of the Astronomer CLI, v0.23.2.

In addition to functionality already available in v0.16, v0.23 of the Astronomer CLI includes:

- Email validation on `$ astro workspace user add`
- Clarify "success" output on `$ astro deploy`
- BugFix: Inaccurate CLI version output on `$ astro upgrade`
- BugFix: Correct output for `deployment service-account create --help` subcommand to read `--deployment-id`

Users running Astronomer Enterprise v0.23 MUST upgrade to the latest version of the Astronomer CLI. To do so, run:

```
$ curl -sSL https://install.astronomer.io | sudo bash
```

For detailed instructions, refer to [CLI Quickstart](https://www.astronomer.io/docs/enterprise/v0.23/develop/cli-quickstart). For a full reference of Astronomer CLI releases, go to the [Astronomer CLI GitHub repo](https://github.com/astronomer/astro-cli/releases).

### Bug Fixes & Improvements

- Default to latest available version of Airflow on Deployment Creation via Astronomer UI/CLI
- Opt-in users to **Email Alerts** by default
- Improved user search in Astronomer UI
- Ability to search Deployment users by role via Houston API
- Updated documentation links in Astronomer UI
- Display toast message in Astronomer UI following Deployment deletion
- Platform Upgrade to [Prisma 2](https://www.prisma.io/) (Database Toolkit for our Houston API)
- Replace `workspaceUuid` with `deploymentUuid` in arg for `deploymentVariables` Houston API mutation
- Houston and Commander Images now created with a non-root user
- Support for new configuration options in Fluentd S3 Plugin (S3 path where Airflow logs are stored and server side encryption)
- Improved OpenShift support
- Support for [Azure Database for PostgreSQL - Flexible Server](https://docs.microsoft.com/en-us/azure/postgresql/flexible-server/)
