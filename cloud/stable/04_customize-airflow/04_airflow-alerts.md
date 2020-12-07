Deployment-level---
title: "Configure Airflow Email Alerts on Astronomer"
navTitle: "Airflow Alerts"
description: "Configure Email Alerts on Astronomer to monitor the health of your Airflow Deployment and the status of your tasks."
---

## Overview

Whether you're just starting to use Apache Airflow or your team is running it at scale, incorporating an alerting framework is critical to the health of your data. On Astronomer, users can leverage two complementary email-based alerting solutions:

* [Airflow Task-level Alerts](#subscribe-to-task-level-alerts) that notify you via email when a task or DAG fails, succeeds, or retries. These require an SMTP (Simple Mail Transfer Protocol) service.
* [Deployment-level Alerts](#subscribe-to-deployment-alerts-on-astronomer) that notify you via email when the health of your Airflow Deployment on Astronomer is low or any of the underlying components are underperforming. You can subscribe to these alerts in the **Email Alerts** section of the Astronomer UI.

## Subscribe to Task-Level Alerts

As an Airflow user, you can configure event-based email alerts directly in your DAG code by leveraging Airflow's [email util](https://github.com/apache/airflow/blob/master/airflow/utils/email.py). Depending on your use case, you may choose to be notified if a particular task or DAG fails, succeeds, retries, etc. On Astronomer, setting up task-level alerts requires configuring an SMTP service to handle the delivery of these emails.

If your team isn't already using an SMTP service, we recommend the following:

- [SendGrid](https://sendgrid.com/)
- [Amazon SES](https://aws.amazon.com/ses/)

For step-by-step instructions on how to integrate either of these two services with Astronomer, refer to the steps below. If your team prefers another email delivery tool, you're more than free to use it.

> **Note:** By default, email alerts for process failures are sent whenever individual tasks fail. To receive only 1 email per DAG failure, refer to the Limit Alerts to the DAG Level topic below. For more information and best practices on Airflow alerts, refer to our Guide on [Error Notifications in Airflow](https://www.astronomer.io/guides/error-notifications-in-airflow/).

### Integrate SendGrid with Astronomer

[SendGrid](https://sendgrid.com/) is an email delivery service that's easy to set up to support Airflow task-level alerts. In terms of cost, SendGrid grants users 40,000 free emails within the first 30 days of an account opening and 100 emails per day after that at no cost. This should be more than enough to cover alerts when a task fails or retries, though you may want to consider upgrading your account if you're running Airflow at a significant scale.

To get started with SendGrid:

#### 1. [Create a SendGrid Account](https://signup.sendgrid.com)

When you create an account, be prepared to disclose some standard information about yourself and your organization.


#### 2. [Verify a Single Sender Identity](https://sendgrid.com/docs/ui/sending-email/sender-verification/)

Because you're sending emails only for internal administrative purposes, a single sender identity is sufficient for integrating with Astronomer. The email address you verify here is used as the sender for your Airflow alert emails.

#### 3. Create a Key Using SendGrid's Web API

a) In SendGrid, go to **Email API** > **Integration Guide**. Follow the steps to generate a new API key using SendGrid's Web API and cURL.

b) Skip the step for exporting your API Key to your development environment. Instead, execute the generated curl code directly in your command line, making sure to replace `$SENDGRID_API_KEY` in the `--header` field with your copied key.

c) Verify your integration in SendGrid to confirm that the key was activated. If you get an error indicating that SendGrid can't find the test email, try rerunning the cURL code in your terminal before retrying the verification.

#### 4. Add SendGrid Credentials to your Airflow Deployment

Now, navigate to your Airflow Deployment in [the Astronomer UI](https://app.gcp0001.us-east4.astronomer.io/login). Go to **Variables** and add the following Environment Variables using the **+Add** button:

```
AIRFLOW__SMTP__SMTP_HOST=smtp.sendgrid.net
AIRFLOW__SMTP__SMTP_STARTTLS=True
AIRFLOW__SMTP__SMTP_SSL=False
AIRFLOW__SMTP__SMTP_USER=apikey
AIRFLOW__SMTP__SMTP_PASSWORD={Your SendGrid API Key from step 3}
AIRFLOW__SMTP__SMTP_PORT=587
AIRFLOW__SMTP__SMTP_MAIL_FROM={Your SendGrid email sender from step 2}
```

Your Environment Variables should look something like this:

![Astronomer Deployment Email Settings](https://assets2.astronomer.io/main/docs/emails/astro_env_variables.png)

To prevent unauthorized users in your Workspace from seeing sensitive information, we recommend selecting the **Secret?** checkbox for your email and password profile variables.

Lastly, click **Deploy Changes** to push your configuration to your Airflow Deployment.

> **Note:** For more information on how to configure Environment Variables both locally and on Astronomer, refer to our ["Environment Variables" doc](https://www.astronomer.io/docs/cloud/stable/deploy/environment-variables/).

### Integrate Amazon SES with Astronomer

#### Prerequisites
This setup requires an AWS account and use of the [AWS Management Console](https://aws.amazon.com/console/).

#### 1. Verify Email Addresses

Go to: **AWS Console** > **Simple Email Service** > **Email Addresses** to add and verify the email addresses you want to receive alerts to.

From here, open the inbox of each email address you specified and verify them through the emails sent by Amazon.

#### 2. Create SMTP Credentials

In the AWS Console, go to **Simple Email Service** > **SMTP Settings** and use the **Create My SMTP Credentials** button to generate a username and password. This will look similar to an access and secret access key. Write down this username and password for later, as well as the **Server Name** and **Port**.

> **Note:** You won't be able to access these values again, so consider storing them in a password manager.

#### 3. Choose an Amazon EC2 region

Refer to [Amazon's list of available regions and servers](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#concepts-regions) to determine which server best fits your needs. Write down the code of the server you chose for the next step.

#### 4. Add SES Credentials to your Astronomer Deployment

Now, navigate to your Airflow Deployment in [the Astronomer UI](https://app.gcp0001.us-east4.astronomer.io/login). Go to **Variables** and add the following Environment Variables using the **+Add** button:
```
AIRFLOW__SMTP__SMTP_HOST={Your SMTP host}
AIRFLOW__SMTP__SMTP_PORT=587
AIRFLOW__SMTP__SMTP_STARTTLS=True
AIRFLOW__SMTP__SMTP_SSL=False
AIRFLOW__SMTP__SMTP_USER={Your username from step 2}
AIRFLOW__SMTP__SMTP_PASSWORD={Your password from step 2}
AIRFLOW__SMTP__SMTP_MAIL_FROM={Your verified email address from step 1}
```
Your Environment Variables should look something like this:

![Astronomer Deployment Email Settings](https://assets2.astronomer.io/main/docs/emails/astro_env_variables.png)

To prevent unauthorized users in your Workspace from seeing sensitive information, we recommend selecting the **Secret?** checkbox for your email and password profile variables.

Lastly, click **Deploy Changes** to push your configuration to your Airflow Deployment.

> **Note:** For more information on how to configure Environment Variables both locally and on Astronomer, refer to our ["Environment Variables" doc](https://www.astronomer.io/docs/cloud/stable/deploy/environment-variables/).

## Limit Alerts to the Airflow DAG Level

By default, email alerts configured via the `email_on_failure` param ([source](https://github.com/apache/airflow/blob/master/airflow/models/baseoperator.py)) are handled at the task level. If some number of your tasks fail, you'll receive an individual email for each of those failures.

If you want to limit failure alerts to the DAG-run level, you can instead set up your alerts using the `on_failure_callback` param ([source](https://github.com/apache/airflow/blob/v1-10-stable/airflow/models/dag.py#L167)). When you pass `on_failure_callback` directly in your DAG file, it defines a Python function that sends you one email per DAG failure, rather than multiple emails for each task that fails:

```
 :param on_failure_callback: A function to be called when a DagRun of this dag fails.
 ```

The code in your DAG might look something like this ([source](https://github.com/apache/airflow/blob/v1-10-stable/airflow/utils/email.py#L41)):

 ```
      from airflow.models.email import send_email
      def new_email_alert(self, **kwargs):
      title = "TEST MESSAGE: THIS IS A MODIFIED TEST"    
      body = ("This is the text "
      "That appears in the email body..<br>")      
      send_email('my_email@email.com', title, body)
  ```
## Subscribe to Deployment Alerts on Astronomer

In the Astronomer UI, you can subscribe to Deployment-level alerts by navigating to the **Settings** tab of your Airflow Deployment and entering your email address under **Email Alerts**.

Astronomer's platform monitors the health of your Airflow Deployment and triggers an alert if any of Airflow's core components are underperforming (e.g. Scheduler, Webserver) or if you've initiated a faulty action. For instance, you may receive an alert if your Airflow Scheduler is unhealthy, if tasks are failing at an abnormal rate, or if you've attempted to upgrade to a version of Airflow that does not match the corresponding Docker image in your Dockerfile.

Unlike task-level alerts, Deployment-level alerts are sent by Astronomer and do _not_ require a separate SMTP configuration.

![Astronomer Deployment Email Settings](https://assets2.astronomer.io/main/docs/emails/astro_deployment_email.png)

## Deployment Alerts on Astronomer

Refer to the following chart for more information on each deployment-level alert you might receive from Astronomer, as well as follow-up steps for improving the health of your affected Deployments.

| Alert | Description | Follow-Up |
| ------------- | ------------- | ------------- |
| `AirflowDeploymentUnhealthy` | The Airflow Deployment is unhealthy or not completely available. | Contact your Astronomer representative. |
| `AirflowEphemeralStorageLimit` | The Airflow Deployment is nearing its limit for storing temporary data. | Ensure that you are continually removing unused temporary data in your Airflow tasks. |
| `AirflowPodQuota` | The Airflow Deployment is near its pod quota; it's been using over 95% of it's pod quota for over 10 minutes. | Either increase the Deployment's allocated Webserver and Scheduler Resources or update your DAGs to use less resources. If you have not already done so, upgrade to [Airflow 2.0](https://www.astronomer.io/blog/introducing-airflow-2-0) for improved resource management. |
| `AirflowSchedulerUnhealthy` | The Airflow scheduler's heartbeat has dropped below the acceptable rate. | Reach out to [Astronomer Support](https://support.astronomer.io). |
| `AirflowTasksPendingIncreasing` | The Airflow Deployment is creating tasks faster than it's clearing them. | Ensure that your tasks are running and completing correctly. If your tasks are running as expected, increase the Deployment's allocated Server Resources in the Astronomer UI or redesign your DAGs so that less tasks are concurrently pending. |
| `ContainerMemoryNearTheLimitInDeployment` | The Airflow Deployment is near its memory quota; it's been using over 95% of it's memory quota for over 10 minutes. | Either increase the Deployment's allocated Webserver Resources or update your DAGs to use less resources. If you have not already done so, upgrade to [Airflow 2.0](https://www.astronomer.io/blog/introducing-airflow-2-0) for improved resource management. |
| `CpuThrottlingInDeployment` | The Airflow Deployment is near its CPU quota; it's been using over 95% of it's CPU quota for over 10 minutes. | Either increase the Deployment's allocated Webserver and Scheduler Resources or update your DAGs to use less resources. If you have not already done so, upgrade to [Airflow 2.0](https://www.astronomer.io/blog/introducing-airflow-2-0) for improved resource management. |
