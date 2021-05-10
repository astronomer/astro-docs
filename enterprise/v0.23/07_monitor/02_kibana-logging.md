---
title: "Logging in Astronomer Enterprise"
navTitle: "Logs"
description: "Using Kibana to monitor platform-wide Airflow logs."
---

## Overview

This guide provides steps for setting up Kibana, which is the primary tool for monitoring Airflow logs on Astronomer Enterprise.

Once you deploy to Airflow on Astronomer, your Webserver, Scheduler, and Worker(s) begin emitting logs. These logs can provide information on task completion and scheduling, API requests, and much more. In the Astronomer UI, these logs are found in the **Logs** tab for any given Deployment. For more information on viewing Deployment-level logs, read [Deployment Logs](/docs/enterprise/v0.23/deploy/deployment-logs).

All Airflow logs on your Astronomer platform flow to Elasticsearch, where they can be visualized and monitored using Kibana. Whereas Grafana is useful for monitoring the performance of your platform's infrastructure, Kibana is useful for monitoring the performance of Airflow itself.

## Access Kibana

By default, only users with [System Admin](https://www.astronomer.io/docs/enterprise/v0.23/manage-astronomer/manage-platform-users#system-roles) permissions can access Kibana. System Admins can access Kibana from the Astronomer UI:

![Add fields](https://assets2.astronomer.io/main/docs/logs/kibana-access.png)

Alternatively, you can go to `kibana.BASEDOMAIN` in your web browser.

## Set Up Kibana

To access logging data from Astronomer, you first need to set up an [index pattern](https://www.elastic.co/guide/en/kibana/current/index-patterns.html). To set up an index pattern for Astronomer:

Navigate to `Management` and create an index pattern for `fluentd.*`
Elasticsearch uses [index patterns](https://www.elastic.co/guide/en/kibana/current/index-patterns.html) to organize how you explore data. Setting `fluentd.*` as the index means that Kibana will display all logs from all deployments (Astronomer uses `fluentd` to ship logs from pods to ElasticSearch).

Set `@timestamp` as the  `Time Filter` on the next screen.

## Discover

Once the index pattern has been confirmed, the `Discover` tab will show logs as they come in.

![Add fields](https://assets2.astronomer.io/main/docs/logs/kibana-access.png)

From this view, you can add filters to see logs as they come in from all Airflow deployments. You can also add fields to filter by:


## Dashboards

Custom dashboards can be created in the `Dashboard` view.
