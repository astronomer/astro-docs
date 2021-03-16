---
title: "Running Astronomer Core at Production Scale"
navTitle: "Production Scale Installation"
description: "Running the Astronomer Core distribution of Airflow at production scale."
---

## Overview

This guide walks through all of the necessary steps to install Astronomer Core in a production environment via Python wheel. By the end of the setup, you'll be able to deploy and run Airflow across multiple machines.

## Prerequisites

First, ensure the OS-level packages listed below are installed on your machines. If you're Debian-based, run `$ apt get <package>` to do so. If you're running RedHat Linux, run `$ yum install <package>`.

- sudo
- python3
- python3-dev (python3-devel for RHEL/CentOS)
- gcc

If you're Debian-based, run `$ apt get <package>` to do so. If you're running RedHat Linux, run `$ yum install <package>`.

You also need a database that is reachable by all the machines that will be running this Airflow cluster. While this guide walks through the process for configuring a PostgreSQL database, Airflow is compatible with all of the following databases:

- PostgreSQL: 9.6, 10, 11, 12, 13
- MySQL: 5.7, 8
- SQLite: 3.15.0+

Lastly, you will need to run the following three Airflow components:

- Scheduler
- Webserver
- Worker(s)

You can run these components on one or multiple machines, though we recommend using multiple machines for a production environment.

## Step 1: Set Up the Database

To set up a PostgreSQL Airflow meta database:

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

> **Note:** To make the database server accessible outside of your localhost, you may have to edit your [`/var/lib/postgres/data/pg_hba.conf`](https://www.postgresql.org/docs/10/auth-pg-hba-conf.html) file and restart Postgres. Editing this file will vary for each individual database setup. You should also understand the security implications before editing this file.
>
> If your database server is running on the same machine as your other Airflow components, you can change `peer` to `md5` to allow connections with username/password from the same machine.

### Alternative setup: Use an existing database

Instead of creating a new PostgreSQL database, you can use an existing database as long as the following are true:

- The database is compatible with Airflow as described in Prerequisites.
- You have a user named `airflow` with ownership access to the database.

When you specify the `AIRFLOW__CORE__SQL_ALCHEMY_CONN` environment variable in step 2F, replace the connection URL with the appropriate URL for your database.

## Step 2: Configure Each Machine in Your System

Each machine that will be running an Astronomer Core component (Scheduler, Webserver, or Worker) will need all of the following steps completed.

### A. Create a system user to run Airflow

Airflow can run as any user, but for this setup we assume the user name `astro`. Run the following command to add this user to your machine:

```sh
sudo useradd --shell=/bin/false --create-home astro
```

### B. Create a project folder for Airflow

You also need to configure an AIRFLOW_HOME directory (not to be confused with the user's home directory) where you'll store your DAGs. We recommend using the path `/usr/local/airflow` as your project directory and `/usr/local/airflow/dags` as your DAG directory, but any path can be chosen as long as the `astro` user has write access to it. To do this, run the following commands:

```sh
sudo install --owner=astro --group=astro -d /usr/local/airflow
echo 'export AIRFLOW_HOME=/usr/local/airflow' | sudo tee --append ~astro/.bashrc
cd /usr/local/airflow && mkdir dags
```

> **Note:** If you're running Airflow on multiple machines, each machine needs access to the same DAGs in order to successfully execute them. We recommend setting up automation pipelines for updating all of your DAG folders whenever a local folder is updated. For more information, read [Deploying DAGs].

### C. Create a virtual environment

To isolate the Astronomer Core python modules from changes to the system, create a virtual environment using the following command:

```sh
sudo -u astro python3 -m venv ~astro/airflow-venv
```

### D. Install Astronomer Core

Install the AC Python Package onto your machine by running:

```sh
sudo -u astro ~astro/airflow-venv/bin/pip install --extra-index-url=https://pip.astronomer.io/simple/ 'astronomer-core[postgres]==1.10.10.*'
```

This command includes the `[postgres]` dependency so that all libraries needed to use Postgres are also installed. You can add additional dependencies such as `[redis, crypto, aws, celery]` depending on your use case.

### E. Configure a process supervisor

To ensure that Airflow is always running when your machine is on, we recommend implementing a process supervisor. Systemd is used in this example, though any process supervisor will work here.

To use systemd as a process supervisor:

1. Create a systemd unit file using the following command:

    ```sh
    sudo -e /etc/systemd/system/astronomer-core@.service
    ```

2. Using the text editor of your choice, add the following to the file you just created:

    ```
    [Unit]
    Description=Airflow %I daemon
    After=network-online.target cloud-config.service
    Requires=network-online.target

    [Service]
    EnvironmentFile=/etc/default/astronomer-core
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

3. Edit `/etc/default/astronomer-core` to contain these Environment Variables and values:

   ```sh
   AIRFLOW_HOME=/usr/local/airflow/
   AIRFLOW__CORE__LOAD_EXAMPLES=False
   PATH=$PATH:/home/astro/airflow-venv/bin
   ```

   If you want to configure an environment variable that applies to all of your machines, you can instead place it in `airflow.cfg` in your Airflow home deployment step. For more information, read the Apache Airflow documentation on [Setting Configuration Options](https://airflow.apache.org/docs/apache-airflow/stable/howto/set-config.html).

### F. Configure Airflow for Database Access

Airflow needs to be connected to the meta database and `airflow` user via Environment Variables. To do this, add the following to your `/etc/default/astronomer-core` file:

For Local Executor:

```
AIRFLOW__CORE__SQL_ALCHEMY_CONN=postgresql://airflow:<your-user-password>@localhost/airflow
AIRFLOW__WEBSERVER__BASE_URL=http://host:port
AIRFLOW__CORE__EXECUTOR=LocalExecutor
```

For Celery Executor:

```
AIRFLOW__CORE__SQL_ALCHEMY_CONN=postgresql://airflow:<your-user-password>@localhost/airflow
AIRFLOW__WEBSERVER__BASE_URL=http://host:port
AIRFLOW__CELERY__BROKER_URL=sqla+postgresql://airflow:<your-user-password>@localhost/airflow
AIRFLOW__CELERY__RESULT_BACKEND=db+postgresql://airflow:<your-user-password>@localhost/airflow
AIRFLOW__CORE__EXECUTOR=CeleryExecutor
```

The password you specify here should be the same one you specified when prompted by the `createuser` command in step 1. If your password contains `%`, `/`, or `@` then you will need to url-escape; replace `%` with `%25`, `/` with `%2F`, and `@` with `%40`.

#### Alternative setup options

* Your Airflow user password is stored written in `/etc/default/astronomer-core` (owned by `root:root` and `0600` permissions) on your nodes. If you'd rather use an existing credential store, such as HashiCorp's Vault, you can instead specify a command that will be run (once, at service start up) to obtain the connection string. For example:

    ```
    AIRFLOW__CORE__SQL_ALCHEMY_CONN_CMD=vault kv get -field=dsn secret/airflow-db
    ```

    For more information on this feature, read [Integrating Airflow and Hashicorp Vault](/guides/airflow-and-hashicorp-vault).

* In this example setup, the `AIRFLOW__CELERY__BROKER_URL` Environment Variable uses the main database for communication. To take some load off of your main database, we recommend using a dedicated message broker such as [Redis](https://redis.io/) and specifying that here instead.

## Step 3: Set Up the Scheduler

The Scheduler orchestrates the running of DAGs across your Airflow Environment. To get your Scheduler running:  

1. Enable the Scheduler by running the following command:

    ```sh
    sudo systemctl enable astronomer-core@scheduler.service
    ```


2. Edit the override file for the machine by running the following command:

    ```sh
    sudo systemctl edit astronomer-core@scheduler.service
    ```

3. In the empty document that appears, add the following lines:

    ```
    [Service]
    ExecStartPre=/home/astro/airflow-venv/bin/airflow upgradedb
    ```

4. Start the service by running:   

    ```sh
    sudo systemctl start astronomer-core@scheduler.service
    ```

## Step 4: Set Up the Webserver

The Webserver is an Airflow core component that is responsible for rendering the Airflow UI. To configure it on its own machine, follow the steps below.

1. Enable the Webserver by running the following:

    ```sh
    sudo systemctl enable astronomer-core@webserver.service
    ```

2. Start the Webserver by running the following:

    ```sh
    sudo systemctl start astronomer-core@webserver.service
    ```

You can now access the Airflow UI in a web browser via `http://host:port`.

> **Note:** For added security and stability, we recommend running the Webserver behind a reverse proxy and load balancer such as [nginx](https://www.nginx.com/). For more information on this feature, read the [Apache Airflow documentation](https://airflow.apache.org/docs/stable/howto/run-behind-proxy.html).

## Step 5: Set Up the Worker Machines

For each machine that you want to host a Worker:

1. Enable the Worker service by running the following command:

   ```sh
   sudo systemctl enable astronomer-core@worker.service
   ```

2. Start the service by running the following command:

    ```sh
    sudo systemctl start astronomer-core@worker.service
    ```

You now have the ability to run Airflow tasks within DAGs.

## Step 6: Confirm the Installation

To confirm that the installation was successful, open `http://host:port` in your web browser. You should see the login screen for the Airflow UI.

Log in with `admin` for both your user name and password. Afterwards, you should see the homepage for Airflow:

![Empty Airflow UI](https://assets2.astronomer.io/main/docs/airflow-ui/installation-home.png)

If you want to further confirm that everything's working as intended, add this [example DAG] to the DAG folder of every machine running Airflow and stop/start your Airflow services. When you reopen the Airflow UI, you should see the example DAG ready to run.

## Next Steps

This guide provided the minimum setup necessary to get Airflow running on multiple machines at scale. From here, you'll want to complete the following additional setup to make the most of Airflow:

- Automate DAG deployment across your installation
- Read how to upgrade to a new Astronomer Core version
- Integrate an authentication system
- Set up a destination for Airflow logs
