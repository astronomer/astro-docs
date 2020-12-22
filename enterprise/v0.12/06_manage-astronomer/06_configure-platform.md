---
title: "Apply a Platform Configuration Change"
navTitle: "Configure the Platform"
description: "How to push configuration changes via Helm to an Astronomer platform."
---

You can configure platform-wide settings without needing to upgrade Astronomer versions. Using Helm, any of the settings for your platform can be updated through a few simple commands. For example, you can use Helm to:

* [Integrate an Auth system](https://www.astronomer.io/docs/enterprise/v0.12/manage-astronomer/integrate-auth-system)
* [Add a registry backend](https://www.astronomer.io/docs/enterprise/v0.12/manage-astronomer/registry-backend)
* [Change resource allocation limits](https://www.astronomer.io/docs/enterprise/v0.12/manage-astronomer/configure-platform-resources)
* Update any other key-value pair specified in the [default configuration file](https://github.com/astronomer/docs/blob/main/enterprise/v0.13/reference/default.yaml)

To configure these settings without upgrading, follow the steps below.

## Step 1: Open Your config.yaml File

This file was created when you installed Astronomer using one of the following guides:

* [AWS EKS Installation Guide](https://www.astronomer.io/docs/enterprise/v0.12/install/aws/install-aws-standard#6-configure-your-helm-chart)
* [GCP GKE Installation Guide](https://www.astronomer.io/docs/enterprise/v0.12/install/gcp/install-gcp-standard#7-configure-your-helm-chart)
* [Azure AKS Installation Guide](https://www.astronomer.io/docs/enterprise/v0.12/install/azure/install-azure-standard#6-configure-your-helm-chart)

## Step 2: Update Key-Value Pairs

To update any of your existing settings, modify them directly in your `config.yaml` file. To update a setting you haven't already specified, copy the corresponding key-value pair from the [default configuration file](https://github.com/astronomer/docs/blob/main/enterprise/v0.12/reference/default.yaml) into your `config.yaml` file and modify the value from there.

When you have finished updating the key-value pairs, ensure that they have the same relative order and indentation as they do in the default configuration file. If they don't, your changes might not be properly applied.

## Step 3: Push Changes to Your Astronomer Platform

Save your `config.yaml` file, then run the following command:

```sh
$ helm upgrade <your-platform-release-name> astronomer/astronomer -f config.yaml -n <your-platform-namespace> --version=<your-platform-version>
```

> **Tip:** The value for `<your-platform-namespace>` can be found in your list of active namespaces. To show this list, run:
```sh
$ kubectl get ns
```
>
>To get the value for `<your-platform-release-name>`, run:
```sh
$ helm ls -n <your-platform-namespace>
```

To see the updated key-value pairs in your terminal, run the following:

```sh
$ helm get values <your-platform-release-name> -n <your-platform-namespace>
```
