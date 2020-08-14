---
title: "Configure an Airflow Deployment on Astronomer"
navTitle: "Configure a Deployment"
description: "How to configure your Airflow Deployment's Resources on Astronomer."
---

Once you've created your deployment, you can configure it for the use case at hand.

## Allocating Resources

The "Settings" tab allows you to adjust your resource components - empowering you to freely scale your deployment up or down as you wish. To this end, you can:

1. Choose your Executor (Local, Celery, or Kubernetes)
2. Adjust resources to your Scheduler and Webserver
3. Adjust Worker Count (*Celery only*)
4. Adjust your Worker Termination Grace Period (*Celery only*)
5. Add Extra Capacity (*Kubernetes or KubernetesPodOperator only*)

![Astro UI Executor Config](https://assets2.astronomer.io/main/docs/astronomer-ui/v0.15-Astro-UI-Executor.png)

You can adjust the AUs (Astronomer Units of CPU and memory) you want to allocate towards your Scheduler, Webserver, and Celery Workers (if applicable).

If you're running Astronomer Enterprise, you can watch these in real time with your Grafana dashboards.

### Airflow Executors 101

Check out this [guide](https://www.astronomer.io/guides/airflow-executors-explained/) for a summary on each executor.

#### Which executor should I be using?

Generally speaking, we recommend the local executor for any "dev" environments and the Celery and Kubernetes executors for any "production" environments.

The local executor will execute your DAGs in the same pod as the scheduler. If you are only running a few light tasks a day that don't use much memory, it may give you what you need to run your DAGs successfully. As you scale up the number of tasks or the resources your workflows require, we recommend moving over to Celery or Kubernetes.

**Regardless of which executor you are using, each task will run in a temporary container. No tasks will have access to the any locally stored file created by a separate task.**

## Scaling the Scheduler and Webserver

If you are seeing delays in tasks being scheduled (check the Gantt Chart), it's usually time to scale up your scheduler. You can also receive email alerts when your scheduler is underprovisioned (more on this in the Alerting section).

If your Airflow UI is really slow or crashes when you try to load a large DAG, you'll want to scale up your webserver.


### Extra Capacity

The **Extra Capacity** setting is tied to the [KubernetesPodOperator](https://www.astronomer.io/docs/kubepodoperator/) and the KubernetesExecutor, as it maps to extra pods created in the cluster. Namely, the slider affects:

1. CPU and memory quotas
2. Database connection limits.

![Astro UI Executor Config](https://assets2.astronomer.io/main/docs/astronomer-ui/Astro-UI-Resources.png)

#### Environment Variables

Environment Variables are a set of configurable values that allow you to dynamically fine tune your Airflow Deployment. As you think about scaling your use of Airflow, you might consider customizing any of the following Environment Variables:

- `AIRFLOW__CORE__PARALLELISM`
- `AIRFLOW__CORE__DAG_CONCURRENCY`
- `AIRFLOW__CELERY__WORKER_CONCURRENCY`
- `AIRFLOW__SCHEDULER__MAX_THREADS`

![Astro UI Env Vars Config](https://assets2.astronomer.io/main/docs/astronomer-ui/v0.16-Astro-UI-EnvVars.png)

To learn more, consider the following two resources:

- ["Environment Variables on Astronomer"](https://www.astronomer.io/docs/environment-variables) Doc
- ["Scaling out Airflow"](https://www.astronomer.io/guides/airflow-scaling-workers/) Guide

> **Note**: Environment Variables are distinct from Airflow Variables/XComs, which you can configure directly via the Airflow UI/our CLI/your DAG code and are used for inter-task communication.
