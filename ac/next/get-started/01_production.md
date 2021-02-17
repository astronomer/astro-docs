---
title: "Running Astronomer Certified in Production"
navTitle: "Running in Production"
description: "Running the Astronomer Certified distribution of Airflow in production with Systemd."
---

## Overview

The specifics of your production environment will determine how you set up Astronomer Core.

You need a PostgreSQL database that is reachable by all the machines that will be running this Airflow cluster. You also must create a user on that database that has the ability to create tables; we will cover that as part of this guide.

Additionally, you will need to run the three following Airflow components:

- Scheduler
- Webserver
- Worker(s)

## Prerequisites

Ensure the following linux packages are installed on your machine. To install them, you can run either `apt get <package>` or `yum install <package>` depending on your OS.

- sudo
- python3
- python3-dev (python3-devel for RHEL/CentOS)
- gcc
- text editor of your choice (vi, vim, nano, etc…)

## Step 1: Set Up the Database

This guide assumes that your database server is local to where you running these commands, and it assumes you are on a Debian-like OS. If your setup is different, you will need to tweak these commands.

To make the database server accessible outside of your localhost, you may have to edit your [`/var/lib/postgres/data/pg_hba.conf`](https://www.postgresql.org/docs/10/auth-pg-hba-conf.html) file and restart Postgres. Editing this file will vary for each individual database setup. You should also understand the security implications before editing this file.

If your database server is running on the same machine (as what?), you can change `peer` to `md5` to allow connections with username/password from the same machine.

To setup the PostgreSQL database:

1. Create a database user named `airflow`:

    ```sh
    sudo -u postgres createuser airflow -P
    ```

    This will prompt for a password - create one and make a note of it. We'll need it later.

2. Create a database named `airflow` and set the `airflow` user as the owner:

    ```sh
    sudo -u postgres createdb --owner airflow airflow
    ```

## Step 2: Per-Machine Setup

Each machine that will be running an Astronomer Core component (Scheduler, Webserver, or Worker) will need all of the following steps completed.

### A. Create a system user to run Airflow

Airflow can run as any user, but for this setup we assume the user name `astro`. Run the following command to add this user to your machine:

```sh
$ sudo useradd --shell=/bin/false --create-home astro
```

You also need to configure an AIRFLOW_HOME directory (not to be confused with the user's home directory) where you'll store your DAGs. We recommend using the path `/usr/local/airflow`, but any path can be chosen as long as the `astro` user has write access to it. To do this, run the following commands:

```sh
$ sudo install --owner=astro --group=astro -d /usr/local/airflow
$ echo 'export AIRFLOW_HOME=/usr/local/airflow' | sudo tee --append ~astro/.bashrc
```

### B. Create a virtual environment

To isolate the Astronomer Certified python modules from changes to the system, create a virtual environment using the following command:

```sh
sudo -u astro python3 -m venv ~astro/airflow-venv
```

### C. Install Astronomer Core

Install the AC Python Package onto your machine by running:

```sh
sudo -u astro ~astro/airflow-venv/bin/pip install --extra-index-url=https://pip.astronomer.io/simple/ 'astronomer-certified[postgres]==1.10.10.*'
```

> **Note:** This command includes the `[postgres]` dependency so that all libraries needed to use Postgres are also installed. You can add additional dependencies such as `[redis, crypto, aws, celery]` depending on your use case.

### D. Optional, but recommended: Create the Systemd unit file

To have Airflow start at your machine's boot time and stay running, we recommend you use a process supervisor. We use Systemd in this example, but it is not required.

To use Systemd as a process supervisor:

1. Create a Systemd unit file using the following command:

    ```sh
    sudo -e /etc/systemd/system/astronomer-certified@.service
    ```

2. Using the text editor of your choice, add the following to the file you just created:

    ```
    [Unit]
    Description=Airflow %I daemon
    After=network-online.target cloud-config.service
    Requires=network-online.target

    [Service]
    EnvironmentFile=/etc/default/astronomer-certified
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

   This Systemd unit file reads environment variables from `/etc/default/astronomer-certified`, so this is a good way to configure environment/machine specific settings.  

3. Edit `/etc/default/astronomer-certified` to contain these Environment Variables and values:

   ```sh
   AIRFLOW_HOME=/usr/local/airflow/
   AIRFLOW__CORE__LOAD_EXAMPLES=False
   PATH=$PATH:/home/astro/airflow-venv/bin
   ```

   If you have a config setting that doesn't change from machine-to-machine or environment-to-environment, you can instead place it in `airflow.cfg` in your Airflow home deployment step.

### E. Configure Airflow for Database Access

Airflow needs to be told where its metadata DB lives, and what user to connect as, by setting additional environment variables. To do so, add the following Environment Variables to your `/etc/default/astronomer-certified` file:

Local Executor:

```
AIRFLOW__CORE__SQL_ALCHEMY_CONN=postgresql://airflow:<your-user-password>@localhost/airflow
AIRFLOW__CORE__EXECUTOR=LocalExecutor
```

Celery Executor:

```
AIRFLOW__CORE__SQL_ALCHEMY_CONN=postgresql://airflow:<your-user-password>@localhost/airflow
AIRFLOW__CELERY__BROKER_URL=sqla+postgresql://airflow:<your-user-password>@localhost/airflow
AIRFLOW__CELERY__RESULT_BACKEND=db+postgresql://airflow:<your-user-password>@localhost/airflow
AIRFLOW__CORE__EXECUTOR=CeleryExecutor
```

(Kubernetes Executor?)

The password you specify here should be the same one you specified when prompted by the `createuser` command in step 1. If your password contains `%`, `/`, or `@` then you will need to url-escape; replace `%` with `%25`, `/` with `%2F`, and `@` with `%40`.

We have also set the configuration options for the CeleryExecutor to use this same database for communication. Another option is to use [Redis](https://redis.io/), which will take load off of the database, but for simplicity's sake and not needing to run another service we'll use the same Postgres database here.

You Airflow user password is stored written in this file (owned by `root:root` and `0600` permissions) on your nodes. If you'd rather use an existing credential store, such as HashiCorp's Vault, you can instead specify a command that will be run (once, at service start up) to obtain the connection string. For example:

```
AIRFLOW__CORE__SQL_ALCHEMY_CONN_CMD=vault kv get -field=dsn secret/airflow-db
```

You can follow our guide on [integrating with Hashicorp Vault](/guides/airflow-and-hashicorp-vault) if you would like more direction on this.

## Step 3: Set Up the Scheduler

On the machine where you want to enable the Scheduler:

1. Enable the Scheduler by running the following command:

    ```sh
    $ sudo systemctl enable astronomer-certified@scheduler.service
    ```


2. Edit the override file for the machine by running the following command:

    ```sh
    $ sudo systemctl edit astronomer-certified@scheduler.service
    ```

3. In the empty document that appears, add the following lines:

    ```
    [Service]
    ExecStartPre=/home/astro/airflow-venv/bin/airflow upgradedb
    ```

4. Start the service by running:    

    ```sh
    sudo systemctl start astronomer-certified@scheduler.service
    ```

## Step 4: Set Up the Webserver

On the machine where you'll be running the Webserver:

1. Enable the Webserver by running the following:

    ```sh
    $ sudo systemctl enable astronomer-certified@webserver.service
    ```

2. Start the service by running the following:

    ```sh
    $ sudo systemctl start astronomer-certified@webserver.service
    ```

>> **Note:** For added security and stability, we recommend running the Webserver behind a reverse proxy and load balancer such as [nginx](https://www.nginx.com/). For more information on this feature, read the [Apache Airflow documentation](https://airflow.apache.org/docs/stable/howto/run-behind-proxy.html).

## Step 5: Set Up the Worker Machines

For each machine that you want to host a Worker:

1. Enable the Worker service by running the following command:

   ```sh
   $ sudo systemctl enable astronomer-certified@worker.service
   ```

2. Start the service by running the following command:

    ```sh
    $ sudo systemctl start astronomer-certified@worker.service
    ```

## Step 6: Connect Your DAGs to All Machines

Every machine running Airflow needs a copy of the DAG files, with all DAG files appearing in the same DAG folder (`/usr/local/airflow/` if you followed the naming convention in step 2A). There are many ways in which you can make this happen, but some popular options include:

- Baking DAGs into the docker image alongside Airflow.
- A job that refreshes the DAGs folder on a schedule ([this is how the folks at WePay do it](https://wecode.wepay.com/posts/airflow-wepay)).
- Existing automation tools such as Ansible, Puppet or Chef.
- Making the DAGs live on a shared filesystem such as NFS (but be aware of read performance penalties - Airflow can be quite heavy on read-ops).

(Is there a "default" way to do this that we can list steps for?)


If you're looking for a full-stack solution for DAG deployment, it's something we can help with via our commercial offerings here at Astronomer. [Get in touch](/contact) if you'd like to chat.

## Production Support

We’re now providing commercial support subscriptions for Apache Airflow via Astronomer Certified. These subscriptions are SLA-backed and give your team access to our deep Airflow expertise through email and our support portal, where you can submit questions, feature requests, and bug reports. [Get in touch](/contact) if you would like to learn more.
