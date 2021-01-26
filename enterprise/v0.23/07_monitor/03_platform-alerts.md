---
title: "Alerting in Astronomer Enterprise"
navTitle: "Platform Alerts"
description: "Route common Airflow deployment and platform alerts to your preferred channel, via Prometheus Alertmanager."
---

## Overview

You can subscribe to two different types of alerts on Astronomer: Airflow alerts and platform alerts. This guide focuses on platform alerts, which you can use to monitor the health of platform components such as your Airflow Schedulers and Webservers. For more information on Airflow alerts, which help you monitor individual Deployments, read [Airflow Alerts](https://www.astronomer.io/docs/cloud/stable/customize-airflow/airflow-alerts).

Platform alerts are:
- Defined in Helm using [PromQL query language](https://prometheus.io/docs/prometheus/latest/querying/basics/).
- Fire via [Prometheus Alertmanager](https://prometheus.io/docs/alerting/alertmanager).

Astronomer offers built-in platform alerts, as well as the ability to create custom alerts. This guide provides all of the information you need to configure Prometheus Alertmanager, subscribe to existing alerts, and create custom alerts.

## Accessing Prometheus and Alertmanager UI

You can access the Prometheus & Alertmanager UIs that are deployed in the Astronomer platform using Kubectl to port forward. For example, the following commands can be used to access these UIs in the `astronomer` namespace.

```
kubectl port-forward svc/cantankerous-gecko-prometheus -n astronomer 9090:9090
```
```
kubectl port-forward svc/cantankerous-gecko-alertmanager -n astronomer 9093:9093
```

After running these commands, a user in this namespace could go to `localhost:9090` or `localhost:9093` in their browser to access the UIs.

## Configuring Alertmanager

Alertmanager is the Astronomer platform component that manages alerts, including silencing, inhibiting, aggregating and sending out notifications via methods such as email, on-call notification systems, and chat platforms.

You can configure [Alertmanager](https://prometheus.io/docs/alerting/configuration/) to send alerts to email, HipChat, PagerDuty, Pushover, Slack, OpsGenie, and more by editing the [Alertmanager ConfigMap](https://github.com/astronomer/astronomer/blob/master/charts/alertmanager/templates/alertmanager-configmap.yaml).

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

## Built-in Platform Alerts

The following table contains some of the most common platform alerts that users subscribe to on Astronomer.

| Alert | Description |
| ------------- | ------------- |
| `PrometheusDiskUsage` | Prometheus high disk usage, has less than 10% disk space available. |
| `RegistryDiskUsage` | Docker Registry high disk usage, has less than 10% disk space available. |
| `ElasticsearchDiskUsage` | Elasticsearch high disk usage, has less than 10% disk space available. |
| `IngressCertificateExpiration` | TLS Certificate expiring soon, expiring in less than a week. |

For a list of all built-in alerts, refer to [the full Prometheus configmap](https://github.com/astronomer/astronomer/blob/master/charts/prometheus/templates/prometheus-alerts-configmap.yaml).

## Subscribe to Platform Alerts

Admins can subscribe to platform alerts by editing the [Alertmanager ConfigMap](https://github.com/astronomer/astronomer/blob/master/charts/alertmanager/templates/alertmanager-configmap.yaml).

You'll receive all possible platform alerts at the `receiver` you specify. For example, the following configuration would cause platform alerts with a `critical` severity to appear in a specified Slack channel:
```
{{- if .Values.receivers.platformCritical }}
    - name: slack-critical-receiver
      slack_configs:
      - api_url: https://hooks.slack.com/services/T02J89GPR/BDBSG6L1W/4Vm7zo542XYgvv3
        channel: '#astronomer_platform_alerts'
        text: |-
          {{ range .Alerts }}{{ .Annotations.description }}
          {{ end }}
        title: '{{ .CommonAnnotations.summary }}'
```

For more information on possible Alertmanager settings, read the [Prometheus documentation](https://prometheus.io/docs/alerting/configuration/).

## Create Custom Platform Alerts

In addition to subscribing to Astronomer's built-in platform alerts, you can also create custom alerts and push them to your Astronomer platform.

### Build a custom platform alert

Platform alerts are created by adding a new `alert` object to your `config.yaml` file.

Each `alert` object contains the following key-value pairs:

* `expr`: The logic that determines when the alert will fire, written in PromQL.
* `for`: How long the `expr` logic has to be true for the alert to fire. This can be defined in minutes or hours (e.g. `5m` or `2h`).
* `labels.tier`: The level of your platform that the alert should operate at. For platform alerts, this value should always be `platform`.
* `labels.severity`: How severe the alert is. Possible values are `critical`, `high`, and `warning`.
* `annotations.summary`: The text for the alert that's sent via Alertmanager.
* `annotations.description`: Human-readable description of what the alert does.

For example, the following alert will fire if more than 2 Airflow Schedulers are not heartbeating for more than 5 minutes:

```yaml
additionalAlerts:
  # Additional rules for the 'platform' alert group
  # Provide as a block string in yaml list form
  platform:
    - alert: ExamplePlatformAlert
      # If greater than 10% task failure
      expr: count(rate(airflow_scheduler_heartbeat{}[1m]) <= 0) > 2
      for: 5m
      labels:
        tier: platform
        severity: critical  
      annotations:
        summary: {{ printf "%q" "{{value}} airflow schedulers are not heartbeating." }}
        description: If more than 2 Airflow Schedulers are not heartbeating for more than 5 minutes, this alert fires.
```

### Push a custom alert to your platform

Because platform alerts are built in .yaml, you can push them to your platform in the same way you push other platform configuration changes: Add the alert to your `config.yaml` file and push the file via Helm as described in [Apply a Config Change](https://www.astronomer.io/docs/enterprise/stable/manage-astronomer/apply-platform-config).

Once you've pushed the alert to your platform, make sure that you've subscribed to that type of alert, either by its `tier` or `severity`, as described in [Subscribe to Platform Alerts](https://www.astronomer.io/docs/enterprise/v0.23/monitor/platform-alerts#subscribe-to-platform-alerts).
