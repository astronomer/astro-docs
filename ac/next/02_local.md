---
title: "Running Astronomer Core Locally"
navTitle: "Running Locally"
description: "Everything you need to know to get up and running on Astronomer's distribution of Apache Airflow on your local machine."
---

## Overview

Delivered by Astronomer's Airflow PMC members and committers, Astronomer Core (AC) is
for teams ready to leverage the Python-based workflow management tool in production.
Astronomer Core combines Airflow’s extensibility and community-driven development with
industry standards for security, reliability, and scale.

There are two primary ways to obtain the Astronomer Core distribution:

1. [Docker Image](https://quay.io/repository/astronomer/core?tab=tags)
2. [Python Package](https://pip.astronomer.io/simple/astronomer-core)

Astronomer Coree currently supports various Airflow version from 1.10.5 and on. This doc
covers everything you need to know to run Astronomer Core via either method, including:

- Pre-Requisites
- Local Dev

## Running AC Locally

### Pre-Requisites

To run Astronomer Core locally, you'll need the following on your machine:

- [Python 3](https://www.python.org/downloads/)
- [Docker](https://www.docker.com/products/docker-desktop)

Once you have the pre-reqs installed, follow the below instructions to get the AC 
distribution running locally.

### Via Docker

The preferred way to install Astronomer Core is to download our latest Astronomer-hosted
Docker image, each of which will correspond with an open source Airflow release.

For Astronomer's full collection of Docker Images, reference our public
[Quay.io repository](https://quay.io/repository/astronomer/core?tab=tags).

#### Install and Run

To install and run the Astronomer Core distribution, ensure that Docker is running on 
your machine and follow the steps below.

1. Create and cd into a new project directory for your Airflow project.

        mkdir astronomer-core && cd astronomer-core

2. Run the following command to initialize all of the necessary files you'll need to run
the Airflow image locally:

        touch .env packages.txt requirements.txt docker-compose.yml Dockerfile

3. Add the the following to the `Dockerfile` to grab the latest Astronomer Core image on
build:

    > Note: The below Dockerfile is an example and may use an outdated image. For an
      updated list of available images, see our [downloads page](/downloads).

        FROM quay.io/astronomer/core:2.0.0-buster-onbuild

    Note that you can select which version you'd like to use via the tag appended to the
    image.

4. Add the following to the `docker-compose.yml` file:

        version: "3"
        volumes:
          postgres_data:
            driver: local
          airflow_logs:
            driver: local
        services:
          postgres:
            container_name: postgres
            image: postgres:10.1-alpine
            restart: unless-stopped
            volumes:
              - postgres_data:/var/lib/postgresql/data
          scheduler:
            container_name: scheduler
            image: "local-airflow-dev"
            build: .
            command: >
              bash -c "airflow upgradedb && airflow scheduler"
            restart: unless-stopped
            depends_on:
              - postgres
            environment:
              AIRFLOW__CORE__EXECUTOR: LocalExecutor
              AIRFLOW__CORE__SQL_ALCHEMY_CONN: postgresql://postgres:@postgres:5432
              AIRFLOW__CORE__LOAD_EXAMPLES: "False"
              # Do not reuse this key in production or anywhere outside your local laptop!
              AIRFLOW__CORE__FERNET_KEY: "d6Vefz3G9U_ynXB3cr7y_Ak35tAHkEGAVxuz_B-jzWw="
            volumes:
              - ./dags:/usr/local/airflow/dags:ro
              - ./plugins:/usr/local/airflow/plugins
              - ./include:/usr/local/airflow/include
              - airflow_logs:/usr/local/airflow/logs
            env_file: .env
          webserver:
            container_name: webserver

            image: "local-airflow-dev"
            command: >
              bash -c "airflow create_user -r Admin -u admin -e admin@example.com -f admin -l user -p admin && airflow webserver"
            restart: unless-stopped
            depends_on:
              - scheduler
              - postgres
            environment:
              AIRFLOW__CORE__EXECUTOR: LocalExecutor
              AIRFLOW__CORE__SQL_ALCHEMY_CONN: postgresql://postgres:@postgres:5432
              AIRFLOW__CORE__LOAD_EXAMPLES: "False"
              AIRFLOW__CORE__FERNET_KEY: "d6Vefz3G9U_ynXB3cr7y_Ak35tAHkEGAVxuz_B-jzWw="
              AIRFLOW__WEBSERVER__RBAC: "True"
            ports:
              - 8080:8080
            volumes:
              - ./dags:/usr/local/airflow/dags:ro
              - ./plugins:/usr/local/airflow/plugins
              - ./include:/usr/local/airflow/include
              - airflow_logs:/usr/local/airflow/logs
            env_file: .env

5. Run `docker-compose up` to spin up the local Airflow Scheduler, Webserver, and
Postgres containers. The default user that gets created for Airflow will have
`admin/admin` as a username and password.

By default, the above will run Airflow on your machine using the Local Executor.  
Containers for your Airflow Metadata Database, Airflow Webserver and Airflow Scheduler
are spun up programmatically (this is the equivalent of running the `airflow initdb`,
`airflow webserver` and `airflow scheduler` commands detailed in the next section).

### Via Python Wheel

We also distribute Astronomer Core as a python wheel available on PyPi. This
distribution can be run locally via the same mechanisms used to run the open source
Airflow package.

1. Run `export AIRFLOW_HOME=~/airflow` to give Astronomer Core Airflow a home root
directory on your machine.

2. Run the following command to get the latest version of the distribution on your
machine:

        PIP_EXTRA_INDEX_URL='https://pip.astronomer.io/simple' pip install -U 'astronomer-core==2.0.0.*'

    Note that if you'd like to install a specific version, you can do so by appending the version tag via the following syntax:

        PIP_EXTRA_INDEX_URL='https://pip.astronomer.io/simple' pip install -U 'astronomer-core==2.0.0-1'

3. Run `airflow initdb` to build out your project directory and initialize a lightweight
SQLite database for Airflow.

4. Run `airflow webserver -p 8080` to spin up the webserver on your `localhost:8080`.

5. Run `airflow scheduler` to spin up the scheduler.
