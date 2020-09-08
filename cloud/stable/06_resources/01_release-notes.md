---
title: "Release Notes"
navTitle: "Release Notes"
description: "Astronomer Cloud Release Notes."
---

## Astronomer v0.19 Release Notes

Release Date: August 27, 2020

### v0.19.3

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