---
title: "Deploy to Astronomer via the CLI"
navTitle: "Deploy Code"
description: "How to push code to your Airflow Deployment on Astronomer via the Astronomer CLI."
---

## Overview

If you've used the Astronomer CLI to develop locally, you'll find it similarly easy to deploy code to an Airflow Deployment on Astronomer Enterprise.

This guide will walk you through the process of deploying code to Astronomer using the Astronomer CLI.

For those looking to automate the deploy process, refer to [Deploy to Astronomer via CI/CD](/docs/enterprise/stable/deploy/ci-cd/).

> **Note:** We recommend that all users test their code locally via the Astronomer CLI before pushing it to an Airflow Deployment on Astronomer. For guidelines on developing locally, refer to [CLI Quickstart](/docs/enterprise/stable/develop/cli-quickstart/).

## Prerequisites

In order to push up code to a Deployment on Astronomer, you must have:

* [The Astronomer CLI](/docs/enterprise/stable/develop/cli-quickstart/) installed.
* An Astronomer platform at `app.BASEDOMAIN`.
* An Astronomer [Workspace](https://www.astronomer.io/docs/enterprise/stable/deploy/manage-workspaces) with at least one active [Airflow Deployment](https://www.astronomer.io/docs/enterprise/stable/deploy/configure-deployment).

## Step 1: Authenticate to Astronomer

To authenticate via the Astronomer CLI, run:

```sh
$ astro auth login BASEDOMAIN
```

## Step 2: Confirm Your Workspace and Deployment

From the Astronomer CLI, you're free to push code to any Airflow Deployment you have access to as long as you have the appropriate deployment-level permissions to do so. For more information on both Workspace and Deployment-level permissions on Astronomer, refer to [User Permissions](https://www.astronomer.io/docs/enterprise/stable/manage-astronomer/workspace-permissions).

Before you deploy to Astronomer, make sure that the Airflow Deployment you'd like to deploy to is within the Workspace you're operating in.

To see the list of Workspaces you have access to, run:

```sh
$ astro workspace list
```

To switch between Workspaces, run:

```sh
$ astro workspace switch
```

To see the list of Deployments within a particular Workspace, run:

```sh
$ astro deployment list
```

For more specific CLI guidelines and commands, read [CLI Quickstart](/docs/enterprise/stable/develop/cli-quickstart/).

## Step 3: Deploy to Astronomer

Finally, make sure you're in the correct Airflow project directory.

When you're ready to deploy your DAGs, run:

```sh
$ astro deploy
```

This command returns a list of Airflow Deployments available in your Workspace and prompts you to pick one.

## Step 4: Validate Your Changes

If it's your first time deploying, expect to wait a few minutes for the Docker Image to build.

To confirm that your deploy was successful, navigate to your Deployment in the Astronomer UI and click **Open Airflow** to see your changes in the Airflow UI.

### What gets deployed?

Everything in the project directory where you ran `$ astro dev init` is bundled into a Docker image and deployed to your Airflow Deployment on your Astronomer platform. Astronomer exclusively deploys the code in your project and does not push any of the metadata associated with your local Airflow environment, including task history and Airflow Connections or variables set locally in the Airflow UI.

For more information about what gets built into your image, read [Customize your Image](/docs/enterprise/stable/develop/customize-image/).

## Next Steps: Organize Astronomer

While the specific needs of your organization might require a slightly different structure than what's described here, these are some general best practices to consider when working with Astronomer:

**Workspaces:** We recommend having 1 Workspace per team of Airflow users, so that anyone on this team has access to the same set of Deployments under that Workspace.

**Deployments:** Most use cases will call for a "Production" and "Dev" Deployment, both of which exist within a single Workspace and are accessible to a shared set of users. From there, you can [set permissions](https://www.astronomer.io/docs/enterprise/stable/manage-astronomer/workspace-permissions) to give users in the Workspace access to specific Deployments.

**Code:** As for the code itself, we’ve seen effective organization where external code is partitioned by function and/or business case, so one directly for SQL, one for data processing tasks, one for data validation, etc.
