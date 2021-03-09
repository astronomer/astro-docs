---
title: "Install Dependencies in a Production Environment"
navTitle: "Install Dependencies"
description: "."
---

## Overview

By default, the Astronomer Core (AC) image includes several additional third party packages in order to better integrate between applications. For a full list of built in packages, read our image breakdown.

If you want to install additional packages,

## Add Python-level Packages at Production Scale

To build existing Python and OS-level packages into a production environment running AC, run the following command on all machines running at least one Airflow component:

```sh
sudo -u astro ~astro/airflow-venv/bin/pip install --extra-index-url=https://pip.astronomer.io/simple/ 'astronomer-certified[<your-dependency>]==1.10.10.*'
```

You can also create your own Python packages and add them to your environment by using a Python wheel or by specifying an environment variable pointing to your the directory for your package. For more information, read the [Airflow documentation on managing modules](http://apache-airflow-docs.s3-website.eu-central-1.amazonaws.com/docs/apache-airflow/latest/modules_management.html).

## Add Python-level Packages in Docker

If you installed AC locally using the [Quickstart] and the Astro CLI, you can add Python packages to your `requirements.txt` file and OS-level packages to your `packages.txt` file.

To pin a version of a package, use the following syntax:

```
<package-name>==<version>
```

If you'd like to exclusively use Pymongo 3.7.2, for example, you'd add the following in your `requirements.txt` file:

```
pymongo==3.7.2
```

If you don't pin a package to a version, the latest version of the package that's publicly available will be installed by default.

Once you've saved those packages in your text editor or version control tool, rebuild your image by running:

```sh
$ astro dev stop
```

followed by

```sh
$ astro dev start
```

This process stops your running Docker containers and restarts them with your updated image.

## Confirm a Package Installation

If you run Astronomer Core on Docker, you can confirm that a package was installed by running a `$ docker exec` command into your Scheduler. To do so:

1. Run `$ docker ps` and retrieve the container ID of your Scheduler container.
2. Run the following command:

    ```
    $ docker exec -it <scheduler-container-id> pip freeze | grep <package-name>
    ```

    If the package was successfully installed, you should see the following output:

    ```
    <package-name>==<version>
    ```
