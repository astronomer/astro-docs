---
title: "Metrics in Astronomer Enterprise"
description: "Get a single-pane view into the health of your deployments with Grafana dashboards."
date: 2018-10-12T00:00:00.000Z
slug: "ee-metrics"
---

## Grafana Dashboards

We take metrics pushed out by Statsd along with those collected from the KubeAPI by Prometheus and funnel them into Grafana dashboards meant to be "single pane views" to see the status of all Airflow deployments on your cluster.

Enterprise admins can access our Grafana dashboards on `grafana.BASEDOMAIN` to access the monitoring overview. All of our dashboards provide live, up-to-date information on the status of Airflow, from the Kubernetes level right to the container level.

There are a ton of dashboards to go through, but the 5 most commonly used ones:

### Airflow State
Monitor all of your deployments from the Kubernetes level, including a birds-eye view of resource usage and system stress levels. When you spin up new deployments, they'll first show as "Unhealthy" in this view before going to "Healthy" when it is ready to be used.

![Astronomer State](https://assets2.astronomer.io/main/docs/ee/airflow_state.png)

### Airflow Scheduler
Displays Airflow's core scheduler metrics.

![Astronomer Scheduler](https://assets2.astronomer.io/main/docs/ee/airflow_scheduler.png)

### Airflow Containers
Monitor every running container's CPU and memory usage, alongside network I/O. This view will probably give you the most information about your jobs as they run.

![Astronomer Containers](https://assets2.astronomer.io/main/docs/ee/airflow_containers.png)

### Airflow Deployments
This is meant to be a high level overview of a particular Airflow deployment.

![Astronomer Deployments](https://assets2.astronomer.io/main/docs/ee/airflow_deployment_overview.png)

### Platform Overivew
This will show the amount of persistent storage available to Prometheus, the registry, and ElasticSearch. It will also show a summary of all alerts that have fired.

![Astronomer Platform](https://assets2.astronomer.io/main/docs/ee/platform_overview.png)
