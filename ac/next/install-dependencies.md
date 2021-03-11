---
title: "Install Dependencies in a Production Environment"
navTitle: "Install Dependencies"
description: "Learn how to instal OS-Level and Python-Level packages on Airflow."
---

## Overview

By default, the Astronomer Core (AC) Docker image includes several additional third party packages in order to better integrate between applications. For a full list of built in packages, read about the [Astronomer Core image architecture].

If your DAGs need additional packages to run, you can add those packages either to your machine or to your Docker image.

## Install Python-level and OS-level Packages on a Machine

To build Python and OS-level packages into a machine running Airflow, run the following command:

```sh
sudo -u astro ~astro/airflow-venv/bin/pip install --extra-index-url=https://pip.astronomer.io/simple/ 'astronomer-certified[<your-dependency>]==1.10.10.*'
```

You can also create your own Python packages and install them on your environment using a Python wheel, or you can configure an environment variable to automatically add a Python directory to your Airflow project folder. For more information on this setup, read the [Apache Airflow documentation on managing modules](http://apache-airflow-docs.s3-website.eu-central-1.amazonaws.com/docs/apache-airflow/latest/modules_management.html).

## Install Python-level and OS-level Packages in Docker

If you installed AC locally using the [Quickstart] and the Astro CLI, you can add Python packages to your `requirements.txt` file and OS-level packages to your `packages.txt` file.

To add the package, simply list the package name on its own line in one of the two files.

You can also pin a specific package version to use. For example, if wanted to exclusively use Pymongo 3.7.2, you'd add the following line to your `requirements.txt` file:

```
pymongo==3.7.2
```

If you don't pin a package to a version, the latest version of the package that's publicly available will be installed by default.

Once you've saved those packages to the appropriate `.txt` files, rebuild your image by running `astro dev stop`, followed by `astro dev start`. This process stops your running Docker containers and restarts them with your updated image.

### Confirm a Package Installation

If you run Astronomer Core in Docker, you can confirm that a package was installed by running a `$ docker exec` command into your Scheduler. To do so:

1. Run `$ docker ps` and retrieve the container ID of your Scheduler container.
2. Run the following command:

    ```
    docker exec -it <scheduler-container-id> pip freeze | grep <package-name>
    ```

    If the package was successfully installed, you should see the following output:

    ```
    <package-name>==<version>
    ```
