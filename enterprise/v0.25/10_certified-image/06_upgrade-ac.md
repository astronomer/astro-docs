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

If you're upgrading an Airflow environment running in Docker, such as one running on the Astronomer platform, all you need to do is update the link to the image in your Dockerfile.

For more information, read [Upgrade Airflow](/docs/enterprise/v0.25/customize-airflow/manage-airflow-versions).
