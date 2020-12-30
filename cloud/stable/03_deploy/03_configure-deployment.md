---
title: "Configure an Airflow Deployment on Astronomer"
navTitle: "Configure a Deployment"
description: "How to configure your Airflow Deployment's Resources on Astronomer."
---

In Astronomer, the term **Airflow Deployment** describes an instance of Airflow that you've spun up either via the Astronomer UI or the [Astronomer CLI](/docs/cloud/stable/develop/cli-quickstart/). Under the hood, each Airflow Deployment gets its own Kubernetes namespace and has a reserved set of dedicated resources and an underlying Postgres Metadata Database.

This guide walks you through the process of creating and managing Deployments using the Astronomer UI.


## Create an Airflow Deployment

1. Log into [Astronomer Cloud](https://app.gcp0001.us-east4.astronomer.io/), open your Workspace, and click **New Deployment**.
![Workspace Dashboard](https://assets2.astronomer.io/main/docs/deploying-code/v0.23-deployments.png)

2. Use the **New Deployment** menu to configure the following:
    * **Name**
    * **Description** (Optional)
    * **Airflow Version**: We recommend using the latest version.

3. Click **Create Deployment**.

## Accessing your Deployment Dashboard

Once you've spun up your Deployment, you'll have access to your Deployment dashboard:

![New Deployment Celery Dashboard](https://assets2.astronomer.io/main/docs/deploying-code/v0.23-new_deployment-dashboard.png)

From this dashboard, you can:

- Modify your Resources
- Initialize the Airflow upgrade process
- Configure **Email Alerts**
- Access the Airflow UI
- Access your Celery Dashboard (if using CeleryExecutor)
- Delete your Deployment

## Choose an Executor for Your Deployment

The type of Executor you choose for your Airflow Deployment determines how that Deployment uses computing resources to execute DAGs. Read [Airflow Executors Explained](/guides/airflow-executors-explained/) to learn more about the function of Executors, as well as which architectures are best suited for each type of Executor.

Generally speaking, we recommend using the Local Executor for development environments and using the Celery or Kubernetes Executor for production environments.

The Local Executor executes DAGs within the same machine the Scheduler runs on. This Executor is ideal for development environments where you run only a few light tasks that don't use much memory.

As you scale up the number of tasks or the resources your workflows require, such as in production environments we recommend moving using the Celery or Kubernetes Executor. The Celery Executor excels at timeliness and horizontal scaling, while the Kubernetes Executor excels at efficiency, fault tolerance, and adaptability.

Regardless of which Executor you choose, each of your tasks runs in a temporary container. No tasks will have access to any locally stored file created by a separate task.

## Allocate Resources for a Deployment

You can use Astronomer to adjust your resource components and freely scale your Airflow Deployment up or down as needed. The following actions are available from the **Settings** tab for your Deployment:

* Changing your Executor (Local, Celery, or Kubernetes)
* Adjusting resources for your Scheduler and Webserver
* Updating your Airflow version
* Adjusting Worker Count (Celery only)
* Adjusting your Worker Termination Grace Period (Celery only)
* Adding Extra Capacity (Kubernetes or KubernetesPodOperator only)

## Scale your Deployment's Scheduler and Webserver

If the Gantt Chart in the Airflow UI shows delays in task scheduling, or if you receive an [Airflow Alert](/docs/cloud/stable/customize-airflow/airflow-alerts/) indicating that your Scheduler is low on resources, it's probably time to scale up your Scheduler.

Alternatively, if your Airflow UI is slow or crashes when you try to load a large DAG, you might need to scale up your Webserver instead. To scale either of these components:

1. In the Astronomer UI, go to **Settings** > **Resources**
2. Adjust either the **Webserver** or **Scheduler** sliders to increase the allocated resources for the respective component. Alternatively, you can update the **AU** field next to the slider to adjust resources by Astronomer Units (AU), which is our standard measurement for Airflow computing resources. 1 AU is equivalent to 0.1 unit of computing processing power.

Note that increasing the allocated resources for your Cloud components will result in changes to your [pricing](https://www.astronomer.io/docs/cloud/stable/resources/pricing).  

## Add Extra Capacity to Kubernetes Exectors

You can adjust an **Extra Capacity** slider for the [KubernetesPodOperator](/docs/cloud/stable/customize-airflow/kubepodoperator/) and the Kubernetes Executor to allocate additional resources for the pods on your cluster. Specifically, the slider affects:

* CPU and memory quotas
* Database connection limits

At their core, both the Kubernetes Executor and KubernetesPodOperator dynamically spin up an individual Pod for each task that needs to be executed - and spin it down once that task is completed. The total AUs allocated using the **Extra Capacity** slider represents the maximum possible resources that could be provisioned to a single or set of pods at any given time. It does not represent actual usage and will not be charged as a fixed resource.

## Configure Your Airflow Deployment Using Environment Variables

Environment Variables are key-value pairs that allow you to dynamically fine-tune your Airflow Deployment. Your Deployment's Environment Variables can be configured in the **Variables** tab in the Astronomer UI:
![Astro UI Env Vars Config](https://assets2.astronomer.io/main/docs/astronomer-ui/v0.16-Astro-UI-EnvVars.png)

As scale your use of Airflow, consider adding any of the following Environment Variables to your Deployment:

* `AIRFLOW__CORE__PARALLELISM`: Defines the maximum number of tasks that can run concurrently across your entire Deployment.
* `AIRFLOW__CORE__DAG_CONCURRENCY`: Defines the maximum number of tasks that can run concurrently for a given DAG.
* `AIRFLOW__CELERY__WORKER_CONCURRENCY`: Defines the maximum number of tasks that a worker can work on at a given time.
* `AIRFLOW__SCHEDULER__MAX_THREADS`: Defines the maximum number or processes that the Scheduler can handle at once.


To learn more, read the following:

* [Environment Variables on Astronomer](/docs/cloud/stable/deploy/environment-variables/)
* [Scaling out Airflow](/guides/airflow-scaling-workers/)

> **Note**: Environment Variables are distinct from Airflow Variables/XComs, which you can configure directly via the Airflow UI/our CLI/your DAG code and are used for inter-task communication.
