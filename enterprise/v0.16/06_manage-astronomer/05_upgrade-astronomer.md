---
title: "Enterprise Upgrade Guide"
navTitle: "Upgrade Astronomer"
description: "How to upgrade the Astronomer Enterprise Platform."
---

## Overview

As of Astronomer v0.16, Astronomer releases will be made generally available to Enterprise customers on a quarterly basis as part of a long-term support (LTS) release model. Critical security and bug fixes will be regularly shipped as patch versions that follow LTS releases. Patch releases will be made available _between_ quarterly LTS releases and require a simple upgrade process.

To help you maintain Astronomer up-to-date, the guide below will walk you through:

- Astronomer Platform Versioning
- How to upgrade to a patch version on Astronomer
- How to upgrade to a minor version on Astronomer

For a detailed breakdown of individual releases, refer to [Astronomer Enterprise Release Notes](https://www.astronomer.io/docs/enterprise/v0.16/resources/release-notes/).

## Astronomer Platform Versioning

Astronomer platform releases follow a semantic versioning scheme. All versions are written as a 3-component number in the format of `x.y.z`. In this syntax,

- X: Major Version
- Y: Minor Version
- Z: Patch/Hotfix

For example, upgrading Astronomer from `v0.16.4` to `v0.16.5` would be considered upgrading to a "patch" version whereas upgrading from `v0.15.0` to `v0.16.0` would be considered upgrading to the latest "minor" version.

## Upgrade to a Patch Version

If you're already on Astronomer's latest minor version (v0.16), you're free to upgrade the platform to a patch release as soon as it's made available.

A few notes before you get started:
- The patch upgrade process will NOT affect running tasks if `upgradeDeployments.enabled=false`
- Patch version updates will NOT cause any downtime to Astronomer services (UI, API, etc.)

Read below for specific guidelines.

> **Note:** Astronomer v0.16.5 and beyond includes an improved upgrade process that allows Airflow Deployments to remain unaffected through a platform upgrade that includes changes to [the Airflow Chart](https://github.com/astronomer/airflow-chart).
>
> Now, Airflow Chart changes only take effect when another restart event is triggered by a user (e.g. a code push, Environment Variable change, resource or executor adjustment, etc).

### Ensure you have a copy of your Astronomer `config.yaml`

First, ensure you have a copy of the `config.yaml` file of your platform namespace if you don't already.

To do this, you can run:

```sh
$ helm3 get values -n <namespace> <release name of astronomer> > config.yaml
```

Review this configuration and delete the line `"USER-SUPPLIED VALUES:"` if you see it.

### Verify Your Current Platform Version

To verify the version of Astronomer you're currently operating with, run:

```sh
helm3 list --all-namespaces | grep astronomer
```

### Run Astronomer's Patch Upgrade Script

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
ASTRO_VERSION=0.16.replace-patch-version

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

## Upgrade to a Minor Version

If you're looking to upgrade to Astronomer Enterprise [v0.16 (latest)](/docs/enterprise/v0.16/resources/release-notes) from an earlier minor version, submit a request to [Astronomer Support](https://support.astronomer.io).

We're working on a more robust and reliable upgrade process for our next Astronomer Enterprise "Long-term Support" quarterly release scheduled for Fall 2020.

## Update Your Platform Configuration

You can reconfigure your Astronomer platform without upgrading your Astronomer version using Helm. This is useful for [integrating an Auth system](https://www.astronomer.io/docs/enterprise/v0.16/manage-astronomer/integrate-auth-system), [adding a registry backend](https://www.astronomer.io/docs/enterprise/v0.16/manage-astronomer/registry-backend), (changing resource allocation limits)[https://www.astronomer.io/docs/enterprise/v0.16/manage-astronomer/configure-platform-resources], or any other change that applies to your entire platform.

#### 1. Open your `config.yaml` file.

This file was created when you installed Astronomer using one of the following guides:
* [AWS EKS Installation Guide] (https://www.astronomer.io/docs/enterprise/v0.16/install/aws/install-aws-standard#6-configure-your-helm-chart)
* [GCP GKE Installation Guide] (https://www.astronomer.io/docs/enterprise/v0.16/install/gcp/install-gcp-standard#7-configure-your-helm-chart)
* [Azure AKS Installation Guide] (https://www.astronomer.io/docs/enterprise/v0.16/install/azure/install-azure-standard#6-configure-your-helm-chart)

If you need to create a new copy of this file, the following Helm command will create a new file called `config.yaml` populated with your organization's configured values::
```
$ helm -n astronomer get values astronomer >config.yaml
```
#### 2. Update key-value pairs in `config.yaml`.

For an example file that includes all of the possible values you can configure, refer to [the default configuration file](https://github.com/astronomer/docs/blob/main/enterprise/v0.16/reference/default.yaml).

To update any of your existing key-value pairs, simply modify the existing value in `config.yaml`. To update a setting that hasn't yet been configured, copy the .yaml key-value pair you want to update from the default configuration file into your `config.yaml` file and update the value from there. After copying and modifying the key-value pairs, ensure they have the same order and indentation as they had in the default configuration file.

#### 3. Push the changes to your Astronomer platform.

Save `config.yaml`, then run the following command:

```
$ helm -n astronomer upgrade astronomer astronomer/astronomer --version=<your current version> -f config.yaml
```
To see the updated key-value pairs in your terminal, you can run:
```
$ helm3 get values -n <namespace> <release name of astronomer>
```
