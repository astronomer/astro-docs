---
title: "Cloud Quickstart"
navTitle: "Quickstart"
description: "Get started with Astronomer Cloud."
---

Welcome to Astronomer.

This guide will help you kick off your trial on Astronomer by walking you through a sample DAG deployment from start to finish.

Whether you're exploring our [Enterprise](https://astronomer.io/enterprise) or [Cloud](https://astronomer.io/cloud) offering, we've designed this to be a great way to get to know our platform.

## Start Trial

If you haven't already, [start an Astronomer Trial](https://www.astronomer.io/trial/).

### Authorization

You can auth in via Google, Github, or standard username/password authentication.

This is how you'll log into both the Astronomer UI and the CLI.

**Note:** Once your account is created, you won't be able to change your method of authorization.

### Create a Workspace

If you're the first person at your org on Astronomer, you'll want to create a Workspace. You can think of Workspaces the same way you'd think of teams - a space that specific user groups have access to with varying levels of permissions.

Airflow deployments are hierarchically lower - from a Workspace, you can create one or more Airflow deployments.

To read more about navigating the Astronomer UI, go [here](https://www.astronomer.io/docs/cloud/stable/deploy/manage-workspaces/).

#### Join another Workspace

If you're new to Astronomer but someone else on your team has an existing Workspace you want to join, your  team member will be able to add you as a user to that shared Workspace directly from their account.

[Role-based Access Control (RBAC)](https://www.astronomer.io/docs/cloud/stable/manage-astronomer/workspace-permissions/) is a recent addition to our platform and allows you to give your teammates varying levels of permissions.

**Note**: If you have any trouble with your invitation or confirmation email, check your spam filter. If that doesn't do the trick, [reach out to us](https://support.astronomer.io).

## Start with the Astronomer CLI

Astronomer's [open-source CLI](https://github.com/astronomer/astro-cli) is the easiest way to run Apache Airflow on your machine.

From the CLI, you can establish a local testing environment and deploy to Astronomer Cloud whenever you're ready.

### Install

#### Pre-Requisites

To start using the CLI, make sure you've already installed:

- [Docker](https://www.docker.com/) (v18.09 or higher)

#### Install Command

To install the Astronomer CLI with our latest version, run:

```
$ curl -ssl https://install.astronomer.io | sudo bash -s -- v0.12.0
```

**Note:** If you're running on Windows, check out our [Windows Install Guide](https://www.astronomer.io/docs/cloud/stable/develop/cli-install-windows-10//).

### Initialize an Airflow Project

Create a new project directory on your machine and `cd` into it. This is what you should check into your version control tool and is where you'll store all files necessary to build and deploy our Airflow image.

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

Your Dockerfile will include reference to an Astronomer [Docker Image](https://hub.docker.com/r/astronomerinc/ap-airflow) that dictates the version of Airflow your deployment will run both when you're developing locally and pushing up to Astronomer Cloud.

The Docker image you'll find by default is:

```
FROM astronomerinc/ap-airflow:latest-onbuild
```

This will install an Astronomer Certified Alpine-based Airflow image running the latest version of Airflow we support. For more information on how to customize your image, refer to the "Customize your Image" section below.

#### Example DAG

Your newly initialized project will by default come with an "Example DAG" meant for you to deploy while getting started.

The DAG itself doesn't have much functionality (it prints the date a bunch of times), but it'll give you a chance to get accustomed to our deployment flow.

If you'd like to deploy some more functional example DAGs, [check out the ones we've open sourced](https://github.com/airflow-plugins/example-dags).

## Develop Locally

With those files in place, you're ready to push the "image" you've built to your local Airflow environment.

### Start Airflow

```
$ astro dev start
```

This command will spin up 3 Docker containers on your machine, each for a different Airflow component:

- **Postgres:** [Airflow's Metadata Database](https://www.astronomer.io/docs/cloud/stable/customize-airflow/access-airflow-database/)
- **Webserver:** The Airflow component responsible for rendering the Airflow UI
- **Scheduler:** The Airflow component responsible for monitoring and triggering tasks

You should see the following output:

```
$ astro dev start
Env file ".env" found. Loading...
Sending build context to Docker daemon  10.75kB
Step 1/1 : FROM astronomerinc/ap-airflow:latest-onbuild
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

#### Verify Docker Containers

To verify that all 3 Docker containers were created, you can also run:

```
$ docker ps
```

**Note**: Running `astro dev start` will by default start your project with the Airflow Webserver exposed at port 8080 and Postgres exposed at port 5432.

If you already have either of those ports allocated, you can either [stop existing docker containers](https://forum.astronomer.io/t/docker-error-in-cli-bind-for-0-0-0-0-5432-failed-port-is-already-allocated/151) or [change the port](https://forum.astronomer.io/t/i-already-have-the-ports-that-the-cli-is-trying-to-use-8080-5432-occupied-can-i-change-the-ports-when-starting-a-project/48).

### Access the Airflow UI

To check out the Airflow UI on your local Airflow project, you can:

- Navigate to http://localhost:8080/
- Login with `admin` as both your Username and Password

### See your Sample DAG

The example DAG automatically generated in your directory should be populated in your local Airflow's UI.

![Sample DAG](https://assets2.astronomer.io/main/docs/getting-started/sample_dag.png)

### Try a Code Change

A few tips for when you're developing locally:

- Any DAG Code changes will immediately render in the Airflow UI as soon as they're saved in your source-code editor

- If you make changes to your Dockerfile, `packages.txt` or `requirements.txt`, you'll have to rebuild your image by running the following in sequence:

   ```
   $ astro dev stop
    ```

   ```
   $ astro dev start
    ```

### Check out your Logs

As you're developing locally, you'll want to pull logs for easy troubleshooting. Check out our [Logs and Source Control](https://www.astronomer.io/docs/cloud/stable/deploy/deployment-logs/) doc for guidelines.

### Customize Your Image

As you get more familiar with Airflow and Astronomer, you can customize any of the following within your image:

- Airflow Base Image (Debian or Alpine)
- Airflow Version (1.10.5+)
- Python Packages and OS-level dependencies
- Airflow configurations (as Environment Variables)

#### Airflow Base Image

Astronomer currently supports both Alpine and Debian based Airflow images for Airflow versions 1.10.5 and beyond.

As noted above, the Astronomer Certified image will by default install the latest version of Airflow available on [Alpine Linux](https://alpinelinux.org/), though users leveraging Machine Learning Python Libraries or more complex dependencies might find Debian to be more appropriate.

If you're interested in upgrading Airflow versions or switching to a Debian-based image, refer to our ["Airflow Versioning" doc](https://www.astronomer.io/docs/cloud/stable/customize-airflow/airflow-versioning/).

#### Add DAGs, Packages and Environment Variables

In addition to customizing the Airflow Image referenced in your Dockerfile, you can:

- Add DAGs in the `dags` folder
- Add custom airflow plugins to the `plugins` directory
- Add Python packages to `requirements.txt`
- Add OS-level packages to `packages.txt`
- Add Environment Variables can go in your `Dockerfile` ([guidelines](https://forum.astronomer.io/t/how-do-i-set-astronomer-config-file-options-env-vars/186/2))

If you're unfamiliar with Alpine Linux, check out some examples of what you might need based on your use-case:

- [GCP](https://github.com/astronomer/airflow-guides/tree/main/example_code/gcp/example_code)
- [Snowflake](https://github.com/astronomer/airflow-guides/tree/main/example_code/snowflake/example_code)

## Deploy to Astronomer Cloud

### Create an Airflow Deployment on Cloud

Now that we've made sure your DAGs run successfully when developing locally, you're ready to create a deployment on Astronomer.

1. [Log into Astronomer](https://app.gcp0001.us-east4.astronomer.io/login)
2. Navigate to the Workspace you want to create a deployment from
3. Hit `New Deployment` on the top right of the page
4. Give your Deployment a Name + Description
5. Choose your Executor (we'd recommend starting with Local)
6. Wait a few minutes for your Webserver and Scheduler to spin up

![Deployment Config](https://assets2.astronomer.io/main/docs/deploying-code/new_deployment-config.png)

For a full walk-through, check out our doc on [Configuring your Deployment and Deploying your Code](https://www.astronomer.io/docs/cloud/stable/deploy/deploy-cli/).

### Deploy your First DAG

You're ready to deploy your first DAG to Astronomer Cloud.

#### Authenticate to the Astronomer CLI

To log into your existing account and pass our authorization flow, run:

```
$ astro auth login gcp0001.us-east4.astronomer.io
```

If you created your account with a username and password, you'll be prompted to enter them directly in your terminal. If you did so via GitHub or Google OAuth, you'll be prompted to grab a temporary token from the https://app.gcp0001.us-east4.astronomer.io/token.

**Note:** Once you run this command once, it should stay cached and allow you to just run `astro auth login` to authenticate more easily in the future.

#### Make sure you're in the right place

To get ready for a deployment, make sure:

- You're in the right Workspace
- You have the right permissions (Workspace Editor or Admin)
- The deployment you want to deploy to lives under that Workspace

Follow our [CLI Getting Started Guide](https://www.astronomer.io/docs/cloud/stable/develop/cli-quickstart/) for more specific guidelines and commands.

#### Deploy

When you're ready to deploy your DAGs, run:

```
$ astro deploy
```

This command will return a list of deployments available in your Workspace and prompt you to pick one.

#### View your Example DAG on your Astronomer Cloud Deployment

After you deploy your example DAG, you'll be able to see it running in your Cloud deployment.

## What's Next

Now that you're set up on Astronomer and familiar with our deployment flow, consider a few next steps:

- [Allowlist our IP](https://www.astronomer.io/docs/cloud/stable/manage-astronomer/vpc-access/) for access to your external databases
- Think about setting up a [CI/CD Pipeline](https://www.astronomer.io/docs/ci-cd/)
- Set up [Airflow Alerts](https://www.astronomer.io/docs/setting-up-airflow-emails/)
- Migrate any existing Airflow DAGs (you'll have to manually port over Variables + Connections)

### Additional Resources

- [**Community Forum**](https://forum.astronomer.io): General Airflow + Astronomer FAQs
- [**Technical Support**](https://support.astronomer.io): Platform or Airflow issues
