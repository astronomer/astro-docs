---
title: "Astronomer Core Quickstart"
navtitle: "Quickstart"
description: "Get ready to run Apache Airflow on your local machine with Astronomer Core."
---

## Overview

Designed in close partnership with the Airflow community, Astronomer Core (AC) is an open source distribution of Apache Airflow built for teams ready to leverage the Python-based workflow management tool both locally and in production. Built and maintained by Astronomer, AC combines Airflow’s extensibility and community-driven development with industry standards for security, reliability, and scale.

In this guide, we'll use the Astronomer CLI to walk you through how to create a local Airflow project and provision the components you need to get Apache Airflow up and running.

For every major and minor version of Apache Airflow, our team produces two Astronomer Core artifacts:

- [A Debian-based Docker image](https://quay.io/repository/astronomer/ap-airflow?tab=tags)
- [A Python Wheel](https://pip.astronomer.io/simple/apache-airflow/)

This quickstart focuses on the Astronomer Core Docker image, which is the recommended way to deploy the offering. For instructions on how to install the Python Wheel, read [Install via Python Wheel](/docs/ac/next/01_quickstart#install-via-python-wheel).

For Astronomer's full collection of Docker images, reference either of our public Docker registries:

- [Quay.io](https://quay.io/repository/astronomer/docker-airflow?tab=tags).
- [Docker Hub](https://hub.docker.com/r/astronomerio/docker-airflow)

> **Note:** While you're free to pull the Astronomer Core Docker image from Docker Hub, you may encounter a [Docker pull rate limit error](https://forum.astronomer.io/t/docker-hub-rate-limit-error-toomanyrequests-you-have-reached-your-pull-rate-limit/887). To avoid limitations, we recommend referencing and pulling from Quay.io.

## Prerequisites

To run Astronomer Core locally, you'll need the following on your machine:

- [Python 3.7](https://www.python.org/downloads/)
- [Docker](https://www.docker.com/products/docker-desktop)

## Install the Astronomer CLI

Astronomer's [open source CLI](https://github.com/astronomer/astro-cli) is the easiest way to run Airflow on your local machine. You'll need the Astronomer CLI to create a local Airflow instance with a dedicated Webserver, Scheduler, and Postgres database.

To install the latest version of the Astronomer CLI via cURL, run:

```
curl -sSL https://install.astronomer.io | sudo bash
```

To install the latest version of the Astronomer CLI via Homebrew, run:

```
$ brew install astronomer/tap/astro
```

To confirm that you have the Astronomer CLI installed on your machine, run:

```bash
$ astro version
```

If the installation was successful, the version of the CLI that you installed will appear in the output:

```
Astro CLI Version: 0.23.3
Git Commit: c4fdeda96501ac9b1f3526c97a1c5c9b3f890d71
```

>**Note:** As of macOS Catalina, Apple [replaced bash with ZSH](https://www.theverge.com/2019/6/4/18651872/apple-macos-catalina-zsh-bash-shell-replacement-features) as the default shell. Our CLI install cURL command currently presents an incompatibility error with ZSH, sudo and the pipe syntax.
>
> If you're running macOS Catalina and beyond, do the following:
>
> 1. Run `sudo -K` to reset/un-authenticate
> 2. Run the following to install the CLI properly:
>
>    ```
>    $ curl -sSL https://install.astronomer.io | sudo bash -s < /dev/null
>    ```

## Install Astronomer Core via Docker

To install and run the Astronomer Core distribution, follow these steps:

1. Create and move into a new directory for your Airflow project:

    ```sh
    $ mkdir astronomer-core && cd astronomer-core
    ```

2. Use the Astronomer CLI to initialize some of the necessary files you'll need to run a local AC image:

    ```sh
    $ astro dev init
    ```

    This command generates the following files in your project directory:

    ```sh
    .
    ├── dags # Where your DAGs go
    │   ├── example-dag.py # An example dag that comes with the initialized project
    ├── Dockerfile # For Astronomer's Docker image and runtime overrides
    ├── include # For any other files you'd like to include
    ├── plugins # For any custom or community Airflow plugins
    ├──airflow_settings.yaml #For your Airflow Connections, Variables and Pools (local only)
    ├──packages.txt # For OS-level packages
    └── requirements.txt # For any Python packages
    ```         

3. Start Airflow locally by running the following command:

   ```sh
   astro dev start
   ```

   This command will spin up 3 Docker containers on your machine, each for a different Airflow component:

   * **Postgres**: Airflow's Metadata Database
   * **Webserver**: The Airflow component responsible for rendering the Airflow UI
   * **Scheduler**: The Airflow component responsible for monitoring and triggering tasks


4. Verify that the 3 Docker containers were successfully created by running:

    ```sh
    docker ps
    ```

    > **Note**: Running `$ astro dev start` will start your project with the Airflow Webserver exposed at port 8080 and Postgres exposed at port 5432.
    >
    > If you already have either of those ports allocated, you can either [stop existing docker containers](https://forum.astronomer.io/t/docker-error-in-cli-bind-for-0-0-0-0-5432-failed-port-is-already-allocated/151) or [change the port](https://forum.astronomer.io/t/i-already-have-the-ports-that-the-cli-is-trying-to-use-8080-5432-occupied-can-i-change-the-ports-when-starting-a-project/48).

5. Access the Airflow UI for your local Airflow project. To do so, go to http://localhost:8080/ and log in with `admin` for both your username and password. Your screen should look something like this:

    ![Example DAG](https://assets2.astronomer.io/main/docs/getting-started/sample_dag.png)

    You should also be able to access your Postgres Database at `localhost:5432/postgres`.

That's all it takes! You're now ready to begin testing DAGs and Airflow features on your local machine.

## Install via Python Wheel

In addition to the Docker-based distribution, Astronomer Core is built as a Python Wheel available on PyPi. This distribution can be run locally via the same mechanisms used to run the Apache Airflow package.

1. Run `export AIRFLOW_HOME=~/airflow` to give Astronomer Core a home root directory on your machine.

2. Install Astronomer Certified using pip3. For example, to install Astronomer Certified for Airflow 2.0.0, you would run:

    ```sh
    PIP_EXTRA_INDEX_URL='https://pip.astronomer.io/simple' pip3 install -U 'astronomer-certified==2.0.0.*'
    ```

    To install a specific version of Astronomer Core, append the version tag via the following syntax::

    ```sh
    PIP_EXTRA_INDEX_URL='https://pip.astronomer.io/simple' pip3 install -U 'astronomer-certified==1.10.10-1'
    ```

3. Run `airflow initdb` to build out your project directory and initialize a lightweight SQLite database for Airflow.

4. Run `airflow webserver -p 8080` to provision the Webserver on your `localhost:8080`.

5. Run `airflow scheduler` to provision the Scheduler.

## Next Steps

Now that you have Astronomer Core running on your local machine, you might want to do one of the following:

* Learn how to apply changes to an [Airflow project](https://www.astronomer.io/docs/cloud/stable/develop/cli-quickstart#apply-changes-to-your-airflow-project)
* Learn about Airflow from the [Apache documentation](https://airflow.apache.org/docs/apache-airflow/stable/index.html)
* Discover best practices through [Airflow Guides](https://www.astronomer.io/guides/)
* Set up Astronomer Core at production scale
* Try out key AC and Airflow features using one of our Airflow guides
* Learn more about what's in the AC image

If you want all of the features of AC, plus additional metrics, security, and customer support, consider exploring our Astronomer Cloud and Enterprise offerings.
