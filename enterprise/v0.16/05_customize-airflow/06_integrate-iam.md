---
title: "Integrate IAM Roles"
navTitle: "Integrate IAM Roles"
description: "How to append IAM roles to an Airflow Deployment on Astronomer."
---

## Overview

On Astronomer, IAM roles can be appended to all Kubernetes pods within any individual Airflow Deployment on the platform.

IAM roles on [AWS](https://aws.amazon.com/iam/faqs/), [GCP](https://cloud.google.com/iam/docs/overview) and other platforms are often used to manage the level of access a specific user (or object, or group of users) have to some resource (or set of resources). The resource in question could be an S3 bucket or Secret Backend, both of which are commonly used in tandem with Airflow and Astronomer and can now be configured to be accessible only to a subset of Kubernetes pods within your wider Astronomer cluster.

To support this functionality, each pod in an Astronomer namespace (each of which maps to an Airflow deployment) is launched by a [Kubernetes Service Account](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/). By annotating the service account with the role, all pods launched will inherit that role.

At a high-level, you can:

* Create an IAM role defining access to the target service or set of services (e.g. AWS S3)
* Create or update an existing Airflow Deployment on Astronomer with that appended IAM role
* Confirm your deployment was annotated successfully by running `kubectl describe po` on any new pod created within that namespace

A few clarifying notes:

* ALL Kubernetes pods within your Astronomer Deployment (Scheduler, Webserver, Workers) will assume the IAM role. There is currently no way to run more than 1 IAM role per deployment.
* If you’d like your IAM role to apply to more than 1 deployment, you must annotate each deployment.
* You must use the Astro CLI to pass IAM role annotations.
* Only Workspace Admins can pass IAM role annotations.
* Once a Deployment is created or updated with an IAM role, there is no way to delete that annotation.

More specific guidelines below.

## Prerequisites

* [The Astronomer CLI](/docs/enterprise/v0.16/develop/cli-quickstart/)
* Admin access on an Astronomer Workspace
* Permission to run `$ kubectl describe po` in your cluster
* EKS 1.14+
* Your IAM role `arn`

## Guidelines

The steps below will walk you through the configuration needed within EKS to integrate IAM with Astronomer, including steps to create an IAM role and policy in the first place. If you've already done so and have your IAM role `arn` on hand, skip to the "Integrate IAM with Astronomer" section below.

### Set up IAM on EKS

Before you can integrate IAM with an Airflow Deployment on Astronomer, you'll need to do the following within EKS:

- Enable IAM Roles for Service Accounts
- Create an IAM Role and Policy
- Test that your IAM Role is functional by applying a Service Account to a Pod

#### Enable IAM Roles for Service Accounts

As a first step within EKS, enable IAM integration for Service Accounts and create an OpenID Connect (OIDC) identity provider in the IAM console. To do so, follow ["Enable IAM Roles for Service Accounts"](https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html) from AWS.

Once you've enabled an IAM OIDC identity provider, you'll be able to create an IAM role to associate with a service account in your cluster.

#### Create an IAM Role and Policy

Now, the next two steps are:

1. Create an IAM Policy that specifies the permissions you want to apply (or restrict) to the resource in question (e.g. read-only access to an AWS S3 bucket)
2. Create an IAM role and Service Account on EKS

Follow ["Create Service Account IAM Policy and Role"](https://docs.aws.amazon.com/eks/latest/userguide/create-service-account-iam-policy-and-role.html) from AWS.

At the end of these two steps, you should have an IAM role that's attached to an IAM policy. That role will be associated with a Kubernetes Service Account.

#### Apply a Service Account to Test your IAM Role

To test that your IAM Role is functional before integrating it with Astronomer, apply a Service Account to a Pod by following ["Specify Service Account Role"](https://docs.aws.amazon.com/eks/latest/userguide/specify-service-account-role.html) from AWS.

These guidelines will walk you through how to annotate a Service Account with an IAM role and apply it to a Kubernetes pod (or set of pods).

### Integrate IAM with Astronomer

Now that your IAM Role is functional, you're ready to apply it to an Airflow Deployment on Astronomer. From here, you'll need to:

- Set `serviceAccountAnnotationKey` in your `config.yaml`
- Create or update an Airflow Deployment with an annotated IAM Role via the `--cloud-role` flag from the Astro CLI
- Confirm the role was passed successfully

Read below for guidelines.

#### Set `serviceAccountAnnotationKey` in your `config.yaml`

In order to apply an IAM role to any Airflow Deployment on Astronomer, you need to explicitly pass a cloud provider config to the platform. To do so, set the following in your `config.yaml` file under `astronomer`, depending on your cloud provider:

**EKS** -

```
serviceAccountAnnotationKey: eks.amazonaws.com/role-arn
```

**GKE** -

```
serviceAccountAnnotationKey: iam.gke.io/gcp-service-account
```

For example:

```global:
    baseDomain: ${var.deployment_id}.${var.route53_domain}
    tlsSecret: astronomer-tls
    postgresqlEnabled: false
  nginx:
    privateLoadBalancer: true
  astronomer:
    houston:
      config:
        deployments:
          serviceAccountAnnotationKey: eks.amazonaws.com/role-arn
        auth:
```

[Source code here](https://github.com/astronomer/houston-api/blob/main/config/default.yaml#L576).

#### Create or update an Airflow Deployment with an annotated IAM Role

Now that you've enabled the ability for Astronomer to pass IAM roles, you're free to create or update an individual Airflow Deployment with an annotated role via the Astronomer CLI.

To _create_ a new Airflow Deployment, run the following:

```
$ astro deployment create new-deployment-1234 --executor=celery --cloud-role={arn-role}
```

To _update_ an existing Airflow Deployment, run the following:

```
$ astro deployment update release-name-1234 --cloud-role={arn-role}
```

As you run these commnds make sure to:

- Insert your own `role-arn` for the IAM role in question after the `--cloud-role` flag
- Specify your Airflow Executor (Celery, Local, Kubernetes) if you create a Deployment
- Specify the release name you'd like to give to your new Airflow Deployment if applicable (e.g. `new-deployment-1234)

> **Note:** To customize an Airflow Deployment's release name when you create it, make sure you've set `manualReleaseNames: true` in the `config.yaml` file of your Astronomer directory. Enabling that configuration should make applying the IAM role to that Airflow Deployment easier to automate. If you _don't_ enable `manualReleaseNames`, the release name for any Aiflow Deployment you create will be generated automatically and at random.

#### Confirm the role was passed successfully

To confirm the role was passed successfully to all pods within your Airflow Deployment, you can either:

1. Run a `kubectl describe po/<pod>` on any new pod created in your namespace and see `Annotations` within the output

2. At the bottom of your `config.yaml`, you should see the role listed ([source code here](https://github.com/astronomer/houston-api/blob/561c2783a11fb7d45ac9b85caa0daf534d6f09fe/config/default.yaml#L538-L541)).

```
astronomer_houston=# select config from houston$default."Deployment";
                                   config
----------------------------------------------------------------------------
 {"serviceAccountAnnotations":{"eks.amazonaws.com/role-arn":"test-update"}}
(1 row)
```
