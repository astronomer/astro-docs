---
title: "Integrate IAM Roles"
navTitle: "Integrate IAM Roles"
description: "How to append IAM roles to an Airflow Deployment on Astronomer."
---

## Overview

On Astronomer, IAM roles can be appended to the Webserver, Scheduler and Worker pods within any individual Airflow Deployment on the platform.

IAM roles on [AWS](https://aws.amazon.com/iam/faqs/) and other platforms are often used to manage the level of access a specific user (or object, or group of users) has to some resource (or set of resources). The resource in question could be an S3 bucket or Secret Backend, both of which are commonly used in tandem with Airflow and Astronomer and can now be configured to be accessible only to a subset of Kubernetes pods within your wider Astronomer cluster.

A few clarifying notes:

* Webserver, Scheduler and Worker pods within your Airflow Deployment will assume the IAM role. There is currently no way to use more than 1 IAM role per deployment.
* If you’d like your IAM role to apply to more than 1 deployment, you must annotate each deployment.
* You must use the Astro CLI to pass IAM role annotations.
* Only Workspace Admins can pass IAM role annotations.
* Once a Deployment is created or updated with an IAM role, there is no way to delete that annotation.

## Prerequisites

* [The Astronomer CLI](/docs/enterprise/v0.16/develop/cli-quickstart/)
* Admin access on an Astronomer Workspace
* Direct access to your Kubernetes Cluster (e.g. permission to run `$ kubectl describe po`)
* Kubernetes 1.14+

## AWS

Before you can integrate IAM with an Airflow Deployment on Astronomer, you'll need to do the following within AWS:

- Create an IAM OIDC Identity Provider
- Create an IAM Policy
- Create an IAM Role
- Create a Trust Relationship

### Create an IAM OIDC Identity Provider

1. Retrieve your EKS cluster's OIDC issuer URL with the following AWS CLI commands:

```bash
$ aws eks list-clusters
{
    "clusters": [
        "astronomer-cluster"
    ]
}
```

```bash
$ aws eks describe-cluster --name astronomer-cluster --query "cluster.identity.oidc.issuer" --output text
https://oidc.eks.us-west-2.amazonaws.com/id/EXAMPLEA829F4B2854D8DAE63782CE90
```

2. Open the IAM console at [https://console.aws.amazon.com/iam/](https://console.aws.amazon.com/iam/)
3. In the navigation pane, choose **Identity Providers**, and then choose **Create Provider**.
4. For **Provider Type**, choose **Choose a provider type**, and then choose **OpenID Connect**.
5. For **Provider URL**, use the OIDC issuer URL for your cluster.
6. For **Audience**, use `sts.amazonaws.com`.
7. Verify that the provider information is correct, and then choose **Create** to create your identity provider.

For additional information, refer to [Enable IAM Roles for Service Accounts](https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html).

### Create an IAM Policy

1. Open the IAM console at https://console.aws.amazon.com/iam/.
2. In the navigation panel, choose **Policies** and **Create policy**.
3. Choose the **JSON** tab.
4. In the Policy Document field, specify the permissions you'd like to apply (or restrict) to the resource in question (e.g. read / write access to an AWS S3 bucket) You can also use the visual editor to construct your own policy.

The following example allows permission to an S3 bucket named `astronomer-bucket`:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket",
                "s3:GetBucketLocation",
                "s3:ListBucketMultipartUploads"
            ],
            "Resource": "arn:aws:s3:::astronomer-bucket"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListMultipartUploadParts",
                "s3:AbortMultipartUpload"
            ],
            "Resource": "arn:aws:s3:::astronomer-bucket/*"
        }
    ]
}
```

5. Review and create your policy.

### Create an IAM Role

1. Open the IAM console at https://console.aws.amazon.com/iam/.
2. In the navigation panel, choose **Roles** and **Create Role**.
3. In the **Select type of trusted entity** section, choose **AWS service** and **EC2**. Choose **Next: Permissions**.
4. In the **Attach Policy** section, select your policy created in the previous section. Choose **Next: Tags.**
5. On the Add tags (optional) screen, you can add tags for the account. Choose **Next: Review.**
6. Enter a name for your role and choose **Create Role**.

For additional information, refer to [Create Service Account IAM Policy and Role](https://docs.aws.amazon.com/eks/latest/userguide/create-service-account-iam-policy-and-role.html).

### Create a Trust Relationship

Create a trust relationship between your IAM role and OIDC identity provider.

1. Open the IAM console at https://console.aws.amazon.com/iam/.
2. In the navigation panel, choose **Roles** and select your role created in the previous section.
3. Select the **Trust relationships** tab and choose **Edit trust relationship**.
4. Create a trust relationship between your IAM role and OIDC identity provider with the following format:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    },
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::AWS_ACCOUNT_ID:oidc-provider/OIDC_PROVIDER"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringLike": {
          "OIDC_PROVIDER:sub": "system:serviceaccount:SERVICE_ACCOUNT_NAMESPACE:SERVICE_ACCOUNT_NAME"
        }
      }
    }
  ]
}
```

Example:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    },
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::123456789:oidc-provider/oidc.eks.us-west-2.amazonaws.com/id/EXAMPLEA829F4B2854D8DAE63782CE90"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringLike": {
          "oidc.eks.us-west-2.amazonaws.com/id/EXAMPLEA829F4B2854D8DAE63782CE90:sub": "system:serviceaccount:astronomer-*:*"
        }
      }
    }
  ]
}
```

For additional information, refer to [IAM Role Configuration](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts-technical-overview.html#iam-role-configuration).

### Integrate your IAM Role with Astronomer

In order to apply your IAM role to any Airflow Deployment on Astronomer, you'll need to explicitly pass an annotation key to the platform.

1. Set the following in your `config.yaml` file under `astronomer.houston.config.deployments`:

```yaml
serviceAccountAnnotationKey: eks.amazonaws.com/role-arn
```

Example:
```yaml
global:
  baseDomain: astro.mydomain.com
  tlsSecret: astronomer-tls
  postgresqlEnabled: false
nginx:
  privateLoadBalancer: true
astronomer:
  houston:
    config:
      deployments:
        serviceAccountAnnotationKey: eks.amazonaws.com/role-arn
```


2. Push the configuration change to your platform as described in [Apply a Platform Configuration Change on Astronomer](https://www.astronomer.io/docs/enterprise/v0.16/manage-astronomer/apply-platform-config).

### Create or update an Airflow Deployment with an attached IAM Role

To _create_ a new Airflow Deployment with your IAM role attached:

```
$ astro deployment create <deployment-name> --executor=celery --cloud-role=arn:aws:iam::123456789:role/example-role
```

To _update_ an existing Airflow Deployment with your IAM role attached:

```
$ astro deployment update <deployment-name> --cloud-role=arn:aws:iam::123456789:role/example-role
```

Confirm the role was passed successfully to Webserver, Scheduler and Worker pods within your Airflow Deployment:
```bash
$ kubectl describe po <pod-name> -n <airflow-namespace>
```

Example:
```bash
$ kubectl describe po arithmetic-radiation-6756-worker-6d89b49f87-48nt4 -n astronomer-arithmetic-radiation-6756
```

You should see the following in your output:


```yaml
AWS_ROLE_ARN: arn:aws:iam::123456789:role/example-role
AWS_WEB_IDENTITY_TOKEN_FILE: /var/run/secrets/eks.amazonaws.com/serviceaccount/token
```

> **Note:** If using Airflow `1.10.5`, you'll need to add `boto3 >=1.9` and `botocore >= 1.12` to your `requirements.txt` file.
