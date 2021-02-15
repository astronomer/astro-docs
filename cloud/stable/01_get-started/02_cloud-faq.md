---
title: "Astronomer Cloud FAQs"
navTitle: "FAQ"
description: "Commonly asked questions and answers for those running Apache Airflow on Astronomer Cloud."
---

If you're thinking about Astronomer Cloud, you might have a few questions on your mind. We've collected a few of the most frequent questions and our answers to it below. You can also ask questions on our [community forum](https://forum.astronomer.io/). Or if you're already a customer, reach out to us via the [Support Portal](https://support.astronomer.io).


## Supported Airflow Versions

### What version of Airflow is Astronomer Cloud currently running?

Astronomer Cloud is officially compatible with Airflow v1.10.5 and higher. For our list of supported images and guidelines on how to upgrade versions, check out our [Airflow Versioning](/docs/cloud/stable/customize-airflow/manage-airflow-versions/) doc.

### What Airflow Executors do you currently support?

We currently support the Celery, Local and Kubernetes Executors. You can switch between the three freely via the Astronomer UI.

If you're not sure which Executor to use, we generally recommend starting off with the Local Executor and moving up from there once you see your deployment is in need of horizontal scaling. Check out [Airflow Executors: Explained](/guides/airflow-executors-explained/) for a ful analysis on each.

## Networking

### How would I give Astronomer Cloud access to my VPC?

To connect Astronomer Cloud to any database in your VPC, you'll have to allowlist the following Static IP Addresses:

- `35.245.140.149`
- `35.245.44.221`
- `34.86.203.139`
- `35.199.31.94`

For more information, read [VPC Access Doc](/docs/cloud/stable/manage-astronomer/vpc-access/).

## Airflow Metadata Access

### Can I access Airflow's underlying Metadata database for my Airflow Deployment?

Yes! Every Airflow Deployment on Astronomer Cloud has a corresponding Postgres Metadata Database hosted by Astronomer and isolated from all other Airflow Deployments. To access that database both on your local machine and Astronomer, check out [Access the Airflow Database](/docs/cloud/stable/customize-airflow/access-airflow-database/).

## Monitoring

### What are my options for monitoring an Airflow Deployment on Astronomer?

Right now, your monitoring options for Cloud are:

* Airflow Alerts at the Task or DAG Run level (instructions [here](/docs/cloud/stable/customize-airflow/airflow-alerts/))
* Deployment Configure page on the Astro UI for all resource configs
* Flower dashboard in the Astro UI to check on your Celery Workers (whether or not they’re online, how many tasks they’re actively processing, etc.)
* Scheduler/Webserver/Worker logs in the Astronomer UI
* Metrics tab in the Astronomer UI (Container Status, Scheduler Heartbeat, CPU utilization)

> **Note:** System Admin monitoring across multiple Airflow Deployments via Grafana is an Enterprise-only feature.

## Code Sharing

### Do you have a recommended way to share code amongst my team members?

This is largely dependent on personal preference and your particular use case.

At a Workspace level, we recommend having 1 Astronomer Workspace per team of Airflow users. All users within a single Workspace have acess to all Airflow deployments within it, with [varying levels of permissions](/docs/cloud/stable/manage-astronomer/workspace-permissions/).

Across Airflow Deployments, we'd generally recommend one repository/parent directory per project. That way, you leave the door open for CI/CD down the line if that's something you ever want to set up.

As for the code itself, we’ve seen effective organization where external code is partitioned by function and/or business case. This may be one directly for SQL, one for data processing tasks, one for data validation, etc.

## Authentication

### What authentication methods does Astronomer Cloud support?

We offer authentication via Google, Github, and local username/password. Once you've created a Workspace on Astronomer with a given authentication method, you'll use that same method to authenticate to the Astronomer CLI.

### Where do I log in?

After you [get in touch with us](https://astronomer.io/get-astronomer) and start a 14-day trial, you can head over to the [Astro UI](https://app.gcp0001.us-east4.astronomer.io/login) to login.

## Billing

### How does billing work?

Your first 14 days on Astronomer Cloud are entirely free of cost. When you create a new Workspace, you'll begin a 14-day trial period that allows you to spin up an Airflow Deployment, configure Environment Variables, invite users, and explore our Deployment-level monitoring tools.

After your first 14 days, you'll be required to input a payment method to continue usage. From there, we'll charge you based on exact resource usage per Airflow Deployment every 1st of the month, pro-rated for your first few weeks.

For more information, refer to [Cloud Pricing](https://www.astronomer.io/docs/cloud/stable/resources/pricing). If you want to cancel your account or trial and are having trouble accessing your Astronomer account,  please [reach out to us](https://support.astronomer.io).
