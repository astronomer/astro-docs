---
title: "Upgrade Your Astronomer Certified Image"
navTitle: "Upgrade Airflow"
description: "Upgrade your Apache Airflow environment by installing the latest image from Astronomer Core."
---

## Overview

A new version of the Astronomer Core image is released for every new version of Apache Airflow. We recommend regularly upgrading your Astronomer Core image to take advantage of new features and fixes.

Use this guide to upgrade your Airflow environment either on a virtual machine or on Docker. For more information on Astronomer Core's release cycle, read our [Release Reference].

>**Note:** Upgrading to Airflow 2.0 requires additional steps and precautions. If you're upgrading from a pre-2.0 image to a 2.0+ image, we recommend following the preparation steps in the Apache Airflow [Upgrading to Airflow 2.0 guide](https://airflow.apache.org/docs/apache-airflow/stable/upgrading-to-2.html).

## Upgrade the Astronomer Core Python Package

Before upgrading, make sure both of the following are true:

* Your Airflow metadata DB is backed up.
* All DAGs have been paused; nothing is currently running.

Then, for each machine running Airflow:

1. Upgrade Astronomer Certified using the following command, making sure to replace the dependencies and version number as needed:

    ```sh
    pip install --extra-index-url=https://pip.astronomer.io/simple/ 'astronomer-    certified[<dependencies>]==<version-number>' --upgrade
    ```

For example, if you wanted to upgrade to the latest patch version of Airflow 2.1 while using a Postgres database, your command would look something like this:

    ```sh
    pip install --extra-index-url=https://pip.astronomer.io/simple/ 'astronomer-certified[postgres]==2.1.0.*' --upgrade
    ```

2. Upgrade your metadata DB using the following command:

    ```sh
    airflow upgrade db
    ```

3. In a web browser, access the Airflow UI at http://host:port and click **About** > **Version**. Once there, you should see the correct Airflow version listed.

    > **Note:** The URL listed above assumes your Webserver is at Port 8080 (default). To change that default, read [this forum post](https://forum.astronomer.io/t/i-already-have-the-ports-that-the-cli-is-trying-to-use-8080-5432-occupied-can-i-change-the-ports-when-starting-a-project/48).

## Upgrade Astronomer Core in Docker

If you're upgrading an Astronomer Core environment running in Docker, all you need to do is update the link to the image in your Dockerfile.

1. Choose a new image for Astronomer Certified based on the Airflow version you want to upgrade to. Make note of the image's URL. For a list of supported Astronomer Certified images, see [Downloads](https://www.astronomer.io/downloads/) or our [Quay.io repository](https://quay.io/repository/astronomer/ap-airflow?tab=tags).

    > **Note:** Once you upgrade Airflow versions, you cannot downgrade to an earlier version. The Airflow metadata database structurally changes with each release, which results in backwards incompatibility across versions.

2. Open the `Dockerfile` in your Airflow project directory.

3. In your `Dockerfile`, replace the URL in the `FROM` line with the URL for the Astronomer Certified version you're upgrading to. If you were upgrading to Airflow 2.1, for example, your Dockerfile would include the following line:

    ```
    FROM quay.io/astronomer/ap-airflow:2.1.0-buster-onbuild
    ```

    If you're developing locally, make sure to save your changes before proceeding.

4. Run `astro dev stop` followed by `astro dev start` to restart your 3 Airflow components (Scheduler, Webserver, and Database).

5. In a web browser, go to http://localhost:8080/ and click **About** > **Version** to confirm that the upgrade was successful.
