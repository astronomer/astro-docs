---
title: "Enterprise Upgrade Guide"
navTitle: "Upgrade Astronomer"
description: "How to upgrade the Astronomer Enterprise Platform."
---

## Overview

As of Astronomer v0.16, Astronomer releases will be made generally available to Enterprise customers on a quarterly basis as part of a long-term support (LTS) release model. Critical security and bug fixes will be regularly shipped as patch versions that follow LTS releases. Patch releases will be made available _between_ quarterly LTS releases and require a simple upgrade process.

For a detailed breakdown of individual releases, refer to [Astronomer Enterprise Release Notes](https://www.astronomer.io/docs/enterprise/v0.13/resources/release-notes/).

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
