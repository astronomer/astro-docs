---
title: "Running in Production"
description: "Running the Astronomer Certified distribution of Airflow in production with Systemd."
---

## Overview

Designed in close partnership with both Airflow committers and users, Astronomer Certified (AC) is for teams ready to leverage the Python-based workflow management tool in production. Astronomer Certified combines Airflow’s extensibility and community-driven development with industry standards for security, reliability, and scale.

There are two primary ways to obtain the Astronomer Certified distribution:

1. [Docker Image](https://hub.docker.com/r/astronomerinc/ap-airflow)
2. [Python Package](https://pip.astronomer.io/simple/apache-airflow/)

Astronomer Certified currently supports Airflow versions  1.10.7 and 1.10.10. This doc should cover everything you need to know to run Astronomer Certified via either method, including:

- Prerequisites
- Instructions for Deploying AC to Production

## Planning Your Deployment

You need a PostgreSQL database that is reachable by all the machines that will be running this Airflow cluster. You also must create a user on that database that has the ability to create tables; we will cover that as part of this guide.

Additionally, you will need to run the three following Airflow components:

- Scheduler
- Webserver
- Worker(s)

You can run multiple or even all of these components on a single machine if your usage is small enough. If you are thinking of running everything on a single node then you can use the `LocalExecutor`, otherwise you will need to use the `CeleryExecutor` or `KubernetesExecutor`

> Note: You can only use the `KubernetesExecutor` if you're deploying this Docker image to a Kubernetes cluster.

### Prerequisites

Ensure the following linux packages are installed on your machine. To get them installed, you can run either `apt get <package>` or `yum install <package>` depending on your OS.

- sudo
- python3
- python3-dev (python3-devel for RHEL/CentOS)
- gcc
- text editor of your choice (vi, vim, nano, etc...)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Setting up the database](#setting-up-the-database)
- [Per-machine setup](#per-machine-setup)
  - [Create system user to run Airflow](#create-system-user-to-run-airflow)
  - [Create virtual environment](#create-virtual-environment)
  - [Install Astronomer ac](#install-astronomer-ac)
  - [Create systemd unit files](#create-systemd-unit-files)
  - [Configure Airflow for database access](#configure-airflow-for-database-access)
- [On the scheduler machine](#on-the-scheduler-machine)
  - [Enable the service](#enable-the-service)
  - [Start the service](#start-the-service)
- [On the webserver machine](#on-the-webserver-machine)
  - [Enable the service](#enable-the-service-1)
  - [Start the service](#start-the-service-1)
    - [Recommend putting nginx in front of Airflow](#todo-recommend-putting-nginx-in-front-of-airflow)
- [On the worker machines](#on-the-worker-machines)
  - [Enable the service](#enable-the-service-2)
  - [Start the service](#start-the-service-2)
- [Deploying DAGs](#deploying-dags)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Setting Up the Database

This section of the guide assumes that the database server is local to where you running these commands, and you are on a Debian-like OS. If your setup is different, you will need to tweak these commands.

To make the database server accessible outside of your localhost, [you may have to edit your `/var/lib/postgres/data/pg_hba.conf`](https://www.postgresql.org/docs/10/auth-pg-hba-conf.html) and restart Postgres. Note that achieving this is outside of the scope of this guide, as there is a degree of variance implied within each custom setup. You should also understand the security implications before editing this file.

If the database is running on the same machine, you can change `peer` to `md5` to allow connections with username/password from the same machine. 

First we need to create a database user named `airflow`:

```sh
sudo -u postgres createuser airflow -P
```

This will prompt for a password - create one and make a note of it. We'll need it later.

Next, we need to create a database named `airflow` and set the `airflow` user as the owner:

```sh
sudo -u postgres createdb --owner airflow airflow
```

## Per-Machine Setup

Each machine that will be running an Astronomer Certified component (Scheduler, Webserver, Worker) will need all of the following steps performed.

### Create System User to Run Airflow

Airflow can run as any user, but for the sake of simplicity we will name the user `astro`.

```
sudo useradd --shell=/bin/false --create-home astro
```

We also need to configure AIRFLOW_HOME (not to be confused with the user's home directory). To avoid mixing "dot", or config, files in with your Airflow installation, we suggest `/usr/local/airflow`, but any path can be chosen as long as the `astro` user has write access to it.

```
sudo install --owner=astro --group=astro -d /usr/local/airflow
echo 'export AIRFLOW_HOME=/usr/local/airflow' | sudo tee --append ~astro/.bashrc
```

### Create a Virtual Environment

In order to isolate the Astronomer Certified python modules from changes to the system we recommend that a virtual environment is created:

```
sudo -u astro python3 -m venv ~astro/airflow-venv
```

### Install Astronomer Certified

```
sudo -u astro ~astro/airflow-venv/bin/pip install --extra-index-url=https://pip.astronomer.io/simple/ 'astronomer-certified[postgres]==1.10.10.*'
```

Note: This command includes the `[postgres]` dependency so that all libraries needed to use Postgres are also installed. You can add additional dependencies such as `[redis, crypto, aws, celery]` depending on your use case.

### Create Systemd Unit File

In order to have Airflow start at your machine's boot time and stay running, we recommend you use a process supervisor. Systemd ships with most modern Linux distributions, so we will use it for the purposes of this example, but it is not a requirement.

With the text editor of your choice, create and edit `/etc/systemd/system/astronomer-certified@.service` (with sudo) and put this in there:

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

This is called a "template" unit file. We will specialize and enable it later on.

Our Systemd unit file reads environment variables from `/etc/default/astronomer-certified` and Airflow will look for [`AIRFLOW__<section>__<option>`](http://airflow.apache.org/docs/stable/howto/set-config.html) environment variables when reading config, so this is a good way to configure environment/machine specific settings. If you have a config setting that doesn't change from machine-to-machine or environment-to-environment then you can place it in `airflow.cfg` in your Airflow home deployment step. More on that later.

Edit `/etc/default/astronomer-certified` to contain (at least) these:

```sh
AIRFLOW_HOME=/usr/local/airflow/
AIRFLOW__CORE__LOAD_EXAMPLES=False
PATH=$PATH:/home/astro/airflow-venv/bin
```

### Configure Airflow for Database Access

Airflow needs to be told where its metadata DB lives, and what user to connect as, by setting the `sql_alchemy_conn` config option in `core` section- this is the DSN of the database connection. If you are okay with having the password written in a file (owned by `root:root` and `0600` permissions) on your nodes, you can make `/etc/default/astronomer-certified` contain these lines:

Local Executor
```
AIRFLOW__CORE__SQL_ALCHEMY_CONN=postgresql://airflow:<PASSWORD_FROM_EARLIER>@localhost/airflow
AIRFLOW__CORE__EXECUTOR=LocalExecutor
```

Celery Executor
```
AIRFLOW__CORE__SQL_ALCHEMY_CONN=postgresql://airflow:<PASSWORD_FROM_EARLIER>@localhost/airflow
AIRFLOW__CELERY__BROKER_URL=sqla+postgresql://airflow:<PASSWORD_FROM_EARLIER>@localhost/airflow
AIRFLOW__CELERY__RESULT_BACKEND=db+postgresql://airflow:<PASSWORD_FROM_EARLIER>@localhost/airflow
AIRFLOW__CORE__EXECUTOR=CeleryExecutor
```

**Make sure to replace `<PASSWORD_FROM_EARLIER>` with the actual password you gave to the `createuser` command.** If your password contains `%`, `/`, or `@` then you will need to url-escape; replace `%` with `%25`, `/` with `%2F`, and `@` with `%40`.

We have also set the configuration options for the CeleryExecutor to use this same database for communication. Another option is to use [Redis](https://redis.io/), which will take load off of the database, but for simplicity's sake and not needing to run another service we'll use the same Postgres database here.

If you aren't happy with this and have an existing "credential store" configured, for example HashiCorp's Vault, you can instead specify a command that will be run (once, at service start up) to obtain the connection string. For example:

```
AIRFLOW__CORE__SQL_ALCHEMY_CONN_CMD=vault kv get -field=dsn secret/airflow-db
```

You can follow our guide on [integrating with Hashicorp Vault](https://astronomer.io/guides/airflow-and-hashicorp-vault) if you would like more direction on this.

## Setting Up the Scheduler

### Enable the service

Begin by running the following command on the machine which you wish to enable the scheduler:

```
sudo systemctl enable astronomer-certified@scheduler.service
```

The machine that will run the scheduler will need some slight configuration, as we have to run DB migrations somewhere, and it's best to only run them from one machine.

>Note: The above is not required, Airflow will not try to apply migrations more than once.

To set up this behavior,  we can edit the "override file" for this unit by running `sudo systemctl edit astronomer-certified@scheduler.service`. This will open an editor with an empty document, into which we place:

```
[Service]
ExecStartPre=/home/astro/airflow-venv/bin/airflow upgradedb
```

### Start the service

```
sudo systemctl start astronomer-certified@scheduler.service
```

## Setting Up the Webserver

### Enable the service

Begin by running the following command on the machine which you wish to enable the webserver:

```
sudo systemctl enable astronomer-certified@webserver.service
```

### Start the service

```
sudo systemctl start astronomer-certified@webserver.service
```

### Configuring a Reverse Proxy

For added security and stability, we recommend running the webserver behind a reverse proxy and load balancer such as [nginx](https://www.nginx.com/). If you would like to get that set up, you can [follow the Airflow guide on using a reverse proxy](https://airflow.apache.org/docs/stable/howto/run-behind-proxy.html).

## Setting Up the Worker Machines

### Enable the service

Begin by running the following command on the machine which you wish to enable the worker:

```
sudo systemctl enable astronomer-certified@worker.service
```

### Start the service

```
sudo systemctl start astronomer-certified@worker.service
```

## Deploying DAGs

Every machine running Airflow needs a copy of the DAG files, with all DAG files appearing in the same DAG folder (`/usr/local/airflow/` if you followed the earlier steps in this guide). There are many ways in which you can make this happen, but some popular options include:

- Baking DAGs into the docker image alongside Airflow.
- Via a job that refreshes the DAGs folder on a schedule ([this is how the folks at WePay do it](https://wecode.wepay.com/posts/airflow-wepay)).
- Via existing automation tools such as Ansible, Puppet or Chef. 
- Via making the DAGs live on a shared filesystem such as NFS (but be aware of read performance penalties - Airflow can be quite heavy on read-ops).

 Whatever you choose, it should align well with your internal development processes and you should leverage the tooling at your disposal (Ansible, Terraform, Git, etc) to automate as much as possible. If you're looking for a full-stack solution for DAG deployment, it's something we can help with via our commercial offerings here at Astronomer. [Get in touch](https://astronomer.io/contact) if you'd like to chat.

## Production Support

We’re now providing commercial support subscriptions for Apache Airflow via Astronomer Certified. These subscriptions are SLA-backed and give your tea access to our deep Airflow expertise through email and our support portal, where you can submit questions, feature requests, and bug reports. [Get in touch](https://astronomer.io/contact) if you would like to learn more.