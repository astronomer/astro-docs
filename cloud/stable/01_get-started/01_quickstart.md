---
title: "Cloud Quickstart"
navTitle: "Quickstart"
description: "Get started with Astronomer Cloud."
---

Welcome to Astronomer.

This guide will help you kick off your trial on Astronomer by walking you through a sample DAG deployment from start to finish.

Whether you're exploring our Enterprise or Cloud offering, we've designed this to be a great way to get to know our platform.

## Start Trial

If you haven't already, start a free 14-day trial by [reaching out to us here](/get-astronomer?ref=docs).

Once you've been in touch with our team, you'll be invited to create an account on Astronomer Cloud via email. The email you receive will be sent from `noreply@astronomer.io` with the subject line **Your Astronomer Invitation**.

![Email Invite to Astronomer](https://assets2.astronomer.io/main/docs/getting-started/email-invite.png)

> **Note:** If you're expecting an invitation email and don't receive one or you have trouble with **Accept Invitation**, [reach out to us](https://support.astronomer.io).

### Create an Account

Once you accept your invitation via email, you'll be taken to a webpage that will prompt you to create an account on Astronomer Cloud. You can sign up with Google, GitHub, or via a username/password combination of your choosing.

![Create an Account on Astronomer](https://assets2.astronomer.io/main/docs/getting-started/create-account.png)

This is how you'll log into both the Astronomer UI and the CLI in the future. 

> **Note:** Once you've created an account on Astronomer Cloud, you will NOT be able to change your method of authorization.

### Create a Workspace

If you're the first person on your team to sign up for Astronomer, create a Workspace to officially begin your 14-day trial.

![Create an Workspace on Astronomer](https://assets2.astronomer.io/main/docs/getting-started/create-workspace.png)

You can think of Workspaces the same way you'd think of teams - a space that specific user groups have access to with varying levels of permissions. From within a Workspace you can create one or more Airflow Deployments, each of which hosts a collection of DAGs.

For more information, refer to [Manage Workspaces and Deployments](/docs/cloud/stable/deploy/manage-workspaces/).

#### Join a Workspace

If you're new to Astronomer Cloud but someone else on your team has an existing Workspace you'd like to join, a _Workspace Admin_ can invite you to it.

Once you receive a Workspace invitation via email, accept the invitation and create an account by following the guidelines above. Once you're a member of a Workspace, you can be granted varying levels of access to the Airflow Deployment(s) within that Workspace by _Deployment Admins_.

For more information on user roles and permissions, refer to ["Manage User Permissions on Astronomer Cloud"](/docs/cloud/stable/manage-astronomer/workspace-permissions/). 

## Start with the Astronomer CLI

The [Astronomer CLI](https://github.com/astronomer/astro-cli) is the easiest way to run Apache Airflow on your machine. From the CLI, you can establish a local testing environment and deploy to Astronomer Cloud whenever you're ready.

### Install

#### Prerequisites

To get started, make sure you've already installed [Docker](https://www.docker.com/) (v18.09 or higher).

#### Install

To install the latest version of the Astronomer CLI via cURL, run:

```bash
$ curl -ssl https://install.astronomer.io | sudo bash
```

To install via [Homebrew](https://brew.sh/), run:

```bash
$ brew install astronomer/tap/astro
```

For more on the Astronomer CLI, refer to ["CLI Quickstart"](https://www.astronomer.io/docs/cloud/stable/develop/cli-quickstart).

> **Note:** If you're running on Windows, check out our [Windows Install Guide](/docs/cloud/stable/develop/cli-install-windows-10/).

### Initialize an Airflow Project

Create a new project directory on your machine and `cd` into it. This is what you should check into your version control tool and will be where you'll store all files necessary to build and deploy your Airflow image.

```
$ mkdir <directory-name> && cd <directory-name>
```

Once you're in that project directory, run:

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
├── plugins # For any custom or community Airflow plugins
├──airflow_settings.yaml #For your Airflow Connections, Variables and Pools (local only)
├──packages.txt # For OS-level packages
└── requirements.txt # For any Python packages
```

#### Dockerfile

Your Dockerfile will include reference to an Astronomer Certified Docker Image. [Astronomer Certified](https://www.astronomer.io/downloads/) (AC) is a Debian-based, production-ready distribution of Apache Airflow that mirrors the open source project and undergoes additional levels of rigorous testing conducted by our team. 

This Docker image is hosted on [Astronomer's Docker Registry](https://quay.io/repository/astronomer/ap-airflow?tab=tags) and allows you to run Airflow on Astronomer. Additionally, the image you include in your Dockerfile dictates the version of Airflow you'd like to run both when you're developing locally and pushing up to Astronomer Cloud.

The Docker image you'll find by default in your Dockerfile is:

```
FROM quay.io/astronomer/ap-airflow:latest-onbuild
```

This will install a Debian-based AC image for the latest version of Airflow we support. To specify a particular Airflow version, refer to ["Manage Airflow Versions"](https://www.astronomer.io/docs/cloud/stable/customize-airflow/manage-airflow-versions) or refer to the "Customize your Image" section below.

#### Example DAG

To help you get started, your initialized project will come with an "Example DAG" in `/dags` by default. The DAG itself simply prints today's date, but it'll give you a chance to get accustomed to our deployment flow.

If you'd like to deploy some more functional example DAGs, upload your own or check out [example DAGs we've open sourced](https://github.com/airflow-plugins/example-dags).

## Develop Locally

With those files in place, you're ready to push your Airflow image to your local Airflow environment.

### Start Airflow

First, run:

```
$ astro dev start
```

This command will spin up 3 Docker containers on your machine, each for a different Airflow component:

- **Postgres:** [Airflow's Metadata Database](/docs/cloud/stable/customize-airflow/access-airflow-database/)
- **Webserver:** The Airflow component responsible for rendering the Airflow UI
- **Scheduler:** The Airflow component responsible for monitoring and triggering tasks

You should see the following output:

```
$ astro dev start
Env file ".env" found. Loading...
Sending build context to Docker daemon  10.75kB
Step 1/1 : FROM quay.io/astronomer/ap-airflow:latest-onbuild
# Executing 5 build triggers
 ---> Using cache
 ---> Using cache
 ---> Using cache
 ---> Using cache
 ---> Using cache
 ---> 5160cfd00623
Successfully built 5160cfd00623
Successfully tagged astro-trial_705330/airflow:latest
INFO[0000] [0/3] [postgres]: Starting
INFO[0002] [1/3] [postgres]: Started
INFO[0002] [1/3] [scheduler]: Starting
INFO[0003] [2/3] [scheduler]: Started
INFO[0003] [2/3] [webserver]: Starting
INFO[0004] [3/3] [webserver]: Started
Airflow Webserver: http://localhost:8080
Postgres Database: localhost:5432/postgres
The default credentials are admin:admin
```

> **Note:** If you’re running the Astronomer CLI with the [buildkit](https://docs.docker.com/develop/develop-images/build_enhancements/) feature enabled in Docker, you may see an error (`buildkit not supported by daemon
`). Learn more in [this forum post](https://forum.astronomer.io/t/buildkit-not-supported-by-daemon-error-command-docker-build-t-airflow-astro-bcb837-airflow-latest-failed-failed-to-execute-cmd-exit-status-1/857).

#### Verify Docker Containers

To verify that all 3 Docker containers were created, run:

```
$ docker ps
```

> **Note**: Running `$ astro dev start` will by default start your project with the Airflow Webserver exposed at port 8080 and Postgres exposed at port 5432.
>
> If you already have either of those ports allocated, you can either [stop existing docker containers](https://forum.astronomer.io/t/docker-error-in-cli-bind-for-0-0-0-0-5432-failed-port-is-already-allocated/151) or [change the port](https://forum.astronomer.io/t/i-already-have-the-ports-that-the-cli-is-trying-to-use-8080-5432-occupied-can-i-change-the-ports-when-starting-a-project/48).

### Access the Airflow UI

To check out the Airflow UI of your local Airflow project, you can:

- Navigate to http://localhost:8080/
- Log in with `admin` as both your Username and Password

### See your Example DAG

The `example_dag` in your directory should be populated in the Airflow UI on your local your machine.

![Example DAG](https://assets2.astronomer.io/main/docs/getting-started/sample_dag.png)

### Try a Code Change

A few tips for when you're developing locally:

- Any code-level DAG changes will immediately render in the Airflow UI as soon as they're saved in your source-code editor

- If you make changes to your Dockerfile, `packages.txt` or `requirements.txt`, you'll have to rebuild your image by running the following in sequence:

   ```
   $ astro dev stop
    ```

   ```
   $ astro dev start
    ```

### Check out your Logs

As you're developing locally, you'll want to pull logs for easy troubleshooting. Check out our [Logs and Source Control](/docs/cloud/stable/deploy/deployment-logs/) doc for guidelines.

### Customize Your Image

As you get more familiar with Airflow and Astronomer, you can customize any of the following:

- Airflow Base Image (Debian or Alpine)
- Airflow Version (1.10.5+)
- Python Packages and OS-level dependencies
- Airflow configurations (as Environment Variables)

#### Astronomer Certified System Distribution

Astronomer supports both [Alpine Linux](https://alpinelinux.org/) and [Debian](https://www.debian.org/)-based AC images for versions 1.10.5-1.10.12. In an effort to standardize our offering and optimize for reliability, we'll exclusively build, test and support Debian-based images starting with AC 1.10.14.

If you're unfamiliar with Alpine Linux or Debian, check out some examples of what you might need based on your use-case:

- [GCP](https://github.com/astronomer/airflow-guides/tree/main/example_code/gcp/example_code)
- [Snowflake](https://github.com/astronomer/airflow-guides/tree/main/example_code/snowflake/example_code)

To learn more, refer to ["Manage Airflow Versions"](/docs/cloud/stable/customize-airflow/manage-airflow-versions/).

#### Add DAGs, Packages and Environment Variables

In addition to customizing the Astronomer Certified image referenced in your Dockerfile, you can:

- Add DAGs in the `dags` folder
- Add custom airflow plugins to the `plugins` directory
- Add Python packages to `requirements.txt`
- Add OS-level packages to `packages.txt`
- Add Environment Variables to your `Dockerfile` ([guidelines](https://forum.astronomer.io/t/how-do-i-set-astronomer-config-file-options-env-vars/186/2))

## Deploy to Astronomer Cloud

### Create an Airflow Deployment on Cloud

Now that we've made sure your DAGs run successfully when developing locally, you're ready to create a deployment on Astronomer.

1. [Log into Astronomer](https://app.gcp0001.us-east4.astronomer.io/login)
2. Navigate to the Workspace you want to create an Airflow Deployment from
3. Select **+ New Deployment**
4. Give your Airflow Deployment a Name and Description (_optional_)
5. Select your **Airflow Version** (we recommend _latest_)
6. Choose your **Executor** (we recommend starting with Local)
7. Select **Create Deployment**

![Create an Airflow Deployment on Astronomer](https://assets2.astronomer.io/main/docs/getting-started/create-deployment.png)

To access the Airflow UI of your new Deployment, wait a few minutes for your Webserver and Scheduler to spin up.

For a full walk-through of the deployment creation and configuration process, check out our doc on [Configuring your Deployment and Deploying your Code](/docs/cloud/stable/deploy/deploy-cli/).

> **Note:** To create an Airflow Deployment via the Astronomer CLI, run: `$ astro deployment create`. Learn more at ["CLI Quickstart"](https://www.astronomer.io/docs/cloud/stable/develop/cli-quickstart).

### Deploy to Astronomer

You're ready to deploy your first DAG to Astronomer Cloud.

> **Note:** To push code to a Deployment on Astronomer, you _must_ be a Deployment _Editor_ or _Admin_. If you created an Airflow Deployment, you'll be an _Admin_ by default.
>
> If you don't have the correct permissions, reach out to someone on your team. For a breakdown of Deployment and Workspace-level roles, refer to ["Manage User Permissions"](https://www.astronomer.io/docs/cloud/stable/manage-astronomer/workspace-permissions).

#### Authenticate via the Astronomer CLI

To log into your existing account and pass our authorization flow, run:

```
$ astro auth login gcp0001.us-east4.astronomer.io
```

If you created your account with a username and password, you'll be prompted to enter them directly in your terminal. If you did so via GitHub or Google OAuth, you'll be prompted to grab a temporary token from https://app.gcp0001.us-east4.astronomer.io/token.

> **Note:** Once you run this command, it should stay cached and allow you to just run `$ astro auth login` to authenticate more easily in the future.

#### Confirm your Workspace and Deployment

Before you deploy to Astronomer, make sure:

- You're in the right Workspace
- The Airflow Deployment you want to deploy to belongs in that Workspace

Follow our [CLI Getting Started Guide](/docs/cloud/stable/develop/cli-quickstart/) for more specific guidelines and commands.

#### Deploy

When you're ready to deploy your DAGs, run:

```
$ astro deploy
```

This command will return a list of Airflow Deployments available in your Workspace and prompt you to pick one.

#### Open the Airflow UI

Once you deploy to Astronomer, navigate back to the [Astronomer UI](https://app.gcp0001.us-east4.astronomer.io/). In **Deployment** > **Settings**, go to **Open Airflow** on the top, right-hand side of the page.

This will give you access to your Deployment's Airflow UI, where you'll find your `example_dag` and any other DAGs in your project.

For guidance on how to navigate the Airflow UI, refer to [Apache Airflow documentation](https://airflow.apache.org/docs/apache-airflow/stable/ui.html).

## What's Next

Now that you're set up on Astronomer and familiar with our deployment flow, consider a few next steps:

- [Allowlist the Astronomer Cloud IP](/docs/cloud/stable/manage-astronomer/vpc-access/) for access to your external databases
- Set up a [CI/CD Pipeline](/docs/cloud/stable/deploy/ci-cd/)
- Set up [Airflow Alerts](/docs/cloud/stable/customize-airflow/airflow-alerts/)
- Migrate existing Airflow DAGs

> **Note:** If you migrate DAGs from another Apache Airflow environment, you'll have to manually re-create Airflow Variables + Connections or pull them from an external secrets backend. To learn more, go to ["Configure a Secrets Backend"](https://www.astronomer.io/docs/cloud/stable/customize-airflow/secrets-backend).

### Additional Resources

- [**Community Forum:**](https://forum.astronomer.io) General Airflow + Astronomer FAQs
- [**Technical Support:**](https://support.astronomer.io) Platform or Airflow issues
- [**Pricing**:](https://www.astronomer.io/docs/cloud/stable/resources/pricing) Astronomer Cloud Pricing + Billing

We're here to help.
