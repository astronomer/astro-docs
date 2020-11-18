---
title: "Monitor Airflow Deployments with Alerts"
navTitle: "Airflow Alerts"
description: "How to configure different types of Airflow alerts on Astronomer to monitor the status of your deployments and tasks."
---

# Monitor Airflow Deployments with Alerts

Airflow alerts help you quickly and accurately diagnose issues with your deployments. Astronomer offers two solutions for triggering alerts when something happens in your system:
* [Email alerts](#configure-email-alerts-for-airflow) are sent when something you specify happens in a task or DAG.
* [Deployment-level alerts](#configure-deployment-level-alerts-for-airflow) give you information about how your entire system is performing. These appear directly in Astronomer’s UI.

## Configure Email Alerts for Airflow

**Prerequisite**: To perform this setup, you need to have built error notifications as described in the [Error Notifications in Airflow](https://www.astronomer.io/guides/error-notifications-in-airflow/) topic.

You can configure Airflow to send alerts via email whenever a task fails, retries, succeeds, or experiences any other event you want to know about through the [email util](https://github.com/apache/airflow/blob/master/airflow/utils/email.py).

With Astronomer, you can integrate a Simple Mail Transfer Protocol (SMTP) service to automatically handle the delivery of these emails. When an Airflow email alert is triggered, the SMTP service automatically sends an email from the address of your choice.

The following topics contain setup steps for two free and popular SMTP services:

* [Integrate Sendgrid with Astronomer](#integrate-sendgrid-with-astronomer)
* [Integrate Amazon's Simple Email Service (SES) with Astronomer](#integrate-sendgrid-with-amazon-ses)

By default, email alerts are sent whenever individual tasks fail. To limit emails only to overall DAG failures, refer to the [Configure Email Alerts at the DAG Level](Link to topic) topic.


## Integrate SendGrid with Astronomer
SendGrid gives you 40,000 free emails for the first 30 days of your account, then 100 emails/day for free after that. We expect this to be more than enough emails for alerting you when a task fails or retries.

To get started with SendGrid:

#### 1. [Create a New Account](https://signup.sendgrid.com)

When creating an account, be prepared to disclose some standard information about yourself and your organization.


#### 2. [Verify a Single Sender Identity](https://sendgrid.com/docs/ui/sending-email/sender-verification/)

Because you’re only sending emails for internal administrative purposes, a single sender identity is sufficient for integrating with Astronomer. The email address you verify here is used as the sender for your Airflow alert emails.

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

## Amazon SES

If you choose to use Amazon SES, the process is similar to the one outlined above for Sendgrid users.

### Verify Email Addresses

Go to: `AWS Console` > `Simple Email Service` > `Email Addresses`

Here, email addresses need to be verified in order to deliver email to them. If you want to configure alerts to be sent to a Slack channel, you can enter an email addreses from Slack to be verified here.

### SMTP Settings

Go to: `AWS Console` > `Simple Email Service` > `SMTP Settings`

Use the `Create My SMTP Credentials` button, which will generate a username and password. This will look similar to an access and secret access key.

**Note:** You won't be able to acecss these values again, so consider storing them in a password manager. Note the Server Name and Port on this page as well.

### Add SES Credentials to your Astronomer Deployment

Once you have your SES API Key, go to your Astronomer Deployment on Astronomer's UI and navigate to `Deployments` > `Configure` > `Env Vars`.

Now, add the following Environment Variables:

```
AIRFLOW__SMTP__SMTP_HOST=in US-EAST-1, this will be "email-smtp.us-east-1.amazonaws.com
AIRFLOW__SMTP__SMTP_PORT=587
AIRFLOW__SMTP__SMTP_STARTTLS=True
AIRFLOW__SMTP__SMTP_SSL=False
AIRFLOW__SMTP__SMTP_USER={ENTER_USERNAME_FROM_STEP2A}
AIRFLOW__SMTP__SMTP_PASSWORD={ENTER_PASSWORD_FROM_STEP2A}
AIRFLOW__SMTP__SMTP_MAIL_FROM={ENTER_FROM_EMAIL_HERE}
```

## Triggering Alerts on DAG Run

Email alerting set up via `email_on_failure` is handled at the task level. If a handful of your tasks fail for related reasons, you'll receive an individual email for each of those failures.

If you're interested in limiting failure alerts to the DAG run level, you can instead pass `on_failure_callback` ([source](https://github.com/apache/airflow/blob/v1-10-stable/airflow/models/dag.py#L167)) directly in your DAG file to define a Python function that sends you an email denoting failure.

```
 :param on_failure_callback: A function to be called when a DagRun of this dag fails.
 ```

The code in your DAG will look something like the following: ([source](https://github.com/apache/airflow/blob/v1-10-stable/airflow/utils/email.py#L41)):

 ```
 from airflow.models.email import send_email

def new_email_alert(self, **kwargs):
  title = "TEST MESSAGE: THIS IS A MODIFIED TEST"
  body = ("I've now modified the email alert "
                "to say whatever I want it to say.<br>")
  send_email('my_email@email.com', title, body)
  ```
# Astronomer Deployment-Level Alerting

In the Astronomer UI, you can subscribe to additional alerts in the `Alerts` tab. These alerts are _platform_ level alerts that pertain to how the underlying components are performing (e.g. is the scheduler healthy? Are tasks failing at an abnormal _rate_? )

**Note:** You do **not** need to create an SMTP URI for this feature to work.

## Airflow Deployment Alerts

| Alert | Description |
| ------------- | ------------- |
| `AirflowDeploymentUnhealthy` | Airflow deployment is unhealthy, not completely available. |
| `AirflowFailureRate` | Airflow tasks are failing at a higher rate than normal. |
| `AirflowSchedulerUnhealthy` | Airflow scheduler is unhealthy, heartbeat has dropped below the acceptable rate. |
| `AirflowPodQuota` | Deployment is near its pod quota, has been using over 95% of it's pod quota for over 10 minutes. |
| `AirflowCPUQuota` | Deployment is near its CPU quota, has been using over 95% of it's CPU quota for over 10 minutes. |
| `AirflowMemoryQuota` | Deployment is near its memory quota, has been using over 95% of it's memory quota for over 10 minutes. |

### Example Alert

This alert fires when the scheduler is not heartbeating every 5 seconds for more than 3 minutes:

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

The full PQL ([Prometheus Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)) for how all these alerts are triggered can be found in our helm [helm charts ](https://github.com/astronomer/helm.astronomer.io/blob/387bcfcc06885d9253c2e1cfd6a5a08428323c57/charts/prometheus/values.yaml#L99
).

> **Note:** Customizing these alerts is currently only a feature available to Enterprise customers.
