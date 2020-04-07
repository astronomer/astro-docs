---
title: "Scaling Airflow"
description: "Configure your deployment to suit your use case."
date: 2019-03-04T00:00:00.000Z
slug: "running-jobs-and-scaling"
---

Once you've created your deployment, you can configure it for the use case at hand.

## Allocating Resources


The second half of the `Configure` tab allows you to adjust your resource components - empowering you to freely scale your deployment up or down as you wish. To this end, you can:

1. Choose your Executor (Local, Celery, or Kubernetes)
2. Adjust resources to your Scheduler and Webserver
3. Adjust worker count (*Celery only*)
4. Adjust your `Worker Termination Grace Period` (*Celery only*)
5. Add Extra Capacity (*Kubernetes only*)

![Astro UI Executor Config](https://assets2.astronomer.io/main/docs/astronomer-ui/Astro-UI-Executor.png)

### Components

In the `Components` section, you can adjust the AUs (Astronomer Units of CPU and memory) you want to allocate towards your Scheduler, Webserver, and Celery Workers (if applicable).

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

The `Extra Capacity` setting is tied to the KubernetesPodOperator and the Kubernetes Executor, as it maps to extra pods created in the cluster. Namely, the slider effects (1) CPU and memory quotas and (2) database connection limits.

![Astro UI Executor Config](https://assets2.astronomer.io/main/docs/astronomer-ui/Astro-UI-Resources.png)

In general, `database connections` show how many actual connections to Astronomer's database (not yours) are actively being used whereas `client connections` refers to *all* Airflow connections opened against the PgBouncer (a light-weight connection pool manager for Postgres) for a particular deployment. This will normally be a higher and more variable number.

Importantly, these connections do **not** have any impact on the way you write your DAGs or how many concurrent connections you hold to your own databases. Rather, they're really just about how the Webserver, Scheduler, and Workers connect to Astronomer's Postgres to update the state of variables, DAGs, and tasks. Unless you're implementing the Kubernetes Pod operator or the Kubernetes Executor, you will not need to worry about them. 


#### Environment Variables

Environment Variables ("Env Vars") are a set of configurable values that allow you to dynamically fine tune your Airflow deployment - they encompass everything from [email alerts](https://www.astronomer.io/docs/setting-up-airflow-emails/) to the number of tasks that can run at once (concurrency). They're traditionally defined in your `airflow.cfg`, but you can now insert them directly via Astronomer's UI.

![Astro UI Env Vars Config](https://assets2.astronomer.io/main/docs/astronomer-ui/Astro-UI-EnvVars.png)

For a full list of Environment Variables you can configure, go [here](https://github.com/apache/airflow/blob/1.10.1/airflow/config_templates/default_airflow.cfg). Every environment variable you set will be stored as a Kubernetes secret in your deployment.

**Note**: Environment Variables are distinct from Airflow Variables/XComs, which you can configure directly via the Airflow UI/our CLI/your DAG code and are used for inter-task communication.
