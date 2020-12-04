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

You can reconfigure your Astronomer platform without upgrading your Astronomer version. This is useful for [integrating an Auth system](https://www.astronomer.io/docs/enterprise/v0.16/manage-astronomer/integrate-auth-system), [adding a registry backend](https://www.astronomer.io/docs/enterprise/v0.16/manage-astronomer/registry-backend), (changing resource allocation limits)[https://www.astronomer.io/docs/enterprise/v0.16/manage-astronomer/configure-platform-resources], or any other change that applies to your entire platform.

#### 1. Populate a .yaml file with your current configuration.

Run the following command to create a new file called `config.yaml`:

```
$ helm -n astronomer get values astronomer >config.yaml
```
#### 2. Open the new file and reconfigure the variables.

By default, the `config.yaml` file you created only shows key-value pairs that have been modified from their default state. To see the full .yaml with every possible key-value pair, refer to [the `values.yaml` template file](https://github.com/astronomer/astronomer/blob/master/values.yaml).

To update any of the prepopulated variables, simply modify the existing value `config.yaml`. To update a variable that hasn't yet been configured, copy the .yaml key-value pair you want to update from [the `values.yaml` template file](https://github.com/astronomer/astronomer/blob/master/values.yaml). After copying the key-value pairs you need to `config.yaml`, ensure they have the same order and indentation as they have in `values.yaml`.

#### 3. Push the changes to your Astronomer platform.

Save your updated config.yaml file, then run the following command:

```
$ helm -n astronomer upgrade astronomer astronomer/astronomer --version=<your current version> -f config.yaml
```
To see the updated key-value pairs in your terminal, you can run:
```
$ helm3 get values -n <namespace> <release name of astronomer>
```
