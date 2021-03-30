---
title: "Install Apache Airflow on Docker"
navtitle: "Install on Docker"
description: "A complete setup for getting Airflow running on Docker using Astronomer Core."
---

## Overview

Running Airflow in Docker containers is a simple and effective way to manage and scale your project. The core Airflow components — the Webserver, Scheduler, and Workers — are each run in separate containers, meaning you can easily scale resource usage based on the computing requirements of your project.

This guide contains all of the necessary setup to get Airflow running on Docker. You'll create a local project directory, pull an Astronomer Core image and `docker-compose` file, and spin up your environment.

## Prerequisites

To install Apache Airflow on Docker, you need:

- [curl](https://curl.se/download.html)
- [Docker](https://docs.docker.com/get-docker/)

## Installation

To install and run the Astronomer Core distribution of Apache Airflow:

1. Create new project directory for your Airflow project and `cd` into it:

    ```sh
    mkdir astronomer-core && cd astronomer-core
    ```

2. Run the following command to initialize some of the key files you'll need to run Astronomer Core:

    ```sh
    touch .env packages.txt requirements.txt Dockerfile
    ```

3. Add the the following to the `Dockerfile` to grab the latest Astronomer Core image on build:

    ```
    # For a Debian-based image
    FROM quay.io/astronomer/docker-airflow:latest
    ```

    To pull from a specific version, replace `latest` in the image tag with the tag for your desired version. For a list of all image tags, refer to the [quay.io repository](https://quay.io/repository/astronomer/ap-airflow?tab=tags).  


4. In your project folder, run one of the following commands to download a default `docker-compose` file based on the database and Airflow Executor you want to use:

    | Configuration | Command |
    |---------------|---------|
    | MySQL/ Celery Executor |`curl -LfO https://raw.githubusercontent.com/astronomer/docker-airflow/main/docker-compose-mysql-celery.yaml`|
    | MySQL/ Local Executor |`curl -LfO https://raw.githubusercontent.com/astronomer/docker-airflow/main/docker-compose-mysql-local.yaml`|
    | Postgres/ Celery Executor |`curl -lfO https://raw.githubusercontent.com/astronomer/docker-airflow/main/docker-compose-postgres-celery.yaml`|
    | Postgres/ Celery Executor |`curl -LfO https://raw.githubusercontent.com/astronomer/docker-airflow/main/docker-compose-postgres-local.yaml` |

    Your `docker-compose` file contains all of the connections and commands needed to start Airflow for the first time. Additionally, the `x-airflow-env` object is where you configure Airflow's environment variables. If you want to change a default configuration, such as your Webserver port or your Airflow home directory, you need to first update this file and restart your Airflow environment.

5. Run `docker-compose up` to spin up the local Airflow Scheduler, Webserver, and Metadata DB containers, as well as create some key objects for running Airflow. The default user created will have `admin/admin` as a username and password.

    By default, this command will run Airflow on your machine based on your `docker-compose` file. Containers for your Airflow Metadata Database, Airflow Webserver and Airflow Scheduler are spun up programmatically.

6. To confirm the installation was successful, open `localhost:8080` in a web browser and log in as your default `admin`. If your setup was successful, you should see the Airflow home:

    ![Airflow home page](https://assets2.astronomer.io/main/docs/airflow-ui/ac-install.png)

    You can also confirm that all Airflow components are running with the following Docker CLI command:

    ```sh
    docker ps
    ```

    If your installation was successful, you should see a container for each Airflow service specified in your `docker-compose` file:

    ```
    CONTAINER ID   IMAGE                             COMMAND                  CREATED          STATUS          PORTS                                        NAMES
45dfd2f532fe   astronomer-core_569586/airflow:latest   "tini -- /entrypoint…"   13 seconds ago   Up 11 seconds   5555/tcp, 8793/tcp, 0.0.0.0:8080->8080/tcp   airflow2569586_webserver_1
4fd455a109f8   astronomer-core_569586/airflow:latest   "tini -- /entrypoint…"   14 seconds ago   Up 12 seconds   5555/tcp, 8080/tcp, 8793/tcp                 airflow2569586_scheduler_1
df802bb4c2ed   postgres:12.2                     "docker-entrypoint.s…"   3 weeks ago      Up 13 seconds   0.0.0.0:5432->5432/tcp                       airflow2569586_postgres_1
user@LocalMachine astronomer-core %
    ```

## Next Steps

This guide provided the minimum setup necessary to get Airflow running on Docker at scale. From here, you'll want to complete the following additional setup to make the most of Airflow:

- Automate DAG deployment across your installation
- Upgrade to a new version of Apache Airflow
- Integrate an authentication system
- Set up a destination for Airflow task logs
