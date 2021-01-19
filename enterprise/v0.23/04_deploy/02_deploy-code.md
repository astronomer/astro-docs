---
title: "Deploying Code on Astronomer"
navTitle: "Deploy Code"
description: "How to push code to your Airflow Deployment on Astronomer via the Astronomer CLI."
---

## Deployment on Astronomer

### Pre-Requisites

In order to push up code to a deployment on Astronomer, you must have:

1. [The Astronomer CLI](/docs/enterprise/stable/develop/cli-quickstart/) Installed
2. Access to an Airflow deployment running on [Astronomer Enterprise](/docs/enterprise/)

### Create a Deployment

To create a deployment on Astronomer, log into the Astronomer UI on either:
- Astronomer Cloud
- Your own domain on Astronomer Enterprise (`app.BASEDOMAIN`)

From your Workspace on Astronomer, click "New Deployment".

![Workspace Dashboard](https://assets2.astronomer.io/main/docs/astronomer-ui/workspace_dashboard.png)

### Configure your Airflow Deployment

To finish creating your Deployment, you'll have to:

- Give it a name and description
- Pick an Airflow Executor (Celery or Local)
- Set Initial Resources

![New Deployment Config](https://assets2.astronomer.io/main/docs/deploying-code/V0.15-new_deployment-config.png)

### Deployment Dashboard

Once you've initialized your deployment, give it a few moments to provision.

You should soon have access to your deployment dashboard:

![New Deployment Celery Dashboard](https://assets2.astronomer.io/main/docs/deploying-code/new_deployment_celery_dashboard.png)

From this dashboard, you can:

- Access the Airflow UI (left)
- Access the Celery UI for Worker Monitoring (right)

**Note**: You'll only see a tab for the Celery Dashboard if your deployment is running the Celery Executor.

## Deploy Code from the CLI

Astronomer's CLI allows you easily deploy your code onto an Airflow Deployment on Astronomer.

### Authentication

To start, authenticate to the CLI.

**Astronomer Cloud**

```
astro auth login gcp0001.us-east4.astronomer.io
```

**Astronomer Enterprise**

```
astro auth login BASEDOMAIN
```

(E.g. If your base domain is airflow.mycompany.io, your login command would be `astro auth login airflow.mycompany.io`)

Follow the authentication flow from there.

```
$ astro auth login gcp0001.us-east4.astronomer.io
```

### Select your Workspace & Deployment

#### Workspace

Any Workspace you have access to on the Astronomer UI, you'll have access to via the Astronomer CLI.

To see the list of all the Workspaces you have access to push code to, run:

```
astro workspace list
```

To switch between workspaces, run:

```
astro workspace switch [UUID]
```

#### Deployment

```
astro deployment list
 NAME           RELEASE NAME                 ASTRO      DEPLOYMENT ID
 demo_cluster     infrared-photon-7780     v0.7.5     c2436025-d501-4944-9c29-19ca61e7f359
```

### Deploy

To deploy on Astronomer, run:

```
astro deploy
```

A few notes:
- If it's your first time deploying, expect to wait a minute or two for the Docker Image to build.
- To know if your deploy was successful, ensure no errors in the output and check your Airflow UI to see your code changes reflected.

#### What gets Deployed?

Everything in your top level directory (and all children directory) in which you ran `astro dev init` will get bundled into a Docker image and deployed out.

We do **not** deploy any of the metadata associated with your local Airflow deployment - only the code.

For more information on what gets built into your image, jump over to our doc on [Customizing your Image](/docs/enterprise/stable/develop/customize-image/).

## Deployments & Kubernetes Namespaces

### Kubernetes Namespaces

Airflow deployments live within their own Kubernetes [Namespace](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) - each completely unaware of the rest.

Each deployment is allocated separate resources, is configured in isolation, and maintains its own metadata.

**Note:** The only thing deployments have in common is that they run on _the same underlying Kubernetes cluster_, whether that's ours on Astronomer Cloud or your own if you're an Astronomer Enterprise customer.

## Organizing your Code

This is largely dependent on personal preference and your particular use case.

### Workspace Level

At a Workspace level, we recommend having 1 Astronomer Workspace per team of Airflow users. That way, anyone on each team has access to the same set of deployments under that Workspace (RBAC will soon allow you to adjust that access at a deployment level if you'd like).

### Deployment Level

Most use cases will call for a `production` and `dev` deployment, both of which exist within a single Workspace and are therefore accessible to a set of users, each with varying permissions.

### Code Level

Across deployments, we'd generally recommend one repository/parent directory per project. That way, you leave the door open for CI/CD down the line if that's something you ever want to set up.

As for the code itself, we’ve seen effective organization where external code is partitioned by function and/or business case, so one directly for SQL, one for data processing tasks, one for data validation, etc.
