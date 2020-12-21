---
title: "Deploy to Astronomer via the CLI"
navTitle: "Deploy Code"
description: "How to push code to your Airflow Deployment on Astronomer via the Astronomer CLI."
---

## Overview

For those who have used the Astronomer CLI to develop locally, the process by which you can deploy code to an Airflow Deployment on Astronomer Cloud is built to be similarly easy.

This guide will walk you through the following:

- How to create an Airflow Deployment on Astronomer
- How to set initial Deployment Configurations
- How to deploy to Astronomer via the Astronomer CLI

For those looking to automate the deploy process, refer to [Deploy to Astronomer via CI/CD](/docs/cloud/stable/deploy/ci-cd/).

> **Note:** We recommend that all users test their code locally via the Astronomer CLI before pushing it to an Airflow Deployment on Astronomer. For guidelines on developing locally, refer to [CLI Quickstart](/docs/cloud/stable/develop/cli-quickstart/).

## Prerequisites

In order to push up code to a Deployment on Astronomer, you must have:

* [The Astronomer CLI](/docs/cloud/stable/develop/cli-quickstart/) Installed
* An account on [Astronomer Cloud](https://app.gcp0001.us-east4.astronomer.io/)
* An Astronomer [Workspace](https://www.astronomer.io/docs/cloud/stable/deploy/manage-workspaces)

## Step 1: Create an Airflow Deployment

To create an Airflow Deployment on Astronomer, log into [Astronomer Cloud](https://app.gcp0001.us-east4.astronomer.io/), open your Workspace, and click **New Deployment**.

![Workspace Dashboard](https://assets2.astronomer.io/main/docs/deploying-code/v0.23-deployments.png)

## Step 2: Configure Your Airflow Deployment

Use the **New Deployment** menu to configure the following:

* **Name**
* **Description** (Optional)
* **Airflow Version**: We recommend using the latest version.
* **Executor**: We recommend starting with Local.

![New Deployment Config](https://assets2.astronomer.io/main/docs/deploying-code/v0.23-new_deployment-config.png)

When you've finished, click **Create Deployment**.

Once you've initialized your Deployment, give it a few moments to spin up. Afterwards, you'll have access to your Deployment dashboard:

![New Deployment Celery Dashboard](https://assets2.astronomer.io/main/docs/deploying-code/v0.23-new_deployment-dashboard.png)

From this dashboard, you can:

- Modify your Resources
- Initialize the Airflow upgrade process
- Configure **Email Alerts**
- Access the Airflow UI
- Access your Celery Dashboard (if using CeleryExecutor)
- Delete your Deployment

For more information on deployment configuration, read [Configure an Airflow Deployment on Astronomer](/docs/cloud/stable/deploy/configure-deployment/).

## Step 3: Deploy Code from the CLI

### a. Authenticate via the Astronomer CLI

To authenticate via the Astronomer CLI, run:

```
$ astro auth login gcp0001.us-east4.astronomer.io
```

### b. Confirm Your Workspace and Deployment

From the Astronomer CLI, you're free to push code to any Airflow Deployment you have access to as long as you have the appropriate deployment-level permissions to do so.

Before you deploy to Astronomer, make sure that the Airflow Deployment you'd like to push code to is within the Workspace you're operating in.

To see the list of Workspaces you have access to, run:

```
$ astro workspace list
```

To switch between Workspaces, run:

```
$ astro workspace switch
```

To see the list of Deployments within a particular Workspace, run:

```
$ astro deployment list
```

For more specific CLI guidelines and commands, read [CLI Quickstart](/docs/cloud/stable/develop/cli-quickstart/).

### c. Deploy to Astronomer

Finally, make sure you're in the correct Airflow project directory.

When you're ready to deploy your DAGs, run:

```
$ astro deploy
```

This command will return a list of Airflow Deployments available in your Workspace and prompt you to pick one.

### d. Validate your changes

If it's your first time deploying, expect to wait a few minutes for the Docker Image to build.

To confirm that your deploy was successful, navigate to your Deployment in the Astronomer UI and click **Open Airflow** to see your changes in the Airflow UI.

#### What gets Deployed?

Everything in the project directory where you ran `$ astro dev init` is bundled into a Docker image and deployed to your Airflow Deployment on Astronomer Cloud. We don't deploy any of the metadata associated with your local Airflow environment (e.g. task history, Airflow Connections and Variables set in the Airflow UI, etc.) - just the code.

For more information about what gets built into your image, read [Customize your Image](/docs/cloud/stable/develop/customize-image/).

## Additional Considerations

### Kubernetes Namespaces

Airflow Deployments live within their own Kubernetes [Namespace](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) - each completely unaware of the rest.

Each Airflow Deployment is allocated separate resources, configured in isolation, and maintains its own metadata.

### Organizing Astronomer

While the specific needs of your organization might require a slightly different structure than what's described here, these are some general best practices to consider when working with Astronomer:

**Workspaces:** We recommend having 1 Workspace per team of Airflow users, so that anyone on this team has access to the same set of Deployments under that Workspace.

**Deployments:** Most use cases will call for a "Production" and "Dev" Deployment, both of which exist within a single Workspace and are accessible to a shared set of users. From there, you can [set permissions](https://www.astronomer.io/docs/cloud/stable/manage-astronomer/workspace-permissions) to give users in the Workspace access to specific Deployments.

**Code:** As for the code itself, we’ve seen effective organization where external code is partitioned by function and/or business case, so one directly for SQL, one for data processing tasks, one for data validation, etc.
