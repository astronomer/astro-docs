---
title: "Pricing"
description: "An overview of pricing for Astronomer."
date: 2018-10-12T00:00:00.000Z
slug: "resources-pricing"
---

To view an overview of our pricing structure, check out the [pricing page](https://www.astronomer.io/pricing/) on our website.

## Cloud Pricing

Astronomer Cloud is priced based on number Airflow deployments you use and the resources you allocate to each cluster. It is fully managed and allows you to run as many DAGs as you'd like. Resources are isolated within each Airflow deployment and you can scale up and down resource allocation via the sliders in our UI. 

The exact price you pay monthly will fully depend on how much you want to scale up each component of your Airflow cluster. We've designed things to be completely customizable in order to give you maximum control over your resource allocation. Towards that objective, you can scale up and down the following components of each Airflow cluster:
- Webserver
- Scheuduler
- Celery worker count
- Celery worker size
- Celery worker termination grace period

To scale these components, we introduce the concept of an Astronomer Unit (or AU). See the below table for a summary of what comes with each AU:

| AU Count | CPU | GB of Memory | Monthly Price |
|----------|-----|--------|-------|
| 1 | 0.1 | .375 | $10 |

We spin up clusters with certain default configurations, but you're more than welcome to adjust the default resource allocations to fit the needs of your organization. See below for out-of-the-box AU defaults that come when you spin up an Airflow deployment. Note that the PgBouncer, StatsD, Redis, and Flower AU configs are static and cannot be changed.

| Executor | PgBouncer | StatsD | Scheduler | Webserver | Celery Worker | Redis | Flower | Total AU | Total Monthly Cost |
|----------|-----|--------|-------|
| Local | 2 | 2 | 5 | 2 | N/A | N/A | N/A | 11 | $110 |
| Celery | 2 | 2 | 5 | 2 | 10 | 2 | 2 | 25 | $250 |

As indicated above, one celery worker comes default with 1 AU, but that number can be scaled up and down according to how hefty your jobs are.

## Enterprise Pricing

Astronomer Enterprise is priced via an annual licensing fee. You get access to the entire source code that powers Astronomer and pay us a flat fee for unlimited workers and Airflow deployments on your Kubernetes cluster.
