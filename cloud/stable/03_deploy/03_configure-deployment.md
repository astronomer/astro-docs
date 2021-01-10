---
title: "Configure an Airflow Deployment on Astronomer"
navTitle: "Configure a Deployment"
description: "How to configure your Airflow Deployment's Resources on Astronomer."
---

Once you've [created your Airflow Deployment](https://www.astronomer.io/docs/cloud/stable/deploy/deploy-cli), you can configure it based on the needs of your organization via the Astronomer UI.

## Allocate Resources

In the **Settings** tab for your Airflow Deployment, you can adjust the amounts of resources your Deployment uses for various functions. This empowers you to freely scale your Deployment up or down as you wish. To this end, you can:

1. Choose your Executor (Local, Celery, or Kubernetes)
2. Adjust resources to your Scheduler and Webserver
3. Adjust Worker Count (*Celery only*)
4. Adjust your Worker Termination Grace Period (*Celery only*)
5. Add Extra Capacity

![Astro UI Executor Config](https://assets2.astronomer.io/main/docs/astronomer-ui/v0.23-astro-UI-executor.png)

To adjust resources, you can either use a slider or specify a specific number of AUs (Astronomer Units of CPU and memory) you want to allocate towards your Scheduler, Webserver, and Celery Workers (if applicable).

> **Note:** Adjusting your resources will affect your pricing on Astronomer Cloud. For more information, refer to [Cloud Pricing](https://www.astronomer.io/docs/cloud/stable/resources/pricing).

### Which executor should I use?

Generally speaking, we recommend the Local Executor for any development environments and the Celery and Kubernetes Executors for any production environments.

The Local Executor will execute DAGs within the Scheduler process. If you are only running a few light tasks a day that don't use much memory, the Local Executor might be sufficient for running your DAGs.

As you scale up the number of tasks or the resources your workflows require, we recommend moving over to Celery or Kubernetes. For more information on each type of Executor, read Astronomer's [Airflow Executors Explained](https://www.astronomer.io/guides/airflow-executors-explained) guide.

> **Note:** Regardless of which Airflow Executor you choose, each task will run in a temporary container. No tasks will have access to any locally stored file created by a separate task.

## Scale Core Resources

If Airflow is slowing down after adding new tasks, it's likely time to scale up either your Scheduler or Webserver via the Astronomer UI. The settings for these resources are available in the **Core Resources** section of your Airflow Deployment's **Settings** tab. When you need to scale a resource, simply adjust the slider for the resource to increase its available computing power.

Read the following sections to help you determine which core resources to scale and when.

### Webserver Resources

The Webserver is responsible for rendering the Airflow UI. If you notice that it's taking longer than usual for DAGs to render in the Airflow UI, or if your Airflow UI crashes when loading a DAG, it might be time to scale your Webserver.

### Scheduler Resources

If you are seeing delays in tasks being scheduled on the [Gantt Chart](https://airflow.apache.org/docs/apache-airflow/stable/ui.html#gantt-chart) in the Airflow UI, it's likely time to scale your Scheduler.

If you want to set up email alerts to be notified when your Scheduler is underprovisioned, refer to our [Airflow Alerts doc](/docs/cloud/stable/customize-airflow/airflow-alerts/).

### Scheduler Count

Increasing the **Scheduler Count** slider creates multiple schedulers that run simultaneously on your Deployment. If you want to significantly increase the speed at which you schedule tasks, scaling your Scheduler Count is the fastest way to do so. Each Scheduler uses the amount of resources you've provisioned using **Scheduler Resources** setting. For instance, if you provision 2 CPUs in Scheduler resources and have 2 Schedulers, you'll be using 4 CPUs of Scheduler resources total.

You also might want multiple Schedulers to eliminate single points of failure in your Deployment. If one Scheduler is down, you can keep scheduling and executing tasks through additional Schedulers.

We generally recommend having only one Scheduler for development environments and multiple Schedulers for production environments.  

## Scale Extra Capacity

The **Extra Capacity** setting is tied to the [KubernetesPodOperator](/docs/cloud/stable/customize-airflow/kubepodoperator/) and the KubernetesExecutor, as it maps to extra pods created in the cluster. Namely, the slider affects:

1. CPU and memory quotas
2. Database connection limits.

## Configure Environment Variables

Environment Variables are a set of configurable values that allow you to dynamically fine tune your Airflow Deployment. As you think about scaling your use of Airflow, you might consider customizing any of the following Environment Variables:

- `AIRFLOW__CORE__PARALLELISM`
- `AIRFLOW__CORE__DAG_CONCURRENCY`
- `AIRFLOW__CELERY__WORKER_CONCURRENCY`
- `AIRFLOW__SCHEDULER__MAX_THREADS`

![Astro UI Env Vars Config](https://assets2.astronomer.io/main/docs/astronomer-ui/v0.16-Astro-UI-EnvVars.png)

To learn more, consider the following two resources:

- ["Environment Variables on Astronomer"](/docs/cloud/stable/deploy/environment-variables/) Doc
- ["Scaling out Airflow"](/guides/airflow-scaling-workers/) Guide

> **Note**: Environment Variables are distinct from Airflow Variables/XComs, which you can configure directly via the Airflow UI/our CLI/your DAG code and are used for inter-task communication.
