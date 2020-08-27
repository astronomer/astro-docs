---
title: "Managing Airflow Versions on Astronomer"
navTitle: "Airflow Versioning"
description: "How to adjust and upgrade Airflow versions on Astronomer."
---

## Overview

On Astronomer, the process of pushing up your code to an individual Airflow deployment involves customizing a locally built Docker image —— with your DAG code, Python Packages, plugins, and so on —— that's then bundled, tagged, and pushed to a Docker Registry (Astronomer's if you're using Astronomer Cloud, yours if you're running Astronomer Enterprise).

Included in that build is your `Dockerfile`, a file that is automatically generated when you initialize an Airflow project on Astronomer via our CLI. Every successful build on Astronomer must include a `Dockerfile` that references an Astronomer-built Docker Image built to be individually compatible with a particular Airflow version.

To upgrade or otherwise change the Airflow version you want to run, all it takes is a swap to the FROM statement held within your Dockerfile. Read below for details.

> **Note:** For more thorough guidelines on customizing your image, reference our ["Customize Your Image" doc](/docs/enterprise/v0.14/develop/customize-image/).

## Upgrade Airflow Version

### Overview

Astronomer is compatible with the following Airflow versions:

- [Airflow 1.10.5](https://github.com/apache/airflow/releases/tag/1.10.5)
- [Airflow 1.10.7](https://github.com/apache/airflow/releases/tag/1.10.7)
- [Airflow 1.10.10](https://airflow.apache.org/blog/airflow-1.10.10/)

To change or upgrade Airflow versions on Astronomer, read the guidelines below.

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

Depending on the version of Airflow and OS distribution you want to run, you'll want to reference the corresponding Astronomer Docker image in the FROM statement that was populated by default in your Dockerfile.

#### Alpine and Debian-based Images

Astronomer supports both Alpine Linux and Debian-based images. Alpine is a widely-used lightweight distribution of Linux that keeps our default images slim and performant. For users leveraging Machine Learning Python Libraries or more complex dependencies, Debian is often more appropriate.

> **Note:** For our platform's full collection of Docker Images, reference [Astronomer on Docker Hub](https://hub.docker.com/r/astronomerinc/ap-airflow/tags).

| Airflow Version | Alpine-based Image                          | Debian-based Image
|-----------------|-----------------------------------------------------|-----------------------------------------------------|
| [v1.10.5](https://github.com/apache/airflow/releases/tag/1.10.5)         | FROM astronomerinc/ap-airflow:1.10.5-alpine3.10-onbuild | FROM astronomerinc/ap-airflow:1.10.5-buster-onbuild |
| [v1.10.7](https://github.com/apache/airflow/releases/tag/1.10.7)         | FROM astronomerinc/ap-airflow:1.10.7-alpine3.10-onbuild | FROM astronomerinc/ap-airflow:1.10.7-buster-onbuild |
| [v1.10.10](https://github.com/astronomer/ap-airflow/blob/master/1.10.10/CHANGELOG.md)         | FROM astronomerinc/ap-airflow:1.10.10-alpine3.10-onbuild | FROM astronomerinc/ap-airflow:1.10.10-buster-onbuild |

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
astro deploy
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
