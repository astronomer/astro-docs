---
title: "CLI Quickstart"
description: "Establish a local testing environment and deploy to Astronomer from your CLI."
date: 2019-10-29T00:00:00.000Z
slug: "cli-quickstart"
---

Astronomer's [open-source CLI](https://github.com/astronomer/astro-cli) is the easiest way to run Apache Airflow on your machine. 

From the CLI, you can establish a local testing environment and deploy to Astronomer whenever you're ready, whether Cloud or Enterprise.

## Pre-Requisites

To install the CLI, make sure you've installed:

- [Docker](https://www.docker.com/) (v18.09 or higher)

## Install

To install the latest version of our CLI, run:

```
$ curl -sSL https://install.astronomer.io | sudo bash
```

**Note:** The `curl` command will work for Unix (Linux+Mac) based systems. If you want to run on Windows 10, you'll need to run through [this guide](https://www.astronomer.io/docs/cli-installation-windows-10) on getting Docker for WSL working.

### Confirm the Install

Let's make sure that you have Astro CLI installed on your machine and have a project to work from.

```bash
$ astro
```

If you're set up properly, you should see the following:

```
astro is a command line interface for working with the Astronomer Platform.

Usage:
  astro [command]

Available Commands:
  auth            Manage astronomer identity
  cluster         Manage Astronomer EE clusters
  completion      Generate autocompletions script for the specified shell (bash or zsh)
  config          Manage astro project configurations
  deploy          Deploy an airflow project
  deployment      Manage airflow deployments
  dev             Manage airflow projects
  help            Help about any command
  upgrade         Check for newer version of Astronomer CLI
  user            Manage astronomer user
  version         Astronomer CLI version
  workspace       Manage Astronomer workspaces

Flags:
  -h, --help   help for astro

Use "astro [command] --help" for more information about a command.
```

For a breakdown of subcommands and corresponding descriptions, you can run: `astro help`

## Initialize an Airflow Project

To create initialize an Airflow project, do the following:

1. Create a new project directory on your machine and `cd` into it

```
$ mkdir <directory-name> && cd <directory-name>
```

2. Then, run:

```
$ astro dev init
```

This will generate some skeleton files:

```py
.
├── dags # Where your DAGs go
│   ├── example-dag.py # An example dag that comes with the initialized project
├── Dockerfile # For Astronomer's Docker image and runtime overrides
├── include # For any other files you'd like to include
├── packages.txt # For OS-level packages
├── plugins # For any custom or community Airflow plugins
└── requirements.txt # For any Python packages
```

These automatically generated and customizable files make up the "image" you'll eventually push to either your local development or to an Astronomer Cloud or Enterprise installation.

## Start Airflow

To spin up a local Airflow deployment on your machine, run:

```
$ astro dev start
```

This command will spin up 3 Docker containers on your machine, each for a different Airflow component:

- **Postgres:** [Airflow's Metadata Database](https://www.astronomer.io/docs/query-airflow-database/)
- **Webserver:** The Airflow component responsible for rendering the Airflow UI
- **Scheduler:** The Airflow component responsible for monitoring and triggering tasks

Once you've run `astro dev start`, you'll be able to access the following components locally:
                   
- Airflow Webserver: http://localhost:8080/admin/ (Credentials are `admin:admin` by default)
- Postgres Database: localhost:5432/postgres

> Note: The image will take some time to build the first time. After that, it will build from cached layers.

## Re-Build your Image

As you develop locally, you'll have to "re-build" your image to render changes depending on what files you're configuring.

### Code Changes

All changes made to the following files will be picked up automatically and render in the Airflow UI as soon as they're saved in your code editor:

- `dags`
- Custom hooks or operators in `plugins` (note: this does not include plugins built off of the stock `AirflowPlugin`)
- `include`

### Other Changes

In order for changes made to the rest of your files to render, you'll have to:

1. Stop your running Docker containers:

```
$ astro dev stop
```

2. Restart those Docker containers:

```
$ astro dev start
```

The files for which this is necessary include:

- `packages.txt`
- `Dockerfile`
- `requirements.txt`
- `airflow_settings.yaml`

## Access to the Airflow CLI

You're free to use native Airflow CLI commands with the Astro CLI when developing locally by wrapping them around docker commands.

Run `docker ps` after your image has been built to see a list of containers running. You should see 3: one for the Scheduler, Webserver, and Airflow Postgres.

### Adding a Connection

For example, an Airflow Connection can be added with:

```bash
docker exec -it SCHEDULER_CONTAINER bash -c "airflow connections -a --conn_id test_three  --conn_type ' ' --conn_login etl --conn_password pw --conn_extra {"account":"blah"}"
```

Refer to the native [Airflow CLI](https://airflow.apache.org/cli.html) for a list of all commands.

> Note: Direct access to the Airflow CLI is an Enterprise-only feature. If you're an Astronomer Cloud customer, you'll only be able to access it while developing locally for reasons related to the multi-tenant architecture of our Cloud. If you'd like to use a particular Airflow CLI command, reach out and we're happy to help you find a workaround.