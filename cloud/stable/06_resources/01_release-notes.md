---
title: "Release Notes"
navTitle: "Release Notes"
description: "Astronomer Cloud Release Notes."
---

## Astronomer v0.17 Release Notes

Release Date: July 27, 2020

## Platform-Wide Changes

### CLI Improvements

Astronomer v0.17 ships with two notable bug fixes that address issues commonly reported by users on v0.16.

**1. (60) SSL certificate problem: certificate has expired**

If you tried to install the Astronomer CLI recently, it's likely you received this error. It misleadingly did _not_ mean that our SSL Certificate was out of date, but rather that the intermediate CA Astronomer keys are signed by was expired.

This has been resolved in 0.17.

**2. CLI commands no longer require Astronomer Authentication**

As reported [here](https://forum.astronomer.io/t/error-http-do-failed-i-o-timeout/706/2) and [here](https://forum.astronomer.io/t/local-airflow-instance-using-astro-cli-on-linux/711/6), v0.16.1 of the Astronomer CLI introduced a bug that blocked users from running `$ astro dev init` and `$ astro version` commands if not authenticated to Astronomer.

The Astronomer CLI is open-source and open to _all_ developers looking to run Apache Airflow locally, so we've made sure to patch this up in v0.17 and will backport changes to 0.16.2 of the CLI.

### Bug Fixes & Improvements

- BugFix: AuthenticationError fetching Airflow Logs
- BugFix: Restore ability to dynamically pull namespace with `namespace=default` in [KubernetesPodOperator](https://www.astronomer.io/docs/kubepodoperator/) + KubernetesExecutor Config
- BugFix: OAuth Login Errors in Safari
- BugFix: Error adding "Billing Details" in Astro UI if Workspace unlocked by Astronomer
- BugFix: Users able to create 2+ Service Accounts with the same label
- Increased Test Coverage for Houston API + Astro CLI

## Astronomer v0.16 Release Notes

Release Date: June 29, 2020

### New "Environment Variables" Tab in the Astronomer UI

Astronomer v0.16 comes with significant improvements to the experience of setting Environment Variables on Astronomer. Namely, we've introduced a dedicated 'Variables' tab, lessening the density of the "Settings" page and making these configurations accessible to "Trial" users on Astronoomer Cloud.

With the new tab comes the ability for Workspace Admins and Editors to create and mark a value as 'secret', permanently hiding the value from the Astronomer UI (and from the client). From the same tab, users can now export Environment Variables as 'JSON' as well.

For more details on this new feature, reference our ["Environment Variables" doc](https://www.astronomer.io/docs/environment-variables).

### Bug Fixes and Improvements

- BugFix: Add Alphanumeric characters (e.g. S3)to Environment Variable validation in the Astro UI
- BugFix: ExtraCapacity values (over minimum) are overriden in Deployment Update
- Improvement: Simplify `updateUser` Mutation in Houston API (remove `uuid`)
- Security: Implement platform-wide Pod Security Policies
- Security: Clear Javascript CVEs

## Platform Changelog & Prior Releases

In addition to release notes, our team publishes an itemized changelog [on GitHub](https://github.com/astronomer/astronomer/blob/master/CHANGELOG.md).

To view earlier release notes, change the version of this doc on the top right menu.