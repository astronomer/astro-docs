---
title: "Enterprise Upgrade Guide"
description: "How to upgrade the Astronomer Enterprise Platform"
date: 2018-08-23T00:00:00.000Z
slug: "ee-upgrade-guide"
---

To upgrade your installation of the Astronomer Enterprise platform, follow the guidelines below.

> Note: This guide is **only** for upgrading from Astronomer v0.9.X to v0.10.X. If you're upgrading from an earlier version, you should bring your deployment to v0.9 first.

## Pre-Requisites

- Access to an Astronomer Enterprise Installation
- Access to the Kubernetes cluster hosting the Astronomer Platform
- Access to DNS (if you are on AWS)
- The Astronomer version you want to upgrade to
    - Platform Changelog [here](https://github.com/astronomer/astronomer/blob/master/CHANGELOG.md)
- All Astronomer images in a registry that can be accessed from your Kubernetes cluster (if your cluster can access the public internet, you don't need to take any action here)

## Ensure your cluster can access the Astronomer images

Astronomer images are publicly hosted on Dockerhub. If you are running your cluster in a setting that cannot access the public internet, you may need to move the Astronomer images into a registry that your Kubernetes cluster can talk to.

A list of all images needed can be found [here](https://github.com/astronomer/astronomer/blob/v0.10.0/Makefile#L11) (`vendor_components` and `platform_components`) and can be accessed from the `astronomerinc` [Dockerhub](https://hub.docker.com/search?q=astronomerinc&type=image).

## Checkout the latest Astronomer Version

Go into your `astronomer` directory or wherever the config for your deployment lives.
Checkout the version of the [Astronomer helm chart](https://github.com/astronomer/astronomer) you'd like to upgrade TO

```
$ git checkout v0.10.0
```

## Find the Platform Release Name

```
$ helm ls
NAME                       	REVISION	UPDATED                 	STATUS  	CHART                            	APP VERSION  	NAMESPACE
excited-armadillo          	1       	Mon Jun 17 18:05:48 2019	DEPLOYED	astronomer-0.9.7                 	0.9.7        	astronomer
```

- Base Platform Release Name: `excited-armadillo`
- Namespace: `astronomer`

Use the same `config.yaml` as before. If you do not have the `config.yaml`, you can regenerate it with `helm get values excited-armadillo >>config.yaml`.
This contains all the overrides and settings needed for your platform (basedomain, SMTP creds, etc.)

## Delete your current Platform Release

```
$ helm delete --purge <PLATFORM-RELEASE>
```

This will delete your current platform release, but leave the secrets and metadata.

## Wait for Pods to Spin Down

Wait until the Pods (FluentD, Grafana, etc.) in your platform namespace spin down. You can track this with:

```
$ watch kubectl get pods -n <NAMESPACE>
```

## Install the New Platform

```
$ helm install -f config.yaml . -n <platform_release> --namespace <namespace>
```
By specifying the old release name, the new platform release will pick up all necessary metadata from the release that was just purged.

You can watch the status of these with.

```
$ watch kubectl get pods --namespace <namespace>
```

If you are Amazon, you may need to update DNS with a new load balancer (the old one was deleted with the previous `helm delete`) to point to your domain.

You can find the load balancer name with:

```
[ec2-user@ip-10-0-0-240 ~]$ kubectl get svc -n <namespace>
NAME                                      TYPE           CLUSTER-IP       EXTERNAL-IP                                                               PORT(S)                                      AGE
excited-armadillo-alertmanager              ClusterIP      172.20.36.181    <none>                                                                    9093/TCP                                     30h
excited-armadillo-cli-install               ClusterIP      172.20.172.155   <none>                                                                    80/TCP                                       30h
excited-armadillo-commander                 ClusterIP      172.20.68.183    <none>                                                                    8880/TCP,50051/TCP                           30h
excited-armadillo-elasticsearch             ClusterIP      172.20.189.196   <none>                                                                    9200/TCP,9300/TCP                            30h
excited-armadillo-elasticsearch-discovery   ClusterIP      172.20.15.116    <none>                                                                    9300/TCP                                     30h
excited-armadillo-elasticsearch-exporter    ClusterIP      172.20.230.62    <none>                                                                    9108/TCP                                     30h
excited-armadillo-elasticsearch-nginx       ClusterIP      172.20.109.192   <none>                                                                    9200/TCP                                     30h
excited-armadillo-grafana                   ClusterIP      172.20.0.112     <none>                                                                    3000/TCP                                     30h
excited-armadillo-houston                   ClusterIP      172.20.74.180    <none>                                                                    8871/TCP                                     30h
excited-armadillo-kibana                    ClusterIP      172.20.76.73     <none>                                                                    5601/TCP                                     30h
excited-armadillo-kube-state                ClusterIP      172.20.32.101    <none>                                                                    8080/TCP,8081/TCP                            30h
excited-armadillo-nginx                     LoadBalancer   172.20.119.182   LOAD_BALANCER_NAME_HERE-1639464812.us-west-2.elb.amazonaws.com            80:32503/TCP,443:31187/TCP,10254:30151/TCP   30h
excited-armadillo-nginx-default-backend     ClusterIP      172.20.77.34     <none>                                                                    8080/TCP                                     30h
excited-armadillo-orbit                     ClusterIP      172.20.183.47    <none>                                                                    8080/TCP                                     30h
excited-armadillo-prisma                    ClusterIP      172.20.209.202   <none>                                                                    4466/TCP                                     30h
excited-armadillo-prometheus                ClusterIP      172.20.219.16    <none>                                                                    9090/TCP                                     30h
excited-armadillo-registry                  ClusterIP      172.20.190.58    <none>                                                                    5000/TCP                                     30h
```

## Log into the Astronomer UI

Now that the platform has been upgraded, go to `app.BASEDOMAIN` in your browser and log into Astronomer. You may need to hard refresh the page (Cntrl+Refresh Button, clear cache, or open in incognito mode) for it to load.

## Upgrade Each Airflow Deployment

From here, we'll need to upgrade each of your Airflow Deployments in your Workspace(s). When you enter your Worksapce, you should see the list of deployments that are available for an Upgrade (they should all be, initially).

![Deployment List](https://assets2.astronomer.io/main/docs/upgrade-guide/upgrade-guide-deployment-list.png)

For each Deployment, navigate to the `Configure` page, and hit `Upgrade`.

## Update your Dockerfile

Change the `FROM` line in your `Dockerfile` to

```
FROM astronomerinc/ap-airflow:0.10.0-1.10.4-onbuild
```

Run `astro dev start` with the new image to verify the new image builds. For a list of changes, see the [CHANGELOG](https://github.com/apache/airflow/blob/master/CHANGELOG.txt) on the Airflow Github. If you are seeing errors in previously working plugins, be sure to check if their import path changed with the new Airflow version.

## Upgrade your CLI

```
$ curl -sL https://install.astronomer.io | sudo bash -s -- v0.10.0

```