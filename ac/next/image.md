---
title: "Astronomer Core Image Architecture"
navTitle: "Image Architecture"
description: "A reference guide of every minimum package and process required to run Astronomer Core."
---

## Overview

The Astronomer Core image for Apache Airflow extends the community-developed Airflow image in a way that makes running Airfow more secure, reliable, and extensible.

Every part of the Astronomer Core image is available as [source code](https://github.com/astronomer/docker-airflow). This guide gives more in-depth explanations for some of the key components of the AC image.

## Environment Variables

When an Airflow service is started, it checks a file for runtime environment variables. If you installed [Astronomer Core via Python wheel], this file is called `astronomer-core`.

If you installed [Astronomer Core on Docker], Docker first checks your Dockerfile for environment variables, then any variables defined in a `docker run` command.

The following environment variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| AIRFLOW__CORE__EXECUTOR| The method used for executing airflow tasks| CeleryExecutor |
| AIRFLOW__CORE__SQL_ALCHEMY_CONN| The connection ID for your metadata db | sqlite:///{AIRFLOW_HOME}/airflow.db |
| AIRFLOW__CELERY__RESULT_BACKEND| The Celery result backend | db+postgresql://postgres:airflow@postgres/airflow|
| AIRFLOW__CELERY__BROKER_URL| The URL for the DB message broker | redis://redis:6379/0|
| AIRFLOW__CORE__FERNET_KEY| The secret key for saving connection passwords in the metadata DB | {FERNET_KEY} |
| AIRFLOW__CORE__DAGS_ARE_PAUSED_AT_CREATION| Determines whether DAGs are paused by default at creation | True |
| AIRFLOW__CORE__LOAD_EXAMPLES| Determines whether example DAGs are loaded when staring Airflow | True |
| AIRFLOW_HOME | Filepath for your Airflow project directory | ~/airflow |
| AIRFLOW__WEBSERVER__BASE_URL | The URL used to access the Airflow UI | http://localhost:8080 |


## Package Dependencies

The AC image comes packaged with dependencies that are utilized in some background processes, as well as provided for use by the community.

"async,azure,amazon,celery,cncf.kubernetes,docker,dask,elasticsearch,ftp,google,grpc,hashicorp,http,ldap,google,microsoft.azure,mysql,password,postgres,redis,sendgrid,sftp,slack,ssh,statsd,virtualenv"

## Astronomer FAB Security Manager

One significant difference between AC's Airflow image
