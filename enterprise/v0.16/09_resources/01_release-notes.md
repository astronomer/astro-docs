---
title: "Release Notes"
navTitle: "Release Notes"
description: "Astronomer Enterprise release notes."
---

### Notice on Astronomer Enterprise Releases

As of v0.16, Astronomer platform releases will be made generally available to Enterprise customers on a quarterly basis. Critical security and bug fixes will be regularly backported to the latest supported Enterprise version as patch releases that are made available between quarterly minor releases. A changelog for all releases will be made available below.

We're committed to testing all quarterly Astronomer Enterprise versions for scale, reliablity and security on EKS, GKE and AKS. If you have any questions or an issue to report, don't hesitate to [reach out to us](support.astronomer.io).

## Astronomer v0.16 Release Notes

Latest Patch Release: **v0.16.5**

### v0.16.5

Release Date: August 19, 2020

#### Support for Latest Builds of Astronomer Certified

Astronomer Enterprise v0.16.5 includes support for the following patch releases of Astronomer Certified (AC), our distribution of Apache Airflow:

- [1.10.5-10](https://github.com/astronomer/ap-airflow/blob/master/1.10.5/CHANGELOG.md)
- [1.10.7-14](https://github.com/astronomer/ap-airflow/blob/master/1.10.7/CHANGELOG.md)
- [1.10.10-4](https://github.com/astronomer/ap-airflow/blob/master/1.10.10/CHANGELOG.md)

These patch releases most notably include:

- BugFix: Broken `/landing_times` view in the Airflow UI rendering with plain HTML ([commit](https://github.com/astronomer/airflow/commit/6567df3))
- BugFix: Tighten restriction for `apache-airflow` in requirements.txt to allow users to install other packages with that prefix ([commit](https://github.com/astronomer/ap-airflow/commit/c2536db))
- BugFix: Broken PapermillOperator ([commit](https://github.com/astronomer/astronomer-airflow-version-check/commit/811cc75) - 1.10.10 only).

To be notified of AC releases, feel free to [subscribe to our AC Newsletter](/downloads/). For information on how to upgrade Astronomer Certified versions, refer to our ["Airflow Versioning" doc](/docs/cloud/stable/customize-airflow/airflow-versioning/).

#### Airflow Chart: Default to Eventual Consistency

Historically, upgrades to Astronomer (major, minor or patch) that have included a change to the Airflow Chart forcibly restart all Airflow Deployments running on the platform at the time of the upgrade, often causing task interruption.

This change allows for Airflow Deployments to remain unaffected through the upgrade and for Airflow Chart changes to take effect _only_ when another restart event is triggered by a user (e.g. a code push, Environment Variable change, resource or executor adjustment, etc).

More specifically, this changes the behavior of our API's `updateDeployment` mutation to perform the Airflow Helm Chart version upgrade only if/when a Houston config is updated. [Source Code here](https://github.com/astronomer/houston-api/blob/main/src/resolvers/mutation/update-deployment/index.js#L86).

#### Bug Fixes and Improvements

- BugFix: 400 Error on ` $ astro workspace user add` in Astro CLI (CLI v0.16.3)
- BugFix: 400 Error on ` $ astro workspace user remove` in Astro CLI (CLI v0.16.3)
- BugFix: Users able to create 2+ Service Accounts with the same label
- BugFix: Link to Workspace broken in 'SysAdmin' > 'Users' View
- BugFix: Navigating directly to the 'Metrics' Tab of the Astronomer UI renders error
- BugFix: Adjust commander role to include KEDA CRD (fixes `could not get information about the resource: scaledobjects.keda.k8s.io` on Airflow Deployment creation)

### v0.16.4

Release Date: July 22, 2020

- BugFix: Restore ability to dynamically pull namespace with `namespace=default` in [KubernetesPodOperator] and KubernetesExecutor Config
- BugFix: Error on `$ astro dev init` and `$ astro version` if not authenticated to Astronomer (CLI v0.16.2)

### v0.16.3

Release Date: July 22, 2020

- Improvement: Allow SysAdmins to Access Workspaces in the Astro UI
- Improvement: Create new critical severity alerts for platform system components
- BugFix: Emails caps-sensitive in error for ADFS
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

Astronomer v0.16 comes with significant improvements to the experience of setting Environment Variables on Astronomer. Namely, we've introduced a dedicated 'Variables' tab, lessening the density of the "Settings" page and making these configurations accessible to "Trial" users on Astronoomer Cloud.

With the new tab comes the ability for Workspace Admins and Editors to create and mark a value as 'secret', permanently hiding the value from the Astronomer UI (and from the client). From the same tab, users can now export Environment Variables as 'JSON' as well.

For more details on this new feature, reference our ["Environment Variables" doc](/docs/enterprise/stable/deploy/environment-variables).

#### Support for AD FS

Astronomer v0.16 for Astronomer Enterprise users comes with support for Microsoft's [Active Directory Federation services (AD FS)](https://docs.microsoft.com/en-us/windows-server/identity/active-directory-federation-services), as an alternative authentication system.

To learn more, reference ["Auth Systems on Astronomer"](/docs/enterprise/stable/manage-astronomer/integrate-auth-system/).

#### Bug Fixes and Improvements

- BugFix: Add Alphanumeric characters (e.g. S3)to Environment Variable validation in the Astro UI
- BugFix: ExtraCapacity values (over minimum) are overridden in Deployment Update
- Improvement: Simplify `updateUser` Mutation in Houston API (remove `uuid`)
- Security: Implement platform-wide Pod Security Policies
- Security: Clear Javascript CVEs
- BugFix: "Airflow State" dashboard in Grafana broken
- BugFix: CLI Install command should point to BASEDOMAIN (not `install.astronomer.io`) for Enterprise users
- BugFix: SysAdmin can't revoke SysAdmin permissions from another user

## Astronomer v0.15 Release Notes

Release Date: June 8, 2020

### v0.15.0

#### Support for Airflow 1.10.10

As of v0.15, Astronomer users are free to run our [Astronomer Certified (AC) 1.10.10 image](/downloads/ac/v1-10-10/), which is based on the [Airflow 1.10.10](https://airflow.apache.org/blog/airflow-1.10.10/) open-source version released in early April.

Airflow 1.10.10 notably includes the ability to choose a timezone in the Airflow UI, DAG Serialization functionality for improved Webserver performance, and the [ability to sync Airflow Connections and Variables](https://forum.astronomer.io/t/aws-parameter-store-as-secrets-backend-airflow-1-10-10/606) with a Secret Backend tool (e.g. AWS Secret Manager, Hashicorp Vault, etc.)

For more detail on what's included in AC 1.10.10, reference the [changelog](https://github.com/astronomer/ap-airflow/blob/master/1.10.10/CHANGELOG.md).

#### Ability to Set Custom Release Names

As of Astronomer v0.15, Enterprise customers can now customize the release name of any Airflow Deployment instead of relying on the default naming scheme (e.g. `solar-galaxy-1234`). Release names within a single cluster must be unique and will continue to be immutable following creation.

To activate this feature on the platform, refer to the `manualReleaseNames` value in your `config.yaml`.

#### Ability to Annotate Pods to integrate with IAM Roles

As of Astronomer v0.15, IAM roles can now be appended to all pods within any individual Airflow Deployment on the platform. Users who integrate Airflow with some resource or set of resources (e.g. an AWS S3 bucket or Secret Backend) can now configure them to be accessible only to a subset of Kubernetes pods within your wider Astronomer cluster.

Leverage this feature by specifying an existing IAM role `arn` when you create or update an Airflow Deployment via the Astro CLI. For guidelines, go [here](/docs/enterprise/stable/customize-airflow/integrate-iam/).

#### Bug Fixes & Improvements

A few notable bug fixes and improvements:

* Ability to add multiple email addresses to receive deployment-level alerts
* Security improvements to the Astronomer UI
* Reframe "Extra Capacity" in the 'Deployment Configuration' tab of the Astronomer UI
* Improved error handling for users who sign up with an email different than their input in our trial form
* Bug Fix: Warning via the CLI on Debian images
* Bug Fix: "Failed to authenticate to the registry..." error on v0.13 of the CLI
* Added support for AWS S3 Registry Backend
* New UI warning when SMTP credentials are not configured and email invites cannot be sent
* Improved UX of Failed Network Connections
* Bug Fix: Missing "Deployment" label in Airflow Alerts

## Platform Changelog & Prior Releases

In addition to release notes, our team publishes an itemized changelog [on GitHub](https://github.com/astronomer/astronomer/blob/master/CHANGELOG.md).

To view earlier release notes, change the version of this doc on the top right menu.