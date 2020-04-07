---
title: "Cloud FAQs"
description: "Commonly asked questions and answers for Astronomer Cloud."
date: 2019-11-07 T00:00:00.000Z
slug: "cloud-faq"
---

If you're thinking about Astronomer Cloud, you might have a few questions on your mind. Here are a few FAQ's that might help.

#### What version of Airflow is Astronomer Cloud currently running?

Astronomer Cloud is officially compatible with Airflow v1.10.5 and higher. For our list of supported images and guidelines on how to upgrade versions, check out our [Airflow Versioning](https://astronomer.io/docs/airflow-versioning) doc.

#### How would I give Astronomer Cloud access to my VPC?

To connect Astronomer Cloud to any database in your VPC, you'll just have to whitelist our Static IP: `35.245.140.149`

If you're whitelisting that IP on Amazon Redshift, check out [our VPC Access Doc](https://www.astronomer.io/docs/vpc-access).

#### Will I have access to Airflow's underlying database for my deployment?

Yes! Each Astronomer Cloud customer has an isolated Postgres database per deployment. To access that database and the Ad-Hoc Query feature for a deployment on both Astronomer and locally, check out [Query the Airflow Database](https://www.astronomer.io/docs/query-airflow-database).

#### What are my options for monitoring our deployments?

Right now, your monitoring options for Cloud are:

1. Airflow Alerts at the Task or DAG Run level (instructions [here](https://www.astronomer.io/docs/setting-up-airflow-emails/))
2. Deployment Configure page on the Astro UI for all resource configs
3. Flower dashboard in the Astro UI to check on your Celery Workers (whether or not they’re online, how many tasks they’re actively processing, etc.)
4. Scheduler/Webserver/Worker logs in the Astronomer UI
5. Metrics tab in the Astronomer UI (Container status, Scheduler Heartbeat, CPU utilization)

**Note:** SysAdmin cluster-level monitoring across deployments via Grafana is an Enterprise-only feature at the moment since all Cloud deployments live within our wider Astronomer-hosted cluster.

#### What Airflow Executors do you currently support?

We currently support the Celery, Local and Kubernetes Executors. You can switch between the two freely via the Astronomer UI.

*Not sure which Executor to use?* We generally recommend starting off with the LocalExecutor and moving up from there once you see your deployment is in need of horizontal scaling. Check out [Airflow Executors: Explained](https://www.astronomer.io/guides/airflow-executors-explained/) for a ful analysis on each.

#### Do you have a recommended way to share code amongst my team members?

This is largely dependent on personal preference and your particular use case.

At a Workspace level, we recommend having 1 Astronomer Workspace per team of Airflow users. All users within a single Workspace have acess to all Airflow deployments within it, with [varying levels of permissions](https://www.astronomer.io/docs/rbac/).

Across deployments, we'd generally recommend one repository/parent directory per project. That way, you leave the door open for CI/CD down the line if that's something you ever want to set up.

As for the code itself, we’ve seen effective organization where external code is partitioned by function and/or business case, so one directly for SQL, one for data processing tasks, one for data validation, etc.

#### What authentication methods does Astronomer Cloud support?

Right now, we offer authentication via Google, Github, and Username/Password in Cloud. Once you've created a Workspace on Astronomer, you'll use that same method to authenticate to the Astronomer CLI.

If you're interested in Enterprise, the options there are more flexible. Check out [this doc](https://www.astronomer.io/docs/ee-integrating-auth-system/) for more info.

#### Where do I log in?

If you're interested in starting a trial on Astronomer Cloud, you can head [here](https://www.astronomer.io/trial/) to kick it off. Expect a Welcome email from there with next steps on how to create an account shortly thereafter.

If you have an existing account, go ahead to the [Astronomer UI](https://app.gcp0001.us-east4.astronomer.io/login) to login.

If you want to cancel your account or trial and are having trouble accessing your Astronomer account, [reach out to us](https://support.astronomer.io).

#### How does billing work?

Your first 14 days on Astronomer Cloud are entirely free of cost. When you create a new Workspace, you'll begin a 14-day trial period that allows you to freely spin up a deployment without worrying about an invoice at the end of the month.

After your first 14 days, you'll be required to input a payment method to continue usage. From there, we'll charge you based on exact resource usage per deployment at the end of the month. You can expect your first invoice 1 month after the end of your trial.

For full pricing details, check out our [Pricing Doc](https://www.astronomer.io/docs/pricing/).

**Did we miss something?** Check out the rest of our docs or our [community forum](https://forum.astronomer.io/) for more product-specific info, or reach out to us via our [Support Portal](https://support.astronomer.io). We'd love to hear from you.