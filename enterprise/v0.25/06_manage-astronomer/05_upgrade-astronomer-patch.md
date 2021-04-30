---
title: "Upgrade to a Patch Version of Astronomer Enterprise"
navTitle: "Upgrade to a Patch Version"
description: "How to update your Astronomer Enterprise Platform to a new patch version."
---

## Overview

Astronomer releases are available to Enterprise customers on a quarterly basis as part of a long-term support (LTS) release model. Critical security and bug fixes will be regularly shipped as patch versions that follow LTS releases.

Patch releases will be made available between quarterly LTS releases and require a simple upgrade process. If you're on Astronomer v0.23, follow the instructions below to upgrade to any v0.23 patch version as soon as it is made available. For information on all patch releases, refer to [Enterprise Release Notes](https://www.astronomer.io/docs/enterprise/v0.25/resources/release-notes).

A few notes before you get started:
- The following guidelines are only for upgrading to the latest Astronomer v0.23 patch version. If you're running Astronomer v0.16 and would like to upgrade, read [Upgrade to Astronomer Enterprise v0.23](https://www.astronomer.io/docs/enterprise/v0.16/manage-astronomer/upgrade-to-0-23). To determine whether the latest version of Astronomer is a minor or patch version, read the Astronomer Platform Versioning guidelines below.
- The patch upgrade process will NOT affect running Airflow tasks as long as `upgradeDeployments.enabled=false` is set in the script below.
- Patch version updates will NOT cause any downtime to Astronomer services (Astronomer UI, Houston API, Astronomer CLI).

> **Note:** Astronomer v0.16.5 and beyond includes an improved upgrade process that allows Airflow Deployments to remain unaffected through a platform upgrade that includes changes to the [Astronomer Airflow Chart](https://github.com/astronomer/airflow-chart).
>
> Now, Airflow Chart changes only take effect when another restart event is triggered by a user (e.g. a code push, Environment Variable change, resource or executor adjustment, etc).

## Astronomer Platform Versioning

Astronomer platform releases follow a semantic versioning scheme. All versions are written as a 3-component number in the format of `x.y.z`. In this syntax,

- X: Major Version
- Y: Minor Version
- Z: Patch/Hotfix

For example, upgrading Astronomer from v0.16.4 to v0.16.5 would be considered upgrading to a patch version, whereas upgrading from v0.15.0 to v0.16.0 would be considered upgrading to the latest minor version.

## Step 1: Ensure You Have a Copy of Your Astronomer config.yaml File

First, ensure you have a copy of the `config.yaml` file of your platform namespace if you don't already.

To do this, you can run:

```sh
$ helm get values <your-platform-release-name> -n <your-platform-namespace>  > config.yaml
```

Review this configuration and delete the line `"USER-SUPPLIED VALUES:"` if you see it.

## Step 2: Verify Your Current Platform Version

To verify the version of Astronomer you're currently operating with, run:

```sh
$ helm list --all-namespaces | grep astronomer
```

## Step 3: Run Astronomer's Patch Upgrade Script

Now, review and run the script below to upgrade to the patch version of your choice.

Make sure to substitute the following 3 variables with your own values:

- `RELEASE_NAME`
- `NAMESPACE`
- `ASTRO_VERSION`

```sh
#!/bin/bash
set -xe

RELEASE_NAME=replace-this
NAMESPACE=replace-this
ASTRO_VERSION=0.23.replace-patch-version

helm3 repo add astronomer https://helm.astronomer.io
helm3 repo update

# upgradeDeployments false ensures that Airflow charts are not upgraded when this script is ran
# If you deployed a config change that is intended to reconfigure something inside Airflow,
# then you may set this value to "true" instead. When it is "true", then each Airflow chart will
# restart.
helm3 upgrade --namespace $NAMESPACE \
            -f ./config.yaml \
            --reset-values \
            --version $ASTRO_VERSION \
            --set astronomer.houston.upgradeDeployments.enabled=false \
            $RELEASE_NAME \
            astronomer/astronomer
```

> **Note:** If you do not specify a patch version above, the script will automatically pull the latest Astronomer Enterprise v0.23 patch available in the [Astronomer Helm Chart](https://github.com/astronomer/astronomer/releases). If you set `ASTRO_VERSION=0.23` and `--version 0.23`, for example, Astronomer v0.23.9 will be installed if it is the latest v0.23 patch available.