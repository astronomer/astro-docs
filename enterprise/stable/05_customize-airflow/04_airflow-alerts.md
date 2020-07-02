---
title: "Airflow Alerts"
navTitle: "Airflow Alerts"
description: "Configure Airflow alerts to monitor the health of your deployments."
---

# Airflow Email Alerting

Airflow emails are a useful way to get notified of DAG retries, failures, and anything else you want to custom set through the [email util](https://github.com/apache/airflow/blob/master/airflow/utils/email.py). By default, Astronomer does not bundle in a SMTP service to send emails through Airflow, but there are a number of easy (and free) options you can incorporate.

This guide will walk through setup with two services, equivalent in functionality:

1. Sendgrid
2. Amazon's Simple Email Service (SES)

Which tool you use is up to you.

## Sendgrid

### Create a Sendgrid Token

#### [1. Create a New Account](`https://signup.sendgrid.com`)

You will need fill out some boilerplate survey information, but it's a quick setup.

![Sendgrid Signup](https://assets2.astronomer.io/main/docs/emails/sendgrid_signup.png)

A new account will be given 40k emails for the first 30 days and then 100 emails/day for free. As long as your DAGs are working properly, this should be more than enough for most use cases.

After you create your account, you'll reach a view like below. 

#### 2. Click on "Integrate using our Web API or SMTP relay"   
![Sendgrid Getting Started](https://assets2.astronomer.io/main/docs/emails/sendgrid_getting_started.png)

#### 3. Choose the "Web API (recommended)" method
![Sendgrid Setup Method](https://assets2.astronomer.io/main/docs/emails/sendgrid_setup_method.png)

#### 4. Select the "cURL" option from the languages
![Sendgrid Language](https://assets2.astronomer.io/main/docs/emails/sendgrid_language.png)

#### 5. Create a new API Key

The name can be anything you want. Then, run the code in your terminal and verify the integration.

You don't have to export the API Key as the docs suggest. Instead, just replace the `$SENDGRID_API_KEY` in the example code with the generated API key.

**Note:** If you don't execute the code to use the token at least once, Sendgrid will not be able to verify that it is working properly and you will not be able to use the key.

![Sendgrid API Key](https://assets2.astronomer.io/main/docs/emails/sendgrid_apikey.png)

#### 6. Verify

On the following page, click `Verify`. This is to make sure that Sendgrid activates the key.

If an error pops up that Sendgrid cannot find the test email, run the cURL command again in your terminal and click `Retry`.

### Add Sendgrid Credentials to your Astronomer Deployment

Once you have your Sendgrid API Key, go to your Astronomer deployment and click "Configure" from the top nav. Click on "Environment Vars" from the lefthand menu and begin adding the following variables specified below.

Two things:

- Your Sendgrid API Key will be used as the value for `SMTP__SMTP_PASSWORD`
- You'll need to specify a `SMTP__SMTP_MAIL_FROM` value with the same email you used to sign up with Sendgrid.

```
AIRFLOW__SMTP__SMTP_HOST=smtp.sendgrid.net
AIRFLOW__SMTP__SMTP_STARTTLS=True
AIRFLOW__SMTP__SMTP_SSL=False
AIRFLOW__SMTP__SMTP_USER=apikey
AIRFLOW__SMTP__SMTP_PASSWORD={ENTER_SENDGRID_APIKEY_HERE}
AIRFLOW__SMTP__SMTP_PORT=587
AIRFLOW__SMTP__SMTP_MAIL_FROM={ENTER_RELEVENT_FROM_EMAIL_HERE}
```
![Astro Create Envs](https://assets2.astronomer.io/main/docs/emails/astro_create_envs.png)

Click `Update` to save the configuration and redeploy to propagate to your deployment. Your deployment will use that configuration to send emails from then on.

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

If you're interested in limiting failure alerts to the DAG run level, you can instead pass `on_failure_callback` ([source](https://github.com/apache/airflow/blob/v1-10-stable/airflow/models.py#L3311)) directly in your DAG file to define a Python function that sends you an email denoting failure.

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

## Platform Alerts (Enterprise Only)

| Alert | Description |
| ------------- | ------------- |
| `PrometheusDiskUsage` | Prometheus high disk usage, has less than 10% disk space available. |
| `RegistryDiskUsage` | Docker Registry high disk usage, has less than 10% disk space available. |
| `ElasticsearchDiskUsage` | Elasticsearch high disk usage, has less than 10% disk space available. |
| `IngessCertificateExpiration` | TLS Certificate expiring soon, expiring in less than a week. |

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

**Note:** Customizing these alerts is currently only a feature available to Enterprise customers.