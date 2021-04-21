---
title: "Configure an Airflow Deployment on Astronomer"
navTitle: "Configure a Deployment"
description: "How to configure your Airflow Deployment's Resources on Astronomer."
---

## Overview

An Airflow Deployment on Astronomer is an instance of Apache Airflow that was created either via the Astronomer UI or the Astronomer CLI. Each Airflow Deployment on Astronomer is hosted on a single Kubernetes namespace, has a dedicated set of resources, and operates with an isolated Postgres Metadata Database.

This guide walks you through the process of creating and configuring an Airflow Deployment on Astronomer.

## Prerequisites

To create an Airflow Deployment, you'll need:
* [The Astronomer CLI](/docs/cloud/stable/develop/cli-quickstart/) installed.
* An account on [Astronomer Cloud](https://app.gcp0001.us-east4.astronomer.io/).
* An Astronomer [Workspace](https://www.astronomer.io/docs/cloud/stable/deploy/manage-workspaces).

## Create a Deployment

To create an Airflow Deployment on Astronomer:

1. Log in to [Astronomer Cloud](https://app.gcp0001.us-east4.astronomer.io/), open your Workspace, and click **New Deployment**.

2. Use the **New Deployment** menu to configure the following:

  * **Name**
  * **Description** (Optional)
  * **Airflow Version**: We recommend using the latest version.
  * **Executor**: We recommend starting with Local.

3. Click **Create Deployment** and give the Deployment a few moments to spin up. Within a few seconds, you'll have access to the **Settings** page of your new Deployment:
![New Deployment Celery Dashboard](https://assets2.astronomer.io/main/docs/deploying-code/v0.23-new_deployment-dashboard.png)

This tab is the best place to modify resources for your Deployment. Specifically, you can:

- Select an Airflow Executor
- Allocate resources to your Airflow Scheduler and Webserver
- Set Scheduler Count (*Airflow 2.0+ only*)
- Add Extra Capacity (*Kubernetes only*)
- Set Worker Count (*Celery only*)
- Adjust your Worker Termination Grace Period (*Celery only*)

The rest of this guide provides additional guidance for configuring each of these settings.

> **Note:** Adjusting resources will affect your monthly bill on Astronomer Cloud. For more information on resource cost and pricing, refer to [Cloud Pricing](https://www.astronomer.io/docs/cloud/stable/resources/pricing).

## Select an Executor

The Airflow [Executor](https://airflow.apache.org/docs/apache-airflow/stable/executor/index.html) works closely with the Airflow Scheduler to decide what resources will complete tasks as they're queued. The difference between Executors comes down to their available resources and how they utilize those resources to distribute work.

Astronomer supports 3 Executors:

- [Local Executor](https://airflow.apache.org/docs/apache-airflow/stable/executor/local.html)
- [Celery Executor](https://airflow.apache.org/docs/apache-airflow/stable/executor/celery.html)
- [Kubernetes Executor](https://airflow.apache.org/docs/apache-airflow/stable/executor/kubernetes.html)

Though it largely depends on your use case, we recommend the Local Executor for development environments and the Celery or Kubernetes Executors for production environments operating at scale.

For a detailed breakdown of each Executor, read Astronomer's [Airflow Executors Explained](https://www.astronomer.io/guides/airflow-executors-explained).

## Scale Core Resources

Apache Airflow requires two primary components:

- The Airflow Webserver
- The Airflow Scheduler

To scale either resource, simply adjust the corresponding slider in the Astronomer UI to increase its available computing power.

Read the following sections to help you determine which core resources to scale and when.

### Airflow Webserver

The Airflow Webserver is responsible for rendering the [Airflow UI](https://airflow.apache.org/docs/apache-airflow/stable/ui.html), where users can monitor DAGs, view task logs, and set various non-code configurations.

If a function within the Airflow UI is slow or unavailable, we recommend increasing the AU allocated towards the Webserver. The default resource allocation is 5 AU.

> **Note:** Introduced in Airflow 1.10.7, [DAG Serialization](https://airflow.apache.org/docs/apache-airflow/stable/dag-serialization.html?highlight=dag%20serialization) removes the need for the Webserver to regularly parse all DAG files, making the component significantly more light-weight and performant. DAG Serialization is enabled by default in Airflow 1.10.12+ and is required in Airflow 2.0.

### Airflow Scheduler

The [Airflow Scheduler](https://airflow.apache.org/docs/apache-airflow/stable/scheduler.html) is responsible for monitoring task execution and triggering downstream tasks once dependencies have been met.

If you experience delays in task execution, which you can track via the [Gantt Chart](https://airflow.apache.org/docs/apache-airflow/stable/ui.html#gantt-chart) view of the Airflow UI, we recommend increasing the AU allocated towards the Scheduler. The default resource allocation is 10 AU.

> **Tip:** To set alerts that notify you via email when your Airflow Scheduler is underprovisioned, refer to [Airflow Alerts](/docs/cloud/stable/customize-airflow/airflow-alerts/).

#### Scheduler Count

[Airflow 2.0](https://www.astronomer.io/docs/cloud/stable/customize-airflow/upgrade-to-airflow-2) comes with the ability for users to run multiple Schedulers concurrently to ensure high-availability, zero recovery time, and faster performance. By adjusting the **Scheduler Count** slider in the Astronomer UI, users can provision up to 4 Schedulers on any Deployment running Airflow 2.0+ on Astronomer.

Each individual Scheduler will be provisioned with the AU specified in **Scheduler Resources**. For example, if you set **Scheduler Resources** to 10 AU and **Scheduler Count** to 2, your Airflow Deployment will run with 2 Airflow Schedulers using 10 AU each for a total of 20 AU.

To increase the speed at which tasks are scheduled and ensure high-availability, we recommend provisioning 2 or more Airflow Schedulers for production environments. For more information on the Airflow 2.0 Scheduler, refer to Astronomer's ["The Airflow 2.0 Scheduler" blog post](https://www.astronomer.io/blog/airflow-2-scheduler).

## Kubernetes Executor: Set Extra Capacity

On Astronomer, resources required for the [KubernetesPodOperator](https://www.astronomer.io/docs/cloud/stable/customize-airflow/kubepodoperator) or the Kubernetes Executor are set as **Extra Capacity**.

The Kubernetes Executor and KubernetesPodOperator each spin up an individual Kubernetes pod for each task that needs to be executed, then spin down the pod once that task is completed.

The amount of AU (CPU and Memory) allocated to **Extra Capacity** maps to [resource quotas](https://kubernetes.io/docs/concepts/policy/resource-quotas/) on the [Kubernetes Namespace](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) in which your Airflow Deployment lives on Astronomer. More specifically, **Extra Capacity** represents the maximum possible resources that could be provisioned to a pod at any given time.

AU allocated to **Extra Capacity** does not affect Scheduler or Webserver performance and does not represent actual usage. It will not be charged as a fixed resource.

## Celery Executor: Configure Workers

To optimize for flexibility and availability, the Celery Executor works with a set of independent Celery Workers across which it can delegate tasks. On Astronomer, you're free to configure your Celery Workers to fit your use case.

### Worker Count

By adjusting the **Worker Count** slider, users can provision up to 20 Celery Workers on any Airflow Deployment.

Each individual Worker will be provisioned with the AU specified in **Worker Resources**. If you set **Worker Resources** to 10 AU and **Worker Count** to 3, for example, your Airflow Deployment will run with 3 Celery Workers using 10 AU each for a total of 30 AU. **Worker Resources** has a maximum of 100 AU (10 CPU, 37.5 GB Memory).

### Worker Termination Grace Period

On Astronomer, Celery Workers restart following every code deploy to your Airflow Deployment. This is to make sure that Workers are executing with the most up-to-date code. To minimize disruption during task execution, however, Astronomer supports the ability to set a **Worker Termination Grace Period**.

If a deploy is triggered while a Celery Worker is executing a task and **Worker Termination Grace Period** is set, the Worker will continue to process that task up to a certain number of minutes before restarting itself. By default, the grace period is ten minutes.

> **Tip:** The **Worker Termination Grace Period** is an advantage to the Celery Executor. If your Airflow Deployment runs on the Local Executor, the Scheduler will restart immediately upon every code deploy or configuration change and potentially interrupt task execution.

## Set Environment Variables

Environment Variables can be used to set [Airflow configurations](https://airflow.apache.org/docs/apache-airflow/stable/configurations-ref.html) and custom values, both of which can be applied to your Airflow Deployment either locally or on Astronomer.

These can include setting Airflow Parallelism, an SMTP service for Alerts, or a [secrets backend](https://www.astronomer.io/docs/cloud/stable/customize-airflow/secrets-backend) to manage Airflow Connections and Variables.

Environment Variables can be set for your Airflow Deployment either in the **Variables** tab of the Astronomer UI or in your `Dockerfile`. If you're developing locally, they can also be added to a local `.env` file. For more information on configuring Environment Variables, read [Environment Variables on Astronomer](/docs/cloud/stable/deploy/environment-variables/).

> **Note**: Environment Variables are distinct from [Airflow Variables](https://airflow.apache.org/docs/apache-airflow/stable/howto/variable.html?highlight=variables) and [XComs](https://airflow.apache.org/docs/apache-airflow/stable/concepts.html?highlight=xcom#concepts-xcom), which you can configure directly via the Airflow UI and are used for inter-task communication.
