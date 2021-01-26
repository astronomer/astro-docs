---
title: "Alerting in Astronomer Enterprise"
navTitle: "Enterprise Alerts"
description: "Route common Airflow Deployment and platform alerts to your preferred channel via Prometheus Alertmanager."
---

## Overview

You can subscribe to two different types of alerts on Astronomer: Airflow alerts and platform alerts. Platform alerts can be used to monitor the health of platform components such as ElasticSearch and DockerRegistry, while Airflow alerts can be used to monitor the health and performance of individual Deployments.

Both Airflow and platform alerts are:
- Defined in Helm using [PromQL query language](https://prometheus.io/docs/prometheus/latest/querying/basics/).
- Fire via [Prometheus Alertmanager](https://prometheus.io/docs/alerting/alertmanager).

Astronomer offers built-in Airflow and platform alerts, as well as the ability to create custom alerts. This guide provides all of the information you need to configure Prometheus Alertmanager, subscribe to existing alerts, and create custom alerts.

Additionally, Airflow offers its own alerting service for individual DAGs and tasks. For more information on configuring this feature, read [Airflow Alerts](https://www.astronomer.io/docs/enterprise/v0.23/customize-airflow/airflow-alerts).

## Access the Prometheus and Alertmanager UIs

You can access the Prometheus & Alertmanager UIs that are deployed in the Astronomer platform using Kubectl to port forward. For example, the following commands can be used to access these UIs in the `astronomer` namespace.

```
kubectl port-forward svc/cantankerous-gecko-prometheus -n astronomer 9090:9090
```
```
kubectl port-forward svc/cantankerous-gecko-alertmanager -n astronomer 9093:9093
```

After running these commands, a user in this namespace could go to `localhost:9090` or `localhost:9093` in their browser to access the UIs.

## Configure Alertmanager

Alertmanager is the Astronomer platform component that manages alerts, including silencing, inhibiting, aggregating and sending out notifications via methods such as email, on-call notification systems, and chat platforms.

You can configure [Alertmanager](https://prometheus.io/docs/alerting/configuration/) to send alerts to email, HipChat, PagerDuty, Pushover, Slack, OpsGenie, and more by editing the [Alertmanager ConfigMap](https://github.com/astronomer/astronomer/blob/master/charts/alertmanager/templates/alertmanager-configmap.yaml).

### Configure an alert route

You can configure Alertmanager's `route` block by editing the [Alertmanager ConfigMap](https://github.com/astronomer/astronomer/blob/master/charts/alertmanager/templates/alertmanager-configmap.yaml). The `route` block determines which alerts should be sent to which receivers, as well as settings such as how often alerts should be sent. You can find more information on the `route` block in the [Prometheus documentation](https://prometheus.io/docs/alerting/configuration/#route).

This example `route` first checks whether an alert has a `status` of `critical`. If the alert is `critical`, then another check is made to determine the alert's `tier`. This allows the `route` to send the alert to different receivers depending on its `status` and `tier`.

```yaml
alertmanager.yaml: |-
  route:
    group_wait: 30s
    group_interval: 5m
    group_by: [alertname]
    repeat_interval: 3h
    receiver: default-receiver
    routes:
{{ if .Values.customRoutes }}
{{ toYaml .Values.customRoutes | trim | indent 6 }}
{{ end }}
    {{ if .Values.receivers.platformCritical }}
    - receiver: platform-critical-receiver
      continue: true  # allows alert to continue down the tree matching any additional child routes
      match:
        severity: critical
        tier: platform
    {{ end }}
    - receiver: {{ if .Values.receivers.platform }} platform-receiver {{ else }} blackhole-receiver {{ end }} ## routes alert to a platform-specific receiver if its tier is platform
      match_re:
        tier: platform
    - receiver: {{ if .Values.receivers.airflow }} airflow-receiver {{ else }} default-receiver {{ end }} ## routes alert to an airflow-specific receiver if its tier is airflow
      group_by: [deployment, alertname]
      match_re:
        tier: airflow
    - receiver: blackhole-receiver
      match:
        silence: cre
```

### Configure an alert receiver

Admins can subscribe to platform alerts by editing the [Alertmanager ConfigMap](https://github.com/astronomer/astronomer/blob/master/charts/alertmanager/templates/alertmanager-configmap.yaml).

You'll receive all possible platform alerts at the `receiver` you specify. For example, coupled with the `route` in the previous section, the following configuration would cause platform alerts with a `critical` severity to appear in a specified Slack channel:

```
{{- if .Values.receivers.platformCritical }}
    - name: platform-critical-receiver
      slack_configs:
      - api_url: https://hooks.slack.com/services/T02J89GPR/BDBSG6L1W/4Vm7zo542XYgvv3
        channel: '#astronomer_platform_alerts'
        text: |-
          {{ range .Alerts }}{{ .Annotations.description }}
          {{ end }}
        title: '{{ .CommonAnnotations.summary }}'
```

For more information on configuring the Alertmanager ConfigMap, read the [Prometheus documentation](https://prometheus.io/docs/alerting/configuration/).

## Built-in Alerts

The following table contains some of the most common platform alerts that users subscribe to on Astronomer:

| Alert | Description |
| ------------- | ------------- |
| `PrometheusDiskUsage` | Prometheus high disk usage, has less than 10% disk space available. |
| `RegistryDiskUsage` | Docker Registry high disk usage, has less than 10% disk space available. |
| `ElasticsearchDiskUsage` | Elasticsearch high disk usage, has less than 10% disk space available. |
| `IngressCertificateExpiration` | TLS Certificate expiring soon, expiring in less than a week. |

The following table contains popular alerts that you might want to subscribe to:

| Alert                                     | Description                                                                                                                        | Follow-Up                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AirflowDeploymentUnhealthy`              | Your Airflow Deployment is unhealthy or not completely available.                                                                  | Reach out to [Astronomer Support](https://support.astronomer.io).                                                                                                                                                                                                                                                                                                                                                                                               |
| `AirflowEphemeralStorageLimit`            | Your Airflow Deployment has been using more than 5GB of its ephemeral storage for over 10 minutes.                                 | Make sure to continually remove unused temporary data in your Airflow tasks.                                                                                                                                                                                                                                                                                                                                                                                    |
| `AirflowPodQuota`                         | Your Airflow Deployment has been using over 95% of its pod quota for over 10 minutes.                                              | Either increase your Deployment's Extra Capacity in the Astronomer UI or update your DAGs to use less resources. If you have not already done so, upgrade to [Airflow 2.0](https://www.astronomer.io/blog/introducing-airflow-2-0) for improved resource management.                                                                                                                                                                                            |
| `AirflowSchedulerUnhealthy`               | The Airflow Scheduler has not emitted a heartbeat for over 1 minute.                                                               | Reach out to [Astronomer Support](https://support.astronomer.io).                                                                                                                                                                                                                                                                                                                                                                                               |
| `AirflowTasksPendingIncreasing`           | Your Airflow Deployment created tasks faster than it was clearing them for over 30 minutes.                                        | Ensure that your tasks are running and completing correctly. If your tasks are running as expected, [raise concurrency and parallelism in Airflow](https://www.astronomer.io/guides/airflow-scaling-workers), then consider increasing one of the following resources to handle the increase in performance: <ul><li>Kubernetes: Extra Capacity</li><li>Celery: Worker Count or Worker Resources</li></ul><ul><li>Local Executor: Scheduler Resources</li></ul> |
| `ContainerMemoryNearTheLimitInDeployment` | A container in your Airflow Deployment is near its memory quota; it's been using over 95% of its memory quota for over 60 minutes. | Either increase your Deployment's allocated resources in the Astronomer UI or update your DAGs to use less memory. If you have not already done so, upgrade to [Airflow 2.0](https://www.astronomer.io/blog/introducing-airflow-2-0) for improved resource management.                                                                                                                                                                                          |

For a list of all built-in Airflow and platform alerts, refer to [the full Prometheus configmap](https://github.com/astronomer/astronomer/blob/master/charts/prometheus/templates/prometheus-alerts-configmap.yaml).

## Create Custom Alerts

In addition to subscribing to Astronomer's built-in alerts, you can also create custom alerts and push them to your Astronomer platform.

### Build a custom alert

Alerts are created by adding a new `alert` object to your `config.yaml` file.

Each `alert` object contains the following key-value pairs:

* `expr`: The logic that determines when the alert will fire, written in PromQL.
* `for`: How long the `expr` logic has to be true for the alert to fire. This can be defined in minutes or hours (e.g. `5m` or `2h`).
* `labels.tier`: The level of your platform that the alert should operate at. Can be either `airflow` or `platform`.
* `labels.severity`: How severe the alert is. Possible values are `info`, `warning`, and `critical`.
* `annotations.summary`: The text for the alert that's sent via Alertmanager.
* `annotations.description`: Human-readable description of what the alert does.

For example, the following platform alert will fire if more than 2 Airflow Schedulers across the platform are not heartbeating for more than 5 minutes:

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

Once you've pushed the alert to your platform, make sure that you've configured your Alertmanager `route` to send the alert to an appropriate receiver based on either its `tier` or `severity`. For more information, read [Configure AlertManager](https://www.astronomer.io/docs/enterprise/v0.23/monitor/platform-alerts#configure-alertmanager).
