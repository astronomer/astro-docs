---
title: "Upgrade Astronomer Core"
navTitle: "Install Dependencies"
description: "."
---

## Upgrade Airflow via Python Package

Before upgrading, make sure all of the following are true:

* Your Airflow meta database is backed up.
* All DAGs have been paused; nothing is currently running.


Then, for each machine running Airflow:

1. Run the following command:

    ```sh
    pip install --extra-index-url=https://pip.astronomer.io/simple/ 'astronomer-certified[postgres]==2.0.0.*' --upgrade
    ```

2. Run the following command to upgrade your Airflow meta database:

    ```sh
    airflow upgrade db
    ```

## Upgrade Airflow in Docker

If you're running Airflow in Docker, all you need to do is update the link to the image in your Dockerfile.

### Step 1: Locate your Dockerfile in your Project Directory

First, open the `Dockerfile` within your Airflow directory. When you initialized an Airflow project via the Astronomer CLI, the following files should have been automatically generated:

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

Depending on the OS distribution and version of Airflow you want to run, you'll want to reference the corresponding Astronomer Certified image in the FROM statement of your `Dockerfile`.

### Step 2: Choose your new Astronomer Certified Image

Below you'll find a matrix of all Astronomer Certified images Depending on the Airflow version you'd like to run or upgrade to, copy one of the images below to your `Dockerfile` and proceed to Step 3.

Once you upgrade Airflow versions, you CANNOT downgrade to an earlier version. The Airflow metadata database structurally changes with each release, making for backwards incompatibility across versions.

For our platform's full collection of Docker Images, reference [Astronomer on Quay.io](https://quay.io/repository/astronomer/ap-airflow?tab=tags). For more information on Alpine and Debian as distinct system distributions, read the "Migrate from Alpine to Debian" section below.

| Airflow Version                                                                       | Debian-based Image                                        | Alpine-based Image                                            |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------- |
| [v1.10.5](https://github.com/astronomer/ap-airflow/blob/master/1.10.5/CHANGELOG.md)   | FROM quay.io/astronomer/ap-airflow:1.10.5-buster-onbuild  | FROM quay.io/astronomer/ap-airflow:1.10.5-alpine3.10-onbuild  |
| [v1.10.7](https://github.com/astronomer/ap-airflow/blob/master/1.10.7/CHANGELOG.md)   | FROM quay.io/astronomer/ap-airflow:1.10.7-buster-onbuild  | FROM quay.io/astronomer/ap-airflow:1.10.7-alpine3.10-onbuild  |
| [v1.10.10](https://github.com/astronomer/ap-airflow/blob/master/1.10.10/CHANGELOG.md) | FROM quay.io/astronomer/ap-airflow:1.10.10-buster-onbuild | FROM quay.io/astronomer/ap-airflow:1.10.10-alpine3.10-onbuild |
| [v1.10.12](https://github.com/astronomer/ap-airflow/blob/master/1.10.12/CHANGELOG.md) | FROM quay.io/astronomer/ap-airflow:1.10.12-buster-onbuild | FROM quay.io/astronomer/ap-airflow:1.10.12-alpine3.10-onbuild  |
| [v1.10.14](https://github.com/astronomer/ap-airflow/blob/master/1.10.14/CHANGELOG.md) | FROM quay.io/astronomer/ap-airflow:1.10.14-buster-onbuild | N/A                                                           |
| [v2.0.0](https://github.com/astronomer/ap-airflow/blob/master/2.0.0/CHANGELOG.md)     | FROM quay.io/astronomer/ap-airflow:2.0.0-buster-onbuild   | N/A                                                           |

> **Note:** We recently migrated from [DockerHub](https://hub.docker.com/r/astronomerinc/ap-airflow) to Quay.io as our Docker Registry due to a [recent change](https://www.docker.com/blog/what-you-need-to-know-about-upcoming-docker-hub-rate-limiting/) in DockerHub's rate limit policy. If you're using a legacy `astronomerinc/ap-airflow` image, replace it with a corresponding `quay.io/astronomer` image to avoid rate limiting errors from DockerHub when you deploy to Astronomer (e.g. `toomanyrequests: You have reached your pull rate limit`).

## Step 3: Rebuild your Image

If you're developing locally, make sure to save your changes before proceeding. Then, run `astro dev stop` followed by `astro dev start` to restart your 3 Airflow components (Scheduler, Webserver, Database).

## Step 4: Confirm your version in the Airflow UI

1. Head to http://localhost:8080/
2. Go to `About` > `Version`

Once there, you should see your correct Airflow version listed.

> **Note:** The URL listed above assumes your Webserver is at Port 8080 (default). To change that default, read [this forum post](https://forum.astronomer.io/t/i-already-have-the-ports-that-the-cli-is-trying-to-use-8080-5432-occupied-can-i-change-the-ports-when-starting-a-project/48).
