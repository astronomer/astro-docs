---
title: "Manage Workspaces and Deployments on Astronomer"
navTitle: "Manage Workspaces"
description: "Manage Astronomer Workspaces and Airflow Deployments via the Astronomer UI."
---

We've designed the Astronomer UI as a place for you to easily manage users, Airflow Deployments and resources.

## Dashboard

Once logged in, you'll land on a view that will direct you to create a new **Workspace**. From this view, you can:

1. Create a new Workspace
2. View the Workspaces you have access to in the left-hand navigation
3. Access "Documentation," "Account Settings" and more in the Account drop-down menu

![Account Dashboard](https://assets2.astronomer.io/main/docs/astronomer-ui/v0.12-empty-dashboard.png)

## Workspaces

**The Astronomer Workspace:** A personal or shared space that is home to a collection of Airflow Deployments. User access to Deployments is managed at the Workspace level on Astronomer.

A **Workspace** is an Astronomer-specific term. You can think of your Workspaces the same way you'd think of teams - they're just collections of Airflow Deployments that specific user groups have access to. When you create an account on Astronomer, a default personal Workspace is automatically created. Airflow Deployments are hierarchically lower - from a Workspace, you can create one or more Airflow Deployments, and grant or restrict user access to those Deployments accordingly.

If you were a solo agent, you could have multiple Airflow Deployments within that single Workspace and have no need for additional Workspaces. Teams, however, often share one or more Workspaces labeled as such, and have multiple Airflow Deployments from there.

Deployments cannot be used or shared across Workspaces. While you’re free to push local DAGs and code anywhere you wish at any time, there is currently no way to move an existing Airflow instance from one Workspace to another once deployed.

Once you click into a Workspace, you'll land on another dashboard that we'll call the **Workspace Dashboard**:

![Workspace Dashboard](https://assets2.astronomer.io/main/docs/astronomer-ui/v0.12-deployments.png)

Here, you have a high-level overview of all of the active Airflow Deployments you have running in that given Workspace. In this case, we only have one cluster spun up.

From this screen, you can:

1. Create new Airflow Deployments
2. Manage user access to the Workspace
3. Generate tokens for CI/CD systems via service accounts.
4. Rename your Workspace

Since all of our app activity is routed through a GraphQL API, you're free to create Deployments, switch Workspaces, and add users via our [CLI](/docs/cloud/stable/develop/cli-quickstart/) if you prefer staying in your terminal.

> **Note:** The concept of a "Workspace" only exists at the API level to support role-based access control and user permissions. It will not affect Airflow task execution.

## Deployments

An [Apache Airflow](https://airflow.apache.org/) Deployment is made up of a Scheduler, a Webserver and, if you're running the Celery or Kubernetes Executors, one or more Workers. An Airflow Deployment within a Workspace has the capacity to host a collection of DAGs.

In the context of Astronomer, the term **Airflow Deployment** is used to describe an instance of Airflow that you've spun up either via the Astronomer UI or [CLI](/docs/cloud/stable/develop/cli-quickstart/) as part of a Workspace. Under the hood, each Airflow Deployment gets its own Kubernetes namespace and has a reserved set of dedicated resources and an underlying Postgres Metadata Database.

You're able to adjust the resources given to your Airflow deployment directly from the UI. This functionality allows you to choose executor (local or celery) and easily provision additional resources as you scale up.

From the Workspace dashboard, navigate back to the "Deployments" tab.

If you click into one of your Airflow Deployments, you'll land on a page that looks like this:

![Deployments](https://assets2.astronomer.io/main/docs/astronomer-ui/v0.15-deployment.png)

From here, you'll be able to access:

1. Airflow UI (DAG Dashboard)
2. Flower Dashboard (if you are running the Celery executor)

The former will link you directly to your DAG Dashboard on Airflow itself. Your Flower Dashboard is your go-to spot to monitor your Celery Workers.

For a breakdown the Airflow UI itself, check out [this guide](/guides/airflow-ui/).

> **Note:** All Airflow Deployments run in an isolated Kubernetes namespace, which means resources will be provisioned independently and data will be kept isolated from the rest. You can assume that each Airflow Deployment is unaware of the others, even within the same Workspace.

## User Management

If you navigate over to the "Users" tab of your Workspace Dashboard, you'll be able to see who has access to the Workspace.

If you'd like to share access to other members of your organization, invite them to a Workspace you're a part of. Once members, they'll have access to _all_ Airflow Deployments under that Workspace with varying permissions.

### Workspace Permissions

Users in a Workspace can be given the role of a **Viewer**, **Editor**, or **Admin***. An exact breakdown of these roles can be found in the [User Roles and Permissions](/docs/cloud/stable/manage-astronomer/workspace-permissions/) section.
