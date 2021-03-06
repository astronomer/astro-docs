---
title: "Install Apache Airflow on a Virtual Machine"
navTitle: "Install on a Virtual Machine"
description: "Install Apache Airflow on one or more virtual machines with the Astronomer Core Python wheel."
---

## Overview

This guide contains the complete setup steps for installing Apache Airflow via the Astronomer Core Python wheel on one or more Virtual Machines (VMs). By the end of the setup, you'll be able to deploy and run an Airflow instance across multiple machines.

Note that this setup represents one possible configuration of Astronomer Core and uses optional tools such as systemd and PostgreSQL. After successfully starting Airflow for the first time, we recommend reviewing this configuration and adjusting it based on the functional requirements for your project.

If you haven't tested Airflow locally and would like to do so, refer to [Astronomer Core Quickstart](/docs/ac/next/01_quickstart).

## Prerequisites

First, ensure the the following OS-level packages are installed on your machines:

- sudo
- python3
- python3-dev (python3-devel for RHEL/CentOS)
- python3-venv
- python3-psycopg2
- gcc
- postgresql
- systemd

If you're Debian-based, you can install these by running:

```
sudo apt-get install sudo python3 python3-dev python3-venv python3-psycopg2 gcc postgresql systemd
```

You also need a database that is accessible to all the machines that will run your Airflow instance. This guide walks through the process for configuring a PostgreSQL database, but Airflow is compatible with all of the following databases:

- PostgreSQL: 9.6, 10, 11, 12, 13
- MySQL: 5.7, 8
- SQLite: 3.15.0+

> **Note:** MySQL 5.7 is compatible with Airflow, but is not recommended for users running Airflow 2.0+, as it does not support the ability to run more than 1 Scheduler. If you'd like to leverage Airflow's new [Highly-Available Scheduler](https://www.astronomer.io/blog/airflow-2-scheduler), make sure you're running MySQL 8.0+.

## Step 1: Set Up Airflow's Metadata Database

In Airflow, the metadata database is responsible for keeping a record of all tasks across DAGs and their corresponding status (queued, scheduled, running, success, failed, etc). To set up the metadata DB:

1. Create a database user named `airflow`:

    ```sh
    sudo -u postgres createuser airflow -P
    ```

    This will prompt you for a password. Create one, and make a note of it for later.

2. Create a database named `airflow` and set the `airflow` user as the owner:

    ```sh
    sudo -u postgres createdb --owner airflow airflow
    ```

This guide assumes that your database server is local to where you run these commands and that you're on a Debian-like OS. If your setup is different, you will need to tweak these commands.

> **Note:** To make the database server accessible outside of your localhost, you may have to edit your [`/var/lib/postgresql/data/pg_hba.conf`](https://www.postgresql.org/docs/10/auth-pg-hba-conf.html) file and restart Postgres. Editing this file will vary for each individual database setup. Before editing this file, take a moment to assess the security  implications of editing this file.

### Alternative setup: Use an existing database

Instead of creating a new PostgreSQL database, you can use an existing database as long as both of the following are true:

- The database is compatible with Airflow as described in Prerequisites.
- A user named `airflow` has ownership access to the database.

When you specify the `AIRFLOW__CORE__SQL_ALCHEMY_CONN` environment variable in step 2F, replace the connection string with one that corresponds to your database.

## Step 2: Configure Each Machine in Your System

Complete the steps below for each machine that will be running a core Apache Airflow component (Scheduler, Webserver, or Worker).

### A. Create a system user to run Airflow

Airflow can run as any user, but for this setup we assume the user name `astro`. Run the following command to add this user to your machine:

```sh
sudo useradd --create-home astro
```

### B. Create an Airflow project directory

You also need to configure an `AIRFLOW_HOME` directory (not to be confused with the user's home directory) where you'll store your DAGs. We recommend using the path `/usr/local/airflow` as your project directory and `/usr/local/airflow/dags` as your DAG directory, but any path can be chosen as long as the `astro` user has write access to it. To do this, run the following commands:

```sh
sudo install --owner=astro --group=astro -d /usr/local/airflow
echo 'export AIRFLOW_HOME=/usr/local/airflow' | sudo tee --append ~astro/.bashrc
cd /usr/local/airflow
sudo mkdir dags
```

> **Note:** If you're running Airflow on multiple machines, each machine needs access to the same DAGs in order to successfully execute them. We recommend setting up automation pipelines for updating all of your DAG folders whenever a local folder is updated. For more information, read [Deploying DAGs].

### C. Create a virtual environment

To isolate the Astronomer Core Python modules from changes to the system, create a virtual environment in a directory named `astro/airflow-venv` using the following command:

```sh
sudo -u astro python3 -m venv ~astro/airflow-venv
```

venv is a tool to create lightweight, isolated Python environments without affecting systemwide configuration. For more information, read [Python's venv documentation](https://docs.python.org/3/library/venv.html).

### D. Install Astronomer Core

To install the AC Python wheel onto your machine, run one of the following commands depending on your chosen Airflow Version and [Executor](https://www.astronomer.io/guides/airflow-executors-explained):

- For Local Executor:

    ```sh
    sudo -u astro ~astro/airflow-venv/bin/pip install --extra-index-url=https://pip.astronomer.io/simple/ 'astronomer-core[postgres]==<airflow-version>' --constraint "https://raw.githubusercontent.com/apache/airflow/constraints-<airflow-version>/constraints-3.8.txt"
    ```

- For Celery Executor:

    ```sh
    sudo -u astro ~astro/airflow-venv/bin/pip install --extra-index-url=https://pip.astronomer.io/simple/ 'astronomer-core[postgres, celery, redis]==<airflow-version>' --constraint "https://raw.githubusercontent.com/apache/airflow/constraints-<airflow-version>/constraints-3.8.txt"
    ```

For example, to install the latest patch version of Apache Airflow 2.0.1 with support for the Celery executor, this command would be:

```sh
sudo -u astro ~astro/airflow-venv/bin/pip install --extra-index-url=https://pip.astronomer.io/simple/ 'astronomer-core[postgres, celery, redis]==2.0.1.*' --constraint "https://raw.githubusercontent.com/apache/airflow/constraints-2.0.1/constraints-3.8.txt"
```

This command includes the optional `postgres`, `celery`, and `redis` dependencies so that all libraries for those tools are also installed. If your environment requires extra functionality, specify additional dependencies in a comma-delimited list:

```
astronomer-core[mysql, redis, celery, crypto, aws]==2.0.1.*
```

For a list of all optional dependencies, refer to the [AC pip index](https://pip.astronomer.io/simple/index.html).

### E. Configure a process supervisor

To ensure that Airflow is always running when your machine is on, we recommend implementing a process supervisor. [Systemd](https://systemd.io/) is used in this example, though any process supervisor works here.

To use systemd as a process supervisor:

1. Create a systemd unit file using the following command:

    ```sh
    sudo -e /etc/systemd/system/astronomer-core@.service
    ```

2. Using a text editor, create a file called `sys-config` and edit it to contain these environment variables and values:

    ```sh
    AIRFLOW_HOME=/usr/local/airflow/
    AIRFLOW__CORE__LOAD_EXAMPLES=False
    PATH=$PATH:/home/astro/airflow-venv/bin
    ```

    If you want to configure environment variables for a single Airflow service, we recommend doing so in the `sys-config` file for the machine on which the service is running.

    > **Note:** When you run Airflow for the first time, a file called `airflow.cfg` is generated in your `AIRFLOW_HOME` directory. If you want to configure environment variables that apply to all of your machines, we recommend specifying them in that `airflow.cfg` file.  For more information, read the Apache Airflow documentation on [Setting Configuration Options](https://airflow.apache.org/docs/apache-airflow/stable/howto/set-config.html).

3. Add the following to your systemd unit file:

    ```
    [Unit]
    Description=Airflow %I daemon
    After=network-online.target cloud-config.service
    Requires=network-online.target

    [Service]
    EnvironmentFile=/usr/local/airflow/sys-config
    User=astro
    Group=astro
    Type=simple
    WorkingDirectory=/usr/local/airflow/
    ExecStart=/home/astro/airflow-venv/bin/airflow %i
    Restart=always
    RestartSec=5s

    [Install]
    WantedBy=multi-user.target
    ```

### F. Configure Airflow for Database Access

To connect your Airflow environment to the metadata DB you created in Step 1, add the following environment variables to your `sys-config` file depending on your chosen [Executor](https://www.astronomer.io/guides/airflow-executors-explained):

- For Local Executor:

    ```
    AIRFLOW__CORE__SQL_ALCHEMY_CONN=postgresql+psycopg2://airflow:<your-user-password>@localhost/airflow
    AIRFLOW__WEBSERVER__BASE_URL=http://localhost:8080
    AIRFLOW__CORE__EXECUTOR=LocalExecutor
    ```

- For Celery Executor:

    ```
    AIRFLOW__CORE__SQL_ALCHEMY_CONN=postgresql+psycopg2://airflow:<your-user-password>@localhost/airflow
    AIRFLOW__WEBSERVER__BASE_URL=http://localhost:8080
    AIRFLOW__CELERY__BROKER_URL=redis://:@redis:6379/0/airflow:<your-user-password>@localhost/airflow
    AIRFLOW__CELERY__RESULT_BACKEND=db+postgresql://airflow:<your-user-password>@localhost/airflow
    AIRFLOW__CORE__EXECUTOR=CeleryExecutor
    ```

The password you specify here should be the same one you specified when prompted by the `createuser` command in Step 1. If your password contains `%`, `/`, or `@` then you will need to url-escape; replace `%` with `%25`, `/` with `%2F`, and `@` with `%40`.

When you've finished configuring environment variables, run the following command to add your environment variables to your `astro` user's shell environment:

```sh
echo 'set -a; source /usr/local/airflow/sys-config; set +a' | sudo tee --append ~astro/.bashrc
```

#### Optional setup: Database access

Your Airflow user password is stored in your `sys-config` file (owned by `root:root` and `0600` permissions) on your nodes. If you'd rather use an existing credential store, such as [HashiCorp Vault](https://www.hashicorp.com/products/vault), you can instead specify a command to obtain the connection string when the service starts up. For example:

```
AIRFLOW__CORE__SQL_ALCHEMY_CONN_CMD=vault kv get -field=dsn secret/airflow-db
```

For more information on this feature, read [Integrating Airflow and Hashicorp Vault](/guides/airflow-and-hashicorp-vault).

## Step 3: Set Up the Scheduler

In Airflow, [the Scheduler](https://airflow.apache.org/docs/apache-airflow/stable/scheduler.html) is responsible for reading from the metadata database to check on the status of each task and decides the order in which tasks should be completed. To get your Scheduler running:  

1. Enable the Scheduler by running the following command:

    ```sh
    sudo systemctl enable astronomer-core@scheduler.service
    ```

2. Edit the override file for the machine by running the following command:

    ```sh
    sudo systemctl edit astronomer-core@scheduler.service
    ```

3. In the override file, add the following lines:

    ```
    [Service]
    ExecStartPre=/home/astro/airflow-venv/bin/airflow db upgrade
    ```

4. Start the service by running:   

    ```sh
    sudo systemctl start astronomer-core@scheduler.service
    ```

## Step 4: Set Up the Webserver

[The Webserver](https://airflow.apache.org/docs/apache-airflow/stable/security/webserver.html) is a core Airflow component that is responsible for rendering the Airflow UI. To configure it on its own machine, follow the steps below.

1. Enable the Webserver by running the following:

    ```sh
    sudo systemctl enable astronomer-core@webserver.service
    ```

2. Start the Webserver by running the following:

    ```sh
    sudo systemctl start astronomer-core@webserver.service
    ```

> **Note:** For added security and stability, we recommend running the Webserver behind a reverse proxy and load balancer such as [nginx](https://www.nginx.com/). For more information on this feature, read the [Apache Airflow documentation](https://airflow.apache.org/docs/stable/howto/run-behind-proxy.html).

## Step 5: Set Up Workers (Celery Only)

Workers are an essential component for running Airflow with the Celery Executor. For each machine on which you want to host a Worker:

1. Enable the Worker service by running the following command:

   ```sh
   sudo systemctl enable astronomer-core@worker.service
   ```

2. Start the service by running the following command:

    ```sh
    sudo systemctl start astronomer-core@worker.service
    ```

## Step 6: Create a User

To log in to the Airflow UI, you need to first create an Airflow user:

1. Switch to your system `astro` user using the following command:

    ```sh
    sudo -H su -u astro bash
    ```

    All Airflow CLI commands must be run from your `astro` user.

2. Create a new `admin` Airflow user with the following command:

    ```sh
    airflow users create -e EMAIL -f FIRSTNAME -l LASTNAME -p PASSWORD -r Admin -u USERNAME
    ```

## Step 7: Confirm the Installation

To confirm that you successfully installed Apache Airflow, open `http://localhost:8080` in your web browser. You should see the login screen for the Airflow UI.

Log in with your `admin` user. From there, you should see Airflow's primary 'DAGs' view:

![Empty Airflow UI](https://assets2.astronomer.io/main/docs/airflow-ui/ac-install.png)

## Next Steps

This guide provided the minimum setup necessary to get Airflow running on multiple machines at scale. From here, you'll want to complete the following additional setup to make the most of Airflow:

- Automate DAG deployment across your installation
- Upgrade to a new version of Apache Airflow
- Integrate an authentication system
- Set up a destination for Airflow task logs
