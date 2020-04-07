---
title: "Getting started with Astro CLI"
description: "Get started deploying DAGs and running Airflow locally with the Astronomer CLI."
link: "Getting started"
date: 2018-10-12T00:00:00.000Z
slug: "cli-getting-started"
---

If you've gotten the Astro CLI installed and want to get ready to push DAGs, you're in the right place. Read below for some starter guidelines.

## I. Confirm the Install & Create a Project

Let's make sure you have Astro CLI installed on your machine, and that you have a project to work from.

### Confirm the Install worked

Open a terminal and run:

```bash
astro
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

### Create a project

Your first step is to create a project to work from that lives in a folder on your local machine. The command you'll need is listed below, with an example `hello-astro` project.

 ```
mkdir hello-astro && cd hello-astro
astro dev init
 ```

`astro dev init` will build a base image from Astronomer's fork of Apache-Airflow using Alpine Linux. The build process will include everything in your project directory, which makes it easy to include any shell scripts, static files, or anything else you want to include in your code.

Once that command is run, you'll see the following skeleton project generated:

```py
.
├── dags #Where your DAGs go
│   ├── example-dag.py
├── Dockerfile #For runtime overrides
├── include #For any other files you'd like to include
├── packages.txt #For OS-level packages
├── plugins #For any custom or community Airflow plugins
└── requirements.txt #For any python packages
```

Our image also comes with an `example_dag` (with 12 branching tasks) that you're free to play around with.

**Note:** The image will take some time to build the first time. Right now, you have to rebuild the image each time you want to add an additional package or requirement.


## II. Getting Started

Now that you have a project up, we'll need to make sure you're properly authenticated to your Astronomer workspace and deployment. To do so, follow the steps below.

### Logging in from the CLI

To make sure you're authenticated, run the following:

```
astro auth login gcp0001.us-east4.astronomer.io
```

**Note:** If you don't already have an account on our platform, running this command will automatically create one for you (and a default workspace as well) based on the name associated with your Google email address).

If do already have an account on our app (app.gcp0001.us-east4.astronomer.io), then press enter when you see something like:

```
 "Paolas-MBP-2:hello-astro paola$ astro auth login gcp0001.us-east4.astronomer.io
 CLUSTER                             WORKSPACE                           
gcp0001.us-east4.astronomer.io                    4a6cb370-c361-440d-b02b-c90b07ef15f6

 Switched cluster
Username (leave blank for oAuth):
```

Once you press enter, you’ll be prompted to go back into our UI to this link: https://app.gcp0001.us-east4.astronomer.io/token

Grab that token, paste it back into your command line, and you’re good to go. Your success message should read:

```
Successfully authenticated to registry.astronomer.cloud
```

### Navigating Workspaces

Once logged in, you'll want to know how to navigate your existing workspaces. To pull a list of workspaces you're a part of, run:

```
astro workspace list
```

You should see a list of 1 or more workspaces in the output. To “pick” one, run our switch command followed by the corresponding ID (no syntax needed around the ID):

```
astro workspace switch <workspace UUID>
```

### Spinning up Airflow

Once you have a project to run on, you might want to spin up a local instance of Apache Airflow to develop on before pushing anything to a live deployment.

To do so, run the following command:

```
astro dev start
```

This will create a local instance of Airflow (running at localhost:8080 on your computer) to which you can push up code.


### Navigating Deployments

If you haven't created a deployment via the UI (recommended), you can do so via Astro CLI.

#### Creating a deployment via Astro CLI

To create a deployment directly from our CLI, run:

`astro deployment create <deployment name>`

**Note:** The language here is a bit misleading. `deployment name` here is your workspace ID (that you pulled above), NOT the name of your new deployment (which doesn’t exist yet).

Once your webserver, scheduler, and celery flower are up, you should see the following success message and URLs:

```
Successfully created deployment. Deployment can be accessed at the following URLs

 Airflow Dashboard: https://popular-orbit-2745-airflow.
 Flower Dashboard: https://popular-orbit-2745-flower.astronomer.cloud
```

#### Listing your Deployments

To pull a list of deployments you're authorized to push to, run:

```
astro deployment list
```

To “pick” a deployment to push up a DAG to (a bit different than picking a workspace), just run:

```
astro dev deploy
```

This command will return a list of deployments available in that workspace, and prompt you to pick one.

```
 #    RELEASE NAME                  WORKSPACE                     DEPLOYMENT UUID                                   
 1    false-wavelength-5456         Paola Peraza Calderon's Workspace90b3dc76-2022-4e0f-9bac-74a03d0dffa7
 ````

## III. CLI Debugging

### Error on Building Image

If your image  is failing to build after running `astro dev start`?

 - You might be getting an error message in your console, or finding that Airflow is not accessible on `localhost:8080/admin`
 - If so, you're likely missing OS-level packages in `packages.txt` that are needed for any python packages specified in `requirements.text`

### Adding Packages & Requirements

If you're not sure what `packages` and `requirements` you need for your use case, check out these examples:

 - [Snowflake](https://github.com/astronomer/airflow-guides/tree/master/example_code/snowflake)
 - [Google Cloud](https://github.com/astronomer/airflow-guides/tree/master/example_code/gcp)

If image size isn't a concern, feel free to "throw the kitchen sink at it" with this list of packages:

```
libc-dev
musl
libc6-compat
gcc
python3-dev
build-base
gfortran
freetype-dev
libpng-dev
openblas-dev
g++
make
musl-dev
```

Additional [RUN](https://docs.docker.com/engine/reference/builder/#run)
commands can be added to the `Dockerfile`. Environment variables can also be
added to [ENV](https://docs.docker.com/engine/reference/builder/#env).

### Logs & Docker Containers

The Astronomer CLI runs docker-compose under the hood (and uses [this template](https://github.com/astronomer/astro-cli/blob/master/airflow/include/composeyml.go) to start up). Since everything is hidden away in Docker containers, you won't see webserver and scheduler logs in the terminal by default.

To see scheduler logs on your local docker container, run:

```
docker logs $(docker ps | grep scheduler | awk '{print $1}')
```

For Webserver logs, replace `scheduler` with `webserver` in the command above.

As for generally interacting with Docker containers, you can access them by running the following:

```
`docker exec -it {CONTAINER_ID} bash`
```

**Note**: For security reasons, you'll only be able to do so while developing locally.



## IV. CLI Help Commands

The CLI includes a help command, descriptions, as well as usage info for subcommands.

To see the help overview:

```
astro help
```

Or for subcommands:

```
astro dev --help
```

```
astro dev deploy --help
```

## V. Access to the Airflow CLI

You're free to use native Airflow CLI commands with the Astro CLI when developing locally by wrapping them around docker commands.

Run `docker ps` after your image has been built to see a list of containers running. You should see one for the scheduler, webserver, and Postgres.

For example, a connection can be added with:

```bash
docker exec -it SCHEDULER_CONTAINER bash -c "airflow connections -a --conn_id test_three  --conn_type ' ' --conn_login etl --conn_password pw --conn_extra {"account":"blah"}"
```

Refer to the native [Airflow CLI](https://airflow.apache.org/cli.html) for a list of all commands.

**Note:** Direct access to the Airflow CLI is an Enterprise-only feature. If you're an Astronomer Cloud customer, you'll only be able to access it while developing locally for reasons related to the multi-tenant architecture of our Cloud. If you'd like to use a particular Airflow CLI command, reach out and we're happy to help you find a workaround.

## VI. Adding Environment Variables

Astronomer makes it easier to inject Environment Variables. Depending on what version of our CLI you're running, check out the guidelines below.

### On Astronomer v0.7.5 (Current for Cloud)

If you're developing locally on Astronomer v0.7.5, you can add Environment Variables directly to your Dockerfile as seen below:

```
ENV ADMIN_USER="mark"
```

### On Astronomer v0.8 (Current for Enterprise)

Astronomer v0.8's CLI comes with the ability to  bring in Environment Variables from a specified file by running `astro dev start` with an `--env` flag as seen below:

```
astro dev start --env .env
```

**Note**: Whatever `.env` you use locally will not be bundled up when you deploy to Astronomer. To add Environment Variables when you deploy to Astronomer, you'll have to add them via the Astronomer UI (`Deployment` > `Configure` > `Environment Vars`).

**Some Guidelines:**

1. First, throw your environment variables of choice in an `.env` file.

2. Airflow configuration variables found in [`airflow.cfg`](https://github.com/apache/incubator-airflow/blob/master/airflow/config_templates/default_airflow.cfg) can be overwritten with the following format:

```
AIRFLOW__SECTION__PARAMETER=VALUE
```
For example, setting `max_active_runs` to 3 would look like:

```
AIRFLOW__CORE__MAX_ACTIVE_RUNS=3
```

3. Make sure your configuration names match up with the version of Airflow you're using.

4. The CLI will look for `.env` by default, but if you have different settings you need to toggle between and want to specify multiple .env files, you can do following:

```
my_project
  ├── .astro
  └──  dags
    └── my_dag
  ├── plugins
    └── my_plugin
  ├── .env
  ├── dev.env
  └── prod.env
```

 5. On `astro dev start`, just specify which file to use (if not `.env`) with the `--env` or `-e` flag.

 ```
 astro dev start --env dev.env
 astro dev start -e prod.env
 ```

## VII. Advanced Dockerfile Configuration

Beyond pure Environment Variables, you can add additional custom scripts or configurations that you want to bring into the image by adding them to your Dockerfile.

For example, Any bash scripts you want to run as `sudo` when the image builds can be added as such:

```
RUN echo 'This is a cool feature!'
```

These commands should go after the `FROM` line that pulls down the Airflow image.
