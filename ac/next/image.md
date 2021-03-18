---
title: "Astronomer Core Image Architecture"
navTitle: "Image Architecture"
description: "A reference guide of every minimum package and process required to run Astronomer Core."
---

## Overview


## Environment Variables


| Variable | Description | Default Value |
|----------|-------------|---------------|
| AIRFLOW__CORE__EXECUTOR| The method used for executing airflow tasks| CeleryExecutor |
| AIRFLOW__CORE__SQL_ALCHEMY_CONN| The connection ID for your database | None |
| AIRFLOW__CELERY__RESULT_BACKEND|||
| AIRFLOW__CELERY__BROKER_URL|||
| AIRFLOW__CORE__FERNET_KEY|||
| AIRFLOW__CORE__DAGS_ARE_PAUSED_AT_CREATION|||
| AIRFLOW__CORE__LOAD_EXAMPLES| Determines whether example DAGs are loaded when staring Airflow | True |
| AIRFLOW_HOME | Filepath for your Airflow project directory | None |
| AIRFLOW__WEBSERVER__BASE_URL | The URL used to access the Airflow UI | None |


## Package Dependencies

By default,

"async,azure,amazon,celery,cncf.kubernetes,docker,dask,elasticsearch,ftp,google,grpc,hashicorp,http,ldap,google,microsoft.azure,mysql,password,postgres,redis,sendgrid,sftp,slack,ssh,statsd,virtualenv"
