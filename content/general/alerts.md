---
title: "Astronomer Platform Alerts"
description: "Route common Airflow deployment and platform alerts to your preferred channel, via Prometheus Alertmanager."
date: 2019-11-01 T00:00:00.000Z
slug: "alerts"
---

Route common Airflow deployment and platform alerts to your preferred channel, via [Prometheus Alertmanager](https://prometheus.io/docs/alerting/alertmanager).

## Overview

At an Astronomer platform-level, alerts are:

- Defined in Helm
- Defined using [PromQL query language](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- Fire via [Prometheus Alertmanager](https://prometheus.io/docs/alerting/alertmanager).

## Accessing Prometheus and AlertManager UI

You can access the Prometheus & Alertmanager UIs that are deployed in the Astronomer platform using Kubectl to port forward. Examples:


```
kubectl port-forward svc/cantankerous-gecko-prometheus -n astronomer 9090:9090
```
```
kubectl port-forward svc/cantankerous-gecko-alertmanager -n astronomer 9093:9093
```

Then visit `localhost:9090` or `localhost:9093` on your computer.

## Configuring AlertManager

Alertmanager is the Astronomer platform component that manages alerts, including silencing, inhibiting, aggregating and sending out notifications via methods such as email, on-call notification systems, and chat platforms.

You can [configure Alertmanager](https://prometheus.io/docs/alerting/configuration/) to send alerts to email, HipChat, PagerDuty, Pushover, Slack, OpsGenie, and more by editing the [Alertmanager ConfigMap](https://github.com/astronomer/astronomer/blob/master/charts/alertmanager/templates/alertmanager-configmap.yaml). 

You can also configure Alertmanager's `route` block by editing the [Alertmanager ConfigMap](https://github.com/astronomer/astronomer/blob/master/charts/alertmanager/templates/alertmanager-configmap.yaml). The `route` block defines values such as `repeat_interval` (the interval at which alert notifications are sent). You can find more information on the `route` block [here](https://prometheus.io/docs/alerting/configuration/#route)

Example `route` definition:

```
# The root route with all parameters, which are inherited by the child
# routes if they are not overwritten.
route:
  receiver: 'default-receiver'
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  group_by: [cluster, alertname]
  # All alerts that do not match the following child routes
  # will remain at the root node and be dispatched to 'default-receiver'.
  routes:
  # All alerts with service=mysql or service=cassandra
  # are dispatched to the database pager.
  - receiver: 'database-pager'
    group_wait: 10s
    match_re:
      service: mysql|cassandra
  # All alerts with the team=frontend label match this sub-route.
  # They are grouped by product and environment rather than cluster
  # and alertname.
  - receiver: 'frontend-pager'
    group_by: [product, environment]
    match:
      team: frontend
```

## Built-in Airflow Alerts


| Alert | Description |
| ------------- | ------------- |
| `AirflowDeploymentUnhealthy` | Release deployment is unhealthy, not completely available. |
| `AirflowFailureRate` | Airflow tasks are failing at a higher rate than normal. |
| `AirflowSchedulerUnhealthy` | Airflow scheduler is unhealthy, heartbeat has dropped below the acceptable rate. You may want to customize this query if it is too noisy by default. |
| `AirflowPodQuota` | Deployment is near its pod quota, has been using over 95% of it's pod quota for over 10 minutes. |
| `AirflowCPUQuota` | Deployment is near its CPU quota, has been using over 95% of it's CPU quota for over 10 minutes. |
| `AirflowMemoryQuota` | Deployment is near its memory quota, has been using over 95% of it's memory quota for over 10 minutes. |

End users can subscribe to these configured alerts in the `Alerts` tab of the Astronomer UI.

> Note: Feel free to reference our [full source code](https://github.com/astronomer/astronomer/blob/master/charts/prometheus/values.yaml) for these built-in Airflow alerts.


## Platform Alerts


| Alert | Description |
| ------------- | ------------- |
| `PrometheusDiskUsage` | Prometheus high disk usage, has less than 10% disk space available. |
| `RegistryDiskUsage` | Docker Registry high disk usage, has less than 10% disk space available. |
| `ElasticsearchDiskUsage` | Elasticsearch high disk usage, has less than 10% disk space available. |
| `IngressCertificateExpiration` | TLS Certificate expiring soon, expiring in less than a week. |

> Note: Feel free to reference our [full source code](https://github.com/astronomer/astronomer/blob/master/charts/prometheus/templates/prometheus-alerts-configmap.yaml) for these built-in platform alerts.

### Configure Platform Alerts

Admins can subscribe to these configured alerts by editing the [Alertmanager ConfigMap](https://github.com/astronomer/astronomer/blob/master/charts/alertmanager/templates/alertmanager-configmap.yaml).

Example:

```
alertmanager:
  receivers:
    platform:
      slack_configs:
      - api_url: https://hooks.slack.com/services/T02J89GPR/BDBSG6L1W/4Vm7zo542XYgvv3
        channel: '#astronomer_platform_alerts'
        text: |-
          {{ range .Alerts }}{{ .Annotations.description }}
          {{ end }}
        title: '{{ .CommonAnnotations.summary }}'
```

You can read more about configuration options [here](https://prometheus.io/docs/alerting/configuration/).



