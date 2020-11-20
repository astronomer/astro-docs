---
title: "Monitor Airflow Deployments with Alerts"
navTitle: "Airflow Alerts"
description: "How to configure alerts on Astronomer to monitor the health of your Airflow Deployment and the status of your tasks."
---

# Monitor Airflow Deployments with Alerts
## Overview

Airflow alerts help you quickly and accurately diagnose issues with your deployments. Astronomer offers two solutions for triggering alerts when something happens in your system:
* [Task-level alerts](#subscribe-to-task-level-alerts) use a Simple Mail Transfer Protocol (SMTP) service to alert you via email when a task or DAG fails, succeeds, or retries.
* [Deployment-level alerts](#subscribe-to-deployment-alerts-on-astronomer) give you information about the general performance of a deployment. You can specify an email address to receive these alerts directly in Astronomer UI.

## Subscribe to Task-Level Alerts

**Prerequisite**: To complete this setup, you need to have built error notifications as described in the [Error Notifications in Airflow](https://www.astronomer.io/guides/error-notifications-in-airflow/) topic.

You can configure Airflow to send alerts via email whenever a task fails, retries, succeeds, or experiences any other event you want to know about through the [email util](https://github.com/apache/airflow/blob/master/airflow/utils/email.py).  

With Astronomer, you can integrate an SMTP service to automatically handle the delivery of these emails. When an Airflow email alert is triggered, the SMTP service automatically sends an email from the address of your choice.

The following topics contain setup steps for two free and popular SMTP services:

* [Integrate SendGrid with Astronomer](#integrate-sendgrid-with-astronomer)
* [Integrate Amazon's Simple Email Service (SES) with Astronomer](#integrate-amazon-ses-with-astronomer)

By default, email alerts for process failures are sent whenever individual tasks fail. To receive only one email per DAG failure, refer to the [Limit Alerts to the DAG Level](#limit-alerts-to-the-dag-level) topic.


### Integrate SendGrid with Astronomer
SendGrid gives you 40,000 free emails for the first 30 days of your account, then 100 emails/day for free after that. We expect this to be more than enough emails for alerting you when a task fails or retries.

To get started with SendGrid:

#### 1. [Create a New Account](https://signup.sendgrid.com)

When creating an account, be prepared to disclose some standard information about yourself and your organization.


#### 2. [Verify a Single Sender Identity](https://sendgrid.com/docs/ui/sending-email/sender-verification/)

Because you're sending emails only for internal administrative purposes, a single sender identity is sufficient for integrating with Astronomer. The email address you verify here is used as the sender for your Airflow alert emails.

#### 3. Create a Key Using SendGrid's Web API.

a) In SendGrid, go to Email API > Integration Guide. Follow the steps to generate a new API key using SendGrid's Web API and cURL.

b) Skip the step for exporting your API Key to your development environment. Instead, execute the generated curl code directly in your command line, making sure to replace `$SENDGRID_API_KEY` in the `--header` field with your copied key.

c) Verify your integration in SendGrid to confirm that the key was activated. If you get an error indicating that SendGrid can't find the test email, try rerunning the cURL code in your terminal before retrying the verification.

#### 4. Add SendGrid Credentials to your Astronomer Deployment

In your Astronomer deployment, go to `Deployments` > `Configure` > `Env Vars` and add the following variables:

```
AIRFLOW__SMTP__SMTP_HOST=smtp.sendgrid.net
AIRFLOW__SMTP__SMTP_STARTTLS=True
AIRFLOW__SMTP__SMTP_SSL=False
AIRFLOW__SMTP__SMTP_USER=apikey
AIRFLOW__SMTP__SMTP_PASSWORD={Your SendGrid API Key from step 3}
AIRFLOW__SMTP__SMTP_PORT=587
AIRFLOW__SMTP__SMTP_MAIL_FROM={Your SendGrid email sender from step 2}
```

Click `Update` to save the configuration and redeploy to propagate to your deployment.

### Integrate Amazon SES with Astronomer

**Prerequisite**: This setup requires an AWS account and use of the [AWS Management Console](https://aws.amazon.com/console/).

#### 1. Verify Email Addresses

Go to: `AWS Console` > `Simple Email Service` > `Email Addresses` and add the email addresses you want to deliver mail to.

From here, open the account each email address you specified and verify them through the email sent by Amazon.


#### 2. Create SMTP Credentials

In the AWS Console, go to `Simple Email Service` > `SMTP Settings` and use the `Create My SMTP Credentials` button to generate a username and password. This will look similar to an access and secret access key. Write down this username and password for later, as well as the Server Name and Port.

**Note:** You won't be able to access these values again, so consider storing them in a password manager.

#### 3. Choose an Amazon EC2 region

Refer to [Amazon's list of available regions and servers](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#concepts-regions) to determine which server best fits your needs. Write down the code of the server you chose for the next step.


#### 4. Add SES Credentials to your Astronomer Deployment

In your Astronomer Deployment on Astronomer's UI, go to `Deployments` > `Configure` > `Env Vars` and add the following Environment Variables:

```
AIRFLOW__SMTP__SMTP_HOST={The address of AWS server you chose in step 3. For instance, in US-EAST-1 this would be email-smtp.us-east-1.amazonaws.com}
AIRFLOW__SMTP__SMTP_PORT=587
AIRFLOW__SMTP__SMTP_STARTTLS=True
AIRFLOW__SMTP__SMTP_SSL=False
AIRFLOW__SMTP__SMTP_USER={Your username from step 2}
AIRFLOW__SMTP__SMTP_PASSWORD={Your password from step 2}
AIRFLOW__SMTP__SMTP_MAIL_FROM={Your verified email address from step 1}
```

## Limit Alerts to the DAG Level

By default, email alerts configured via the `email_on_failure` param ([source](https://github.com/apache/airflow/blob/master/airflow/models/baseoperator.py)) are handled at the task level. If a handful of your tasks fail for related reasons, you'll receive an individual email for each of those failures.

If you want to limit failure alerts to the DAG run level, you can instead set up your alerts using the `on_failure_callback` param ([source](https://github.com/apache/airflow/blob/v1-10-stable/airflow/models/dag.py#L167)). When you pass `on_failure_callback` directly in your DAG file, it defines a Python function that sends you one email per DAG failure, rather than multiple emails for each task that fails:

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

In Astronomer's UI, you can subscribe to deployment-level email alerts in the Settings page for a deployment. These alerts tell you how a deployment is performing. For instance, it might tell you whether the scheduler is healthy, or whether tasks are failing at an abnormal rate. Unlike task-level alerts, deployment-level alerts can be sent without an SMTP service.

![Astronomer Deployment Email Settings](https://assets2.astronomer.io/main/docs/emails/astro_deployment_email.png)

### List of All Astronomer Airflow Deployment Alerts

| Alert | Description |
| ------------- | ------------- |
| `AirflowDeploymentUnhealthy` | Airflow deployment is unhealthy or not completely available. |
| `AirflowFailureRate` | Airflow tasks are failing at a higher rate than normal. |
| `AirflowSchedulerUnhealthy` | Airflow scheduler is unhealthy: heartbeat has dropped below the acceptable rate. |
| `AirflowPodQuota` | Deployment is near its pod quota: it's been using over 95% of it's pod quota for over 10 minutes. |
| `AirflowCPUQuota` | Deployment is near its CPU quota: it's been using over 95% of it's CPU quota for over 10 minutes. |
| `AirflowMemoryQuota` | Deployment is near its memory quota: it's been using over 95% of it's memory quota for over 10 minutes. |


### Anatomy of a Deployment Alert

When you subscribe to the AirflowSchedulerUnhealthy Alert in Astronomer's UI, an alert checks to see if the scheduler is heartbeating every 5 seconds. If the scheduler stops heartbeating for more than 3 minutes, the alert is triggered:

```
alert: AirflowSchedulerUnhealthy
      expr: round(rate(airflow_scheduler_heartbeat{type="counter"}[1m]) * 5) == 0
      for: 3m # Scheduler should reboot quick
      labels:
        tier: airflow
        component: scheduler
        deployment: "{{ $labels.deployment }}"
      annotations:
        summary: "{{ $labels.deployment }} scheduler is unhealthy"
        description: "The {{ $labels.deployment }} scheduler's heartbeat has dropped below the acceptable rate."
```

**Need to customize an alert?** Customers with Enterprise-level Astronomer can modify any Astronomer-released alert according to their organization's needs.
