---
title: "Integrate IAM Roles"
navTitle: "Integrate IAM Roles"
description: "How to append IAM roles to an Airflow Deployment on Astronomer."
---

## Overview

As of Astronomer v0.15, IAM roles can now be appended to all pods within any individual Airflow Deployment on the platform.

IAM roles on [AWS](https://aws.amazon.com/iam/faqs/), [GCP](https://cloud.google.com/iam/docs/overview) and other platforms are often used to manage the level of access a specific user (or object, or group of users) have to some resource (or set of resources). The resource in question could be an S3 bucket or Secret Backend, both of which are commonly used in tandem with Airflow and Astronomer and can now be configured to be accessible only to a subset of Kubernetes pods within your wider Astronomer cluster.

To support this functionality, each pod in an Astronomer namespace (each of which maps to an Airflow deployment) is launched by a [Kubernetes Service Account](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/). By annotating the service account with the role, all pods launched will inherit that role.

At a high-level, you can now:

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
* Your IAM role `arn`
* Admin access on an Astronomer Workspace
* Permission to run `$ kubectl describe po` in your cluster

## Guidelines

### Create or update an Airflow Deployment with an annotated IAM Role

The only way to create or update an Airflow Deployment with an annotated IAM Role is to do so via the Astronomer CLI.

To create a new Airflow Deployment, run the following:

```
astro deployment create new-deployment-name123 --executor=celery --cloud-role={arn-role}
```

To update an existing Airflow Deployment, run the following:

```
astro deployment update new-deployment-name123 --cloud-role={arn-role}
```

Make sure to insert your own `role-arn` for the IAM role in question after the `--cloud-role` flag.


### Confirm the role was passed successfully

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
