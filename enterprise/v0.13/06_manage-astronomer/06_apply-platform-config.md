---
title: "Apply a Platform Configuration Change on Astronomer"
navTitle: "Apply a Config Change"
description: "How to apply platform-wide configuration changes to Astronomer via Helm."
---

## Overview

When you install Astronomer, a number of platform-level settings will be set by default. If you'd like to change any of those settings based on the needs of your organization, you can do so at any time using Helm.

For example, you can:

* [Integrate an Auth system](https://www.astronomer.io/docs/enterprise/v0.13/manage-astronomer/integrate-auth-system)
* [Add a registry backend](https://www.astronomer.io/docs/enterprise/v0.13/manage-astronomer/registry-backend)
* [Change resource allocation limits](https://www.astronomer.io/docs/enterprise/v0.13/manage-astronomer/configure-platform-resources)
* Update any other key-value pair specified in the [default configuration file](https://github.com/astronomer/docs/blob/main/enterprise/v0.13/reference/default.yaml)

To configure these settings, follow the steps below.

> **Note:** If you're interested in upgrading Astronomer to a new version of the platform, read [Upgrade Astronomer](https://www.astronomer.io/docs/enterprise/v0.13/manage-astronomer/upgrade-astronomer).

## Step 1: Open Your config.yaml File

This file was created when you installed Astronomer using one of the following guides:

* [AWS EKS Installation Guide](https://www.astronomer.io/docs/enterprise/v0.13/install/aws/install-aws-standard#6-configure-your-helm-chart)
* [GCP GKE Installation Guide](https://www.astronomer.io/docs/enterprise/v0.13/install/gcp/install-gcp-standard#7-configure-your-helm-chart)
* [Azure AKS Installation Guide](https://www.astronomer.io/docs/enterprise/v0.13/install/azure/install-azure-standard#6-configure-your-helm-chart)

## Step 2: Update Key-Value Pairs

To update any of your existing settings, modify them directly in your `config.yaml` file. To update a setting you haven't already specified, copy the corresponding key-value pair from the [default configuration file](https://github.com/astronomer/docs/blob/main/enterprise/v0.13/reference/default.yaml) into your `config.yaml` file and modify the value from there.

When you have finished updating the key-value pairs, ensure that they have the same relative order and indentation as they do in the default configuration file. If they don't, your changes might not be properly applied.

## Step 3: Push Changes to Your Astronomer Platform

Save your `config.yaml` file, then run the following command:

```sh
$ helm upgrade <your-platform-release-name> <your-platform-namespace> astronomer/astronomer -f config.yaml --version=<your-platform-version>
```

> **Tip:** The value for `<your-platform-namespace>` can be found in your list of active namespaces. To show this list, run:
>
> ```sh
> $ kubectl get ns
> ```
>
> To get the value for `<your-platform-release-name>`, run:
> ```sh
> $ helm ls <your-platform-namespace>
> ```

To see the updated key-value pairs in your terminal, run the following:

```sh
$ helm get values <your-platform-release-name> <your-platform-namespace>
```
