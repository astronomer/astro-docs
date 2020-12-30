---
title: "Deploy to Astronomer via the CLI"
navTitle: "Deploy Code"
description: "How to push code to your Airflow Deployment on Astronomer via the Astronomer CLI."
---

Astronomer's CLI allows you easily deploy your code onto an Airflow Deployment.

## Step 1: Authenticate to the CLI

Run the following command:

```
$ astro auth login gcp0001.us-east4.astronomer.io
```

## Step 2: Select Your Workspace & Deployment

Any Workspace you have access to on the Astronomer UI, you'll have access to via the Astronomer CLI.

To see the list of all the Workspaces you have access to push code to, run:

```
$ astro workspace list
```

To switch between workspaces, run:

```
$ astro workspace switch [UUID]
```

When you're in the appropriate workspace, run the following command to show a list of available deployments.

```
$ astro deployment list
 NAME             RELEASE NAME             ASTRO      DEPLOYMENT ID
 demo_cluster     infrared-photon-7780     v0.17.0     c2436025-d501-4944-9c29-19ca61e7f359
```

## Step 3: Deploy Your Code

To deploy on Astronomer, run:

```
$ astro deploy
```

If it's your first time deploying, expect to wait a few minutes for the Docker image to build. If you can see your code changes in the Airflow UI, then the deploy was successful.

### What gets Deployed?

Everything in your top level directory (and all children directories) where you ran `$ astro dev init` will get bundled into a Docker image and deployed to your Airflow Deployment on Astronomer Cloud.

We don't deploy any of the Metadata associated with your local Airflow deployment, only the code.

For more information on what gets built into your image, read [Customizing your Image](/docs/cloud/stable/develop/customize-image/).

## Deployments & Kubernetes Namespaces

### Kubernetes Namespaces

Airflow Deployments live within their own Kubernetes [Namespace](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) - each completely unaware of the rest.

Each Airflow Deployment is allocated separate resources, is configured in isolation and maintains its own metadata.

## Organizing your Code

This is largely dependent on personal preference and your particular use case.

### Workspace Level

At a Workspace level, we recommend having 1 Astronomer Workspace per team of Airflow users. That way, anyone on each team has access to the same set of deployments under that Workspace (RBAC will soon allow you to adjust that access at a deployment level if you'd like).

### Deployment Level

Most use cases will call for a `production` and `dev` deployment, both of which exist within a single Workspace and are therefore accessible to a set of users, each with varying permissions.

### Code Level

Across deployments, we'd generally recommend one repository/parent directory per project. That way, you leave the door open for CI/CD down the line if that's something you ever want to set up.

As for the code itself, we’ve seen effective organization where external code is partitioned by function and/or business case, so one directly for SQL, one for data processing tasks, one for data validation, etc.
