---
title: "Enterprise Upgrade Guide"
navTitle: "Upgrade Astronomer"
description: "How to upgrade the Astronomer Enterprise Platform."
---

## Overview

As of Astronomer v0.16, Astronomer releases will be made generally available to Enterprise customers on a quarterly basis within a long-term support (LTS) release model. Critical security and bug fixes will be regularly backported to the latest supported Enterprise LTS version as one or more patch releases. Patch releases will be made available _between_ quarterly LTS releases and require a simple upgrade process.

To help you maintain Astronomer up-to-date, the guide below will walk you through:

- Astronomer Platform Versioning
- How to upgrade to a patch version on Astronomer
- How to upgrade to a minor version on Astronomer

For a detailed breakdown of individual releases, refer to [Astronomer Enterprise Release Notes](https://www.astronomer.io/docs/enterprise/stable/resources/release-notes/).

## Astronomer Platform Versioning

Astronomer platform releases follow a semantic versioning scheme. All versions are written as a 3-component number in the format of `x.y.z`. In this syntax,

- X: Major Version
- Y: Minor Version
- Z: Patch/Hotfix

For example, upgrading Astronomer from `v0.16.4` to `v0.16.5` would be considered upgrading to a "patch" version whereas upgrading from `v0.15.0` to `v0.16.0` would be considered upgrading to a subsequent "minor" version.

## Upgrade to a Patch Version

If you're already on Astronomer 0.16.x, you're free to upgrade Astronomer to a patch releases without our assistance as soon as they're made available.

Read below for guidelines.

### Ensure you have a copy of Astronomer `config.yaml`

First, ensure you have a copy of the `config.yaml` file of your platform namespace if you don't already.

To do this, you can run:

```sh
$ helm3 get values -n <namespace> <release name of astronomer> > config.yaml
```

Review this configuration, and you can delete the line "USER-SUPPLIED VALUES:"
- check your current version

```sh
helm3 list --all-namespaces | grep astronomer
```

### Run Astronomer's Patch Upgrade Script

- Use a script like this to update Astronomer patch versions or reconfigurations, please review this script to understand what it is doing and substitute the variables with your own values

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
            --version $ASTRO_VERSION \
            --set astronomer.houston.upgradeDeployments.enabled=false \
            $RELEASE_NAME \
            astronomer/astronomer
```


## Upgrade to a Minor Version

In the meantime:

- If you're looking to upgrade to Astronomer Enterprise [v0.16 (latest)](/docs/enterprise/stable/resources/release-notes) from an earlier minor version, submit a request to [our Support Portal](support.astronomer.io).

We're working on a more robust and reliable upgrade process for our next Astronomer Enterprise "Long-term Support" quarterly release scheduled for Fall 2020.

