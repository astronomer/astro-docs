---
title: "Install Dependencies in a Production Environment"
navTitle: "Install Dependencies"
description: "Learn how to install OS-level and Python-level packages on Airflow."
---

## Overview

By default, the Astronomer Core distribution of Airflow is built with a collection of pre-installed provider packages to help users integrate with popular applications. For the full list of built-in packages, read [Astronomer Core Image Architecture].

If you require additional dependencies to run your DAGs, you can either install those packages onto your local machines or build them into a Docker image.

## Install Packages on a Virtual Machine

To build Python and OS-level packages into a machine running Airflow, run the following command:

```sh
sudo -u astro ~astro/airflow-venv/bin/pip install --extra-index-url=https://pip.astronomer.io/simple/ 'astronomer-core[<your-dependency>]==<airflow-version>.*'
```

You can also create your own Python packages and install them into your Airflow environment via a Python wheel, or you can configure an environment variable to automatically add the packages to your Airflow project directory. For more information on this setup, read the [Apache Airflow documentation on managing modules](http://apache-airflow-docs.s3-website.eu-central-1.amazonaws.com/docs/apache-airflow/latest/modules_management.html).

## Install Packages Using the Astronomer CLI

If you're running Astronomer Core locally via the Astronomer CLI [Quickstart], you can add Python-level packages to your `requirements.txt` file and OS-level packages to your `packages.txt` file.

To add the package, list the package name on its own line in the corresponding file. To install a particular version of any packages, pin that version to the package name in the format of `<package-name>==<package-version>`. To install Pymongo 3.7.2, for example, add the following to your `requirements.txt` file:

```
pymongo==3.7.2
```

If you don't pin a package to a version, the latest version of the package that's publicly available will be installed by default.

Once you've saved those packages to the appropriate `.txt` files, rebuild your image by running `astro dev stop`, followed by `astro dev start`. This process stops your running Docker containers and restarts them with your updated image.

To confirm that a package was successfully installed:

1. Run `$ docker ps` and retrieve the container ID of your Scheduler container.
2. Run the following command:

    ```
    docker exec -it <scheduler-container-id> pip freeze | grep <package-name>
    ```

    If the package was successfully installed, you should see the following output:

    ```
    <package-name>==<version>
    ```

## Install Packages on a Custom Docker Image

If you [installed AC on Docker], you can install the packages directly onto your image via your Dockerfile. To install OS-level packages, you can specify them using a `RUN` directive with `apt-get`. For example, the following Dockerfile would install `your-dependency` on the image:

```
FROM: quay.io/astronomer/docker-airflow:latest-onbuild
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
         your-dependency \
  && apt-get autoremove -yqq --purge \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*
```

To install a Python-level package, specify the package using a `RUN` directive with `pip install` instead. For example:

```
FROM: quay.io/astronomer/docker-airflow:latest-onbuild
RUN pip install --no-cache-dir --user your-dependency
```

Once you rebuild your image with `docker-build`, the image will have access to any packages that you specified. To confirm that a package was installed:

1. Run `$ docker ps` and retrieve the container ID of your Scheduler container.
2. Run the following command:

    ```
    docker exec -it <scheduler-container-id> pip freeze | grep <package-name>
    ```

    If the package was successfully installed, you should see the following output:

    ```
    <package-name>==<version>
    ```