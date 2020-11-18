---
title: "Manage Airflow Versions on Astronomer"
navTitle: "Manage Airflow Versions"
description: "How to adjust and upgrade Airflow versions on Astronomer."
---

## Overview

On Astronomer, the process of pushing up your code to an individual Airflow deployment involves customizing a locally built Docker image —— with your DAG code, Python Packages, plugins, and so on —— that's then bundled, tagged, and pushed to your Docker Registry.

Included in that build is your `Dockerfile`, a file that is automatically generated when you initialize an Airflow project on Astronomer via our CLI. Every successful build on Astronomer must include a `Dockerfile` that references an Astronomer-built Docker Image built to be individually compatible with a particular Airflow version.

To upgrade your Airflow Deployment to a higher version of Airflow, all it takes is changing the FROM statement in your project's Dockerfile to reference the AC image of your choice. Read below for details.

> **Note:** For more thorough guidelines on customizing your image, reference our ["Customize Your Image" doc](/docs/enterprise/v0.16/develop/customize-image/).

## Upgrade Airflow Version

Astronomer Certified offers support for the following versions of Apache Airflow:

- [Airflow 1.10.5](https://github.com/apache/airflow/releases/tag/1.10.5)
- [Airflow 1.10.7](https://github.com/apache/airflow/releases/tag/1.10.7)
- [Airflow 1.10.10](https://airflow.apache.org/blog/airflow-1.10.10/)
- [Airflow 1.10.12](https://airflow.apache.org/blog/airflow-1.10.12/) (_Astronomer v0.16.9+ only_)

### 1. Locate your Dockerfile in your Project Directory

First, open the `Dockerfile` within your Astronomer directory. When you initialiazed an Airflow project on Astronomer via our CLI, the following files should have been automatially generated:

```
.
├── dags # Where your DAGs go
│   ├── example-dag.py # An example dag that comes with the initialized project
├── Dockerfile # For Astronomer's Docker image and runtime overrides
├── include # For any other files you'd like to include
├── packages.txt # For OS-level packages
├── plugins # For any custom or community Airflow plugins
└── requirements.txt # For any Python packages
```

### 2. Change the FROM Statement in your Dockerfile

Depending on the OS distribution and version of Airflow you want to run, you'll want to reference the corresponding Astronomer Certified image in the FROM statement of your Dockerfile.

#### Alpine and Debian-based Images

Astronomer supports both Alpine Linux and Debian-based images. Alpine is a widely-used lightweight distribution of Linux that keeps our default images slim and performant. For users leveraging Machine Learning Python Libraries or more complex dependencies, we strongly recommend Debian.

> **Note:** For our platform's full collection of Docker Images, reference [Astronomer on Docker Hub](https://hub.docker.com/r/quay.io/astronomer/ap-airflow/tags).

| Airflow Version | Alpine-based Image                          | Debian-based Image
|-----------------|-----------------------------------------------------|-----------------------------------------------------|
| [v1.10.5](https://github.com/astronomer/ap-airflow/blob/master/1.10.5/CHANGELOG.md)         | FROM quay.io/astronomer/ap-airflow:1.10.5-alpine3.10-onbuild | FROM quay.io/astronomer/ap-airflow:1.10.5-buster-onbuild |
| [v1.10.7](https://github.com/astronomer/ap-airflow/blob/master/1.10.7/CHANGELOG.md)         | FROM quay.io/astronomer/ap-airflow:1.10.7-alpine3.10-onbuild | FROM quay.io/astronomer/ap-airflow:1.10.7-buster-onbuild |
| [v1.10.10](https://github.com/astronomer/ap-airflow/blob/master/1.10.10/CHANGELOG.md)         | FROM quay.io/astronomer/ap-airflow:1.10.10-alpine3.10-onbuild | FROM quay.io/astronomer/ap-airflow:1.10.10-buster-onbuild |
| [v1.10.12](https://github.com/astronomer/ap-airflow/blob/master/1.10.12/CHANGELOG.md)         | FROM quay.io/astronomer/ap-airflow:1.10.12-alpine3.10-onbuild | FROM quay.io/astronomer/ap-airflow:1.10.12-buster-onbuild |

To upgrade an Airflow Deployment to Astronomer Certified 1.10.12 you _must_ be running  [v0.16.9](https://www.astronomer.io/docs/enterprise/v0.16/resources/release-notes/)+ of the Astronomer Platform. For instructions on how to upgrade the platform, refer to ["Upgrade Astronomer"](https://www.astronomer.io/docs/enterprise/v0.16/manage-astronomer/upgrade-astronomer/) or [reach out to us](https://support.astronomer.io).

> **Note:** Once you upgrade Airflow versions, you CANNOT downgrade to an earlier version. The Airflow metadata database structurally changes with each release, making for backwards incompatibility across versions.

### 3. Re-Build your Image

#### Local Development

If you're developing locally, make sure to save your changes and issue the following from your command line:

1. `$ astro dev stop`

   This will stop all 3 running Docker containers for each of the necessary Airflow components (Webserver, Scheduler, Postgres).

2. `$ astro dev start`

   This will start those 3 Docker containers needed to run Airflow.

#### On Astronomer

If you don't need to test this locally and just want to push to your Astronomer Enterprise installation, you can issue:

```bash
$ astro deploy
```

This will bundle your updated directory, re-build your image and push it to your remote Airflow deployment on Astronomer.

### 4. Confirm your version in the Airflow UI

Once you've issued that command, navigate to your Airflow UI to confirm that you're now running the correct Airflow version.

#### Local Development

If you're developing locally, you can:

1. Head to http://localhost:8080/
2. Navigate to `About` > `Version`

Once there, you should see your correct Airflow version listed.

**Note:** The URL listed above assumes your Webserver is at Port 8080 (default). To change that default, read [this forum post](https://forum.astronomer.io/t/i-already-have-the-ports-that-the-cli-is-trying-to-use-8080-5432-occupied-can-i-change-the-ports-when-starting-a-project/48).

#### On Astronomer

If you're on Astronomer Enterprise, navigate to your Airflow Deployment page on the Astronomer UI.

### Patch Versions of Astronomer Certified

In addition to supporting the latest versions of open-source Airflow on Astronomer Certified (AC), our team regularly ships bug and security fixes to AC images as _patch_ releases.

For example, Astronomer Certified 1.10.10 has been enhanced with 4 additional patches since its initial release:

- 1.10.10-2
- 1.10.10-3
- 1.10.10-4
- 1.10.10-5

All generally available patch releases are listed in a corresponding changelog, which specifies the date the patch was released and all individual changes made to it. Bugs that are reported by the wider Airflow community are often backported by our team and made available prior to the subsequent open-source release.

> **Note:** Not all versions of the Astronomer Platform support all versions of Astronomer Certified. If you're not running the latest version of Astronomer and want to upgrade to the latest AC patch, [reach out to us](https://support.astronomer.io).

#### Upgrade to an Astronomer Certified Patch Version

To upgrade to the latest patch version of Astronomer Certified, replace the image referenced in your `Dockerfile` with a pinned version that specifies a particular patch.

If you're looking for the latest Astronomer Certified 1.10.10, for example, you would:

1. Check the AC [1.10.10 Changelog](https://github.com/astronomer/ap-airflow/blob/master/1.10.10/CHANGELOG.md)
2. Identify the latest patch (e.g. `1.10.10-5`)
3. Pin the Astronomer Certified Image in your Dockerfile to that patch version

In this case, that would be: `FROM quay.io/astronomer/ap-airflow:1.10.10-5-buster-onbuild` (Debian).

> **Note:** If you're pushing code to an Airflow Deployment via the Astronomer CLI and install a new Astronomer Certified image for the first time _without_ pinning a specific patch, the latest version available will automatically be pulled.
> 
> If a patch release becomes available _after_ you've already built an Astronomer Certified image for the first time, subsequent code pushes will _not_ automatically pull the latest corresponding patch. You must follow the process above to pin your image to a particular version.