---
title: "Configure NFS Volume-based DAG Deployment"
navTitle: "Configure NFS Volumes"
description: "How to push DAGs to an Airflow Deployment on Astronomer using an external NFS Volume."
---

## Overview

Starting in Astronomer Enterprise v0.25, you can use an external NFS Volume to deploy DAGs to an Airflow environment.

Unlike [deploying DAGs via the CLI](/docs/enterprise/v0.25/deploy/deploy-cli.), deploying DAGs to an NFS volume does not require rebuilding your Airflow Deployment. When a DAG is added to an NFS volume, it automatically appears in your Deployment without any further build steps.

This guide provides the necessary setup for connecting an NFS volume to Astronomer as a DAG deployment option. Some considerations before completing this setup:

- NFS volumes are used only for DAG deploys. To add dependencies or other requirements to your Deployment, you still need to rebuild your image via the CLI as described in [Customize Images](/docs/enterprise/v0.25/develop/customize-image).
- DAGs must be deployed directly to NFS volumes. They cannot be deployed via the Astronomer CLI or an Astronomer service account.

## Step 1: Enable the Feature on Your Platform

NFS Volume deployment is not enabled by default. To enable it on your platform, update your `config.yaml` file with the following values:

```yaml
houston:
  config:
      deployments:
        configureDagDeployment: true
        nfsMountDagDeployment: true
```

Once you have saved the file, push the configuration change to your platform as described in [Apply a Platform Configuration Change on Astronomer](https://www.astronomer.io/docs/enterprise/v0.23/manage-astronomer/apply-platform-config).

## Step 2: Provision an NFS Volume

Any NFS volume can be used for this step as long as it has:

* A directory for DAGS.
* Read access for a user with GID `50000` and UID `50000`

We recommend using a GCP Filestore instance for your NFS Volume. For more information on configuring a Filestore instance, read the [GCP documentation](https://cloud.google.com/filestore/docs/creating-instances).

## Step 3: Connect the NFS Volume to Astronomer

1. In the Astronomer UI, create a new Airflow Deployment or open an existing one.
2. In the **Settings** tab, go to **Mechanism**.
2. Select **NFS Volume Mount**.
3. In the **NFS Location** field that appears, enter the location of your volume-based DAG directory as `<IP>:/<path>` (for example: `192.168.0.1:/path/to/your/dags`).
4. Save your changes to the Deployment.

> **Note:** NFS Volumes can also be configured via the Astronomer CLI. To do so, configure the `--nfs-location` flag when running `astro deployment create` or `astro deployment update`.
