---
title: "CLI Quickstart"
navTitle: "CLI Quickstart"
description: "Establish a local testing environment and deploy to Astronomer from the CLI."
---

## Overview

Astronomer's [open source CLI](https://github.com/astronomer/astro-cli) is the easiest way to run Apache Airflow on your machine.

From the CLI, both Astronomer and non-Astronomer users can create a local Apache Airflow instance with a dedicated Webserver, Scheduler and Postgres Database. Once you initialize a project on Astronomer, you can easily customize your image (e.g. add Python or OS-level packages, plugins etc.) and push that image to run on your local machine.

If you're an Astronomer user, you might use the Astronomer CLI to do the following:

- Authenticate to Astronomer
- List Astronomer Workspaces and Deployments you have access to
- Deploy to an Airflow Deployment on Astronomer
- Create Astronomer Service Accounts, Users and Deployments
- Append annotations to your Deployment's Pods (Enterprise only)

This guide will walk you through how to install the CLI, initialize an Astronomer project, and deploy to an Airflow instance on your local machine.

## Prerequisites

To install the CLI, make sure you've installed:

- [Docker](https://www.docker.com/) (v18.09 or higher)

## Step 1: Install the Astronomer CLI

There are two ways to install any version of the Astronomer CLI:

* Using [Homebrew](https://brew.sh/)
* Using a simple cURL command

> **Note:** Both methods only work for Unix (Linux+Mac) based systems. If you're running on Windows 10, follow [this guide](/docs/cloud/stable/develop/cli-install-windows-10/) to get set up with Docker for WSL.

### Install Using Homebrew

If you have Homebrew installed, run:

```sh
$ brew install astronomer/tap/astro
```

To install a specific version of the Astro CLI, you'll have to specify `@major.minor.patch`. To install v0.13.1, for example, run:

```sh
$ brew install astronomer/tap/astro@0.13.1
```

### Install Using cURL

To install the latest version of our CLI, run:

```
$ curl -sSL https://install.astronomer.io | sudo bash
```

To install a specific version of the Astro CLI, specify `-s -- major.minor.patch` as a flag at the end of the curl command. To install v0.13.1, for example, run:

```
$ curl -sSL https://install.astronomer.io | sudo bash -s -- v0.13.1
```

#### Note for MacOS Catalina Users:

As of macOS Catalina, Apple [replaced bash with ZSH](https://www.theverge.com/2019/6/4/18651872/apple-macos-catalina-zsh-bash-shell-replacement-features) as the default shell. Our CLI install cURL command currently presents an incompatibility error with ZSH, sudo and the pipe syntax.

If you're running macOS Catalina and beyond, do the following:

1. Run `sudo -K` to reset/un-authenticate
2. Run the following to install the CLI properly:

```
$ curl -sSL https://install.astronomer.io | sudo bash -s < /dev/null
```

## Step 2: Confirm the Install

To make sure that you have the Astro CLI installed on your machine and have a project to work from, run:

```bash
$ astro version
```

If the installation was successful, you should see the version of the CLI you installed in the output:

```
Astro CLI Version: 0.15.0
Git Commit: c4fdeda96501ac9b1f3526c97a1c5c9b3f890d71
```

For a breakdown of subcommands and corresponding descriptions, you can always run `$ astro` or `$ astro --help`.

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

## Step 3: Initialize an Airflow Project

Once the Astronomer CLI is installed, the next step is to initialize an Airflow project on Astronomer. Follow the guidelines below.

### a. Create a New Directory on Your Machine

To do this in a single command, run:

```
$ mkdir <directory-name> && cd <directory-name>
```

### b. Create the Necessary Project Files

Once you're in that project directory, run:

```
$ astro dev init
```

This will generate a collection of files within your directory:

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

These files make up the Docker image you'll then push to the Airflow instance on your local machine, or to a Deployment on Astronomer Cloud or Enterprise.

## Step 4: Start Airflow Locally

To spin up a local Airflow Deployment on your machine, run:

```
$ astro dev start
```

This command will spin up 3 Docker containers on your machine, each for a different Airflow component.

- **Postgres:** Airflow's Metadata Database
- **Webserver:** The Airflow component responsible for rendering the Airflow UI
- **Scheduler:** The Airflow component responsible for monitoring and triggering tasks

Run `docker ps` to verify that these containers were created. Once you've run `astro dev start`, you'll be able to access the following components locally:

- Airflow Webserver: http://localhost:8080/admin/ (Credentials are `admin:admin` by default)
- Postgres Database: localhost:5432/postgres

For guidelines on accessing your Postgres database both locally and on Astronomer, read [Access the Airflow Database](/docs/cloud/stable/customize-airflow/access-airflow-database/).

> **Note:** The image might take some time to build the first time. After that, it will build from cached layers.


## Step 5: Authenticate to Astronomer

To authenticate to Astronomer Cloud via the CLI, run:

```
$ astro auth login gcp0001.us-east4.astronomer.io
```

If you created your account with a username and password, you'll be prompted to enter them directly in your terminal. If you did so via OAuth (Google, GitHub, Okta, etc.), you'll be prompted to grab a temporary token from the Astronomer UI in your browser.

> **Note:** Once you run this command once, it should stay cached and allow you to just run `astro auth login` to authenticate more easily in the future.

If you do not yet have an account on Astronomer, ask your System Administrator for access, [start a new trial on Astronomer Cloud](/trial/), or [reach out to us](https://support.astronomer.io/hc/en-us).

## Next Steps: Apply Changes using the CLI

As you develop locally, it's worth noting that some changes made to your image are automatically applied, while other changes made to a certain set of files require rebuilding your image in order for them to render.

Read below for guidelines on both.

### Code Changes

All changes made to the following files will be picked up automatically:

- `dags`
- `plugins`
- `include`

Make sure to save changes in your code editor and refresh the Airflow Webserver in your browser to see them render.

### Other Changes

All changes made to the following files require rebuilding your image:

- `packages.txt`
- `Dockerfile`
- `requirements.txt`
- `airflow_settings.yaml`

This includes changing the Airflow image in your `Dockerfile`, adding Python Packages to `requirements.txt` or OS-level packages to `packages.txt`, etc. To rebuild your image, first run the following command:

```
$ astro dev stop
```

Then, restart the Docker containers by running:

```
$ astro dev start
```

## Additional Resources

For more information on our CLI specifically, feel free to reference:

* [CLI Release Changelog](https://github.com/astronomer/astro-cli/releases)
* [CLI README on GitHub](https://github.com/astronomer/astro-cli#astronomer-cli----)

## Beyond the CLI

Looking for additional next steps after installing the Astronomer CLI? We recommend reading through the following guides:

* [Deploying to Astronomer](/docs/cloud/stable/deploy/deploy-cli/)
* [Customizing Your Image](/docs/cloud/stable/develop/customize-image/)
* [Manage Airflow Versions](/docs/cloud/stable/customize-airflow/manage-airflow-versions/)
* [Deploy to Astronomer via CI/CD](/docs/cloud/stable/deploy/ci-cd/)

As always, don't hesitate to reach out to the [Astronomer Support Portal](https://support.astronomer.io/hc/en-us) or [Astronomer Forum](https://forum.astronomer.io/) for additional questions.
