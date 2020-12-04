---
title: "Enterprise Upgrade Guide"
navTitle: "Upgrade Astronomer"
description: "How to upgrade the Astronomer Enterprise Platform."
---

## Overview

As of Astronomer v0.16, Astronomer releases will be made generally available to Enterprise customers on a quarterly basis as part of a long-term support (LTS) release model. Critical security and bug fixes will be regularly shipped as patch versions that follow LTS releases. Patch releases will be made available _between_ quarterly LTS releases and require a simple upgrade process.

For a detailed breakdown of individual releases, refer to [Astronomer Enterprise Release Notes](https://www.astronomer.io/docs/enterprise/v0.12/resources/release-notes/).

## Upgrade to Astronomer v0.16

If you're running Astronomer on a version below 0.16, reach out to [Astronomer Support](support.astronomer.io) to request an upgrade. Once you get in touch, our Support and Customer Succcess teams will connect with you to:

- Confirm your current platform configurations (Cloud provider, database, Airflow image, # of Airflow Deployments, etc.)
- Book time with our Infrastructure Engineering team to assist with an upgrade

Beyond Astronomer v0.16 we'll be implementing a more robust and reliable upgrade process for our next Astronomer Enterprise LTS release scheduled for Fall 2020.

> **Note:** If you're already on Astronomer v0.16 and need to upgrade to a patch release, refer to our instructions in the v0.16 version of this doc by toggling the version menu on the top left of this page.

## Astronomer Platform Versioning

Astronomer platform releases follow a semantic versioning scheme. All versions are written as a 3-component number in the format of `x.y.z`. In this syntax,

- X: Major Version
- Y: Minor Version
- Z: Patch/Hotfix

For example, upgrading Astronomer from `v0.16.4` to `v0.16.5` would be considered upgrading to a "patch" version whereas upgrading from `v0.15.0` to `v0.16.0` would be considered upgrading to the latest "minor" version.

## Configure Astronomer Between Upgrades

You can configure Astronomer's settings without needing to upgrade your version number. Using Helm, any of the settings your platform uses, including ones available in the Astronomer UI, can be updated through a few simple commands. For example, you can use Helm to quickly:
* [Integrate an Auth system](https://www.astronomer.io/docs/enterprise/v0.16/manage-astronomer/integrate-auth-system)
* [Add a registry backend](https://www.astronomer.io/docs/enterprise/v0.16/manage-astronomer/registry-backend),
* [Change resource allocation limits](https://www.astronomer.io/docs/enterprise/v0.16/manage-astronomer/configure-platform-resources)
* Update any other key-value pair specified in the [default configuration file](https://github.com/astronomer/docs/blob/main/enterprise/v0.16/reference/default.yaml).

To do so:

#### 1. Open your config.yaml file.

This file was created when you installed Astronomer using one of the following guides:
* [AWS EKS Installation Guide] (https://www.astronomer.io/docs/enterprise/v0.16/install/aws/install-aws-standard#6-configure-your-helm-chart)
* [GCP GKE Installation Guide] (https://www.astronomer.io/docs/enterprise/v0.16/install/gcp/install-gcp-standard#7-configure-your-helm-chart)
* [Azure AKS Installation Guide] (https://www.astronomer.io/docs/enterprise/v0.16/install/azure/install-azure-standard#6-configure-your-helm-chart)

#### 2. Update key-value pairs in config.yaml.

To update any of your existing settings, modify them directly in `config.yaml`. To update a setting you haven't already specified, copy the corresponding key-value pair from the [default configuration file](https://github.com/astronomer/docs/blob/main/enterprise/v0.16/reference/default.yaml) into your `config.yaml` file and modify the value from there.

When you have finished updating the key-value pairs, ensure that they have the same relative order and indentation as they had in the default configuration file. If they don't, your changes might not be properly applied.

#### 3. Push the changes to your Astronomer platform.

Save `config.yaml`, then run the following command:

```
$ helm -n astronomer upgrade astronomer astronomer/astronomer --version=<your current version> -f config.yaml
```
To see the updated key-value pairs in your terminal, you can run:

```
$ helm3 get values -n <namespace> <release name of astronomer>
```
