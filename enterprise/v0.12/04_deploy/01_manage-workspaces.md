---
title: "Manage Workspaces and Deployments on Astronomer"
navTitle: "Manage Workspaces"
description: "Manage Astronomer Workspaces and Airflow Deployments via the Astronomer UI."
---

We've designed the Astronomer UI as a place for you to easily and effectively manage users, deployments and resources.

## Dashboard

Once logged in, you'll land on a dashboard that gives you an overview of your Workspaces. We'll call this the **Account Dashboard**:

![Account Dashboard](https://assets2.astronomer.io/main/docs/astronomer-ui/v0.12-empty-dashboard.png)

From this dashboard, you can:

1. Spin up new Workspaces
2. View the workspaces you currently have access to
3. Update your name from the "Account Settings" menu

## Workspaces

**The Astronomer Workspace:** A personal or shared space that is home to a collection of Airflow deployments. User access to deployments is managed at the workspace level on Astronomer.

A **Workspace** is an Astronomer-specific term. You can think of your workspaces the same way you'd think of teams - they're just collections of Airflow deployments that specific user groups have access to. When you create an account on Astronomer, a default personal workspace is automatically created. Airflow deployments are hierarchically lower - from a workspace, you can create one or more Airflow deployments, and grant or restrict user access to those deployments accordingly.

If you were a solo agent, you could have multiple Airflow deployments within that single workspace and have no need for additional workspaces. Teams, however, often share one or more workspaces labeled as such, and have multiple Airflow deployments from there.

Deployments cannot be used or shared across workspaces. While you’re free to push local DAGs and code anywhere you wish at any time, there is currently no way to move an existing Airflow instance from one workspace to another once deployed.

Once you click into a workspace, you'll land on another dashboard that we'll call the **Workspace Dashboard**:

![Workspace Dashboard](https://assets2.astronomer.io/main/docs/astronomer-ui/v0.12-deployments.png)

Here, you have a high-level overview of all of the active Airflow deployments you have running in that given workspace. In this case, we only have one cluster spun up.

From this screen, you can:

1. Create new Airflow deployments
2. Manage user access to the workspace
3. Generate tokens for CI/CD systems via service accounts.
4. Rename your Workspace

Since all of our app activity is routed through a GraphQL API, you're free to create deployments, switch workspaces, and add users via our [CLI](https://www.astronomer.io/docs/cli-quickstart/) if you prefer staying in your terminal.

**Note:** The concept of a "workspace" only exists at the API level to help with permissions. It does **not** have anything to do with how Airflow will run jobs.

## Deployments

A single instance of [Apache Airflow](https://airflow.apache.org/) made up of a scheduler, a webserver, and one or more workers. A deployment has the capacity to host a collection of DAGs.

In the context of Astronomer, the term **Airflow Deployment** is used to describe an instance of Airflow that you've spun up either via our [UI](https://astronomer.io/docs/overview) or [CLI](https://astronomer.io/docs/cli-quickstart) as part of a workspace. Under the hood, each deployment gets its own Kubernetes namespace and has a set isolated resources reserved for itself.

You're able to adjust the resources given to your Airflow deployment directly from the UI. This functionality allows you to choose executor (local or celery) and easily provision additional resources as you scale up.


From the Workspace dashboard, navigate back to the "Deployments" tab.

If you click into one of your Airflow deployments, you'll land on a page that looks like this:

![Deployments](https://assets2.astronomer.io/main/docs/astronomer-ui/v0.15-deployment.png)

From here, you'll be able to access:

1. Airflow UI (DAG Dashboard)
2. Flower Dashboard (if you are running the Celery executor)

The former will link you directly to your DAG Dashboard on Airflow itself. Your Flower Dashboard is your go-to spot to monitor your Celery Workers.

For a breakdown the Airflow UI itself, check out [this guide](https://www.astronomer.io/guides/airflow-ui/).

**Each deployment will run in a separate Kubernetes namespace, so they'll all get resources and maintain metadata independently. You should assume that each deployment is unaware of the others.**

## User Management

If you navigate over to the "Users" tab of your Workspace Dashboard, you'll be able to see who has access to the Workspace. If you'd like to share access to other members of your organization, invite them to a workspace you're a part of. Once members, they'll have access to _all_ Airflow deployments under that workspace.

## Workspace Permissions

Users in a Workspace can be given the role of a **Viewer**, **Editor**, or **Admin***. An exact breakdown of these roles can be found in the [User Roles and Permissions](https://www.astronomer.io/docs/rbac/) section. Astronomer Enterprise admins can [configure the exact permissions](https://www.astronomer.io/docs/ee-configuring-permissions/) for each Astronomer role.