---
title: "The Airflow CLI with Astronomer Enterprise"
description: "Leverage commands native to the Airflow CLI."
date: 2018-10-09T12:00:00.000Z
slug: "ee-administration-airflow-cli"
---

Although Airflow's UI coupled with Astronomer's UI supports most actions you would need to take when setting up your environment and building DAGs, there are cases when you want to use commands native to the Airflow CLI.

Follow the guidelines below to run commands like `clear`, `backfill`, etc.

## Configuring kubectl

Before interacting directly with the pods that are created with each Airflow deployment, it is necessary to first configure the Kubernetes command line `kubectl`.

Instructions on how to install `kubectl` can be found [here](https://kubernetes.io/docs/tasks/tools/install-kubectl/). Connecting to your Kubernetes cluster will be different depending on where it is installed.

- [Configuring GKE (Google) Access for kubectl](https://cloud.google.com/kubernetes-engine/docs/how-to/cluster-access-for-kubectl)
- [Configuring EKS (Amazon) Access for kubectl](https://docs.aws.amazon.com/eks/latest/userguide/configure-kubectl.html)
- [Configuring AKS (Microsoft) Access for kubectl](https://docs.microsoft.com/en-us/azure/aks/tutorial-kubernetes-deploy-cluster#connect-to-cluster-using-kubectl)

## Set up kubectx

We recommend using [kubectx](https://github.com/ahmetb/kubectx) as an add on to `kubectl`. This will allow you to easily switch beween Kubernetes Clusters + contexts.

> Note: The rest of this doc will assume use of `kubectx`

### Switch to the Correct Context

Once connected to your cluster, you will need to set the appropriate context.

1. Check Available Contexts

```
$ kubectx
```

2. Pick your Astronomer Cluster

```
$ kubectx gke_astronomer-demo_us-west2-a_astronomer-demo-ltgzkozwnr
```

The output should look like:

```
Switched to context "gke_astronomer-demo_us-west2-a_astronomer-demo-ltgzkozwnr"
```

### Switch to the Correct Namespace

After setting the context, you will want to switch into the appropriate namespace.

1. Run `kubens` to see all available namespaces on your Astronomer Cluster

```
$ kubens
```

Output:

```
astronomer-demo-true-transit-3925
astronomer-demo-meteoric-meteorite-9699
```

2. Switch to desired Namespace

```
$ kubens astronomer-demo-meteoric-meteorite-9699
```

You'll see:

```
Context "gke_astronomer-demo_us-west2-a_astronomer-demo-ltgzkozwnr" modified.
Active namespace is "astronomer-demo-meteoric-meteorite-9699".
```

### Retrieve Pod Names

Once in the desired Kubernetes Namespace, you can list the pod names.

In order to leverage the Airflow CLI, you'll need to work with a pod that has Airflow installed on it. This means the Scheduler, Webserver, and Celery Workers if applicable.

To list all available pods in your existing cluster, run:

```
$ kubectl get pods
```

You should see:

```
NAME                                                 READY     STATUS    RESTARTS   AGE
meteoric-meteorite-9699-flower-67b5c956bb-d2k27      1/1       Running   0          7m
meteoric-meteorite-9699-pgbouncer-874d47799-2j74x    2/2       Running   0          7m
meteoric-meteorite-9699-redis-0                      1/1       Running   0          7m
meteoric-meteorite-9699-scheduler-7f5ccc7fdb-pfdq5   1/1       Running   0          7m
meteoric-meteorite-9699-statsd-69548ddcbc-n8cgv      1/1       Running   0          7m
meteoric-meteorite-9699-webserver-684b7b56d4-zr7ff   1/1       Running   0          7m
meteoric-meteorite-9699-worker-0                     2/2       Running   0          7m
```

## Examples

Once you have retrieved a pod name (remember, it needs to be one that has airflow installed!) you can `exec` into it and then execute the relevant Airflow commands as below.

The command will always include the following:

```
kubectl exec -it <Container Name> ...
```

### Adding Connections

```
kubectl exec -it meteoric-meteorite-9699-scheduler-7f5ccc7fdb-pfdq5 -- airflow connections --add --conn_id a_new_connection  --conn_type ' ' --conn_login etl --conn_password my_password
	Successfully added `conn_id`=a_new_connection :  ://etl:my_password@:
```

### Adding Variables

```
kubectl exec -it meteoric-meteorite-9699-scheduler-7f5ccc7fdb-pfdq5 -- airflow variables --set my_key my_value
```
