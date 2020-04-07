---
title: "Cloud Migration Guide"
description: "Everything you need to migrate to Next Generation Astronomer Cloud."
date: 2018-10-12T00:00:00.000Z
slug: "cloud-migration"
---

## Overview

After a long awaited release, our newly built Astronomer Cloud is finally ready for you. We've spent the past few months re-building our Cloud's infrastructure to optimize for scale, reliability, usability, and security.

Given the change in infrastructure, upgrading to Astronomer's latest ([v0.12.0](https://www.astronomer.io/docs/release-notes/)) involves a "migration" from one Astronomer-hosted Kubernetes cluster to another. To get set up, you have 2 paths:

**(1) Self-Migration**

In short, a self-migration requires that you:
 - Create an account on "New" Astronomer Cloud
 - Create and configure a new Deployment (Env Vars, resources, Airflow connections)
 - Start pushing up DAGs as soon as you're ready
 - Spin down your Deployments on "Old" Cloud

> **Note:** This option assumes that you do NOT want to migrate your Airflow Deployment's metadata database to your new environment. Your DAG/Task Run History will NOT be preserved and you will need to recreate Airflow Variables, Connections, and Pools.

**(2) Astronomer Assisted Database Migration**

An Astronomer Assisted Migration requires that you:
- Turn your DAGs off
- Allow us to backup and restore your Airflow DB in a fresh deployment on "New" Astronomer Cloud
- Turn your DAGs back on

> **Note:** Depending on the size of your database, this process can be completed relatively quickly, though it requires that you migrate *all* DAGs within a deployment at once.

## Self-Migration

Below are the steps required for a self migration to our “New” Astronomer Cloud environment.

### Part I: Upgrade to Airflow v1.10.5

1. Upgrade all of your Airflow deployments on Astronomer Cloud to Airflow [v1.10.5](https://github.com/apache/airflow/blob/master/UPDATING.md)
     - To do so, you can update your Dockerfile to use the following image: `astronomerinc/ap-airflow:0.10.3-1.10.5-onbuild`

2. Ensure that your DAGs run smoothly on Airflow v1.10.5 either by testing locally with `astro dev start` or pushing them to your current Cloud deployments. 
     - The v1.10.5 image listed above is compatible with current Cloud 

### Part II: Set up on “New” Astronomer Cloud

Depending on the time of your migration, our team will either send you an invite to your new Workspace or expect that you create a new account and add users as needed.

1. Verify that you can login to the new Cloud cluster
    - URL: https://app.gcp0001.us-east4.astronomer.io/login
2. Re-create your Airflow Deployment(s) via the “New” Astronomer UI with appropriate resources
3. Manually generate your Airflow Connections, Variables and Pools in the Airflow UI
4. Re-create Environment Variables + Service Accounts in the Astronomer UI if needed
5. Whitelist “New” Astronomer Cloud’s IP address on any external systems your DAGs communicate with (e.g. AWS Redshift).
    - Static IP: `35.245.140.149`
6. Add your email address in the "Alerts" tab. These are platform-level alerts you can get more info on [here](https://www.astronomer.io/docs/alerts/)

> Note: If you leverage CI/CD, you'll have to replace our current Docker registry (`registry.astronomer.cloud`) with the registry on "New" Cloud (`registry.gcp0001.us-east4.astronomer.io`) in your script, in addition to your newly generated API Key.

### Part III: Upgrade the Astronomer CLI + Deploy

1. Upgrade your Astro CLI to our latest version. This is a MUST to authenticate.
    - `curl -sSL https://install.astronomer.io | sudo bash -s -- v0.12.0`
2. Authenticate to the new cluster via the CLI (once upgraded)
    - Auth Command:  `astro auth login gcp0001.us-east4.astronomer.io`
3. Pause DAGs on the old cluster
4. Deploy your project
    - `astro deploy`
5. Enable DAGs on the new cluster
    - Ensure your `start_date` and `catch_up` settings are appropriate so you don’t have duplicate DAG runs
6. If using CI/CD, update your CI/CD config file with your Service Account's new API key and deployment name

> **Note:** If you’re deploying code across the 2 Clouds, you WILL need to upgrade/downgrade your CLI version + authenticate to each accordingly.

## Astronomer Assisted Migration

If you'd like to preserve your deployment's Airflow database, we're more than happy to help. Follow the guidelines below.

### Part I: Upgrade to Airflow v1.10.5

1. Upgrade all of your Airflow deployments on Astronomer Cloud to Airflow v1.10.5
     - Update your Dockerfile to use the following image: 
     `astronomerinc/ap-airflow:0.10.3-1.10.5-onbuild`

2. Ensure that your DAGs run smoothly on Airflow v1.10.5 either by testing locally with `astro dev start` or pushing them to your current Cloud deployments. 
     - The v1.10.5 image listed above is compatible with the current Cloud

### Part II: Request a DB Migration

Once you've made sure that your DAGs can run successfully on Airflow v1.10.5, request an Astronomer Assisted DB Migration [here](https://astronomer.typeform.com/to/RWJcN5).

When you reach out, you'll be asked to provide the following:

1. Confirmation that you're running Airflow v1.10.5 on *all* deployments you want to migrate
2. The "release name" of all Airflow deployments you want to (or don't want to) migrate (e.g. `geodetic-planet-1234`)
3. Timeframe preference and availability

Once we receive a request from you, we'll take a look at your deployment's database and give you an estimate of how long the backup will take and schedule time with you to coordinate the migration.

> **Note:** Depending on the age of your deployment and the frequency at which your tasks run, this can take anywhere from 2 minutes to 1 hour.

## Cloud Switching Guide

If you find yourself utilizing both Clouds throughout your migration, feel free to reference the chart below for drilled-down differences.


|                     | Legacy Astronomer Cloud                                           | "New" Astronomer Cloud                                              |
|---------------------|--------------------------------------------------------------------|-------------------------------------------------------------------|
| Astronomer UI Login | https://app.astronomer.cloud/login                                 | https://app.gcp0001.us-east4.astronomer.io/login                  |
| CLI Install         | `curl -sSL https://install.astronomer.io | sudo bash -s -- v0.7.5-2` | `curl -sSL https://install.astronomer.io | sudo bash -s -- v0.12.0` |
| CLI Auth            | `astro auth login astronomer.cloud`                                  | `astro auth login gcp0001.us-east4.astronomer.io`                   |
| CLI Deploy          | `astro airflow deploy`                                               | `astro deploy`                                                      |
| CLI Local Dev       | `astro airflow start`, `astro airflow stop`                            | `astro dev start`, `astro dev stop`                                   |
| Docker Registry     | registry.astronomer.cloud                                          | registry.gcp0001.us-east4.astronomer.io                           |
| Static IP           | 35.188.248.243                                                     | 35.245.140.149                                                    |

> **Note:** If you’re deploying code across the 2 Clouds, you WILL need to upgrade/downgrade your CLI version + authenticate to each accordingly.

## Frequently Asked Questions (FAQs)

**1. Will I experience any downtime with either migration path?**

The DB Migration path described above involves “pausing” your running DAGs and turning those same DAGs back on in your new environment as soon as your database has been restored with help from our team. If you opt to "Self Migrate," the timing around pausing your DAGs and deploying your project to your new deployment depends entirely on your personal preference.

If your DAGs run on short schedules, we encourage customers to:

- Perform this action at a time task execution is not at its peak
- Set `catchup=True` on any DAGs that you want DAG runs generated for during the downtime

**2. Do I HAVE to upgrade to Airflow v1.10.5?**

Yes. The only image compatible with Cloud 2 is Airflow v1.10.5, though we don't expect upgrading from prior Airflow versions to require significant changes.

Refer to [Airflow's v1.10.5](https://github.com/apache/airflow/blob/master/UPDATING.md) release notes for more detail on differences across versios.

**3. Will my Airflow DB be preserved?**

This is a choice you have. In the “Self Migration” process described above - no.

If you want to preserve your DB, please follow the guidelines above for an "Astronomer Assisted Database Migration" and reach out to us via our [Support Portal](https://support.astronomer.io/hc/en-us).

**4. Can I wait to upgrade?**

Yes, but we urge you to migrate as soon as you're able to. The sooner you're running on "New" Cloud, the better we can support your team and Airflow Deployments.

We plan on deprecating app.astronomer.cloud on May 15, 2020.

**5. Will my Service Accounts and CI/CD process be affected?**

If you have a running CI/CD process that leverages an Astronomer Cloud API token, you will have to create a new service account with a newly generated API token on "New" Astronomer Cloud.

In your script, you'll have to replace our current Docker registry (`registry.astronomer.cloud`) to the new one, e.g.:

```
docker build . -t registry.gcp0001.us-east4.astronomer.io/{deployment-release-name}/airflow:$TAG
docker login registry.gcp0001.us-east4.astronomer.io -u _ -p ${NEW_API_SECRET_KEY}
docker push registry.gcp0001.us-east4.astronomer.io/{deployment-release-name}/airflow:$TAG```
```

**6. Will I have to re-add users to Astronomer?**

Yes. Once you create a new Workspace on "New" Cloud, you will need to invite users again to your Workspace manually.

At this point, you will also be able to set their roles as either an Admin, Editor or Viewer.

**7. Do I have to re-enter payment information?**

You do not! We’ll take care of that for you.

If you want to *change* your current method of payment on file, you're free to enter a new credit card in the `Billing` tab of your Astronomer Workspace.

**8. Is this what all future releases will look like?**

This is a major platform upgrade. We anticipate future upgrades to be done in place and not require a migration.

**9. Will I be charged for usage on both "Old" Cloud and "New" Cloud if there’s an overlap?**

If you decide to pursue the "Self Migration" path, yes. You'll be charged per exact resource usage across both Clouds.

If you pursue the "Astronomer Assisted Database Migration" path, we'll make sure everything is running as expected in "New" Cloud and deprovision your Deployment(s) on your current Cloud environment shortly thereafter as appropriate.

**10. Can I use the Kubernetes Executor now?**

Yes. You’re free to transition to using the Kubernetes Executor in place of the Local or Celery Executors.









