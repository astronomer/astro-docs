---
title: "Cloud Pricing"
navTitle: "Pricing"
description: "An overview of Astronomer Cloud pricing."
---

> Interested in trying out Astronomer? [Get in touch](https://www.astronomer.io/get-astronomer/).

## Overview

As part of our promise to give our customers more freedom and control with Apache Airflow, Astronomer Cloud is priced based on exact resource usage per Airflow Deployment. Your monthly charge is based on the total number of Deployments tied to your organization and the total AU hours you allocate to each of those Deployments throughout the course of that particular month.

Cloud is managed entirely on Astronomer's infrastructure, allowing you to run as many Airflow Deployments (and DAGs) as you'd like. Each of your Deployments is powered by an isolated set of resources that can be scaled up or down to fit your needs.

Resource configuration is directly managed via the **Settings** tab of the [Astronomer UI](https://app.gcp0001.us-east4.astronomer.io/logi). For more information on Deployment-level configuration, reference [Configure a Deployment](https://www.astronomer.io/docs/cloud/stable/deploy/configure-deployment/).

## Configuration Overview

To maximize your control over your Airflow Deployment, the monthly cost to run Astronomer Cloud fully depends on how much you scale each component within it - and for how long - throughout the course of your billing cycle.

Via the [Astronomer UI](https://app.gcp0001.us-east4.astronomer.io/login), you'll be asked to select an Airflow Executor and set the amount of resources you'd like to allocate to each the following:

- Airflow Webserver
- Airflow Scheduler
- Celery Worker(s)
- Extra Capacity*

![Astro UI Executor Config](https://assets2.astronomer.io/main/docs/astronomer-ui/v0.23-astro-UI-executor.png)

Resource configurations are "live" as soon as you adjust the toggles on your web browser and click **Update**.

> **Note:** Read below for details on how to configure **Extra Capacity**, **Scheduler Count** and **Worker Count**. AU allocated to these sliders are calculated and billed differently.

## The Astronomer Unit (AU)

To track and measure allocation to each of these components, we introduce the concept of an Astronomer Unit (AU).

| AU Count | CPU | GB of Memory |
|----------|-----|--------|
| 1 | 0.1 | .375 |
| 10 | 1 | 3.75 |

When you spin up an Airflow Deployment, you'll find that it's pre-configured with default resource allocations. We've identified those levels to be effective baselines for the Local, Celery and Kubernetes Executors, respectively. Of course, you're free to adjust them at any time.

See below for out-of-the-box configurations and corresponding AU count:

| Executor   | PgBouncer & StatsD | Scheduler | Webserver | Celery Worker | Redis & Flower | Extra Capacity | Total AU |
|------------|--------------------|-----------|-----------|---------------|----------------|----------------|----------|
| Local | 4 | 10| 5 | N/A | N/A | N/A | 19 |
| Celery | 4 | 10 | 5 | 10 | 4 | N/A | 33 |
| Kubernetes | 4 | 10 | 5 | N/A | N/A | 10 | 19 - 29 |

> **Note**: The PgBouncer, StatsD, Redis, and Flower AU configs are static infrastructure minimums that cannot be changed.

## Extra Capacity

On Astronomer, resources needed for either the [KubernetesPodOperator](/docs/cloud/stable/customize-airflow/kubepodoperator/) or the KubernetesExecutor are mapped to the **Extra Capacity** slider on the **Settings** tab of your Airflow Deployment in the Astronomer UI.

The AU allocated to **Extra Capacity** maps to [*resource quotas*](https://kubernetes.io/docs/concepts/policy/resource-quotas/) on the [Kubernetes Namespace](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) in which your Airflow Deployment lives.

At their core, both the Kubernetes Executor and KubernetesPodOperator dynamically spin up an individual Pod for each task that needs to be executed - and spin it down once that task is completed.

The total AU allocated to **Extra Capacity** represents the maximum possible resources that *could* be provisioned to a single or set of pods at any given time. It does not represent actual usage and will not be charged as a fixed resource.

### Extra Capacity pricing

On Astronomer Cloud, you will only be charged for the CPU and Memory *actually used* by either your Kubernetes Executor or KubernetesPodOperator within the span of your billing period. The AU value you set for the slider represents the *maximum* AU our cluster has permission to provision within your Deployment's namespace, but you will not be charged for that maximum unless fully utilized.

If you set your **Extra Capacity** slider to 30 AU but the Pods spun up within your billing period only required 20 AU total to execute all tasks, you will only be charged for 20 AU at the end of the month at our regular rate.

> **Note:** While **Extra Capacity** is dynamically priced, resources needed for the Scheduler, Webserver, PgBouncer & StatsD will remain fixed costs that are not affected by downtime/uptime.

## Scheduler and Worker Count

Setting the **Scheduler Count** slider determines how many Schedulers run on your Airflow Deployment concurrently, while the **Worker Count** slider determines the number of Celery Workers provisioned for your Airflow Deployment. The cost for each is based on the amount of AU specified in their respective **Resources** settings.

### Scheduler and Worker Count pricing

The total price you pay for Scheduler resources is calculated by multiplying your **Scheduler Count** by the amount of AU allocated to **Scheduler Resources**. For instance, if you provision $100 per month in **Scheduler Resources** and you set **Scheduler Count** to 3, you can expect to pay $300 per month total towards Airflow Scheduler functionality.

Similarly, the total price you pay for Celery Workers is calculated by multiplying your **Worker Count** by the amount of AU allocated to **Worker Resources**.  For instance, if you provision $200 per month in **Worker Resources** and you set **Worker Count** to 2, you can expect to pay $400 per month total towards Celery Worker functionality.

## Node limits on Astronomer Cloud

On Astronomer Cloud, the node limits for any single task (based on Google's [n1-standard-32 machine type](https://cloud.google.com/compute/docs/machine-types#n1_standard_machine_types)) are:

- 90 GB of Memory/RAM
- 24 vCPUs

## Billing

To calculate your Astronomer Cloud bill at the end of the month, we take a snapshot of your Airflow Deployment's resource allocations for every individual hour that your Airflow Deployment is running on our platform. At the end of the month, we aggregate the total AU hours for that billing cycle and convert it to a dollar amount.

> **Note:** Resources allocated to **Extra Capacity** are calculated and charged by the minute, not by the hour.

## Enterprise Pricing

If you're interested in Enterprise and haven't already talked to us, reach out [here](/contact).
