---
title: "Registry Back Ends in Astronomer Enterprise"
description: "How to configure a registry back end."
date: 2019-06-26T00:00:00.000Z
slug: "ee-registry-backend"
---

## Overview

Astronomer Enterprise requires a Docker Registry to store the Docker images generated every time a user either pushes code or a configuration change to an Airflow Deployment on Astronomer.

The default storage backend for this Docker Registry is a [Kubernetes Persistent Volume](https://kubernetes.io/docs/concepts/storage/persistent-volumes/). While this may be sufficient for teams just getting started on Astronomer, we'd strongly recommend backing the registry with an external storage solution for any team running in production.

This doc will walk through configuring the 3 tools that Astronomer supports:

- [Google Cloud Storage](https://cloud.google.com/storage/)
- [AWS S3](https://aws.amazon.com/s3/)
- [Azure Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs/)

## Google Cloud Storage

If you're running Astronomer Enterprise on GCP GKE, we'd recommend Google Cloud Storage (GCS) as a registry backend solution. Read below for guidelines.

To read more about the Google Cloud Storage driver, reference [this doc](https://github.com/docker/docker.github.io/blob/master/registry/storage-drivers/gcs.md).

### Prerequisites

To use Google Cloud Storage (GCS) as a registry backend solution, you'll need:

-  An existing GCS Bucket
- Your Google Cloud Platform Service Account JSON Key
- Ability to create a Kubernetes Secret in your cluster

### Add to your config.yaml

**1. Download your Google Cloud Platform service account JSON key from [Google Console](https://console.cloud.google.com/apis/credentials/serviceaccountkey).** Make sure the service account you use has both the `Storage Legacy Bucket Owner` and `Storage Object Admin` roles.

**2. Create a [Kubernetes Secret](https://kubernetes.io/docs/concepts/configuration/secret/) using the downloaded key:** 

```
kubectl create secret generic astronomer-gcs-keyfile --from-file astronomer-gcs-keyfile=/path/to/key.json -n <your-namespace>
```

**3. Add the following to your `config.yaml`:**

```yaml
astronomer:
  registry:
    gcs:
      enabled: true
      bucket: my-gcs-bucket
```

Example:

```yaml
#################################
## Astronomer global configuration
#################################
global:
  # Base domain for all subdomains exposed through ingress
  baseDomain: astro.mydomain.com

  # Name of secret containing TLS certificate
  tlsSecret: astronomer-tls

#################################
## Nginx configuration
#################################
nginx:
  # IP address the nginx ingress should bind to
  loadBalancerIP: 0.0.0.0
  preserveSourceIP: true

#################################
## SMTP configuration
#################################  
astronomer:
  houston:
    config:
      email:
        enabled: true
        smtpUrl: YOUR_URI_HERE
  registry:
    gcs:
      enabled: true
      bucket: my-gcs-bucket
```

### Apply your Changes

From here, find your platform release name and apply your changes.

```
$ helm ls
```

```
$ helm upgrade <platform-release-name> -f config.yaml --version=<platform-version> astronomer/astronomer -n <your-namespace>
```

For example, if you're running Astronomer v0.15.5 and your platform release name is `astronomer`, you might run:

```
$ helm upgrade astronomer -f config.yaml --version=0.15.5 astronomer/astronomer -n astronomer
```

## AWS S3

If you're running Astronomer Enterprise on AWS EKS, we'd recommend AWS S3 as a registry backend solution. Read below for guidelines.

To read more about the AWS S3 storage driver, [go here](https://github.com/docker/docker.github.io/blob/master/registry/storage-drivers/s3.md).

### Prerequisites

To use AWS S3 as a registry backend solution, you'll need:

- An S3 bucket
- Your AWS Access Key
- Your AWS Secret Key
- Ability to create a Kubernetes Secret in your cluster

### Add to your `config.yaml`

Now, add the following to your `config.yaml`:

```yaml
astronomer:
  registry:
    s3:
      enabled: true
      accesskey: my-access-key
      secretkey: my-secret-key
      region: us-east-1
      bucket: my-s3-bucket
```

### Apply your Changes

From here, find your platform release name and apply your changes.

```
$ helm ls
```

```
$ helm upgrade <platform-release-name> -f config.yaml --version=<platform-version> astronomer/astronomer -n <your-namespace>
```

For example, if you're running Astronomer v0.15.5 and your platform release name is `astronomer`, you might run:

```
$ helm upgrade astronomer -f config.yaml --version=0.15.5 astronomer/astronomer -n astronomer
```

## Azure Blob Storage

If you're running Astronomer Enterprise on Azure AKS, we'd recommend Azure Blob Storage as a registry backend solution. Read below for guidelines.

To read more about the Azure Blog Storage driver, [go here](https://github.com/docker/docker.github.io/blob/master/registry/storage-drivers/azure.md).


### Prerequisites

To use Azure Blog Storage as a registry backend solution, you'll need:

- Azure Storage Account Name
- Azure Account Access Key
- Azure Container Name

### Add to your `config.yaml`

Now, add the following to your `config.yaml`:

```yaml
astronomer:
  registry:
    azure:
      enabled: true
      accountname: my-account-name
      accountkey: my-account-key
      container: my-container-name
      realm: core.windows.net
```

### Apply your Changes

From here, find your platform release name and apply your changes.

```
$ helm ls
```

```
$ helm upgrade <platform-release-name> -f config.yaml --version=<platform-version> astronomer/astronomer -n <your-namespace>
```

For example, if you're running Astronomer v0.15.5 and your platform release name is `astronomer`, you might run:

```
$ helm upgrade astronomer -f config.yaml --version=0.15.5 astronomer/astronomer -n astronomer
```