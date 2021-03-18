---
title: "Upgrade Airflow via Astronomer Core"
navTitle: "Upgrade Airflow"
description: "Upgrade your Apache Airflow environment by installing the latest image from Astronomer Core."
---

## Overview

A new version of the Astronomer Core image is released for every new version of Apache Airflow. We recommend regularly upgrading your Astronomer Core image to take advantage of new features and fixes.

Use this guide to upgrade your Airflow environment either on a virtual machine or on Docker. For more information on Astronomer Core's release cycle, read our [Release Reference].

>**Note:** Upgrading to Airflow 2.0 requires additional steps and precautions. If you're upgrading from a pre-2.0 image to a 2.0+ image, we recommend following the preparation steps in the Apache Airflow [Upgrading to Airflow 2.0 guide](https://airflow.apache.org/docs/apache-airflow/stable/upgrading-to-2.html).

## Upgrade Astronomer Core via Python Package

Before upgrading, make sure both of the following are true:

* Your Airflow metadata DB is backed up.
* All DAGs have been paused; nothing is currently running.

Then, for each machine running Airflow:

1. Run the following command:

    ```sh
    pip install --extra-index-url=https://pip.astronomer.io/simple/ 'astronomer-certified[postgres]==2.0.0.*' --upgrade
    ```

2. Upgrade your metadata DB using the following command:

    ```sh
    airflow upgrade db
    ```

3. In a web browser, access the Ariflow UI at http://host:port and click **About** > **Version**. Once there, you should see the correct Airflow version listed.

    > **Note:** The URL listed above assumes your Webserver is at Port 8080 (default). To change that default, read [this forum post](https://forum.astronomer.io/t/i-already-have-the-ports-that-the-cli-is-trying-to-use-8080-5432-occupied-can-i-change-the-ports-when-starting-a-project/48).

## Upgrade Astronomer Core in Docker

If you're upgrading an Airflow environment running in Docker, all you need to do is update the link to the image in your Dockerfile.

1. Open the `Dockerfile` within your Airflow directory that was created when you initialized an Airflow project via the Astronomer CLI.

    Depending on the OS distribution and version of Airflow you want to run, you'll want to reference the corresponding Astronomer Certified image in the FROM statement of your `Dockerfile`.

2. Choose a new image for Astronomer Certified based on the Airflow version you want to upgrade to. The table below includes the most recent AC images, as well as the URL to include in your `Dockerfile` for upgrading. Make note of the URL you need for the next step.

    Once you upgrade Airflow versions, you _cannot_ downgrade to an earlier version. The Airflow metadata database structurally changes with each release, which results in backwards incompatibility across versions.

    For our platform's full collection of Docker Images, reference [Astronomer on Quay.io](https://quay.io/repository/astronomer/docker-airflow?tab=tags).

    | Airflow Version                                                                       | Debian-based Image                                        | Alpine-based Image                                            |
    | ------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------- |
    | [v1.10.5](https://github.com/astronomer/docker-airflow/blob/master/1.10.5/CHANGELOG.md)   | quay.io/astronomer/docker-airflow:1.10.5-buster-onbuild  | quay.io/astronomer/docker-airflow:1.10.5-alpine3.10-onbuild  |
    | [v1.10.7](https://github.com/astronomer/docker-airflow/blob/master/1.10.7/CHANGELOG.md)   | quay.io/astronomer/docker-airflow:1.10.7-buster-onbuild  | quay.io/astronomer/docker-airflow:1.10.7-alpine3.10-onbuild  |
    | [v1.10.10](https://github.com/astronomer/docker-airflow/blob/master/1.10.10/CHANGELOG.md) | quay.io/astronomer/docker-airflow:1.10.10-buster-onbuild | quay.io/astronomer/docker-airflow:1.10.10-alpine3.10-onbuild |
    | [v1.10.12](https://github.com/astronomer/docker-airflow/blob/master/1.10.12/CHANGELOG.md) | quay.io/astronomer/docker-airflow:1.10.12-buster-onbuild | quay.io/astronomer/docker-airflow:1.10.12-alpine3.10-onbuild  |
    | [v1.10.14](https://github.com/astronomer/docker-airflow/blob/master/1.10.14/CHANGELOG.md) | quay.io/astronomer/docker-airflow:1.10.14-buster-onbuild | N/A                                                           |
    | [v2.0.0](https://github.com/astronomer/docker-airflow/blob/master/2.0.0/CHANGELOG.md)     | quay.io/astronomer/docker-airflow:2.0.0-buster-onbuild   | N/A                                                           |
    | [v2.0.1](https://github.com/astronomer/docker-airflow/blob/master/2.0.1/CHANGELOG.md)     | quay.io/astronomer/docker-airflow:2.0.1-buster-onbuild   | N/A                                                           |

    > **Note:** We recently migrated from [DockerHub](https://hub.docker.com/r/astronomerinc/docker-airflow) to Quay.io as our Docker Registry due to a [recent change](https://www.docker.com/blog/what-you-need-to-know-about-upcoming-docker-hub-rate-limiting/) in DockerHub's rate limit policy. If you're using a legacy `astronomerinc/docker-airflow` image, replace it with a corresponding `quay.io/astronomer` image to avoid rate limiting errors from DockerHub when you deploy to Astronomer (e.g. `toomanyrequests: You have reached your pull rate limit`).

3. In your `Dockerfile`, replace the URL in the `FROM` line with the URL for the version you're upgrading to. If you were upgrading to Airflow 2.0, for example, your Dockerfile would include the following line:

    ```
    FROM quay.io/astronomer/docker-airflow:2.0.0-buster-onbuild
    ```

    If you're developing locally, make sure to save your changes before proceeding.

4. Run `astro dev stop` followed by `astro dev start` to restart your 3 Airflow components (Scheduler, Webserver, and Database).

5. In a web browser, go to http://localhost:8080/ and click **About** > **Version**. Once there, you should see the correct Airflow version listed.

    > **Note:** The URL listed above assumes your Webserver is at Port 8080 (default). To change that default, read [this forum post](https://forum.astronomer.io/t/i-already-have-the-ports-that-the-cli-is-trying-to-use-8080-5432-occupied-can-i-change-the-ports-when-starting-a-project/48).
