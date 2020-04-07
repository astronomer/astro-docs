---
title: "Postgres Credentials on Astronomer Enterprise"
description: "How to pull the credentials for your deployment's metadata database."
date: 2018-08-24T00:00:00.000Z
slug: "ee-administration-postgres-creds"
---

## Overview

Each Airflow deployment on Astronomer lives in an isolated [Kubernetes Namespace](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) and maintains a separate underlying metadata database. The credentials for that database are stored as [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/#overview-of-secrets) within that namespace.

To pull the credentials you need to access your deployment's underlying database, follow the guidelines below.

### Pre-Requisites

- Access to your Kubernetes Cluster with permissions to:
    - List Namespaces
    - List Pods
    - List Kubernetes Secrets
- [Kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [Kubectx](https://github.com/ahmetb/kubectx) (*optional*)

## How To Pull Postgres Credentials via Kubectl

**1. Switch into your Kubernetes Cluster**

The rest of this guide will assume the use of [kubectx](https://github.com/ahmetb/kubectx) - a command line tool that allows you to easily switch between Kubernetes Clusters and Namespaces.

To start, switch into the Kubernetes Cluster that hosts Astronomer Enterprise.

```
$ kubectx
```

**2. List the Namespaces in your Cluster**

To list the namespaces on your Kubernetes cluster, run:

```
$ kubens
```

**3. Confirm your Deployment's Corresponding Namespace**

Find the Kubernetes Namespace that corresponds to the Airflow deployment whose database you'd like credentials to and run:

```
$ kubens <NAMESPACE>
```

Then, run:

```
$ kubectl get pods
```

You should see something like:

```
$ kubectl get pods
NAME                                                READY   STATUS    RESTARTS   AGE
quasaric-sun-9051-flower-7bbdf98d94-zxxjd           1/1     Running   0          93d
quasaric-sun-9051-2346-pgbouncer-c997bbd9d-dgsjr    2/2     Running   0          2d
quasaric-sun-9051-2346-redis-0                      1/1     Running   0          93d
quasaric-sun-9051-2346-scheduler-59f856bd5-d7gl4    1/1     Running   0          3h
quasaric-sun-9051-2346-statsd-5c7d7b6777-x7v4x      1/1     Running   0          93d
quasaric-sun-9051-2346-webserver-56fb447559-gjg8n   1/1     Running   0          3h
quasaric-sun-9051-2346-worker-0                     2/2     Running   0          3h
```

On every Astronomer Deployment, you'll see a Kubernetes Pod for each component - the combination of which depends on the Airflow Executor running in that deployment.

The example above assumes the Celery Executor and so includes an additional component for a Celery Worker, a [Redis](https://redis.io/) queue and [Flower](https://flower.readthedocs.io/en/latest/) dashboard.

**4. Get Secret**

As a next step, you'll have to pull one of multiple Kubernetes Secrets for the Kubernetes Namespace in which your Airflow Deployment lives.

To list those secrets, run:

```
$ kubectl get secret
```

You'll see something like the following:

```
$ kubectl get secret
NAME                                                              TYPE                                  DATA   AGE
default-token-fk86l                                               kubernetes.io/service-account-token   3      93d
geocentric-instrument-2346-airflow-metadata                       Opaque                                1      93d
geocentric-instrument-2346-airflow-result-backend                 Opaque                                1      93d
geocentric-instrument-2346-broker-url                             Opaque                                1      93d
geocentric-instrument-2346-env                                    Opaque                                0      92d
geocentric-instrument-2346-fernet-key                             Opaque                                1      93d
geocentric-instrument-2346-pgbouncer-config                       Opaque                                2      93d
geocentric-instrument-2346-pgbouncer-stats                        Opaque                                1      93d
geocentric-instrument-2346-redis-password                         Opaque                                1      93d
geocentric-instrument-2346-registry                               kubernetes.io/dockerconfigjson        1      93d
geocentric-instrument-2346-scheduler-serviceaccount-token-w29bn   kubernetes.io/service-account-token   3      93d
geocentric-instrument-2346-worker-serviceaccount-token-gqr4w      kubernetes.io/service-account-token   3      93d
```

The secret we're looking for lives in that "airflow-metadata" pod (for Airflow's Metadata database).

Now, run:

```
$ kubectl get secret <airflow metadata pod>
```

Next, run:

```
$ kubectl get secret <airflow metadata pod> -o yaml
```

This will pull some metadata on the secret itself, including an encoded "connection" string.

```
apiVersion: v1
data:
  connection: cG9zdGdyZXNxbDovL2dlb2NlbnRyaWNfaW5zdHJ1bWVudF8yMzQ2X2FpcmZsb3c6VTJvN3F2VnVsWnZ5cXl2V1hXbTBSSGh1UHlqdk1IT3BAZ2VvY2VudHJpYy1pbnN0cnVtZW50LTIzNDYtcGdib3VuY2VyOjY1NDMvZ2VvY2VudHJpYy1pbnN0cnVtZW50LTIzNDYtbWV0YWRhdGE=
kind: Secret
metadata:
  creationTimestamp: "2019-05-02T09:06:11Z"
  labels:
    chart: airflow
    heritage: Tiller
    release: geocentric-instrument-2346
    workspace: 484c967e-4ec1-4b36-8536-1525813028e1
  name: geocentric-instrument-2346-airflow-metadata
  namespace: astronomer-cloud-geocentric-instrument-2346
  resourceVersion: "47818384"
  selfLink: /api/v1/namespaces/astronomer-cloud-geocentric-instrument-2346/secrets/geocentric-instrument-2346-airflow-metadata
  uid: a84029d3-0e6d-12e8-b31a-42010a96009f
type: Opaque
```

**6. Decode the Secret**

Now, let's grab the "connection" string from the top of that output and decode it:

```
$ echo "<connectionstring>" | base64 --decode
```

You'll get something like the following (don't worry, this is a sample deployment):

```
postgresql://quasaric_sun_9051_airflow:U2o7qvVulGvyqyvAXWm0RPhuPvjvlHOp@quasaric-sun-9051-pgbouncer:6543echo /quasaric-sun-9051-metadata
```

**7. Save your Credentials**

Based on the output above, you can find the connection credentials you're looking for in the following format: `login:password@host:port/schema`

In this example, that'd be:

```
- Host: quasaric-sun-9051-pgbouncer
- Schema: quasaric-sun-9051-metadata
- Login: quasaric_sun_9051_airflow
- Password: U2o7qvVulGvyqyvAXWm0RPhuPvjvlHOp
- Port: 6543
```

**8. Update and Confirm your Connection**

To finish creating and confirming your connection, go back to our [Query the Airflow Database](https://astronomer.io/docs/query-airflow-database/) doc.






















