---
title: "Astronomer Core Quickstart"
navtitle: "Quickstart"
description: "Spin up example pipelines on Astronomer Core in minutes."
---

## Overview

Designed in close partnership with both Apache Airflow committers and users, Astronomer Core (AC) an image that combines Airflow's extensibility with industry standards for security, reliability, and scale.

Use this guide to quickly get started with AC on a local machine. You'll spin up the essential components of AC on your local machine and deploy an example DAG via the Astronomer CLI.

There are two primary ways to obtain the Astronomer Core:

- [Docker Image](https://quay.io/repository/astronomer/ap-airflow?tab =tags)
- [Python Package](https://pip.astronomer.io/simple/apache-airflow/)

The recommended way to install Astronomer Core for a local environment, and the focus of this guide, is to install the latest version of the Astronomer-hosted Docker image which corresponds to the latest Apache Airflow release. For the Python Wheel setup, read to [Install via Python Wheel](/docs/ac/next/01_quickstart#install-via-python-wheel).

For Astronomer's full collection of Docker Images, reference our public [Quay.io repository](https://quay.io/repository/astronomer/ap-airflow?tab=tags).

## Prerequisites

To run Astronomer Certified locally, you'll need the following on your machine:

- [Python 3](https://www.python.org/downloads/)
- [Docker](https://www.docker.com/products/docker-desktop)
- [Astronomer CLI](https://www.astronomer.io/docs/enterprise/v0.23/get-started/quickstart)

## Install via Docker

To install and run the Astronomer Certified distribution:

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

## Install Via Python Wheel

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

Now that you have Astronomer Core Airflow running on your local machine, you might want to do one of the following:

* Set up Astronomer Core in a production environment.
* Try out key AC and Airflow features using one of our Airflow guides.
* Learn more about what's in the AC image.

If you want all of the features of AC, plus additional metrics, security, and customer support, consider exploring our Astronomer Cloud and Enterprise offerings.
