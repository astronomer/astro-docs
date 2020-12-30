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

Before you deploy to Astronomer, make sure that the Airflow Deployment you'd like to push code to is within the Workspace you're operating in.

To see the list of Workspaces you have access to, run:

```
$ astro workspace list
```

To switch between Workspaces, run:

```
$ astro workspace switch
```

When you're in the appropriate workspace, run the following command to show a list of available deployments:

```
$ astro deployment list
```

## Step 3: Deploy to Astronomer

Finally, make sure you're in the correct Airflow project directory.

When you're ready to deploy your DAGs, run:

```
$ astro deploy
```
This command returns a list of Airflow Deployments available in your Workspace and prompts you to pick one.

## Step 4: Validate Your Changes

If it's your first time deploying, expect to wait a few minutes for the Docker Image to build.

To confirm that your deploy was successful, navigate to your Deployment in the Astronomer UI and click **Open Airflow** to see your changes in the Airflow UI.


### What gets Deployed?

Everything in your top level directory (and all children directories) where you ran `$ astro dev init` will get bundled into a Docker image and deployed to your Airflow Deployment on Astronomer Cloud.

We don't deploy any of the Metadata associated with your local Airflow deployment, only the code.

For more information on what gets built into your image, read [Customizing your Image](/docs/cloud/stable/develop/customize-image/).

## Additional Considerations

### Kubernetes Namespaces

Airflow Deployments live within their own Kubernetes [Namespace](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) - each completely unaware of the rest.

Each Airflow Deployment is allocated separate resources, configured in isolation, and maintains its own metadata.

### Organizing Astronomer

While the specific needs of your organization might require a slightly different structure than what's described here, these are some general best practices to consider when working with Astronomer:

**Workspaces:** We recommend having 1 Workspace per team of Airflow users, so that anyone on this team has access to the same set of Deployments under that Workspace.

**Deployments:** Most use cases will call for a "Production" and "Dev" Deployment, both of which exist within a single Workspace and are accessible to a shared set of users. From there, you can [set permissions](https://www.astronomer.io/docs/cloud/stable/manage-astronomer/workspace-permissions) to give users in the Workspace access to specific Deployments.

As for the code itself, we’ve seen effective organization where external code is partitioned by function and/or business case. In practice, this means having one Deployment for SQL, one for data processing tasks, one for data validation, etc.
