---
title: "Release Notes"
navTitle: "Release Notes"
description: "Astronomer Enterprise release notes."
---

## Astronomer v0.16 Release Notes

Release Date: June 29, 2020

## Platform-Wide Changes

### New "Environment Variables" Tab in the Astronomer UI

Astronomer v0.16 comes with significant improvements to the experience of setting Environment Variables on Astronomer. Namely, we've introduced a dedicated 'Variables' tab, lessening the density of the "Settings" page and making these configurations accessible to "Trial" users on Astronoomer Cloud.

With the new tab comes the ability for Workspace Admins and Editors to create and mark a value as 'secret', permanently hiding the value from the Astronomer UI (and from the client). From the same tab, users can now export Environment Variables as 'JSON' as well.

For more details on this new feature, reference our ["Environment Variables" doc](https://www.astronomer.io/docs/enterprise/v0.13/deploy/environment-variables/).

### Bug Fixes and Improvements

- BugFix: Add Alphanumeric characters (e.g. S3)to Environment Variable validation in the Astro UI
- BugFix: ExtraCapacity values (over minimum) are overriden in Deployment Update
- Improvement: Simplify `updateUser` Mutation in Houston API (remove `uuid`)
- Security: Implement platform-wide Pod Security Policies
- Security: Clear Javascript CVEs

## Astronomer Enterprise-only Changes

### Support for AD FS

Astronomer v0.16 for Astronomer Enterprise users comes with support for Microsoft's [Active Directory Federation services (AD FS)](https://docs.microsoft.com/en-us/windows-server/identity/active-directory-federation-services), as an alternative authentication system.

To learn more, reference ["Auth Systems on Astronomer"](https://www.astronomer.io/docs/enterprise/v0.13/manage-astronomer/integrate-auth-system/).

### Bug Fixes and Improvements

- BugFix: "Airflow State" dashboard in Grafana broken
- BugFix: CLI Install command should point to BASEDOMAIN (not install.astronomer.io) for Enterprise users
- BugFix: SysAdmin can't revoke SysAdmin permissions from another user

## Astronomer v0.15 Release Notes

Release Date: June 8, 2020

## Platform-Wide Changes

### Support for Airflow 1.10.10

As of v0.15, Astronomer users are free to run our [Astronomer Certified (AC) 1.10.10 image](https://www.astronomer.io/downloads/ac/v1-10-10/), which is based on the [Airflow 1.10.10](https://airflow.apache.org/blog/airflow-1.10.10/) open-source version released in early April.

Airflow 1.10.10 notably includes the ability to choose a timezone in the Airflow UI, DAG Serialization functionality for improved Webserver performance, and the [ability to sync Airflow Connections and Variables](https://forum.astronomer.io/t/aws-parameter-store-as-secrets-backend-airflow-1-10-10/606) with a Secret Backend tool (e.g. AWS Secret Manager, Hashicorp Vault, etc.)

For more detail on what's included in AC 1.10.10, reference the [changelog](https://github.com/astronomer/ap-airflow/blob/master/1.10.10/CHANGELOG.md).

### Bug Fixes & Improvements

A few notable bug fixes and improvements:

* Ability to add multiple email addresses to receive deployment-level alerts
* Security improvements to the Astronomer UI
* Reframe "Extra Capacity" in the 'Deployment Configuration' tab of the Astronomer UI
* Improved error handling for users who sign up with an email different than their input in our trial form
* Bug Fix: Warning via the CLI on Debian images
* Bug Fix: "Failed to authenticate to the registry..." error on v0.13 of the CLI

## Astronomer Enterprise-Only Changes

### Manually Set Release Names

As of Astronomer v0.15, Enterprise customers can now customize the release name of any Airflow Deployment instead of relying on the default naming scheme (e.g. `solar-galaxy-1234`). Release names within a single cluster must be unique and will continue to be immutable following creation.

To activate this feature on the platform, refer to the `manualReleaseNames` value in your `config.yaml`.

### Ability to Annotate Pods to integrate with IAM Roles

As of Astronomer v0.15, IAM roles can now be appended to all pods within any individual Airflow Deployment on the platform. Users who integrate Airflow with some resource or set of resources (e.g. an AWS S3 bucket or Secret Backend) can now configure them to be accessible only to a subset of Kubernetes pods within your wider Astronomer cluster.

Leverage this feature by specifying an existing IAM role `arn` when you create or update an Airflow Deployment via the Astro CLI. For guidelines, go [here](https://forum.astronomer.io/t/can-i-integrate-iam-roles-with-astronomer/649).

### Bug Fixes & Improvements

* Added support for AWS S3 Registry Backend
* New UI warning when SMTP credentials are not configured and email invites cannot be sent
* Improved UX of Failed Network Connections
* Bug Fix: Missing "Deployment" label in Airflow Alerts

## Platform Changelog & Prior Releases

In addition to release notes, our team publishes an itemized changelog [on GitHub](https://github.com/astronomer/astronomer/blob/master/CHANGELOG.md).

To view earlier release notes, change the version of this doc on the top right menu.