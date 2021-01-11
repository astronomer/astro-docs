---
title: "Configure an Airflow Deployment on Astronomer"
navTitle: "Configure a Deployment"
description: "How to configure your Airflow Deployment's Resources on Astronomer."
---

Once you've [created an Airflow Deployment](https://www.astronomer.io/docs/cloud/stable/deploy/deploy-cli), you can configure it based on the needs of your organization via the Astronomer UI.

## Overview

The **Settings** tab of an Airflow Deployment on Astronomer is the best place to set deployment-level configurations allocate resources to various components of your Deployment. More specifically, you can:

1. Select an Airflow Executor
2. Allocate resources to your Airflow Scheduler and Webserver
3. Set Scheduler Count (*Airflow 2.0+ only*)
4. Set Worker Count (*Celery only*)
5. Adjust your Worker Termination Grace Period (*Celery only*)
6. Add Extra Capacity (*Kubernetes only*)

![Astro UI Executor Config](https://assets2.astronomer.io/main/docs/astronomer-ui/v0.23-astro-UI-executor.png)

> **Note:** Adjusting resources will affect your monthly bill on Astronomer Cloud. For more information on resource cost and pricing, refer to [Cloud Pricing](https://www.astronomer.io/docs/cloud/stable/resources/pricing).

## Select an Executor

In the context of Apache Airflow, [the Executor](https://airflow.apache.org/docs/apache-airflow/stable/executor/index.html) works closely with the Airflow Scheduler to decide what resources will actually complete those tasks as they're queued. The difference between Executors comes down to the resources they have at hand and how they choose to utilize those resources to distribute work (or not distribute it at all).

Astronomer supports 3 Executors:

- [Local Executor](https://airflow.apache.org/docs/apache-airflow/stable/executor/local.html)
- [Celery Executor](https://airflow.apache.org/docs/apache-airflow/stable/executor/celery.html)
- [Kubernetes Executor](https://airflow.apache.org/docs/apache-airflow/stable/executor/kubernetes.html)

Though it largely depends on your use case, we recommend the Local Executor for development environments and the Celery or Kubernetes Executors for production environments operating at scale.

For a detailed breakdown of each Executor, read Astronomer's [Airflow Executors Explained](https://www.astronomer.io/guides/airflow-executors-explained).

## Scale Core Resources

Apache Airflow requires two primary components:

1. The Airflow Webserver
2. The Airflow Scheduler

To scale either resource, simply adjust the slider for the resource to increase its available computing power.

Read the following sections to help you determine which core resources to scale and when.

### Airflow Webserver

The Airflow Webserver is responsible for rendering the [Airflow UI](https://airflow.apache.org/docs/apache-airflow/stable/ui.html), where users can monitor DAGs, view task logs, and set various non-code configurations. 

If a function within the Airflow UI is slow or unavailable, we recommend raising the AUs allocated towards the Webserver. The default resource allocation is 5 AU.

To acceess the Airflow UI, click **Open Airflow** on the top, right-hand side of any Deployment page in the Astronomer UI.

> **Note:** Introduced in Airflow 1.10.7, [DAG Serialization](https://airflow.apache.org/docs/apache-airflow/stable/dag-serialization.html?highlight=dag%20serialization) removes the need for the Webserver to regularly parse all DAG files, making the component significantly more light-weight and performant. DAG Serialization is enabled by default in Airflow 1.10.12+ and is required in Airflow 2.0.

### Airflow Scheduler

The [Airflow Scheduler](https://airflow.apache.org/docs/apache-airflow/stable/scheduler.html) is responsible for monitoring task execution and triggering downstream tasks once dependencies have been met.

If you experience delays in task execution, which you can track via the [Gantt Chart](https://airflow.apache.org/docs/apache-airflow/stable/ui.html#gantt-chart) view of the Airflow UI, we recommend raising the AUs allocated towards the Scheduler. The default resource allocation is 10 AU.

> **Tip:** To set alerts that notify you via email when your Airflow Scheduler is underprovisioned, refer to [Airflow Alerts](/docs/cloud/stable/customize-airflow/airflow-alerts/).

### Scheduler Count

[Airflow 2.0](https://www.astronomer.io/docs/cloud/stable/customize-airflow/upgrade-to-airflow-2) comes with the ability for users to run multiple Schedulers concurrently to ensure high-availability, zero recovery time, and faster performance. By adjusting the **Scheduler Count** slider in the Astronomer UI, users can provision up to 4 Schedulers on any Deployment running Airflow 2.0+ on Astronomer.

As is the case with **Worker Count**, resources specified in **Scheduler Resources** apply to all Schedulers. If you set **Scheduler Resources** to 10AU and **Scheduler Count** to 2, for example, your Airflow Deployment will run with 2 Airfow Schedulers use 10 AU each for a total cost of 20 AU.

To increase the speed at which tasks are scheduled and ensure high-availability, we recommend provisioning 2 or more Airflow Schedulers for production environments. For more information on the Airflow 2.0 Scheduler, refer to Astronomer's ["The Airflow 2.0 Scheduler" blog post](https://www.astronomer.io/blog/airflow-2-scheduler).

## Extra Capacity

On Astronomer, resources required for the [KubernetesPodOperator](https://www.astronomer.io/docs/cloud/stable/customize-airflow/kubepodoperator) or the Kubernetes Executor are set as **Extra Capacity**.

The Kubernetes Executor and KubernetesPodOperator each spins up an individual Kubernetes pod for each task that needs to be executed and spins the pod down once that task is completed.

The number of AUs (CPU and Memory) allocated to **Extra Capacity** maps to [resource quotas](https://kubernetes.io/docs/concepts/policy/resource-quotas/) on the [Kubernetes Namespace](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) in which your Airflow Deployment lives on Astronomer. More specifically, **Extra Capacity** represents the maximum possible resources that could be provisioned to a single or set of pods at any given time.

The AUs allocated to **Extra Capacity** do not represent actual usage, will not be charged as a fixed resource, and do not affect Scheduler or Webserver performance.

## Set Environment Variables

Environment Variables are a set of configurable values that allow you to dynamically fine tune your Airflow Deployment. As you think about scaling your use of Airflow, you might consider customizing any of the following Environment Variables:

- `AIRFLOW__CORE__PARALLELISM`
- `AIRFLOW__CORE__DAG_CONCURRENCY`
- `AIRFLOW__CELERY__WORKER_CONCURRENCY`
- `AIRFLOW__SCHEDULER__MAX_THREADS`

![Astro UI Env Vars Config](https://assets2.astronomer.io/main/docs/astronomer-ui/v0.16-Astro-UI-EnvVars.png)

To learn more, consider the following two resources:

- ["Environment Variables on Astronomer"](/docs/cloud/stable/deploy/environment-variables/) Doc
- ["Scaling out Airflow"](/guides/airflow-scaling-workers/) Guide

> **Note**: Environment Variables are distinct from Airflow Variables/XComs, which you can configure directly via the Airflow UI and are used for inter-task communication.