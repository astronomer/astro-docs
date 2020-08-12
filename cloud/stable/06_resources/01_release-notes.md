---
title: "Release Notes"
navTitle: "Release Notes"
description: "Astronomer Cloud Release Notes."
---

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
- BugFix: Restore ability to dynamically pull namespace with `namespace=default` in [KubernetesPodOperator](https://www.astronomer.io/docs/cloud/stable/customize-airflow/kubepodoperator/) and KubernetesExecutor Config
- BugFix: OAuth Login Errors in Safari
- BugFix: Error adding "Billing Details" in Astro UI if Workspace unlocked by Astronomer
- BugFix: Users able to create 2+ Service Accounts with the same label
- Improvement: Increased Test Coverage for Houston API + Astro CLI

## Astronomer v0.16 Release Notes

### v0.16.0

Release Date: June 29, 2020

#### New "Environment Variables" Tab in the Astronomer UI

Astronomer v0.16 comes with significant improvements to the experience of setting Environment Variables on Astronomer. Namely, we've introduced a dedicated 'Variables' tab to the Astronomer UI, lessening the density of the 'Settings' tab and making these configurations accessible to Astronomer Cloud "trial" users.

Along with this feature come a few other additions:

- The ability for Workspace Admins and Editors to create and mark a value as 'secret', hiding it from the Astronomer UI (and the client)
- The ability to export Environment Variables as JSON
- A new `updateDeploymentVariables` mutation in Astronomer's [Houston API](https://www.astronomer.io/docs/cloud/stable/manage-astronomer/houston-api/), separating the Environment Variable creation and update actions from the `updateDeployment` mutation

For more details on this new feature, reference our ["Environment Variables" doc](https://www.astronomer.io/docs/cloud/stable/deploy/environment-variables).

#### Bug Fixes and Improvements

- BugFix: Add Alphanumeric characters (e.g. S3)to Environment Variable validation in the Astro UI
- BugFix: ExtraCapacity values (over minimum) are overriden in Deployment Update
- Security: Implement platform-wide Pod Security Policies
- Security: Clear Javascript CVEs

### v0.16.1

Release Date: July 9, 2020

- BugFix: 'Metrics' Tab in the Astro UI unresponsive with large task payload
- BugFix: Error when deleting a 'Pending' Workspace invite in Astro UI 
- BugFix: "Deployment Status" bubble in the Astro UI persistently blue/pulsating
- BugFix: Issue with Extra Capacity resetting every time you change an Env Var

### v0.16.3

Release Date: July 17, 2020

- BugFix: Mismatched rendering when switching between Deployments in the Astro UI

## Platform Changelog & Prior Releases

In addition to release notes, our team publishes an itemized changelog [on GitHub](https://github.com/astronomer/astronomer/blob/master/CHANGELOG.md).

To view earlier release notes, change the version of this doc on the top right menu.