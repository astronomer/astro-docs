---
title: "Astronomer Core Image Architecture"
navTitle: "Image Architecture"
description: "A reference guide of every minimum package and process required to run Astronomer Core."
---

## Overview


## Environment Variables

### Environment

| Variable | Description | Default Value |
|----------|-------------|---------------|
| AIRFLOW__CORE__EXECUTOR|||
| AIRFLOW__CORE__SQL_ALCHEMY_CONN|||
| AIRFLOW__CELERY__RESULT_BACKEND|||
| AIRFLOW__CELERY__BROKER_URL|||
| AIRFLOW__CORE__FERNET_KEY|||
| AIRFLOW__CORE__DAGS_ARE_PAUSED_AT_CREATION|||
| AIRFLOW__CORE__LOAD_EXAMPLES|||
| AIRFLOW__WEBSERVER__BASE_URL |||
| AIRFLOW__CORE__SQL_ALCHEMY_CONN_CMD|||

### Services


## Dependencies

By default,

"async,azure,amazon,celery,cncf.kubernetes,docker,dask,elasticsearch,ftp,google,grpc,hashicorp,http,ldap,google,microsoft.azure,mysql,password,postgres,redis,sendgrid,sftp,slack,ssh,statsd,virtualenv"
