---
title: "Applying IAM Roles to Pods"
description: "Attaching IAM roles to tasks running on a deployment"
date: 2018-10-12T00:00:00.000Z
slug: "aws-iam-roles"
---

# IAM Roles 

[IAM roles](https://aws.amazon.com/iam/faqs/) can be used to avoid storing credentials in plaintext and having to deal with grabbing secrets. If Astronomer is running on EKS, roles can be automatically attached to all pods in for a particular deployment.

## Adding an annotation

Airflow pods will be launched by a service account for any given namespace.

```
$ kubectl get serviceaccounts -n astro-demo-true-hemisphere-2825

NAME                                            SECRETS   AGE
default                                         1         14d
true-hemisphere-2825-scheduler-serviceaccount   1         14d
true-hemisphere-2825-worker-serviceaccount      1         14d
```
The [worker service account](https://github.com/astronomer/astronomer-airflow/blob/master/charts/airflow/templates/workers/worker-serviceaccount.yaml) will launch pods within a namespace. 

Follow the official [EKS documentation](https://docs.aws.amazon.com/eks/latest/userguide/specify-service-account-role.html) to add an annotation to the `worker-serviceaccount`:

```
kubectl annotate serviceaccount -n astro-demo-true-hemisphere-2825 true-hemisphere-2825-worker-serviceaccount \
eks.amazonaws.com/role-arn=arn:aws:iam::AWS_ACCOUNT_ID:role/IAM_ROLE_NAME
```

This will let all future pods launched assume that role.

## Updating boto

Once the serviceaccount has been given the annotation, the version of `boto` Airflow ships with needs to be upgraded.

In the `requirements.txt` for that deployment, add:

```
boto3 >=1.9
botocore >= 1.12
``` 

Verify the image builds and deploy it. Now all tasks launched should assume the role. 