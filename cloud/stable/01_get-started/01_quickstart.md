---
title: "Cloud Quickstart"
navTitle: "Quickstart"
description: "Get started with Astronomer Cloud."
---

Welcome to Astronomer.

This guide will help you kick off your trial on Astronomer by walking you through a sample DAG deployment from start to finish.

Whether you're exploring our Enterprise or Cloud offering, we've designed this to be a great way to become familiar with our platform.

## Step 1: Start Your Trial

If you haven't already, start a free 14-day trial by [reaching out to us](/get-astronomer?ref=docs).

Once you've been in touch with our team, you'll be invited to create an account on Astronomer Cloud via email. The email you receive will be sent from `noreply@astronomer.io` with the subject line "Your Astronomer Invitation".

![Email Invite to Astronomer](https://assets2.astronomer.io/main/docs/getting-started/email-invite.png)

> **Note:** If you're expecting an invitation email and don't receive one or you can't accept the invitation, reach out to [Astronomer Support](https://support.astronomer.io).

## Step 2: Create an Account

Once you accept your invitation via email, you'll be taken to a webpage that will prompt you to create an account on Astronomer Cloud. You can sign up with Google, GitHub, or via a username/password combination of your choosing.

![Create an Account on Astronomer](https://assets2.astronomer.io/main/docs/getting-started/create-account.png)

This is how you'll log into both the Astronomer UI and the CLI in the future.

> **Note:** Once you've created an account on Astronomer Cloud, you will NOT be able to change your method of authentication.

## Step 3: Create a Workspace

If you're the first person on your team to sign up for Astronomer, click **New Workspace** to create a Workspace and officially begin your 14-day trial.

![Create a Workspace on Astronomer](https://assets2.astronomer.io/main/docs/getting-started/create-workspace.png)

You can think of Workspaces the same way you'd think of teams - a space that specific user groups have access to with varying levels of permissions. From within a Workspace you can create one or more Airflow Deployments, each of which hosts a collection of DAGs.

For more information, read [Manage Workspaces and Deployments](/docs/cloud/stable/deploy/manage-workspaces/).

### Join an Existing Workspace

If you're new to Astronomer Cloud but someone else on your team has an existing Workspace you'd like to join, a Workspace Admin can invite you to it.

Once you receive a Workspace invitation via email, accept the invitation and create an account by following the guidelines above. Once you're a member of a Workspace, Deployment Admins can grant you varying levels of access to the Airflow Deployment(s) within that Workspace.

For more information on Workspace Admins, Deployment Admins, and other user roles and permissions, read [Manage User Permissions on Astronomer Cloud](/docs/cloud/stable/manage-astronomer/workspace-permissions/).

## Step 4: Install the Astronomer CLI

The [Astronomer CLI](https://github.com/astronomer/astro-cli) is the easiest way to run Apache Airflow on your machine. From the CLI, you can establish a local testing environment and deploy to Astronomer Cloud whenever you're ready.

There are two ways to install any version of the Astronomer CLI:

- cURL
- [Homebrew](https://brew.sh/)

> **Note:** If you're running on Windows, check out our [Windows Install Guide](/docs/cloud/stable/develop/cli-install-windows-10/).

### Prerequisites

The CLI installation process requires [Docker](https://www.docker.com/) (v18.09 or higher).

#### Install the CLI via cURL

To install the latest version of the Astronomer CLI via cURL, run:

```bash
curl -ssl https://install.astronomer.io | sudo bash
```

#### Install the CLI via Homebrew

To install the latest version of the Astronomer CLI via [Homebrew](https://brew.sh/), run:

```bash
brew install astronomer/tap/astro
```

For more information on the Astronomer CLI, read [CLI Quickstart](https://www.astronomer.io/docs/cloud/stable/develop/cli-quickstart).

## Step 5: Initialize an Airflow Project

Create a new project directory on your machine and `cd` to it:

```
mkdir <directory-name> && cd <directory-name>
```

This project directory is where you'll store all the necessary files to build and deploy your Airflow image.

In the project directory, run:

```
astro dev init
```

This will generate the following files:

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

A few of these files are essential for deploying your Airflow image for the first time:

### Dockerfile

Your Dockerfile will include reference to an Astronomer Certified Docker Image. [Astronomer Certified](https://www.astronomer.io/downloads/) (AC) is a Debian-based, production-ready distribution of Apache Airflow that mirrors the open source project and undergoes additional levels of rigorous testing conducted by our team.

This Docker image is hosted on [Astronomer's Docker Registry](https://quay.io/repository/astronomer/ap-airflow?tab=tags) and allows you to run Airflow on Astronomer. Additionally, the image you include in your Dockerfile dictates the version of Airflow you'd like to run both when you're developing locally and pushing up to Astronomer Cloud.

The Docker image you'll find in your Dockerfile by default is:

```
FROM quay.io/astronomer/ap-airflow:latest-onbuild
```

This will install a Debian-based AC image for the latest version of Airflow we support. To specify a particular Airflow version, read [Manage Airflow Versions](https://www.astronomer.io/docs/cloud/stable/customize-airflow/manage-airflow-versions) and the _Customize your Image_ topic below.

### Example DAG

To help you get started, your initialized project includes an example DAG in `/dags`. This DAG simply prints today's date, but it'll give you a chance to become familiar with how to deploy on Astronomer.

If you'd like to deploy some more functional DAGs, upload your own or check out [example DAGs we've open sourced](https://github.com/airflow-plugins/example-dags).

## Step 6: Start Airflow Locally

Now that you have the necessary files project directory, you're ready to push your Airflow image to your local Airflow environment.

### a. Start Airflow

Run the following command:

```
astro dev start
```

This command spins up 3 Docker containers on your machine, each for a different Airflow component:

- **Postgres:** [Airflow's Metadata Database](/docs/cloud/stable/customize-airflow/access-airflow-database/)
- **Webserver:** The Airflow component responsible for rendering the Airflow UI
- **Scheduler:** The Airflow component responsible for monitoring and triggering tasks

You should see the following output:

```
astro dev start
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

> **Note:** If you’re running the Astronomer CLI with the [buildkit](https://docs.docker.com/develop/develop-images/build_enhancements/) feature enabled in Docker, you may see an error (`buildkit not supported by daemon`). Learn more in [this forum post](https://forum.astronomer.io/t/buildkit-not-supported-by-daemon-error-command-docker-build-t-airflow-astro-bcb837-airflow-latest-failed-failed-to-execute-cmd-exit-status-1/857).

### b. Verify the Docker Containers

To verify that all 3 Docker containers were created, run:

```
docker ps
```

> **Note**: Running `$ astro dev start` will start your project with the Airflow Webserver exposed at port 8080 and Postgres exposed at port 5432.
>
> If you already have either of those ports allocated, you can either [stop existing docker containers](https://forum.astronomer.io/t/docker-error-in-cli-bind-for-0-0-0-0-5432-failed-port-is-already-allocated/151) or [change the port](https://forum.astronomer.io/t/i-already-have-the-ports-that-the-cli-is-trying-to-use-8080-5432-occupied-can-i-change-the-ports-when-starting-a-project/48).

### c. Access the Airflow UI

To check out the Airflow UI of your local Airflow project, go to http://localhost:8080/ and log in with `admin` as both your username and password.

The example DAG in your directory should be populated in the Airflow UI on your local machine.

![Example DAG](https://assets2.astronomer.io/main/docs/getting-started/sample_dag.png)

## Step 7: Create an Airflow Deployment

Now that we've made sure your DAGs run successfully when developing locally, you're ready to create an Airflow Deployment on Astronomer.

### a. Create a New Deployment

[Log into Astronomer](https://app.gcp0001.us-east4.astronomer.io/login) and open the Workspace you want to create an Airflow  Deployment in. From there, select **+ New Deployment**.

![Create New Deployment](https://assets2.astronomer.io/main/docs/getting-started/new-deployment.png)

### b. Configure Your Deployment

Use the **New Deployment** menu to configure the following:

* **Name**
* **Description** (Optional)
* **Airflow Version**: We recommend using the latest version.
* **Executor**: We recommend starting with the Local Executor.

Once you've finished, click **Create Deployment**.

![Create an Airflow Deployment on Astronomer](https://assets2.astronomer.io/main/docs/getting-started/create-deployment.png)

For a full walk-through of the Deployment creation and configuration process, read [Deploy to Astronomer via the CLI](/docs/cloud/stable/deploy/deploy-cli/).

> **Note:** If you configure your new Deployment to run a version of Airflow that is _not_ latest, make sure that the Astronomer Certified image in your Dockerfile corresponds to that version.
>
> For example, if you create an Airflow Deployment to run **1.10.12**, replace the AC image in your Dockerfile with:
>
> `FROM quay.io/astronomer/ap-airflow:1.10.12-buster-onbuild`

## Step 8: Deploy to Astronomer

You're ready to deploy your first DAG to Astronomer Cloud using the Astronomer CLI.

First, make sure that you're either a Deployment Editor or Admin. If you create an Airflow Deployment, you'll be a Deployment Admin by default.

If you don't have the correct permissions, reach out to someone on your team. For a breakdown of Deployment and Workspace-level roles, read [Manage User Permissions](https://www.astronomer.io/docs/cloud/stable/manage-astronomer/workspace-permissions) .

### a. Authenticate via the Astronomer CLI

To authenticate via the Astronomer CLI, run:

```
astro auth login gcp0001.us-east4.astronomer.io
```

If you created your account with a username and password, you'll be prompted to enter them directly in your terminal. If you did so via GitHub or Google OAuth, you'll be prompted to grab a temporary token from https://app.gcp0001.us-east4.astronomer.io/token.

> **Note:** Once you run this command, it should stay cached and allow you to just run `$ astro auth login` to authenticate more easily in the future.

### b. Confirm Your Workspace and Deployment

Before you deploy to Astronomer, make sure you're in the correct Workspace by running:

```
astro workspace list
```

For more specific CLI guidelines and commands, read [CLI Quickstart](/docs/cloud/stable/develop/cli-quickstart/).

### c. Deploy to Astronomer

When you're ready to deploy your DAGs, run:

```
astro deploy
```

This command will return a list of Airflow Deployments available in your Workspace and prompt you to pick one.

### d. Access the Airflow UI

Once you deploy to Astronomer, reopen the [Astronomer UI](https://app.gcp0001.us-east4.astronomer.io/). From there, go to **Deployment** > **Settings** > **Open Airflow**.

![Access Airflow UI](https://assets2.astronomer.io/main/docs/getting-started/open-airflow.png)

This links to your Deployment's Airflow UI, where you'll find your example DAG and all other DAGs in your project.

For guidance on how to navigate the Airflow UI, refer to [Apache Airflow documentation](https://airflow.apache.org/docs/apache-airflow/stable/ui.html).

## What's Next?

Now that you're set up on Astronomer and familiar with our deployment flow, consider a few next steps:

### Try a Code Change

A few tips for when you're developing locally:

- Any code-level DAG changes will immediately render in the Airflow UI as soon as they're saved in your source-code editor.

- If you make changes to your Dockerfile, `packages.txt` or `requirements.txt`, rebuild your image by running the following in sequence:

   ```
   astro dev stop
   ```
   ```
   astro dev start
    ```

### Check out Your Logs

As you're developing locally, you'll want to pull logs for easy troubleshooting. Check out our [Logs and Source Control](/docs/cloud/stable/deploy/deployment-logs/) doc for guidelines.

### Customize Your Image

As you get more familiar with Airflow and Astronomer, you can customize any of the following:

- Astronomer Certified Image
- Airflow Version (1.10.5+)
- Python Packages and OS-level dependencies
- Airflow configuration (e.g. Environment Variables)

#### Customize Your Astronomer Certified Image

Astronomer Certified supports both [Alpine Linux](https://alpinelinux.org/) and [Debian](https://www.debian.org/)-based images for versions 1.10.5-1.10.12. In an effort to standardize our offering and optimize for reliability, we'll exclusively build, test and support Debian-based images starting with AC 1.10.14.

If a new version of Astronomer Certified is made available, you can upgrade by replacing the image in your Dockerfile.

To learn more, refer to [Manage Airflow Versions](/docs/cloud/stable/customize-airflow/manage-airflow-versions/).

#### Add DAGs, Packages, and Environment Variables

In addition to customizing the Astronomer Certified image referenced in your Dockerfile, you can:

- Add DAGs to the `dags` directory
- Add custom Airflow plugins to `plugins`
- Add Python packages to `requirements.txt`
- Add OS-level packages to `packages.txt`
- Add Environment Variables to your `Dockerfile` ([guidelines](https://forum.astronomer.io/t/how-do-i-set-astronomer-config-file-options-env-vars/186/2))

If you're unfamiliar with Alpine Linux or Debian, check out some examples of what you might need based on your use-case:

- [GCP](https://github.com/astronomer/airflow-guides/tree/main/example_code/gcp/example_code)
- [Snowflake](https://github.com/astronomer/airflow-guides/tree/main/example_code/snowflake/example_code)

### Complete Additional Setup

Once you're familiar with Astronomer and Airflow, we recommend the following to make the most of your experience:

- [Add the Astronomer Cloud IP to an Allowlist](/docs/cloud/stable/manage-astronomer/vpc-access/) for access to your external databases.
- Set up a [CI/CD Pipeline](/docs/cloud/stable/deploy/ci-cd/).
- Set up [Airflow Alerts](/docs/cloud/stable/customize-airflow/airflow-alerts/).
- Configure resources in the Astronomer UI.
- Migrate existing Airflow DAGs.

For full control over resource configuration, upgrade anytime by adding payment information in **Deployment** > **Billing**.

> **Note:** If you migrate DAGs from another Apache Airflow environment, you'll have to manually re-create Airflow Variables + Connections or pull them from an external secrets backend. To learn more, go to [Configure a Secrets Backend](https://www.astronomer.io/docs/cloud/stable/customize-airflow/secrets-backend).

### Additional Resources

- [**Community Forum:**](https://forum.astronomer.io) General Airflow + Astronomer FAQs
- [**Technical Support:**](https://support.astronomer.io) Platform or Airflow issues
- [**Pricing**:](https://www.astronomer.io/docs/cloud/stable/resources/pricing) Astronomer Cloud Pricing + Billing

We're here to help.
