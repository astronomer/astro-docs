---
title: "Install Apache Airflow with Docker Compose"
navtitle: "Install Airflow with Docker Compose"
description: "A complete setup for creating a multi-container Apache Airflow application with Docker Compose and Astronomer Core."
---

## Overview

Running Apache Airflow in a containerized environment is a simple and effective way to manage and grow your project. The core Airflow components — the Webserver, Scheduler, Metadata database, and Celery Workers — are each run in separate containers, which means that you can easily scale resource usage based on the computing requirements of your project. With [Docker Compose](https://docs.docker.com/compose/), you can manage all Airflow Docker containers with a single YAML configuration file.

This guide explains how to run Airflow on Docker with an Astronomer Core Docker image. You'll create a local project directory, pull an Astronomer Core image, set up Docker Compose, and spin up your environment.

## Prerequisites

To install Apache Airflow on Docker, you need:

- [curl](https://curl.se/download.html)
- [Docker](https://docs.docker.com/get-docker/)

> **Note:** Docker Compose is pre-installed on Docker for Mac and Windows, but not for Linux. If you're running on Linux, make sure to [install Docker Compose](https://docs.docker.com/compose/install/) separately.

## Installation

To install and run the Astronomer Core distribution of Apache Airflow:

1. Create new directory for your Airflow project and `cd` into it:

    ```sh
    mkdir astronomer-core && cd astronomer-core
    ```

2. Run the following command to initialize some of the key files you'll need to run Astronomer Core:

    ```sh
    touch .env packages.txt requirements.txt Dockerfile dags
    ```

    Docker containerizes these files whenever your image is built:

    - `.env` stores Airflow environment variables.
    - `packages.txt` stores Python-level dependencies.
    - `requirements.txt` stores OS-level dependencies.
    - `Dockerfile` pulls an Astronomer Core image from Astronomer's Docker registry. It can also include runtime commands and logic.
    - `dags` stores your Airflow DAGs.


3. Add the following to your `Dockerfile` to pull the latest Astronomer Core Docker image:

    ```
    # For a Debian-based image
    FROM quay.io/astronomer/docker-airflow:latest-onbuild
    ```

    When you create the Docker containers to run Airflow, this file pulls the latest Astronomer Core `onbuild` image ([source code](https://github.com/astronomer/ap-airflow/)) and creates a Docker image based on the logic within it. To specify a particular version of Apache Airflow and Astronomer Core, replace `latest` with the tag for your desired version. For a list of all image tags available, refer to [Astronomer on Quay.io](https://quay.io/repository/astronomer/ap-airflow?tab=tags).

4. In your project folder, run one of the following commands to download a default `docker-compose.yaml` file based on the database and Airflow Executor you want to use:

    | Configuration | Command |
    |---------------|---------|
    | MySQL/ Celery Executor |`curl -LfO https://raw.githubusercontent.com/astronomer/docker-airflow/main/docker-compose-mysql-celery.yaml`|
    | MySQL/ Local Executor |`curl -LfO https://raw.githubusercontent.com/astronomer/docker-airflow/main/docker-compose-mysql-local.yaml`|
    | Postgres/ Local Executor |`curl -lfO https://raw.githubusercontent.com/astronomer/docker-airflow/main/docker-compose-postgres-celery.yaml`|
    | Postgres/ Celery Executor |`curl -LfO https://raw.githubusercontent.com/astronomer/docker-airflow/main/docker-compose-postgres-local.yaml` |

    In addition to the Executor and database you selected, this `docker-compose.yaml` file defines:

    - System-level environment variables required to start the environment
    - A default `Admin` Airflow user
    - Containers for the Airflow Scheduler, Webserver, and Metadata DB services
    - Containers for Celery workers, Redis, and Flower (Celery Executor only)
    - Airflow commands required to start your environment (for example, `airflow upgrade db`)
    - Volumes for Airflow DAGs and logs

    If you want to change a default configuration, such as your Webserver port or Airflow home directory, make sure to first update this file and restart your Airflow environment. To configure Airflow [environment variables](https://airflow.apache.org/docs/apache-airflow/stable/configurations-ref.html), add the variables to your `.env` file and restart your Airflow environment.

5. Run `docker-compose up` to create isolated Docker containers for the Airflow Scheduler, Webserver, and Metadata DB. If you're running the Celery Executor, this command creates one container for each Celery worker.

6. To confirm that the installation was successful, open `localhost:8080` in a web browser to access the Airflow UI. When prompted to log in, enter `admin` for both the username and password. If your setup was successful, you should see the Airflow home:

    ![Airflow home page](https://assets2.astronomer.io/main/docs/airflow-ui/ac-install.png)

    To confirm that all Airflow components are running successfully, you can also run the following command:

    ```sh
    docker ps
    ```

    You should see a container for each Airflow service specified in your `docker-compose` file:

    ```
    CONTAINER ID   IMAGE                                   COMMAND                  CREATED          STATUS          PORTS                                        NAMES
    45dfd2f532fe   astronomer-core_569586/airflow:latest   "tini -- /entrypoint…"   13 seconds ago   Up 11 seconds   5555/tcp, 8793/tcp, 0.0.0.0:8080->8080/tcp   airflow2569586_webserver_1
    4fd455a109f8   astronomer-core_569586/airflow:latest   "tini -- /entrypoint…"   14 seconds ago   Up 12 seconds   5555/tcp, 8080/tcp, 8793/tcp                 airflow2569586_scheduler_1
    df802bb4c2ed   postgres:12.2                           "docker-entrypoint.s…"   3 weeks ago      Up 13 seconds   0.0.0.0:5432->5432/tcp                       airflow2569586_postgres_1
    user@LocalMachine astronomer-core %
    ```

## Next Steps

This guide provided the minimum setup necessary to get Airflow running on Docker. From here, you'll want to complete the following additional setup to make the most of Airflow:

- Automate DAG deployment across your installation
- Upgrade to a new version of Apache Airflow
- Integrate an authentication system
- Set up a destination for Airflow task logs
