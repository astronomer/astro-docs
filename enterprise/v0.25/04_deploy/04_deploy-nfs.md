---
title: "Deploy DAGs via NFS Volume"
navTitle: "Deploy DAGs via NFS Volume"
description: "How to push DAGs to an Airflow Deployment on Astronomer using an external NFS volume."
---

## Overview

Starting in Astronomer Enterprise v0.25, you can use an external [Network File System (NFS) Volume](https://kubernetes.io/docs/concepts/storage/volumes/#nfs) to deploy DAGs to an Airflow Deployment on Astronomer.

Unlike [deploying DAGs via the Astronomer CLI](/docs/enterprise/v0.25/deploy/deploy-cli.), deploying DAGs to an NFS volume does not require rebuilding a Docker image and thus restarting the underlying Airflow service. When a DAG is added to an NFS volume, it automatically appears in the Airflow UI without requiring additional action or causing downtime.

This guide provides the necessary setup for connecting an NFS volume to Astronomer as a DAG deploy option. Some considerations before completing this setup:

- NFS volumes are used only for DAG deploys. To add dependencies or other requirements to your Deployment, you still need to set them in your `requirements.txt` and `packages.txt` files and rebuild your image via the CLI as described in [Customize Images](/docs/enterprise/v0.25/develop/customize-image).
- DAGs must be deployed directly to NFS volumes. They cannot be deployed via the Astronomer CLI or an Astronomer service account.

## Enable NFS Volume Storage

NFS volume deploys must be explicitly enabled on Astronomer by a System Admin. To enable it, update your `config.yaml` file with the following values:

```yaml
houston:
  config:
      deployments:
        configureDagDeployment: true
        nfsMountDagDeployment: true
```

Once you have saved the file, push the configuration change to your platform as described in [Apply a Platform Configuration Change on Astronomer](https://www.astronomer.io/docs/enterprise/v0.25/manage-astronomer/apply-platform-config). This process needs to be completed only once per Astronomer installation.

## Provision an NFS Volume

While you can use any NFS volume for this step, we recommend using each support cloud provider's own NFS volume solution:

* GCP: [Filestore](https://cloud.google.com/filestore/docs/creating-instances)
* Azure: [File Storage](https://docs.microsoft.com/en-us/azure/storage/files/storage-files-how-to-create-nfs-shares?tabs=azure-portal)
* AWS: [EFS](https://docs.aws.amazon.com/efs/latest/ug/getting-started.html)

For each NFS volume you provision for DAG deploys, you need to configure:

* A directory for DAGs.
* Read access for a user with GID `50000` and UID `50000`. For an example setup of this, read [Configuring Ip-based access control](https://cloud.google.com/filestore/docs/creating-instances#configuring_ip-based_access_control) in Google Cloud's documentation.

## Add an NFS Volume to a Deployment

Workspace editors can configure a new or existing Airflow Deployment to use a provisioned NFS volume for DAG deploys. From there, any member of your organization with write permissions to the NFS volume can deploy DAGs to the Deployment. To do so:

1. In the Astronomer UI, create a new Airflow Deployment or open an existing one.
2. Go to the **DAG Deployment** section of the Deployment's Settings page.
3. For your **Mechanism**, select **NFS Volume Mount**:

    ![Custom Release Name Field](https://assets2.astronomer.io/main/docs/astronomer-ui/nfs.png)

4. In the **NFS Location** field that appears, enter the location of your volume-based DAG directory as `<IP>:/<path>` (for example: `192.168.0.1:/path/to/your/dags`).
5. Save your changes.

> **Note:** NFS volumes can also be configured via the Astronomer CLI. To do so, specify the `--nfs-location` flag when running [`astro deployment create`](docs/enterprise/v0.25/resources/cli-reference#astro-deployment-create) or [`astro deployment update`](docs/enterprise/v0.25/resources/cli-reference#astro-deployment-update).
