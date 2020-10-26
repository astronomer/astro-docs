---
title: "Release Notes"
navTitle: "Release Notes"
description: "Astronomer Cloud Release Notes."
---

## Astronomer v0.21 Release Notes

### v0.21.1

Release Date: October 22, 2020

#### Bug Fixes & Improvements

- BugFix: "User" query in Astro UI + API broken with filter for email address
- BugFix: Ability to update user role locked if a Workspace Admin creates Service Account with view access
- BugFix: User can still access the Airflow Webserver of a deleted Deployment

### v0.21.0

Release Date: October 15, 2020

#### A New "Deploment Status" Framework

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

## Astronomer v0.20 Release Notes

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
- A new `on_kill` method that ensures a KubernetesPodOperator task is killed when it's cleared in the Airflow UI ([commit]((https://github.com/apache/airflow/commit/ce94497cc) ))
- Ability to define a custom XCom class ([commit]((https://github.com/apache/airflow/pull/8560)))
- Support for grabbing Airflow configs with sensitive data from Secret Backends ([commit]((https://github.com/apache/airflow/pull/9645)))
- Support for AirfowClusterPolicyViolation support in Airflow local settings ([commit](https://github.com/apache/airflow/pull/10282)).

For a detailed breakdown of all changes, refer to the [AC 1.10.12 Changelog](https://github.com/astronomer/ap-airflow/blob/master/1.10.12/CHANGELOG.md). For instructions on how to upgrade to 1.10.12 on Astronomer, refer to ["Airflow Versioning"](https://www.astronomer.io/docs/cloud/stable/customize-airflow/airflow-versioning/).

> **Note:** AC 1.10.12 will be the _last_ version to support an Alpine-based image. In an effort to standardize our offering and optimize for reliability, we'll exclusively build, test and support Debian-based images starting with AC 1.10.13. A guide for how to migrate from Alpine to Debian coming soon.

#### Bug Fixes and Improvements

- Improved user search in Astro UI
- Updated doc links in Astro UI
- Platform Upgrade to [Prisma 2](https://www.prisma.io/) (Database Toolkit for our Houston API)
- Improved error message on `$ astro dev init` if not authenticated to Astronomer (_CLI v0.20_)
- BugFix: Inaccurate CLI version output on `$ astro upgrade` (_CLI v0.20_)
- BugFix: Navigating to the Airflow Webserver if not authenticated redirects to Astro UI homepage after login
- BugFix: Intermittent errors with Workspace "Trial" functionality and "Billing" tab (`Minified React Error #310`)

## Astronomer v0.19 Release Notes

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

## Astronomer v0.18 Release Notes

Release Date: August 10, 2020

### v0.18.0

#### Support for Latest Astronomer Certified Builds

Astronomer v0.18 includes support for the latest patch releases from Astronomer Certified, our distribution of Apache Airflow. These patch releases most notably include:

- BugFix: Broken `/landing_times` view in the Airflow UI rendering with plain HTML ([commit](https://github.com/astronomer/airflow/commit/6567df3))
- BugFix: Tighten restriction for `apache-airflow` in requirements.txt to allow users to install other packages with that prefix ([commit](https://github.com/astronomer/ap-airflow/commit/c2536db))
- BugFix: Broken PapermillOperator ([commit](https://github.com/astronomer/astronomer-airflow-version-check/commit/811cc75) - 1.10.10 only).

For a full list, reference the changelogs in our [`ap-airflow` repo](https://github.com/astronomer/ap-airflow) for the AC version of your choice (e.g. changelog for 1.10.10 [here](https://github.com/astronomer/ap-airflow/blob/master/1.10.10/CHANGELOG.md)).

To be notified of AC releases, feel free to [subscribe to our AC Newsletter](/downloads/). For information on how to upgrade Astronomer Certified versions, refer to our ["Airflow Versioning" doc](/docs/cloud/stable/customize-airflow/airflow-versioning/).

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

## Astronomer v0.17 Release Notes

Release Date: July 27, 2020

### v0.17.0

#### CLI Improvements

Astronomer v0.17 ships with two notable bug fixes that address issues commonly reported by users on v0.16.

**1. (60) SSL certificate problem: certificate has expired**

If you tried to install the Astronomer CLI recently, it's likely you received this error. It misleadingly did _not_ mean that our SSL Certificate was out of date, but rather that the intermediate CA Astronomer keys are signed by was expired.

This has been resolved in 0.17.

**2. CLI commands no longer require Astronomer Authentication**

As reported [here](https://forum.astronomer.io/t/error-http-do-failed-i-o-timeout/706/2) and [here](https://forum.astronomer.io/t/local-airflow-instance-using-astro-cli-on-linux/711/6), v0.16.1 of the Astronomer CLI introduced a bug that blocked users from running `$ astro dev init` and `$ astro version` commands if not authenticated to Astronomer.

The Astronomer CLI is open-source and open to _all_ developers looking to run Apache Airflow locally, so we've made sure to patch this up in v0.17 and will backport changes to 0.16.2 of the CLI.

#### Bug Fixes & Improvements

- BugFix: AuthenticationError fetching Airflow Logs
- BugFix: Restore ability to dynamically pull namespace with `namespace=default` in [KubernetesPodOperator](/docs/cloud/stable/customize-airflow/kubepodoperator/) and KubernetesExecutor Config
- BugFix: OAuth Login Errors in Safari
- BugFix: Error adding "Billing Details" in Astro UI if Workspace unlocked by Astronomer
- BugFix: Users able to create 2+ Service Accounts with the same label
- Improvement: Increased Test Coverage for Houston API + Astro CLI

## Astronomer v0.16 Release Notes

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