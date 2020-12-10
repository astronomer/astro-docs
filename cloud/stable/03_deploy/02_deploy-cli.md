---
title: "Deploy to Astronomer via the CLI"
navTitle: "Deploy Code"
description: "How to push code to your Airflow Deployment on Astronomer via the Astronomer CLI."
---

Once you create an Airflow Deployment, you can quickly push code there using the Astronomer CLI.

## Prerequisites

In order to push up code to a Deployment on Astronomer, you must have:

* [The Astronomer CLI](/docs/cloud/stable/develop/cli-quickstart/) Installed
* An account on [Astronomer Cloud](https://app.gcp0001.us-east4.astronomer.io/)
* A [Workspace](https://www.astronomer.io/docs/cloud/stable/deploy/manage-workspaces).

## Step 1: Create an Airflow Deployment

To create an Airflow Deployment on Astronomer, log into [Astronomer Cloud](https://app.gcp0001.us-east4.astronomer.io/), open your Workspace, and click **New Deployment**.

![Workspace Dashboard](https://assets2.astronomer.io/main/docs/astronomer-ui/workspace_dashboard.png)

## Step 2: Configure your Airflow Deployment

Use the **New Deployment** menu to configure the following:

* **Name** and **Description** (optional)
* **Airflow Version**: We recommend using the latest version.
* **Executor**: We recommend starting with Local.

When you've finished, click **Create Deployment**.

Once you've initialized your Deployment, give it a few moments to spin up. Afterwards, you'll have access to your Deployment dashboard:

![New Deployment Celery Dashboard](https://assets2.astronomer.io/main/docs/deploying-code/new_deployment_celery_dashboard.png)

From this dashboard, you can:

- Access the Airflow UI
- Reallocate your resources.
- Open the Kubernetes or Celery (if you configured your Deployment to use one of those executors).


## Step 3: Deploy Code from the CLI

First, authenticate to the CLI:


```
$ astro auth login gcp0001.us-east4.astronomer.io
```


From the Astronomer CLI, you have access to any Workspace you have access to on the Astronomer UI.

To see the list of all the Workspaces you have access to push code to, run:

```
$ astro workspace list
```

To switch between Workspaces, run:

```
$ astro workspace switch [UUID]
```

To see a list of Deployments in a Workspace, run:

```
$ astro deployment list
 NAME             RELEASE NAME             ASTRO      DEPLOYMENT ID
 demo_cluster     infrared-photon-7780     v0.17.0     c2436025-d501-4944-9c29-19ca61e7f359
```

To deploy on Astronomer, go to your Airflow project directory and run:

```
$ astro deploy
```

If it's your first time deploying, expect to wait a minute or two for the Docker Image to build. If the deployment was successful, your code changes will appear directly in Airflow.

### What gets Deployed?

Everything in the project directory where you ran `$ astro dev init` is bundled into a Docker image and deployed to your Airflow Deployment on Astronomer Cloud. Note that we don't deploy any of the Metadata associated with your local Airflow Deployment; just the code.

For more information about what gets built into your image, read [Customizing your Image](/docs/cloud/stable/develop/customize-image/).

## Considerations: Kubernetes Namespaces

Airflow Deployments live within their own Kubernetes [Namespace](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) - each completely unaware of the rest.

Each Airflow Deployment is allocated separate resources, configured in isolation, and maintains its own metadata.

## Considerations: Organizing Astronomer

While the specific needs of your organization might require a slightly different structure than what's described here, these are some general best practices to consider when working with Astronomer:

**Workspaces:** We recommend having 1 Workspace per team of Airflow users, so that anyone on this team has access to the same set of Deployments under that Workspace.

**Deployments:** Most use cases will call for a `production` and `dev` Deployment, both of which exist within a single Workspace and are accessible to the same set of users. From there, you can [set permissions](https://www.astronomer.io/docs/cloud/stable/manage-astronomer/workspace-permissions) to give users in the Workspace access to specific Deployments.

**Code:** Across Deployments, we generally recommend one parent directory per project. That way, you can still configure [CI/CD](https://www.astronomer.io/docs/cloud/stable/deploy/ci-cd) in the future. When creating child directories, we recommend having code directories partitioned by function and/or business case. For instance, you can have one directory for SQL, one for data processing tasks, and one for data validation.
