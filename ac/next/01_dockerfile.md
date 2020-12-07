---
title: "Astronomer Core Docker Images"
navtitle: "Docker Images"
description: "Docker Images for Astronomer Core."
---

## Astronomer Core Docker Images

We publish Docker images for our supported Airflow version to [Quay.io](https://quay.io/repository/astronomer/core?tab=tags)

1. `astronomerinc/ap-airflow:2.0.0-1-buster`
2. `astronomerinc/ap-airflow:2.0.0-1-buster-onbuild`

The difference between them is that the `-onbuild` images uses Docker `ONBUILD` commands to
copy `packages.txt`, `requirements.txt` and the entire project directory (including `dags`,
`plugins` folders etc) in the Docker file.

For each of our `-onbuild` images we publish two flavors of tag:

1. `astronomer/core:2.0.0-buster-onbuild` which is our latest release of the `2.0.0` series,
including latest security patches. This tag is "floating" or movable.
2. `astronomer/core:2.0.0-1-buster-onbuild` once this tag is pushed it will never change again.

### Details

* ARG:
  * `PYTHON_BASE_IMAGE="python:3.7-slim"`
  * `ARG ASTRONOMER_USER="astro"`
  * `ARG ASTRONOMER_UID="50000"`
  * `ORG="astronomer"`

* LABEL:
  * `io.astronomer.docker=true`
  * `io.astronomer.docker.distro="debian"`
  * `io.astronomer.docker.module="airflow"`
  * `io.astronomer.docker.component="airflow"`
  * `io.astronomer.docker.uid="${ASTRONOMER_UID}"`

* ENV:
 * `AIRFLOW_HOME="/usr/local/airflow"`
 * `PYTHONPATH=${PYTHONPATH:+${PYTHONPATH}:}${AIRFLOW_HOME}`
 * `ENV ASTRONOMER_USER=${ASTRONOMER_USER}`
 * `ENV ASTRONOMER_UID=${ASTRONOMER_UID}`

* apt-get install:
  * `apt-utils`
  * `curl`
  * `libmariadb3`
  * `freetds-bin`
  * `gosu`
  * `libffi6`
  * `libkrb5-3`
  * `libpq5`
  * `libsasl2-2`
  * `libsasl2-modules`
  * `libssl1.1`
  * `locales`
  * `netcat`
  * `rsync`
  * `sasl2-bin`
  * `sudo`
  * `tini`

```
RUN useradd --uid $ASTRONOMER_UID --create-home ${ASTRONOMER_USER} \
    && groupadd astrogroup --gid 101 \
    && usermod --append --groups astrogroup ${ASTRONOMER_USER}
```

### From the airflow image on master

```
#################################################################
######## Installed dependencies - now installing Airflow ########
#################################################################

FROM ${APT_DEPS_IMAGE} as devel
SHELL ["/bin/bash", "-o", "pipefail", "-e", "-u", "-x", "-c"]

ENV PIP_NO_CACHE_DIR="true"

RUN apt-get update \
    && curl -sL https://deb.nodesource.com/setup_13.x | sudo bash - \
    && apt-get install -y --no-install-recommends \
        build-essential \
        default-libmysqlclient-dev \
        libffi-dev \
        libkrb5-dev \
        libpq-dev \
        libsasl2-dev \
        libssl-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

ARG VERSION="2.0.0-1.*"
ARG SUBMODULES="async,azure,aws,celery,elasticsearch,gcp,password,kubernetes,mysql,postgres,redis,slack,ssh,statsd,virtualenv"
ARG AIRFLOW_MODULE="astronomer_certified[${SUBMODULES}]==$VERSION"
ARG AIRFLOW_VERSION="2.0.0"
```

* Additional labels:
  * `io.astronomer.docker.airflow.version="${AIRFLOW_VERSION}"`
  * `io.astronomer.docker.ac.version="${VERSION}"`

* Addtional pip installs:
  * `apache-airflow-providers-elasticsearch`
  * `astronomer-airflow-scripts`
  * `astronomer-fab-security-manager`


### Startup

```
RUN sed -i \
    # Run pods spun up by Kubernetes Executor as astro user
    -e 's/^run_as_user =.*/run_as_user = 50000/g' \
    # Needed by astronomer-version-check-plugin
    -e 's/^lazy_load_plugins =.*/lazy_load_plugins = False/g' \
    # We sync permissions in the entrypoint so do not need to run in the Webserver again
    -e 's/^update_fab_perms =.*/update_fab_perms = False/g' \
    # Use Auth Backend defined in Astronomer FAB Security Manager
    -e 's/^auth_backend =.*/auth_backend = astronomer.flask_appbuilder.current_user_backend/g' \
    /usr/local/lib/python3.7/site-packages/airflow/config_templates/default_airflow.cfg

# Create logs directory, so we can own it when we mount volumes
RUN install --directory --owner="${ASTRONOMER_USER}" "${AIRFLOW_HOME}" \
    && install --directory --owner="${ASTRONOMER_USER}" "${AIRFLOW_HOME}/logs"

# Copy entrypoint to root
COPY include/entrypoint /

# Copy "cron" scripts
COPY include/clean-airflow-logs /usr/local/bin/clean-airflow-logs

# Set it up so that _apt/UID 100 can `gosu`, but no other users can
RUN groupadd gosuers \
    && usermod --append --groups gosuers _apt \
    && chgrp gosuers /usr/sbin/gosu \
    && chmod u+s,g+sx,o-rx /usr/sbin/gosu

# Create man directory to solve issues installing JRE
RUN mkdir -pv /usr/share/man/man1 && mkdir -pv /usr/share/man/man7

# Though this is set here we currently override this in the helm template, so
# this _might_ not have any effect once deployed. The /entrypoint script copes
# with this
USER ${ASTRONOMER_USER}

# Switch to AIRFLOW_HOME
WORKDIR ${AIRFLOW_HOME}

ENTRYPOINT ["/entrypoint"]
CMD ["airflow", "--help"]
```

### Entrypoint script

```
#!/usr/bin/env bash
set -e

if [[ $UID == "${ASTRONOMER_UID:-1000}" ]]; then
  # Since we need to support running tini as another user, we can't put tini in
  # the ENTRYPOINT command, we have to run it here, if we haven't already
  if [[ -z "$__TINIFIED" ]]; then
    __TINIFIED=1 exec tini -- "$0" "$@"
  fi
else
  __TINIFIED=1 exec gosu "${ASTRONOMER_USER}" tini -- "$0" "$@"
fi

if [[ -n "$EXECUTOR" && -z "$AIRFLOW__CORE__EXECUTOR" ]]; then
  # Support for puckle style of defining configs
  export AIRFLOW__CORE__EXECUTOR "${EXECUTOR}Executor"
fi

# Airflow subcommand
CMD=$2

url_parse_regex="[^:]+://([^@/]*@)?([^/:]*):?([0-9]*)/?"

# Wait for postgres then init the db
if [[ -n $AIRFLOW__CORE__SQL_ALCHEMY_CONN  ]]; then
  # Wait for database port to open up
  [[ ${AIRFLOW__CORE__SQL_ALCHEMY_CONN} =~ $url_parse_regex ]]
  HOST=${BASH_REMATCH[2]}
  PORT=${BASH_REMATCH[3]}
  echo "Waiting for host: ${HOST} ${PORT}"
  while ! nc -w 1 -z "${HOST}" "${PORT}"; do
    sleep 0.001
  done
fi

if [[ -n $AIRFLOW__CELERY__BROKER_URL ]] && [[ $CMD =~ ^(scheduler|celery worker|celery flower)$ ]]; then
  # Wait for database port to open up
  [[ ${AIRFLOW__CELERY__BROKER_URL} =~ $url_parse_regex ]]
  HOST=${BASH_REMATCH[2]}
  PORT=${BASH_REMATCH[3]}
  echo "Waiting for host: ${HOST} ${PORT}"
  while ! nc -w 1 -z "${HOST}" "${PORT}"; do
    sleep 0.001
  done
fi

if [[ $CMD == "webserver" ]]; then
  airflow sync-perm
fi

# Run the original command
exec "$@"
```
