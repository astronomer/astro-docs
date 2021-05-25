---
title: "Astronomer Certified Architecture"
navTitle: "Image Architecture"
description: "Reference documentation for every component used to build Astronomer Certified."
---

## Overview

The Astronomer Certified image for Apache Airflow extends the community-developed Airflow image in a way that makes running Airflow more secure, reliable, and extensible.

Every part of the Astronomer Certified image is available as [source code](https://github.com/astronomer/docker-airflow). This guide provides more in-depth explanations for the key components of the AC image.

## Distribution

The Astronomer Certified image is distributed both as a Python wheel and a Docker image. These distributions vary slightly in scope and dependencies.

The Python wheel is the "core" of Astronomer Certified. It is comprised of open source Airflow, plus bug fixes extend the support lifespan of each version.

The Astronomer Certified Docker image is built from the Python wheel. In addition to the Python wheel's bug fixes, the Docker image includes dependencies for increasing the security and extensibility of Airflow.

## Versioning

For each release of Apache Airflow, Astronomer releases a corresponding version of Astronomer Certified. For our Python wheel distribution, the release name is defined in the following syntax:

```
astronomer-Certified[dependencies]==2.0.1.*
```

In this example, the `*` will pull the latest Astronomer Certified patch release of Airflow 2.0.1. This version might include additional bug and security fixes not present in the corresponding open source version.

Astronomer Certified's Docker image is defined in the following syntax:

```
quay.io/astronomer/docker-airflow:2.0.1-1-buster-onbuild
```

Astronomer maintains two Docker images for each version: one with an `onbuild` tag, and one without. If you plan on building additional dependencies and customizations into the image, we recommend pulling from the version without the `onbuild` tag.

## Environment Variables

When an Airflow service is started, it checks a file for runtime environment variables.

If you installed [Astronomer Certified via Python wheel], this file is called `astronomer-Certified`. If you installed [Astronomer Certified on Docker], Docker first checks your Dockerfile for environment variables. Environment variables in these files can be overwritten with a runtime command, such as `docker run`.

Astronomer Certified supports the same environment variables as Apache Airflow. For a list of all configurable environment variables, read the [Apache Airflow documentation](https://airflow.apache.org/docs/apache-airflow/stable/configurations-ref.html).

The following table lists the essential environment variables used when running Airflow via Astronomer Certified. These environment variables should always be reviewed or overridden when completing a new installation:

| Variable                                        | Description                                                                   | Default Value                                     |
| ----------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------- |
| AIRFLOW**CELERY**RESULT_BACKEND                 | The Celery result backend (Celery Executor only).                             | db+postgresql://postgres:airflow@postgres/airflow |
| AIRFLOW**CELERY**BROKER_URL                     | The URL for the DB message broker (Celery Executor only).                     | redis://redis:6379/0                              |
| AIRFLOW**Certified**DAGS_ARE_PAUSED_AT_CREATION | Determines whether DAGs are paused by default at creation.                    | True                                              |
| AIRFLOW**Certified**EXECUTOR                    | The method used for executing airflow tasks.                                  | CeleryExecutor                                    |
| AIRFLOW**Certified**FERNET_KEY                  | The secret key for saving connection passwords in the metadata DB.            | {FERNET_KEY}                                      |
| AIRFLOW**Certified**LOAD_EXAMPLES               | Determines whether example DAGs are loaded when starting Airflow.             | True                                              |
| AIRFLOW**Certified**SQL_ALCHEMY_CONN            | The connection ID for your metadata db.                                       | sqlite:///{AIRFLOW_HOME}/airflow.db               |
| AIRFLOW_PIP_VERSION                             | The version of pip to use for installing Airflow and dependencies.            | 19.3.1                                            |
| AIRFLOW_HOME                                    | Filepath for your Airflow project directory.                                  | usr/local/airflow                                 |
| AIRFLOW**WEBSERVER**BASE_URL                    | The URL used to access the Airflow UI.                                        | http://localhost:8080                             |
| ASTRONOMER_USER                                 | The username for your Airflow user.                                           | astro                                             |
| ASTRONOMER_UID                                  | The ID for your Airflow user.                                                 | 5000                                              |
| PIP_NO_CACHE_DIR                                | Specifies whether to maintain copies of source files when installing via pip. | True                                              |
| PYTHON_MAJOR_MINOR_VERSION                      | The version of Python to use for Airflow.                                     | 3.7                                               |

## Provider Packages

By default, the Astronomer Certified image includes provider packages that are utilized in some background processes, as well as packages which are commonly used by the Airflow community. The following list contains links to the Apache Airflow documentation for each default of Astronomer Certified's default provider packages:

| Astronomer Certified | [amazon](https://airflow.apache.org/docs/apache-airflow-providers-amazon/stable/index.html) |[azure](https://airflow.apache.org/docs/apache-airflow-providers-microsoft-azure/stable/index.html) | [celery](https://airflow.apache.org/docs/apache-airflow-providers-celery/stable/index.html) | [cncf.kubernetes](https://airflow.apache.org/docs/apache-airflow-providers-cncf-kubernetes/stable/index.html) | [elasticsearch](https://airflow.apache.org/docs/apache-airflow-providers-elasticsearch/stable/index.html) | [ftp](https://airflow.apache.org/docs/apache-airflow-providers-ftp/stable/index.html) | [google](https://airflow.apache.org/docs/apache-airflow-providers-google/stable/index.html) |   [http](https://airflow.apache.org/docs/apache-airflow-providers-http/stable/index.html) |[imap](https://airflow.apache.org/docs/apache-airflow-providers-imap/stable/index.html) | [mysql](https://airflow.apache.org/docs/apache-airflow-providers-microsoft-mssql/stable/index.html) | [postgres](https://airflow.apache.org/docs/apache-airflow-providers-postgres/stable/index.html) | [redis](https://airflow.apache.org/docs/apache-airflow-providers-redis/stable/index.html) | [slack](https://airflow.apache.org/docs/apache-airflow-providers-slack/stable/index.html) | [sqlite](https://airflow.apache.org/docs/apache-airflow-providers-sqlite/stable/index.html) | [ssh](https://airflow.apache.org/docs/apache-airflow-providers-ssh/stable/index.html) |
| -------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
|**1.10.10**|1.0.0|1.1.0|1.0.0|1.0.1|1.0.4|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|
|**1.10.12**|1.0.0|1.1.0|1.0.0|1.0.1|1.0.4|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|
|**1.10.14**|1.0.0|1.1.0|1.0.0|1.0.1|1.0.4|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|
|**1.10.15**|1.0.0|1.1.0|1.0.0|1.0.1|1.0.4|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|
|**1.10.7**|1.0.0|1.1.0|1.0.0|1.0.1|1.0.4|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|
|**2.0.0**|1.0.0|1.1.0|1.0.0|1.0.1|1.0.4|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|1.0.0|
|**2.0.2**|1.3.0|1.3.0|1.0.1|1.2.0|1.0.4|1.0.1|2.2.0|1.1.1|1.0.1|1.1.0|1.0.1|1.0.1|3.0.0|1.0.2|1.3.0|
|**2.1.0**|1.3.0|1.3.0|1.0.1|1.2.0|1.0.4|1.0.1|2.2.0|1.1.1|1.0.1|1.1.0|1.0.1|1.0.1|3.0.0|1.0.2|1.3.0|

## System Dependencies

The Astronomer Certified Docker image includes a number of OS-level dependencies for running basic system processes. These dependencies can be installed in the Python Wheel as described in [Install Dependencies].

- [apt-utils](https://packages.debian.org/buster/apt-utils)
- [build-essential](https://packages.debian.org/buster/build-essential)
- [curl](https://packages.debian.org/buster/curl)
- [build-essential](https://packages.debian.org/buster/build-essential)
- [default-libmysqlclient-dev](https://packages.debian.org/buster/default-libmysqlclient-dev)
- [libmariadb3](https://packages.debian.org/buster/libmariadb3)
- [freetds-bin](https://packages.debian.org/buster/freetds-bin)
- [gosu](https://packages.debian.org/buster/gosu)
- [libffi6](https://packages.debian.org/buster/libffi6)
- [libffi-dev](https://packages.debian.org/buster/libffi-dev)
- [libkrb5-3](https://packages.debian.org/buster/libkrb5-3)
- [libkrb5-dev](https://packages.debian.org/buster/libkrb5-dev)
- [libpq5](https://packages.debian.org/buster/libpq5)
- [libpq-dev](https://packages.debian.org/buster/libpq-dev)
- [libsasl2-2](https://packages.debian.org/buster/libsasl2-2)
- [libsasl2-dev](https://packages.debian.org/buster/libsasl2-dev)
- [libsasl2-modules](https://packages.debian.org/buster/libsasl2-modules)
- [libssl1.1](https://packages.debian.org/buster/libssl1.1)
- [libssl-dev](https://packages.debian.org/buster/libssl-dev)
- [locales](https://packages.debian.org/buster/locales)
- [netcat](https://packages.debian.org/buster/netcat)
- [rsync](https://packages.debian.org/buster/rsync)
- [sasl2-bin](https://packages.debian.org/buster/sasl2-bin)
- [sudo](https://packages.debian.org/buster/sudo)
- [tini](https://packages.debian.org/buster/tini)

## Extras

Astronomer Certified includes a few packages that do not have a corresponding provider. These packages are used for basic system functions or optional Airflow functionality. The following list contains all extra packages built into Astronomer Certified by default:

- async: Provides asynchronous workers for Gunicorn
- dask: Adds support for the [Dask Executor](https://airflow.apache.org/docs/apache-airflow/stable/executor/dask.html)
- ldap: Adds support for LDAP authentication
- password: Adds support for user password hashing
- statsd: Adds support for sending metrics to StatsD
- virtualenv: Adds support for running Python tasks in local virtual environments
