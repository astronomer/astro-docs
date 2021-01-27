---
title: "Manage Workspaces and Deployments on Astronomer"
navTitle: "Create a Workspace"
description: "Manage Astronomer Workspaces and Airflow Deployments via the Astronomer UI."
---

## Overview

A Workspace is the highest level of organization on Astronomer. From a Workspace, you can manage a collection of Airflow Deployments and manage other users' access to those Deployments. New Workspaces can be created using the **New Workspace** button on in the sidebar of the Astronomer UI.  

This guide walks through the best practices for creating and managing Workspaces as a Workspace admin. It's organized by the 4 tabs you can access from the Workspace menu in the Astronomer UI:

* Deployments
* Settings
* Users
* Service Accounts

## Deployments

The most important function of Workspaces is creating and managing access to Airflow Deployments: instances of Airflow that you've spun up either via the Astronomer UI or [CLI](/docs/enterprise/stable/develop/cli-quickstart/). To create a new Deployment, simply click the **New Deployment** button in the **Deployments** tab and configure its settings. For more information on configuring Deployment settings, read [Configure a Deployment](https://www.astronomer.io/docs/enterprise/v0.23/deploy/configure-deployment).

The **Deployments** tab also contains information on all of your existing Deployments, including names, Executor types, and Deployment status. A blue dot next to a Deployment's name indicates that the Deployment is still spinning up, while a green dot indicates that the Deployment is fully operational:

![Deployment Tab](https://assets2.astronomer.io/main/docs/astronomer-ui/v0.12-deployments.png)

Deployments cannot be used or shared across Workspaces. While you’re free to push local DAGs and code anywhere you wish at any time, there is currently no way to move an existing Airflow instance from one Workspace to another once deployed.

## Settings

You can use the **Settings** tab to rename your Workspace or rewrite its description. While these fields have no effect on how tasks are executed, we recommend configuring them to give users an idea of the Workspace's purpose and scope.

## Users

If you go to the **Users** tab of your Workspace Dashboard, you'll see who has access to the Workspace.

If you'd like to share access to other members of your organization, invite them to a Workspace you're a part of. Once your team members are part of your Workspace, Deployment Admins can grant them varying levels of access to Airflow Deployments within the Workspace. Likewise, Workspace Admins can grant them varying levels of access to the entire Workspace.

An exact breakdown of user roles and their respective levels of access can be found in [Manage User Permissions on an Astronomer Workspace](/docs/enterprise/stable/manage-astronomer/workspace-permissions/).

In addition, Enterprise admins can add or remove specific permissions for each type of user role. For more information on this feature, read [Customize Permissions](https://www.astronomer.io/docs/enterprise/stable/manage-astronomer/manage-platform-users#customize-permissions).

## Service Accounts

In the **Service Accounts** tab, you can create a new Service Account to push code and deploy to your Workspace's Airflow Deployments via a Continuous Integration/Continuous Delivery (CI/CD) tool of your choice.

Creating a Service Account at the Workspace level allows you to deploy to multiple Airflow deployments with one code push, while creating them at the Deployment level ensures that your CI/CD pipeline only deploys to one particular deployment on Astronomer. For more information on this feature, read [Deploy via CI/CD](https://www.astronomer.io/docs/enterprise/v0.23/deploy/ci-cd).
