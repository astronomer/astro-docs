---
title: "Upgrade to Astronomer Enterprise v0.23"
navTitle: "Upgrade to v0.23"
description: "How to upgrade the Astronomer Enterprise Platform."
---

## Overview

As of Astronomer v0.16, Astronomer releases will be made generally available to Enterprise customers on a quarterly basis as part of a long-term support (LTS) release model.

This guide walks through the process of upgrading your Astronomer Enterprise platform to v0.23, which is the latest minor version.

## Astronomer Platform Versioning

Astronomer platform releases follow a semantic versioning scheme. All versions are written as a 3-component number in the format of `x.y.z`. In this syntax,

- X: Major Version
- Y: Minor Version
- Z: Patch/Hotfix

For example, upgrading Astronomer from v0.16.4 to v0.16.5 would be considered upgrading to a patch version, whereas upgrading from v0.15.0 to v0.16.0 would be considered upgrading to the latest minor version.

The following setup is only for upgrading to the latest minor version. To upgrade to a patch version, read [Upgrade to a Patch Version of Astronomer Enterprise](https://www.astronomer.io/docs/enterprise/v0.16/manage-astronomer/upgrade-astronomer)

## Step 1: Check Version Compatibility

Ensure that the following software

- **Kubernetes**: Your version must be greater than or equal to 1.14 and less than 1.19. If you need to upgrade Kubernetes, contact your cloud provider's support or your Kubernetes administrator.
- **Airflow Images**: You must be using an Astronomer Certified Airflow Image, and the version of your Image must be 1.10.5 or greater. In addition, your image should be in the following format:
```
astronomerinc/ap-airflow:<airflow-version>-<build-number>-<distribution>-onbuild
```
For example, all of the following images would work for this upgrade:
```sh
astronomerinc/ap-airflow:1.10.12-1-alpine3.10-onbuild
astronomerinc/ap-airflow:1.10.12-1-alpine3.10
astronomerinc/ap-airflow:1.10.5-9-buster-onbuild
astronomerinc/ap-airflow:1.10.5-9-buster
```
> **Note:** While `-onbuild` and `<build-number>` are optional, we recommend including them for most upgrades. If you have your own build, test, and publish workflows that are layered on top of the Astronomer Airflow images, then removing `<build-number>` is appropriate.

## Step 2: Check Permissions

Minor version upgrades can be initiated only by Astronomer Admins. To confirm you're an Astronomer Admin, confirm that you have access to **System Admin** features in the in the Astronomer UI:

![Admin](https://assets2.astronomer.io/main/docs/enterprise_quickstart/admin_panel.png)

You also need permission to create Kubernetes resources. These permissions can be confirmed by running the following commands:

```
$ kubectl auth can-i create pods --namespace <your-astronomer-namespace>
$ kubectl auth can-i create sa --namespace <your-astronomer-namespace>
$ kubectl auth can-i create jobs --namespace <your-astronomer-namespace>
```

If all commands return `yes`, then you have the appropriate Kubernetes permissions.

## Step 3: Backup Your Database

Backup your database using your cloud provider's functionality for doing so, or make a request to your database administrator to backup based on your organization's own guidelines.

## Step 4: Check the Status of Your Kubernetes Pods

All pods should be either `Running` or `Completed`. If you have any pods that are crashing, but this is expected behavior and you want to proceed anyways, make note of which pods are crashing before upgrading.

## Step 5: Switch to Your Default Namespace

Switch to the default namespace in your Kubernetes context by running the following command:

```sh
$ kubectl config set-context --current --namespace=default
```

## Step 6: Upgrade Astronomer

Run the following command to begin the upgrade process:

```
kubectl apply -f https://raw.githubusercontent.com/astronomer/astronomer/master/bin/migration-scripts/lts-to-lts/0.16-to-0.23/manifests/upgrade.yaml
```

While your platform is upgrading, monitor your pods to ensure that no errors occur. To do so, first find the names of your pods by running the following command:

```sh
$ kubectl get pods | grep upgrade-astronomer
```

Then, run the following command to see each pod while you upgrade:

```sh
$ kubectl logs <your-pod-name>
```

## Step 7: Confirm That the Upgrade Was Successful

If the upgrade was successful, you should be able to:

* Log in to Astronomer at `astronomer.BASEDOMAIN`
* See Workspaces and Airflow Deployments in the Astronomer UI
* Access the settings of your Airflow Deployments
* See metrics on the **Metrics** tab in the Astronomer UI
* Successfully run `$ astro deploy` using the Astronomer CLI
* Open a Deployment in the Airflow UI
* Access logs for your DAGs in the Airflow UI

## Roll Back to Enterprise v0.16

If the upgrade has some issues and you need to recover your platform, you can roll back to v0.16. To do so:

1. Apply the rollback automation script by running the following command:
```sh
kubectl apply -f https://raw.githubusercontent.com/astronomer/astronomer/master/bin/migration-scripts/lts-to-lts/0.16-to-0.23/manifests/rollback.yaml
```

2. Wait a few minutes for your platform to come back up.

3. Confirm that the rollback completed. To do so, watch your pods until they have stabilized; every pod in your Astronomer namespace should be `Running` with full readiness or `Completed`. You can check the status of your pods using the following command:
```sh
$ watch kubectl get pods -n <your-astronomer-namespace>
```
