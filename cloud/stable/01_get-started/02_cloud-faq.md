---
title: "Astronomer Cloud FAQs"
navTitle: "FAQ"
description: "Commonly asked questions and answers for those running Apache Airflow on Astronomer Cloud."
---

If you're thinking about Astronomer Cloud, you might have a few questions on your mind. We've collected a few of the most frequent questions and our answers to it below. You can also ask questions on our [community forum](https://forum.astronomer.io/). Or if you're already a customer, reach out to us via the [Support Portal](https://support.astronomer.io).


## Supported Airflow Versions

### What version of Airflow is Astronomer Cloud currently running?

Astronomer Cloud is officially compatible with Airflow v1.10.5 and higher. For our list of supported images and guidelines on how to upgrade versions, check out our [Airflow Versioning](https://astronomer.io/docs/airflow-versioning) doc.

### What Airflow Executors do you currently support?

We currently support the Celery, Local and Kubernetes Executors. You can switch between the three freely via the Astronomer UI.

If you're not sure which Executor to use, we generally recommend starting off with the Local Executor and moving up from there once you see your deployment is in need of horizontal scaling. Check out [Airflow Executors: Explained](https://www.astronomer.io/guides/airflow-executors-explained/) for a ful analysis on each.

## Networking

### How would I give Astronomer Cloud access to my VPC?

To connect Astronomer Cloud to any database in your VPC, you'll just have to allowlist our Static IP: `35.245.140.149`

If you're allowlisting that IP on Amazon Redshift, check out [our VPC Access Doc](https://www.astronomer.io/docs/vpc-access).

## Airflow Metadata Access

### Will I have access to Airflow's underlying database for my deployment?

Yes! Every Airflow Deployment on Astronomer Cloud has a corresponding Postgres Metadata Database hosted by Astronomer and isolated from all other Airflow Deployments. To access that database both on your local machine and Astronomer, check out our [Query the Airflow Database](https://www.astronomer.io/docs/query-airflow-database) doc.

## Monitoring

### What are my options for monitoring our deployments?

Right now, your monitoring options for Cloud are:

* Airflow Alerts at the Task or DAG Run level (instructions [here](https://www.astronomer.io/docs/setting-up-airflow-emails/))
* Deployment Configure page on the Astro UI for all resource configs
* Flower dashboard in the Astro UI to check on your Celery Workers (whether or not they’re online, how many tasks they’re actively processing, etc.)
* Scheduler/Webserver/Worker logs in the Astronomer UI
* Metrics tab in the Astronomer UI (Container Status, Scheduler Heartbeat, CPU utilization)

> **Note:** System Admin monitoring across multiple Airflow Deployments via Grafana is an Enterprise-only feature.

## Code Sharing

### Do you have a recommended way to share code amongst my team members?

This is largely dependent on personal preference and your particular use case.

At a Workspace level, we recommend having 1 Astronomer Workspace per team of Airflow users. All users within a single Workspace have acess to all Airflow deployments within it, with [varying levels of permissions](https://www.astronomer.io/docs/rbac/).

Across Airflow Deployments, we'd generally recommend one repository/parent directory per project. That way, you leave the door open for CI/CD down the line if that's something you ever want to set up.

As for the code itself, we’ve seen effective organization where external code is partitioned by function and/or business case. This may be one directly for SQL, one for data processing tasks, one for data validation, etc.

## Authentication

### What authentication methods does Astronomer Cloud support?

We offer authentication via Google, Github, and Local Username/Password.

Once you've created a Workspace on Astronomer, you'll use that same method to authenticate to the Astronomer CLI.

### Where do I log in?

After you [sign up for a trial](https://www.astronomer.io/trial/), you can head over to the [Astro UI](https://app.gcp0001.us-east4.astronomer.io/login) to login.

## Billing

### How does billing work?

Your first 14 days on Astronomer Cloud are entirely free of cost. When you create a new Workspace, you'll begin a 14-day trial period that allows you to spin up an Airflow Deployment, configure Environment Variables, invite users, and explore our Deployment-level monitoring tools.

After your first 14 days, you'll be required to input a payment method to continue usage. From there, we'll charge you based on exact resource usage per Airflow Deployment every 1st of the month, pro-rated for your first few weeks.

If you want to cancel your account or trial and are having trouble accessing your Astronomer account,  please [reach out to us](https://support.astronomer.io).
