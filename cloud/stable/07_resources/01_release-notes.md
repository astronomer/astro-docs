---
title: "Release Notes"
navTitle: "Release Notes"
description: "Astronomer Cloud Release Notes."
---

## Astronomer v0.25

### v0.25.3

Release Date: June 30th, 2021

#### Bypass Email Verification for Users via Houston API

The Houston API `workspaceAddUser` mutation now includes a `bypassInvite` field. When this field is set to true, users invited to a Workspace no longer need to first verify their email addresses before accessing the Workspace. This type of query can be useful to minimize friction when programmatically inviting many users to Astronomer. For more information, see [Sample Mutations](/docs/cloud/stable/manage-astronomer/houston-api#sample-mutations).

#### Minor Improvements

- Workspace Admins can now perform CRUD operations on any Deployment within their Workspace, even if they don't have Deployment Admin permissions for the given Deployment.

#### Bugfixes

- Fixed broken links to Deployments in alert emails.
- Fixed an issue where historical logs did not appear in the Astronomer UI.
- Fixed an issue where long task execution logs did not appear in the Airflow UI.
- Fixed a visual bug where some Deployments with only 1 Scheduler were shown as having 2 in the Astronomer UI.
- Fixed a visual bug where users without Workspace Admin permissions had a non-functional **Invite Users** button in the Astronomer UI.

### v.0.25.2

Release Date: May 18th, 2021

#### Minor Improvements

This release contains features and bug fixes only for Astronomer Enterprise v0.25. For more information about these changes, read the [Enterprise release notes](docs/enterprise/v0.25/resources/release-notes).

### v0.25.1

Release Date: May 11th, 2021

#### Minor Improvements

This release contains features and bug fixes only for Astronomer Enterprise v0.25. For more information about these changes, read the [Enterprise release notes](docs/enterprise/v0.25/resources/release-notes).

## Astronomer v0.23

### v0.23.13

Release Date: April 13, 2021

#### Zero Webserver Downtime for Airflow 2.0+ Deployments

We're excited to announce that Astronomer v0.23.13 introduces zero Webserver downtime for Deployments running Airflow 2.0+. This feature is automatically enabled and requires no configuration in your system.

This change has a few effects:
- The Airflow Webserver now requires less CPU and Memory.
- Increasing your total # of DAGs no longer requires proportionally increasing your Webserver resources.
- When you deploy code or configuration changes via `astro deploy`, these changes will appear in the Airflow UI in real time without an intermediary "Airflow is Starting Up" page.
- The Webserver still restarts when you deploy code, but a "rolling restart" is applied so that the Webserver pod is slowly replaced by another instead of stopping entirely.

For context, this functionality is possible because Airflow 2.0 requires [DAG Serialization](https://airflow.apache.org/docs/apache-airflow/stable/dag-serialization.html), which is an open source feature that makes the Webserver stateless.

#### Bug Fixes

- Fixed an issue where new Deployments did not pull latest patch version of the corresponding Astronomer Certified image.

### v0.23.12

Release Date: March 30, 2021

#### Support for Airflow 1.10.15

[Airflow 1.10.15](https://github.com/apache/airflow/releases/tag/1.10.15) comes with a suite of enhancements and bug fixes that follow [Airflow 1.10.14](https://github.com/apache/airflow/releases/tag/1.10.14), which was released in December of 2020 to make the migration to [Airflow 2.0](https://www.astronomer.io/docs/cloud/stable/customize-airflow/upgrade-to-airflow-2) as easy as possible. If you haven't migrated to Airflow 2.0 yet, you _must_ upgrade to Airflow 1.10.14+ first.

Specifically, Airflow 1.10.15 includes the following changes:

- Fix sync-perm to work correctly when update_fab_perms = False [(commit)](https://github.com/astronomer/airflow/commit/950028f93e1220d49629aea10dfbaf1173b8910b)
- Pin SQLAlchemy to <1.4 due to breakage of sqlalchemy-utils [(commit)](https://github.com/astronomer/airflow/commit/331f0d23260a77212e7b15707e04bee02bdab1f2)
- Enable DAG Serialization by default [(commit)](https://github.com/apache/airflow/commit/cd1961873783389ee51748f7f2a481900cce85b9)
- Stop showing Import Errors for Plugins in Webserver [(commit)](https://github.com/apache/airflow/commit/a386fd542fe1c46bd3e345371eed10a9c230f690)
- Add role-based authentication backend [(commit)](https://github.com/apache/airflow/commit/16461c3c8dcb1d1d2766844d32f3cdec31c89e69)
- Show a "Warning" to Users with duplicate connections [(commit)](https://github.com/apache/airflow/commit/c037d48c9e383a6fd0b1b0d88407489d0ed02194)

For detailed guidelines on how to upgrade Airflow on Astronomer, read [Upgrade Airflow](https://www.astronomer.io/docs/cloud/stable/customize-airflow/manage-airflow-versions). For more information on 1.10.15, check out the [Airflow Release](https://airflow.apache.org/docs/apache-airflow/1.10.15/changelog.html) or the corresponding [AC 1.10.15 changelog](https://github.com/astronomer/ap-airflow/blob/master/1.10.15/CHANGELOG.md).

#### Bug Fixes

- Addressed CVEs found in the following platform images: `ap-curator`, `ap-db-bootstrapper`, `ap-elasticsearch`, `ap-fluentd`, `ap-grafana`, `ap-kibana`, `ap-nats-server`, `ap-nginx`, `ap-nginx-es`, `ap-postgres-exporter`, `ap-registry`, and `ap-vendor/fluentd`.
- The value for an Environment Variable that exists with the same name in 2+ Airflow Deployments now renders correctly when navigating between those Deployments in the Astronomer UI.
- Setting `AIRFLOW__KUBERNETES__FS_GROUP:50000` in the Astronomer UI now properly forces the `fsGroup` setting in the pod template file. ([Source](https://github.com/astronomer/airflow-chart/pull/190))
- Fixed an issue where Airflow Schedulers were unable to adopt running Kubernetes Executor tasks due to a permissions error, causing those tasks to be queued and then terminated. ([Source](https://github.com/astronomer/airflow-chart/pull/191))

### v0.23.11

Release Date: February 11, 2021

#### Bug Fixes & Improvements

- BugFix: Connections, Pools, and Variables in `airflow_settings.yaml` not built into image via Astronomer CLI if Airflow 2.0 image (*Resolved in CLI v0.23.3*)
- BugFix: Houston API does not pull latest available Airflow patch on deploy (e.g. Airflow `2.0.0-1` if Airflow `2.0.0-2` is available)
- BugFix: Workspace Service Account suddenly only available as a Deployment Service account (Error: `Insufficient Permissions`)

### v0.23.9

Release Date: January 18, 2021

This release was exclusively infrastructure maintenance for Astronomer Enterprise v0.23.

### v0.23.6

Release Date: December 16, 2020

#### Platform Support for Airflow 2.0

Astronomer now offers full support for [Airflow 2.0](https://www.astronomer.io/blog/introducing-airflow-2-0/), a momentous open-source release that includes a refactored Scheduler, over 30 UI/UX improvements, a new REST API, and much more.

In support for Airflow 2.0, Astronomer has:

- Support for [Multiple Schedulers](https://www.astronomer.io/blog/airflow-2-scheduler) (*added in v0.22.3*)
- A mechanism to ensure that users migrate to Airflow 1.10.14+ prior to upgrading to 2.0.0+ (*added in v0.23.5*)
- Support for Airflow's ["upgrade check"](https://airflow.apache.org/docs/apache-airflow/v0.23/upgrade-check.html) in the Astronomer CLI (`$ astro dev upgrade-check`) (*added in v0.23.5*)

For guidelines on how to upgrade, read [Upgrade to Airflow 2.0 on Astronomer](https://www.astronomer.io/docs/cloud/stable/customize-airflow/upgrade-to-airflow-2).

#### Bug Fixes & Improvements

- BugFix: Error on Deployment page in Astronomer UI if Deployment was created before August 10th, 2020 and Webserver resources have not been modified (`Cannot read property 'limits' of undefined`)

### v0.23.5

Release Date: December 14, 2020

#### Support for Airflow 1.10.14

Support for Airflow 1.10.14 as an Astronomer Certified image was introduced on December 11th, a few days prior to the release of Astronomer v0.23.5.

Airflow 1.10.14 was built to make testing and migration to Airflow 2.0 as easy as possible. Highlights include:

- "Warning" to users with duplicate Airflow Connections ([commit](https://github.com/apache/airflow/commit/0e40ddd8e))
- Enable [DAG Serialization](https://airflow.apache.org/docs/apache-airflow/stable/dag-serialization.html) by default ([commit](https://github.com/apache/airflow/commit/8a265067e))
- Support for Airflow 2.0 CLI commands ([commit](https://github.com/apache/airflow/pull/12725))
- Bugfix: Unable to import Airflow plugins on Python 3.8 ([commit](https://github.com/apache/airflow/pull/12859))
- BugFix: Tasks with depends_on_past or task_concurrency are stuck ([commit](https://github.com/apache/airflow/pull/12663))
- Security Fix: Incorrect Session Validation in Airflow Webserver with default config allows a an authorized Airflow user on site A access an unauthorized Airflow Webserver on Site B through the session from Site A. ([Details](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-17526))

To upgrade to AC 1.10.14, add our new Debian image to your Dockerfile:

```
FROM quay.io/astronomer/ap-airflow:1.10.14-buster-onbuild
```

For detailed guidelines on how to upgrade Airflow on Astronomer, read [“Manage Airflow Versions”](https://www.astronomer.io/docs/cloud/stable/customize-airflow/manage-airflow-versions). For more information on 1.10.14, check out the [Airflow Release](https://github.com/apache/airflow/releases/tag/1.10.14) or the corresponding [AC 1.10.14 changelog](https://github.com/astronomer/ap-airflow/blob/master/1.10.14/CHANGELOG.md).

> **Note:** In an effort to standardize our offering and optimize for reliability, we will only support a Debian-based image for AC 1.10.14. Alpine-based images for AC 1.10.5 - 1.10.12 will continue to be supported.

#### Support for latest Astronomer Certified Patch Releases

In addition to support for Airflow 1.10.14, Astronomer v0.16.15 also includes support for the latest patch versions of existing Astronomer Certified images:

- [1.10.12-2](https://github.com/astronomer/ap-airflow/blob/master/1.10.12/CHANGELOG.md)
- [1.10.10-6](https://github.com/astronomer/ap-airflow/blob/master/1.10.10/CHANGELOG.md)
- [1.10.7-16](https://github.com/astronomer/ap-airflow/blob/master/1.10.7/CHANGELOG.md)

For instructions on how to upgrade to the latest patch version of a release, refer to [Upgrade Airflow](https://www.astronomer.io/docs/cloud/stable/customize-airflow/manage-airflow-versions).

#### Improvements to Airflow 2.0 Upgrade Path

In preparation for Airflow 2.0, we've continued to enhance the expected migration experience for users on Airflow 1.10.

As of Astronomer v0.23.5, we:

- Enforce that all users migrate to Astronomer Certified 1.10.14 before upgrading to 2.0
- Support Airflow's ["upgrade check"](https://airflow.apache.org/docs/apache-airflow/stable/upgrade-check.html) in the Astronomer CLI (`$ astro dev upgrade-check`)

To get started, read [Upgrade to Apache Airflow 2.0 on Astronomer](https://www.astronomer.io/docs/cloud/stable/customize-airflow/upgrade-to-airflow-2). The migration path to Airflow 2.0 on Astronomer follows [recommendations published by the Apache Airflow project](https://airflow.apache.org/docs/apache-airflow/stable/upgrading-to-2.html).

#### Bug Fixes & Improvements

- Raise Maximum Node Size to 24 vCPUs, 90 GB Memory/RAM (Read more in [Pricing](https://www.astronomer.io/docs/cloud/stable/resources/pricing))
- Add clear messaging to Astronomer UI around steps required to finalize Airflow upgrade
- Opt-in users to **Email Alerts** by default
- BugFix: `pod_mutation_hook` overrides commands for the KubernetesPodOperator pods if using KubernetesExecutor

### v0.23.0

Release Date: November 24, 2020

#### Support for Docker Images on Quay.io + DockerHub

Astronomer recently migrated from [Docker Hub](https://hub.docker.com/r/astronomerinc/ap-airflow/tags) to [Quay.io](https://quay.io/repository/astronomer/ap-airflow?tab=tags) as our platform’s primary Docker Registry in light of Docker Hub’s [new rate-limit policy](https://www.docker.com/blog/what-you-need-to-know-about-upcoming-docker-hub-rate-limiting/), effective Nov 2nd, 2020.

Astronomer v0.23 supports Airflow images that are pulled from _either_ Docker registry, though we strongly encourage users to switch to Quay.io images to avoid rate limiting errors from Docker Hub. If you're running a legacy image that pulls from `astronomerinc/ap-airflow`, all it takes is modifying that image in your Dockerfile to read `quay.io/astronomer/ap-airflow`. Both have the exact same functionality.

For more information, refer to ["Manage Airflow Versions"](https://www.astronomer.io/docs/cloud/stable/customize-airflow/manage-airflow-versions/) or [this forum post](https://forum.astronomer.io/t/docker-hub-rate-limit-error-toomanyrequests-you-have-reached-your-pull-rate-limit/887).

#### Improved Celery Worker Update Strategy

Astronomer v0.23 includes an improvement to the process by which new Celery Workers are created and begin to pick up tasks following a deploy to an Airflow Deployment on Astronomer.

Previously, the number of Celery Worker replicas that could be immediately created following a deploy was restricted to 25% of the total number of desired Celery Workers - until the original Workers shut down. This meant that it took longer for replacement Celery Workers to be created and start picking up Airflow tasks. Defined as `maxSurge`, that percentage is now set to 100%, allowing the maximum number of Celery Worker replicas to exist and push your data pipelines forward.

For users, this change will result in a quicker, more efficient, and more graceful deploy process.

> **Note:** This improvement applies only to those running Airflow with the Celery Executor on Astronomer. For more information on Airflow Executors, refer to ["Airflow Executors Explained"](https://www.astronomer.io/guides/airflow-executors-explained) or [Configure an Airflow Deployment on Astronomer](https://www.astronomer.io/docs/cloud/stable/deploy/configure-deployment).

#### Bug Fixes & Improvements

- Improvement: Default to latest available version of Airflow on Deployment Creation via Astro UI/CLI
- BugFix: `$ astro dev init` shows `No module named 'airflow.api.auth.backend.basic_auth` (_CLI v0.23_)
- Bugfix: Deployment "Viewer" Access erroneously given to Workspace user
- BugFix: Variables and Connections declared in `airflow_settings.yaml` are not properly passed to Airflow's Metadata Database via the Astro CLI (_CLI v0.23_)

## Astronomer v0.22

### v0.22.4

Release Date: November 16, 2020

#### Bug Fixes & Improvements

- BugFix: Workspace-level Service Account unable to trigger action on any Airflow Deployment (`denied: You do not have deployment.images.push permission`)

### v0.22.3

Release Date: November 12, 2020

#### New Deployment-level Permissions

Astronomer v0.22 introduces deployment-level permissions, a much-awaited feature for teams running multiple Airflow Deployments on Astronomer.

Users can now configure and be assigned 1 of 3 user roles within each Deployment - _Admin_, _Editor_ and _Viewer_. If you have a "Prod" and "Dev" Airflow Deployment, for example, you can restrict a user's access to "Prod" as a _Viewer_ but grant them full access to "Dev" as an _Admin_ - all within the same Workspace. Similarly, the level of access that Workspace _Admins_ have to the Airflow Deployments within that Workpace can now be customized without limiting their ability to manage Billing and Workspace user invites, for example.

This new framework comes with support via the Astronomer UI/API and a new set of commands for the Astro CLI. For more information, refer to our re-factored ["User Permissions" doc](https://www.astronomer.io/docs/cloud/stable/manage-astronomer/workspace-permissions/).

#### Airflow Version Selection & Upgrade in Astronomer UI/CLI

This release formally introduces "Airflow Version" to the Astronomer UI, CLI and API for an enhanced version selection and Airflow upgrade experience.

Users can now see the version of Airflow they're running in the **Settings** page of a Deployment and indicate interest in upgrading to a higher version. Users who initialize the upgrade process via the Astronomer UI or CLI will be instructed to update the Astronomer Certified (AC) Docker image in their Dockerfile and be given feedback along the way.

For more information, refer to ["Manage Airflow Versions"](https://www.astronomer.io/docs/cloud/stable/customize-airflow/manage-airflow-versions/).

#### Support for Multiple Schedulers (_Airflow 2.0+_)

Airflow 2.0 is around the corner and will allow users to provision multiple Airflow Schedulers for ultimate high-availability and scale. While Airflow 2.0 is not generally available just yet, Astronomer v0.22 pre-emptively supports the ability to provision up to 4 Schedulers via the Astronomer UI for Airflow Deployments running Airflow 2.0+.

Once Airflow 2.0 is released, you'll be able to leverage this feature as an Astronomer Cloud user as soon as you upgrade Airflow versions. To read more on Airflow 2.0, check out our blog post, ["Introducing Airflow 2.0"](https://www.astronomer.io/blog/introducing-airflow-2-0/).

#### Bug Fixes & Improvements

- Improved error handling on `$ astro auth login` when Docker isn't running
- BugFix: Alert are not triggered when Airflow components resource threshold is breached
- BugFix: Some Airflow metrics not rendering in Astronomer UI (`Zombies Killed`, `Task Stream`, `DagBag Count`, `Task Success Rate`, `Task Failure Rate`).

## Astronomer v0.21

### v0.21.2

Release Date: October 29, 2020

#### Bug Fixes & Improvements

- BugFix: Reset password flow triggered incorrect email for users who use local username/password to authenticate

### v0.21.1

Release Date: October 22, 2020

#### Bug Fixes & Improvements

- BugFix: "User" query in Astro UI + API broken with filter for email address
- BugFix: Ability to update user role locked if a Workspace Admin creates Service Account with view access
- BugFix: User can still access the Airflow Webserver of a deleted Deployment

### v0.21.0

Release Date: October 15, 2020

#### A New "Deployment Status" Framework

The biggest change to Astronomer Cloud in v0.21 is the introduction of a new `deploymentStatus` query that allows the platform to more reliably communicate the status of a _deploy_ and the overall health of your Airflow Deployment. We define a _deploy_ as the process that begins when a user triggers a change to an Airflow Deployment (e.g. a code push from the Astronomer CLI or the addition of an Environment Variable) and ends when that change is successfully passed and considered to be live.

While this change largely sets the foundation for new features in later releases, we did include a handful of UX improvements in the meantime.

More specifically, Astronomer v0.21 will include:

- A new banner in the "Deployment" view of the Astronomer UI if a deploy to that Airflow Deployment is in progress.
- Refined logic for "Deployment Health Status" (Unhealthy/Red, Healthy/Green, Deploying/Blue and Unknown/Gray) that's visible as a "bubble" next to all Airflow Deployments in the Astronomer UI.
- A set of error messages to alert you if a deploy has failed or was otherwise _not_ complete.

#### Bug Fixes & Improvements

- Improvement: Add email validation to `$ astro workspace user add` command in Astro CLI (_CLI v0.21_)
- BugFix: Workspace Admin downgraded to Workspace Viewer after creating Service Account with "Viewer" permissions
- BugFix: "Billing" page in Astronomer UI shows error in console when saving a new card
- BugFix: Calling the `createWorkspace` Houston API mutation with a system Service Account returns an error (`No Node for the model User`)
- BugFix: Some Airflow Metrics unavailable in the "Metrics" tab of the Astronomer UI (DagBag Count, Zombies Killed, Task Success Rate, Task Failure Rate, Task Stream)

## Astronomer v0.20

### v0.20.1

Release Date: October 7, 2020

#### Bug Fixes and Improvements

- BugFix: Platform signup successful with invalid or changed invite token

### v0.20.0

Release Date: September 30, 2020

#### Support for Airflow 1.10.12

Astronomer v0.20 comes with support for [Airflow 1.10.12](https://airflow.apache.org/blog/airflow-1.10.12/), the community's most recent release.

Airflow 1.10.12 notably includes:

- The ability to configure and launch pods via YAML files with the Kubernetes Executor and KubernetesPodOperator ([commit](https://github.com/apache/airflow/pull/6230))
- A new `on_kill` method that ensures a KubernetesPodOperator task is killed when it's cleared in the Airflow UI ([commit](https://github.com/apache/airflow/commit/ce94497cc))
- Ability to define a custom XCom class ([commit](https://github.com/apache/airflow/pull/8560))
- Support for grabbing Airflow configs with sensitive data from Secret Backends ([commit](https://github.com/apache/airflow/pull/9645))
- Support for AirfowClusterPolicyViolation support in Airflow local settings ([commit](https://github.com/apache/airflow/pull/10282)).

For a detailed breakdown of all changes, refer to the [AC 1.10.12 Changelog](https://github.com/astronomer/ap-airflow/blob/master/1.10.12/CHANGELOG.md). For instructions on how to upgrade to 1.10.12 on Astronomer, refer to ["Airflow Versioning"](https://www.astronomer.io/docs/cloud/stable/customize-airflow/manage-airflow-versions/).

> **Note:** AC 1.10.12 will be the _last_ version to support an Alpine-based image. In an effort to standardize our offering and optimize for reliability, we'll exclusively build, test and support Debian-based images starting with AC 1.10.13. A guide for how to migrate from Alpine to Debian coming soon.

#### Bug Fixes and Improvements

- Improved user search in Astro UI
- Updated doc links in Astro UI
- Platform Upgrade to [Prisma 2](https://www.prisma.io/) (Database Toolkit for our Houston API)
- Improved error message on `$ astro dev init` if not authenticated to Astronomer (_CLI v0.20_)
- BugFix: Inaccurate CLI version output on `$ astro upgrade` (_CLI v0.20_)
- BugFix: Navigating to the Airflow Webserver if not authenticated redirects to Astro UI homepage after login
- BugFix: Intermittent errors with Workspace "Trial" functionality and "Billing" tab (`Minified React Error #310`)

## Astronomer v0.19

### v0.19.4

Release Date: September 9, 2020

#### Bug Fixes and Improvements

- BugFix: Adding a non-Airflow config Environment Variable on Astronomer UI with KubernetesExecutor does not get passed successfully

### v0.19.3

Release Date: August 27, 2020

#### Bug Fixes and Improvements

- Improvement: Display toast message in Astronomer UI following Deployment deletion
- Improvement: Replace `workspaceUuid` with `deploymentUuid` in arg for `deploymentVariables` Houston API mutation
- Improvement: The 'Create', 'Update' and 'Delete' Deployment operations are now implemented in an event-driven framework optimized for reliability
- BugFix: Correct Astro CLI output for `deployment service-account create --help` subcommand to read `--deployment-id`
- BugFix: `$ astro upgrade` no longer requires authentication to Astronomer
- BugFix: Environment Variable changes via the Astronomer UI not consistently reflected in Workers and in underlying Kubernetes secrets
- BugFix: Incorrect Extra Capacity AU detected from Houston API
- BugFix: Adjust commander role to include KEDA CRD (fixes `could not get information about the resource: scaledobjects.keda.k8s.io` on Airflow Deployment creation)
- BugFix: User Invite redirects to "Public Signups Disabled"
- BugFix: Error on "Inspect" of the 'Metrics' tab of the Astronomer UI: `Error with Feature-Policy header`

## Astronomer v0.18

Release Date: August 10, 2020

### v0.18.0

#### Support for Latest Astronomer Certified Builds

Astronomer v0.18 includes support for the latest patch releases from Astronomer Certified, our distribution of Apache Airflow. These patch releases most notably include:

- BugFix: Broken `/landing_times` view in the Airflow UI rendering with plain HTML ([commit](https://github.com/astronomer/airflow/commit/6567df3))
- BugFix: Tighten restriction for `apache-airflow` in requirements.txt to allow users to install other packages with that prefix ([commit](https://github.com/astronomer/ap-airflow/commit/c2536db))
- BugFix: Broken PapermillOperator (1.10.10 only).

For a full list, reference the changelogs in our [`ap-airflow` repo](https://github.com/astronomer/ap-airflow) for the AC version of your choice (e.g. changelog for 1.10.10 [here](https://github.com/astronomer/ap-airflow/blob/master/1.10.10/CHANGELOG.md)).

To be notified of AC releases, feel free to [subscribe to our AC Newsletter](/downloads/). For information on how to upgrade Astronomer Certified versions, refer to our ["Manage Airflow Versions" doc](/docs/cloud/stable/customize-airflow/manage-airflow-versions/).

#### Houston API Improvements

Astronomer v0.18 includes standardization of the following 2 mutations to be more strongly typed and reliable:

- `updateDeployment`
- `createDeployment`

If you're calling either of those mutations in your current workflow, Astronomer v0.18 will introduce a breaking change.

As we strive to polish and standardize the schema more generally, our API will undergo rapid and potentially breaking changes over the next few releases. The Astronomer CLI and UI will continue to stay in sync with API changes and is our recommended way to interact with the platform.

If calling our API programmatically is critical to your use case, reference our [Houston API Documentation](/docs/cloud/stable/manage-astronomer/houston-api/) for details and stay in close touch with our team.

#### Astronomer Bug Fixes & Improvements

Fixes to the Astronomer Platform shipped in 0.18:

- BugFix: Navigating directly to the "Metrics" tab in the Astronomer UI renders an error
- BugFix: API error (400) on `$ astro workspace user add` and `$ astro workspace user remove` in Astro CLI
- BugFix: `Error: failed to find a valid role` on Service Account creation (CLI + Astro UI)

## Astronomer v0.17

Release Date: July 27, 2020

### v0.17.0

#### CLI Improvements

Astronomer v0.17 ships with two notable bug fixes that address issues commonly reported by users on v0.16.

**1. (60) SSL certificate problem: certificate has expired**

If you tried to install the Astronomer CLI recently, it's likely you received this error. It misleadingly did _not_ mean that our SSL Certificate was out of date, but rather that the intermediate CA Astronomer keys are signed by was expired.

This has been resolved in 0.17.

**2. CLI commands no longer require Astronomer Authentication**

As reported [here](https://forum.astronomer.io/t/error-http-do-failed-i-o-timeout/706/2) and [here](https://forum.astronomer.io/t/local-airflow-instance-using-astro-cli-on-linux/711/6), v0.16.1 of the Astronomer CLI introduced a bug that blocked users from running `$ astro dev init` and `$ astro version` commands if not authenticated to Astronomer.

The Astronomer CLI is open source and open to _all_ developers looking to run Apache Airflow locally, so we've made sure to patch this up in v0.17 and will backport changes to 0.16.2 of the CLI.

#### Bug Fixes & Improvements

- BugFix: AuthenticationError fetching Airflow Logs
- BugFix: Restore ability to dynamically pull namespace with `namespace=default` in [KubernetesPodOperator](/docs/cloud/stable/customize-airflow/kubepodoperator/) and KubernetesExecutor Config
- BugFix: OAuth Login Errors in Safari
- BugFix: Error adding "Billing Details" in Astro UI if Workspace unlocked by Astronomer
- BugFix: Users able to create 2+ Service Accounts with the same label
- Improvement: Increased Test Coverage for Houston API + Astro CLI

## Astronomer v0.16

### v0.16.3

Release Date: July 17, 2020

- BugFix: Mismatched rendering when switching between Deployments in the Astro UI

### v0.16.1

Release Date: July 9, 2020

- BugFix: 'Metrics' Tab in the Astro UI unresponsive with large task payload
- BugFix: Error when deleting a 'Pending' Workspace invite in Astro UI
- BugFix: "Deployment Status" bubble in the Astro UI persistently blue/pulsating
- BugFix: Issue with Extra Capacity resetting every time you change an Env Var

### v0.16.0

Release Date: June 29, 2020

#### New "Environment Variables" Tab in the Astronomer UI

Astronomer v0.16 comes with significant improvements to the experience of setting Environment Variables on Astronomer. Namely, we've introduced a dedicated 'Variables' tab to the Astronomer UI, lessening the density of the 'Settings' tab and making these configurations accessible to Astronomer Cloud "trial" users.

Along with this feature come a few other additions:

- The ability for Workspace Admins and Editors to create and mark a value as 'secret', hiding it from the Astronomer UI (and the client)
- The ability to export Environment Variables as JSON
- A new `updateDeploymentVariables` mutation in Astronomer's [Houston API](/docs/cloud/stable/manage-astronomer/houston-api/), separating the Environment Variable creation and update actions from the `updateDeployment` mutation

For more details on this new feature, reference our ["Environment Variables" doc](/docs/cloud/stable/deploy/environment-variables).

#### Bug Fixes and Improvements

- BugFix: Add Alphanumeric characters (e.g. S3)to Environment Variable validation in the Astro UI
- BugFix: ExtraCapacity values (over minimum) are overridden in Deployment Update
- Security: Implement platform-wide Pod Security Policies
- Security: Clear Javascript CVEs

## Platform Changelog & Prior Releases

In addition to release notes, our team publishes an itemized changelog [on GitHub](https://github.com/astronomer/astronomer/blob/master/CHANGELOG.md).
