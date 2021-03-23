---
title: "Astronomer Core Image Architecture"
navTitle: "Image Reference"
description: "A reference guide for the key components used to build Astronomer Core."
---

## Overview

The Astronomer Core image for Apache Airflow extends the community-developed Airflow image in a way that makes running Airflow more secure, reliable, and extensible.

Every part of the Astronomer Core image is available as [source code](https://github.com/astronomer/docker-airflow). This guide gives more in-depth explanations for some of the key components of the AC image.

## Versioning

For each release of Apache Airflow, Astronomer releases a corresponding version of Astronomer Core. If you install via Python wheel, the release name is defined in the following syntax:

```
astronomer-core[dependencies]==2.0.1.*
```

In this example, the `*` will pull the latest Astronomer Core patch release of Airflow 2.0.1. This version might include additional bug and security fixes not present in the corresponding open source version.

Astronomer Core's Docker image is defined in the following syntax:

```
quay.io/astronomer/docker-airflow:2.0.1-1-buster-onbuild
```

Astronomer maintains two Docker images for each version: one with an `onbuild` tag, and one without. If you plan on building additional dependencies and customizations into the image, we recommend pulling from the version without the `onbuild` tag.

## Environment Variables

When an Airflow service is started, it checks a file for runtime environment variables.

If you installed [Astronomer Core via Python wheel], this file is called `astronomer-core`. If you installed [Astronomer Core on Docker], Docker first checks your Dockerfile for environment variables. Environment variables in these files can be overwritten with a runtime command, such as `docker run`.

Astronomer Core supports the same environment variables as Apache Airflow. For a list of all configurable environment variables, read the [Apache Airflow documentation](https://airflow.apache.org/docs/apache-airflow/stable/configurations-ref.html).

The following table lists the essential environment variables used when running Airflow via Astronomer Core. These environment variables should always be reviewed or overridden when completing a new installation:

| Variable                                   | Description                                                        | Default Value                                     |
| ------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------- |
| AIRFLOW__CELERY__RESULT_BACKEND            | The Celery result backend (Celery Executor only).                  | db+postgresql://postgres:airflow@postgres/airflow |
| AIRFLOW__CELERY__BROKER_URL                | The URL for the DB message broker (Celery Executor only).          | redis://redis:6379/0                              |
| AIRFLOW__CORE__DAGS_ARE_PAUSED_AT_CREATION | Determines whether DAGs are paused by default at creation.         | True                                              |
| AIRFLOW__CORE__EXECUTOR                    | The method used for executing airflow tasks.                       | CeleryExecutor                                    |
| AIRFLOW__CORE__FERNET_KEY                  | The secret key for saving connection passwords in the metadata DB. | {FERNET_KEY}                                      |
| AIRFLOW__CORE__LOAD_EXAMPLES               | Determines whether example DAGs are loaded when starting Airflow.   | True                                              |
| AIRFLOW__CORE__SQL_ALCHEMY_CONN            | The connection ID for your metadata db.                            | sqlite:///{AIRFLOW_HOME}/airflow.db               |
| AIRFLOW_HOME                               | Filepath for your Airflow project directory.                       | ~/airflow                                         |
| AIRFLOW__WEBSERVER__BASE_URL               | The URL used to access the Airflow UI.                             | http://localhost:8080                             |

## Package Dependencies

By default, the Astronomer Core image includes provider packages that are utilized in some background processes, as well as packages which are commonly used by the community. The following list contains links to the Apache Airflow documentation for each default of Astronomer Core's default provider packages:

- [azure](https://airflow.apache.org/docs/apache-airflow-providers-microsoft-azure/stable/index.html)
- [amazon](https://airflow.apache.org/docs/apache-airflow-providers-amazon/stable/index.html)
- [celery](https://airflow.apache.org/docs/apache-airflow-providers-celery/stable/index.html)
- [cncf.kubernetes](https://airflow.apache.org/docs/apache-airflow-providers-cncf-kubernetes/stable/index.html)
- [docker](https://airflow.apache.org/docs/apache-airflow-providers-docker/stable/index.html)
- [elasticsearch](https://airflow.apache.org/docs/apache-airflow-providers-elasticsearch/stable/index.html)
- [ftp](https://airflow.apache.org/docs/apache-airflow-providers-ftp/stable/index.html)
- [google](https://airflow.apache.org/docs/apache-airflow-providers-google/stable/index.html)
- [grpc](https://airflow.apache.org/docs/apache-airflow-providers-grpc/stable/index.html)
- [hashicorp](https://airflow.apache.org/docs/apache-airflow-providers-hashicorp/stable/index.html)
- [http](https://airflow.apache.org/docs/apache-airflow-providers-http/stable/index.html)
- [mysql](https://airflow.apache.org/docs/apache-airflow-providers-microsoft-mssql/stable/index.html)
- [postgres](https://airflow.apache.org/docs/apache-airflow-providers-postgres/stable/index.html)
- [redis](https://airflow.apache.org/docs/apache-airflow-providers-redis/stable/index.html)
- [sendgrid](https://airflow.apache.org/docs/apache-airflow-providers-sendgrid/stable/index.html)
- [sftp](https://airflow.apache.org/docs/apache-airflow-providers-sftp/stable/index.html)
- [slack](https://airflow.apache.org/docs/apache-airflow-providers-slack/stable/index.html)
- [ssh](https://airflow.apache.org/docs/apache-airflow-providers-ssh/stable/index.html)

## Extras

Astronomer Core includes a few packages that do not have a corresponding provider. These packages are used for basic system functions or optional Airflow functionality. The following list contains all extra packages built into Astronomer Core by default:

- async: Provides asynchronous workers for Gunicorn
- dask: Adds support for the [Dask Executor](https://airflow.apache.org/docs/apache-airflow/stable/executor/dask.html)
- ldap: Adds support for LDAP authentication
- password: Adds support for user password hashing
- statsd: Adds support for sending metrics to StatsD
- virtualenv: Adds support for running Python tasks in local virtual environments
