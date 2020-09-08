---
title: "Enterprise Upgrade Guide"
navTitle: "Upgrade Astronomer"
description: "How to upgrade the Astronomer Enterprise Platform."
---

## Overview

As of Astronomer v0.16, Astronomer releases will be made generally available to Enterprise customers on a quarterly basis as part of a long-term support (LTS) release model. Critical security and bug fixes will be regularly shipped as patch versions that follow LTS releases. Patch releases will be made available _between_ quarterly LTS releases and require a simple upgrade process.

For a detailed breakdown of individual releases, refer to [Astronomer Enterprise Release Notes](https://www.astronomer.io/docs/enterprise/stable/resources/release-notes/).

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

