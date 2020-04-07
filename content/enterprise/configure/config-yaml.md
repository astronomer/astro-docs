---
title: "Build your config.yaml"
description: "Installing config.yaml for Astronomer"
date: 2018-10-12T00:00:00.000Z
slug: "ee-configyaml"
---
Here, we'll set the configuration values for the Astronomer Helm chart.

`cd` to where you cloned `astronomer`

Create a `config.yaml` for your domain setting overrides by copying [master.yaml](https://github.com/astronomer/astronomer/blob/master/configs/master.yaml) if you don't already have one.

(If you are on GKE, you can use the GKE one).

```
cp master.yaml config.yaml
```

Change the branch on GitHub to match your desired Astronomer Platform version.

In `config.yaml`, set the following values:

```yaml
global:
  baseDomain: <your-basedomain>
  tlsSecret: astronomer-tls

astronomer:
  auth:
    google:
      enabled: true   
      clientId: <your-client-id>
      clientSecret: <your-client-secret>
```

Replace `<your-client-id>` and `<your-client-secret>` with the values from the previous step.

## Set up SMTP

To use email invites with Astronomer, you'll have to generate SFTP creds from an external service (e.g. [SendGrid](https://sendgrid.com/)). For help generating those credentials and configuring them with your Airflow deployments, follow our guide on [Setting up Airflow Emails](https://www.astronomer.io/docs/setting-up-airflow-emails/).

Once you have those credentials, throw them in your helm config (nested under `astronomer.smtp.uri`). Add something like:

```yaml
astronomer:
  smtp:
    uri: "smtp://user:pass@email-smtp.us-east-1.amazonaws.com/?requireTLS=true"
```

This is the format for using Amazon's SMTP service, but it should be similar for other services.

Once you've updated your helm config, you'll need to do a `helm upgrade`. That'll restart Houston and pass in the creds that you need.

**Note**: We send emails using [nodemailer](https://nodemailer.com/smtp/).
