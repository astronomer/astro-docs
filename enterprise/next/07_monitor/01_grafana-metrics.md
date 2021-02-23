---
title: "Metrics in Astronomer Enterprise"
navTitle: "Metrics"
description: "Get a single-pane view into the health of your deployments with Grafana dashboards."
---

## Overview

We take metrics pushed out by Statsd along with those collected from the KubeAPI by Prometheus and funnel them into Grafana dashboards meant to be "single pane views" to see the status of all Airflow deployments on your cluster.

Enterprise admins can access our Grafana dashboards on `grafana.BASEDOMAIN` to access the monitoring overview. All of our dashboards provide live, up-to-date information on the status of Airflow, from the Kubernetes level right to the container level.

## Astronomer UI Dashboard

Each of your Deployments has a built-in metrics dashboard in the Astronomer UI. To get there, open a Deployment and go to the **Metrics** tab.

This dashboard is most useful for tracking the performance of individual Airflow Deployments, whereas Grafana dashboards are more useful for tracking performance at the platform level.

### Key Metrics

**Pod / CPU / Memory Usage**: These metrics measure the amount of pods, CPUs, and memory being used by an individual Deployment in its Kubernetes namespace. The upper limits of these metrics are the maximum allowed resources defined in the Kubernetes cluster.

If you're using the Local or Celery Executors, these metrics should each show around 50% usage at all times.

If you're using the Kubernetes executor or the KubernetesPodOperator in your DAGs, these metrics should a fluctuation in usage based on how many tasks you're running. If these metrics increase to near-full usage when running your tasks, you can allocate more computing power by adjusting the **Extra Capacity** slider in the **Settings** tab for the Deployment.

## Airflow State
Monitor all of your deployments from the Kubernetes level, including a birds-eye view of resource usage and system stress levels. When you spin up new deployments, they'll first show as "Unhealthy" in this view before going to "Healthy" when it is ready to be used.

![Astronomer State](https://assets2.astronomer.io/main/docs/ee/airflow_state.png)

### Key Metrics

**CPU Requests and Memory Requests:** These metrics appear in the **Quotas** panel of the dashboard. If you are executing your workflows in a cloud infrastructure, the typical paradigm is to pay for the resources you actually use, so it is important to monitor this usage and its associated costs. Due to the varying structure, tools, and pricing models of cloud provider solutions, the recommended values for these metrics will vary between organizations.

## Kubernetes Pods

This dashboard shows the status of your Kubernetes pods in your environment.

### Key Metrics

**Pod Status:** This metric shows the status of your pods in your environment, which is the same value you get by running `$ kubectl get pod <pod-name> -n <namespace>`. If desired, you can add a panel to the dashboard to easily see states for all pods at once.

## Airflow Deployment Overview

Use this Dashboard to drill down to each individual Deployment on your platform.

![Astronomer Deployments](https://assets2.astronomer.io/main/docs/ee/airflow_deployment_overview.png)

### Key metrics

**Deployment Status:** This metric appears in the **At a Glance** panel of the dashboard. It is a single value that indicates whether a Deployment is healthy or unhealthy.

A Deployment's status is determined by whether all pods in an Airflow deployment are running. If any pods aren't running as expected, the Deployment's status becomes "Unhealthy".


## Platform Overview
This will show the amount of persistent storage available to Prometheus, the registry, and ElasticSearch. It will also show a summary of all alerts that have fired.

![Astronomer Platform](https://assets2.astronomer.io/main/docs/ee/platform_overview.png)

### Key metrics

- **1-day Airflow Task Volume:** This metric is the single best tool for monitoring Airflow task successes and failures. It can also be adjusted to better find specific data points.

    For instance, if you click **Edit** in the dropdown menu for the metric, you're able to update the **Metrics** query to show data for a different time frame, such as `1h` or `15m`. In addition, you can use the eye icons at the far right to show only failures, rather than both successes and failures.

    To monitor task failures across all Deployments, you can update the failure query to be `sum by (deployment) (increase(airflow_ti_failures[<time-interval>]))`. This is especially useful for monitoring potential system-wide problems.

- **Database Connections:** This metric can be found in the **Database** panel. It measures how often your database is reached out to by the Airflow Scheduler, Webserver, and Workers. The chart shows the sum total of connections coming from sqlpooling in all Airflow Deployments in your environment.

    This metric is particularly relevant to organizations with more than 20 Airflow Deployments. For optimal performance, this should stay under 300 less than the `max_connections` for your postgresSQL database.  

- **PG Bouncer Waiting Clients:** This metric can be found in the **Database** panel. It measures how long specific actions are queued in a given Airflow Deployment before being executed. In healthy Deployments, this number should be very low.

    Extended periods of waiting can degrade performance and should be investigated for potential problems. For example, the Deployments associated with the red and blue spikes in the following graph might be experiencing issues with successfully executing tasks:

- **Unhealthy Schedulers:**  This metric is available in the **Airflow Health** panel, but Scheduler health can also be assessed for each individual Deployment in the Astronomer UI's **Metrics** tab. This metric gives you info on when and for how long individual Airflow deployment schedulers restarted.  

    Scheduler restarts could be normal, such as during an update, but if you see a single scheduler continue to restart or stay in an unhealthy state for a significant amount of time, it is worth investigating further.

    For example, an organization would want to investigate the green Scheduler in the following screen shot:


- **DAG Parsing Time:** This metric is available in the **Airflow Health** panel. It measures how quickly the Scheduler is executing your DAGs, and it's an indicator for how well your Scheduler is scheduling jobs for execution.

   Anything under 1 second is considered good, but the lower the measured time the better. Note that operator executions are not included in this metric, as those are typically scheduled for execution in Worker pods.

- **Elasticsearch Available Disk Space:** Astronomer leverages the ELK stack for logging events; this is an important part of establishing observability for the platform as a whole. To do this successfully, Elasticsearch should always have >20% Available Disk Space which you can monitor from the “Platform Overview” dashboard, to ensure that logs are captured and persisted successfully.

   If this ever dips below 20%, we recommend increasing the replica count in the Elasticsearch-data helm chart. The helm changes will look something like the following:

   ```yaml
   elasticseatch:
     data:
       replicas: <number>
   ```

## Fluentd

This dashboard tracks the performance of Fluentd.

### Key Metrics

- **Buffer Size and Buffer Length:** These metrics track whether the fluentd buffer is getting backed up, which might indicate an issue with writing logs to Elasticsearch. These metrics should ideally be hovering around zero.


## Custom Metric Scraping

If admins on your platform want customize how or what Prometheus scrapes for metrics, the following link shows every endpoint that Prometheus hits: https://prometheus.<BASEDOMAIN>/targets

Alongside this, the configurations for prometheus are defined in the following helm charts (prometheus & statsd-exporter).   https://github.com/astronomer/astronomer/blob/v0.16.12/charts/prometheus/values.yaml
https://github.com/astronomer/ap-vendor/blob/main/statsd-exporter/include/mappings.yml
