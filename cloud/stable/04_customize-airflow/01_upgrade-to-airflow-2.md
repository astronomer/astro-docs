---
title: "Upgrade to Apache Airflow 2.0 on Astronomer"
navTitle: "Upgrade to Airflow 2.0"
description: "How to prepare for and upgrade to Airflow 2.0 on Astronomer."
---

## Overview

Apache Airflow 2.0 is a momentous open-source release that we're thrilled to support. For those eager to learn more about Airflow 2.0 and upgrade an existing Airflow Deployment on Astronomer, read the guidelines below.

At a high-level, the recommended upgrade path is as follows:

1. Migrate to Airflow 1.10.14
2. Run the Airflow Upgrade Check Script
3. Modify your DAGs, Configs, and Import Statements
4. Upgrade to Airflow 2.0

Following a section that highlights the biggest features included in Airflow 2.0, this doc will walk through each step listed above.

> **Note:** The recommendations around the upgrade process are largely written in collaboration with the Apache Airflow project and community, though there a few differences in steps on Astronomer that we've made sure to outline below.

## Why Airflow 2.0

Airflow 2.0 is built to be faster, more reliable, and significantly more scalable than 1.10. Among the hundreds of new features both large and small, Airflow 2.0 includes:

- [Refactored Airflow Scheduler](https://airflow.apache.org/docs/apache-airflow/stable/scheduler.html#running-more-than-one-scheduler) for enhanced performance and high-availability.
- [Full REST API](https://airflow.apache.org/docs/apache-airflow/stable/stable-rest-api-ref.html) that enables opportunity for automation.
- [Smart Sensors](https://airflow.apache.org/docs/apache-airflow/stable/smart-sensor.html) that execute as single, long-running tasks.
- [TaskFlow API](https://airflow.apache.org/docs/apache-airflow/stable/concepts.html#taskflow-api) for a simpler way to pass information between tasks.
- [Independent Providers](https://github.com/apache/airflow/tree/master/airflow/providers) for improved usability and a more agile release cadence.
- Simplified KubernetesExecutor for ultimate flexibility in configuration.
- [UI/UX Improvements](https://github.com/apache/airflow/pull/11195) including a new Airflow UI and auto-refresh button in the **Graph** view.

### Airflow 2.0 Resources

For more information on Airflow 2.0, we highly recommend the following:

- ["Introducing Airflow 2.0" blog post](https://www.astronomer.io/blog/introducing-airflow-2-0) from Astronomer
- [Airflow 2.0 YouTube Series](https://www.youtube.com/playlist?list=PLCi-q9vYo4x-PESoBcXN0tXCMgzh5c_Pj) from Astronomer
- Airflow 2.0 blog post from the Apache Airflow Project

As always, don't hesitate to reach out to [Astronomer Support](https://support.astronomer.io) for questions.

## Step 1: Upgrade to Airflow 1.10.14

Airflow 1.10.14, considered a "bridge" release to Airflow 2.0, was built to make the migration and testing process as easy as possible. On Astronomer, you MUST upgrade to an Astronomer Certified (AC) 1.10.14 image before upgrading to any 2.0 version.

To upgrade to 1.10.14,

1. Initialize the Airflow upgrade process via the Astronomer UI or CLI
2. Deploy the AC 1.10.14 image (Debian-only):

```
FROM quay.io/astronomer/ap-airflow:1.10.14-buster-onbuild
```

For detailed guidelines on how to upgrade Airflow on Astronomer, read [“Manage Airflow Versions”](https://www.astronomer.io/docs/cloud/stable/customize-airflow/manage-airflow-versions). For more information on 1.10.14, check out the [Airflow Release](https://github.com/apache/airflow/releases/tag/1.10.14) or the corresponding [AC 1.10.14 changelog](https://github.com/astronomer/ap-airflow/blob/master/1.10.14/CHANGELOG.md).

> **Note:** Astronomer Certified exclusively supports a Debian-based Docker image for both Airflow 1.10.14 and 2.0. If you're currently running an Alpine-based AC image for an earlier version of Airflow, we recommend that you first test the corresponding Debian image for your current version. For example, if you're runnning an Alpine-based 1.10.12 image, try the Debian-based 1.10.12 image before you upgrade to 1.10.14.

## Step 2: Run the Airflow Upgrade Check Script

Once you've upgraded to 1.10.14, you're ready to start making your DAGs and configurations Airflow 2.0-compatible. Most Airflow 2.0-compatible DAGs will work in Airflow 1.10.14, though not all.

For a comprehensive list of recommended and required changes specific to your existing project, run the Airflow upgrade check script via the Astronomer CLI. The script reviews your DAG code, deployment-level configuration and Environment Variables, as well as metadata from the Airflow Database.

### a. Run the Upgrade Check from the Astronomer CLI

To run the Airflow 2.0 upgrade check script, run:

```
$ astro dev upgrade-check
```

This command will automatically install the latest version of the `apache-airflow-upgrade-check` package at runtime and output results from the corresponding Airflow CLI command. It is only supported locally.

#### b. Review Upgrade Check Recommendations

In response to the command above, you should see something like the following:

```
==============================================STATUS============================================

Check for latest versions of apache-airflow and checker..................................SUCCESS
Remove airflow.AirflowMacroPlugin class..................................................SUCCESS
Chain between DAG and operator not allowed...............................................SUCCESS
Connection.conn_id is not unique.........................................................SUCCESS
Connection.conn_type is not nullable.....................................................SUCCESS
Fernet is enabled by default.............................................................FAIL
GCP service account key deprecation......................................................SUCCESS
Changes in import paths of hooks, operators, sensors and others..........................FAIL
Users must delete deprecated configs for KubernetesExecutor..............................FAIL
Legacy UI is deprecated by default.......................................................SUCCESS
Logging configuration has been moved to new section......................................FAIL
Removal of Mesos Executor................................................................SUCCESS
Users must set a kubernetes.pod_template_file value......................................FAIL
SendGrid email uses old airflow.contrib module...........................................SUCCESS
Changes in import path of remote task handlers...........................................SUCCESS
Jinja Template Variables cannot be undefined.............................................FAIL
Found 7 problems.

========================================== RECOMMENDATIONS ========================================

Fernet is enabled by default
----------------------------
The fernet mechanism is enabled by default to increase the security of the default installation.

Problems:

1.  fernet_key in airflow.cfg must be explicitly set empty as fernet mechanism is enabled by default.
This means that the apache-airflow[crypto] extra-packages are always installed.However, this requires
that your operating system has libffi-dev installed.

Changes in import paths of hooks, operators, sensors and others
---------------------------------------------------------------
Many hooks, operators and other classes has been renamed and moved. Those changes were part of
unifying names and imports paths as described in AIP-21.
The contrib folder has been replaced by providers directory and packages:
https://github.com/apache/airflow#backport-packages

Problems:

1.  Using ``airflow.operators.python_operator.PythonOperator`` will be replaced by ``airflow.operators.python.PythonOperator``. Affected file:
```

For more information on upgrade check functionality, read [Upgrade Check Script](
]http://apache-airflow-docs.s3-website.eu-central-1.amazonaws.com/docs/apache-airflow/latest/upgrade-check.html#upgrade-check) from Apache Airflow.

## Step 3: Prepare Airflow 2.0 DAGs

The next step is to review the results from Airflow's upgrade check script and make all necessary changes to your import statements, DAGs, and configurations.

a. Import Operators from Backport Providers

All Airflow 2.0 Operators are backwards compatible with Airflow 1.10. To transition to using these providers:

1. Add the new providers to your `requirements.txt` or `packages.txt` files
2. Modify your Import Statements

For more information,refer to [Backport Providers](https://airflow.apache.org/docs/apache-airflow/stable/backport-providers.html?highlight=provider) from Apache Airflow.

b. Modify Airflow DAGs

Depending on how your DAGs are written today, you'll likely need to modify your code to be 2.0-compatible. This could include:

- Change to undefined variable handling in templates
- Changes to the KubernetesPodOperator
- Change default value for `dag_run_conf_overrides_params`
- Other

For more, refer to [Step 5: Upgrade Airflow DAGs](http://apache-airflow-docs.s3-website.eu-central-1.amazonaws.com/docs/apache-airflow/latest/upgrading-to-2.html#step-5-upgrade-airflow-dags) from Apache Airflow.

## Step 4: Upgrade to Airflow 2.0

If your DAGs and configurations pass the upgrade check script above, you're ready to officially upgrade to Airflow 2.0.0. The upgrade process itself is the same as any other on Astronomer.

To upgrade to 2.0.0,

1. Initialize the Airflow upgrade process via the Astronomer UI or CLI
2. Deploy the AC 2.0.0 image (Debian-only) in your Dockerfile:

```
FROM quay.io/astronomer/ap-airflow:2.0.0-buster-onbuild
```

Then, navigate to the Airflow UI to confirm that your upgrade was successful. 

## What's Next

You're all set! If you have any questions or issues, feel free to:

- Reach out to [Astronomer Support](https://support.astronomer.io)
- Post in the [Astronomer Community Forum](https://forum.astronomer.io/)
- Ask a question in the [Airflow Dev List](https://airflow.apache.org/community/)
- Join the [Apache Airflow Slack](https://apache-airflow-slack.herokuapp.com/)

Our team is here to help alongside the open source community.

If you find a bug or problem in Airflow, file a GitHub issue in the [Apache Airflow GitHub repo]((https://github.com/apache/airflow/issues)). We'll be working with open source contributors towards subsequent 2.0 releases and are committed to regularly triaging community-reported issues.








