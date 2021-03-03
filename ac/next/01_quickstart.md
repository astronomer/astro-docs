---
title: "Astronomer Core Quickstart"
navtitle: "Quickstart"
description: "Spin up example pipelines on Astronomer Core in minutes."
---

## Overview

Designed in close partnership with the Airflow community, Astronomer Core (AC) is an open source distribution of Apache Airflow built for teams ready to leverage the Python-based workflow management tool in production. Built and maintained by Astronomer, AC combines Airflow’s extensibility and community-driven development with industry standards for security, reliability, and scale.

To get started with AC on your local machine, follow this guide. We'll use the Astronomer CLI to create a local Airflow project and provision all essential components to get it running.

There are two primary ways to obtain the Astronomer Core:

- [Debian-based Docker Image](https://quay.io/repository/astronomer/ap-airflow?tab =tags)
- [Python Wheel](https://pip.astronomer.io/simple/apache-airflow/)

This quickstart focuses on setting up Astronomer Core via Docker, which is the what we recommend for local installations. For the Python Wheel setup, read to [Install via Python Wheel](/docs/ac/next/01_quickstart#install-via-python-wheel).

For Astronomer's full collection of Docker Images, reference our public [Quay.io repository](https://quay.io/repository/astronomer/ap-airflow?tab=tags).

> **Note: Astronomer Core is also hosted on [Docker Hub](https://hub.docker.com/r/astronomerinc/ap-airflow), but pulling your image from there might result in rate limiting errors. Because of that, we recommend pulling from the Quay.io repository.

## Prerequisites

To run Astronomer Core locally, you'll need the following on your machine:

- [Python 3.7 or 3.8](https://www.python.org/downloads/)
- [Docker](https://www.docker.com/products/docker-desktop)
- [Astronomer CLI](https://www.astronomer.io/docs/enterprise/v0.23/get-started/quickstart)

## Install via Docker

To install and run the Astronomer Core distribution:

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

3. Start Airflow on your local machine by running the following command:

   ```sh
   $ astro dev start
   ```

   This command will spin up 3 Docker containers on your machine, each for a different Airflow component:

   * **Postgres**: Airflow's Metadata Database
   * **Webserver**: The Airflow component responsible for rendering the Airflow UI
   * **Scheduler**: The Airflow component responsible for monitoring and triggering tasks


4. Verify that the 3 Docker containers were succesfully created by running:

    ```sh
    docker ps
    ```

    > **Note**: Running `$ astro dev start` will start your project with the Airflow Webserver exposed at port 8080 and Postgres exposed at port 5432.
    >
    > If you already have either of those ports allocated, you can either [stop existing docker containers](https://forum.astronomer.io/t/docker-error-in-cli-bind-for-0-0-0-0-5432-failed-port-is-already-allocated/151) or [change the port](https://forum.astronomer.io/t/i-already-have-the-ports-that-the-cli-is-trying-to-use-8080-5432-occupied-can-i-change-the-ports-when-starting-a-project/48).

5. Access the Airflow UI for your local Airflow project. To do so, go to http://localhost:8080/ and log in with `admin` for both your Username and Password. Your screen should look something like this:

    ![Example DAG](https://assets2.astronomer.io/main/docs/getting-started/sample_dag.png)

    You should also be able to access your Postgres Database at `localhost:5432/postgres`.

That's all it takes! You're now ready to begin testing DAGs and Airflow features on your local machine.

## Install via Python Wheel

We also distribute Astronomer Core as a python wheel available on PyPi. This distribution can be run locally via the same mechanisms used to run the Apache Airflow package.

1. Run `export AIRFLOW_HOME=~/airflow` to give Astronomer Core a home root directory on your machine.

2. Run the following command to get the latest version of the distribution on your machine:

    ```sh
    PIP_EXTRA_INDEX_URL='https://pip.astronomer.io/simple' pip3 install -U 'astronomer-certified==1.10.10.*'
    ```

    Note that if you'd like to install a specific version, you can do so by appending the version tag via the following syntax:

    ```sh
    PIP_EXTRA_INDEX_URL='https://pip.astronomer.io/simple' pip3 install -U 'astronomer-certified==1.10.10-1'
    ```

3. Run `$ airflow initdb` to build out your project directory and initialize a lightweight SQLite database for Airflow.

4. Run `$ airflow webserver -p 8080` to spin up the Webserver on your `localhost:8080`.

5. Run `$ airflow scheduler` to spin up the Scheduler.

## Next Steps

Now that you have Astronomer Core running on your local machine, you might want to do one of the following:

* Learn about Airflow from the open source documentation.
* Discover best practices through Airflow Guides.
* Set up Astronomer Core in a production environment.
* Try out key AC and Airflow features using one of our Airflow guides.
* Learn more about what's in the AC image.

If you want all of the features of AC, plus additional metrics, security, and customer support, consider exploring our Astronomer Cloud and Enterprise offerings.
