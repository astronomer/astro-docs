---
title: "Platform Configuration Reference Guide"
navTitle: "Platform Configurations"
description: "A list of they key platform settings you can configure on Astronomer Enterprise."
---

## Astronomer Global Configuration

#### .Values.global.airflowChartVersion

The default Airflow chart version that will be installed when creating a new deployment in the system. This is also used to ensure all child airflow deployments are kept up to date and on the latest version.

| Value Type | Default Value | Valid Values                                                                  | Importance |
| ---------- | ------------- | ----------------------------------------------------------------------------- | ---------- |
| Integer    | 0.19.0        | Any [released version](https://github.com/astronomer/airflow-chart/releases/) | High       |

#### .Values.global.nodeSelector

Specifies the Kubernetes clusters on which you run the Astronomer platform.

| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| Key-value pairs     |  { }            | [Node values](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/)            | Low          |


#### .Values.global.affinity

Further specifies constraints for Kubernetes pods running the Astronomer platform.

| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| Key-value pairs          | { }             | [Affinity values](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity)            | Low          |


#### .Values.global.tolerations

Specifies whether Kubernetes pods can schedule onto nodes with certain qualities.

| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| Key-value pairs          | [ ]             | [Taint values](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/)             | Low          |


#### .Values.global.images.commander

Specifies image settings for Astronomer's Commander service. Each of the following subvalues must be configured:

- `.Values.global.images.commander.repository`: The repository from which you pull the image.
- `.Values.global.images.commander.tag`: The tag for the image you want to use.
- `.Values.global.images.commander.pullPolicy`: The [pull policy](https://kubernetes.io/docs/concepts/containers/images/#updating-images) for updating images.


#### .Values.global.images.registry

Specifies image settings for Astronomer's Registry service. Each of the following subvalues must be configured:

- `.Values.global.images.registry.repository`: The repository from which you pull the image.
- `.Values.global.images.registry.tag`: The tag for the image you want to use.
- `.Values.global.images.registry.pullPolicy`: The [pull policy](https://kubernetes.io/docs/concepts/containers/images/#updating-images) for updating images.

#### .Values.global.images.houston

Specifies image settings for Astronomer's Houston API service. Each of the following subvalues must be configured:

- `.Values.global.images.houston.repository`: The repository from which you pull the image.
- `.Values.global.images.houston.tag`: The tag for the image you want to use.
- `.Values.global.images.houston.pullPolicy`: The [pull policy](https://kubernetes.io/docs/concepts/containers/images/#updating-images) for updating images.

#### .Values.global.images.astroUI

Specifies image settings for the Astronomer UI service. Each of the following subvalues must be configured:

- `.Values.global.images.AstroUI.repository`: The repository from which you pull the image.
- `.Values.global.images.AstroUI.tag`: The tag for the image you want to use.
- `.Values.global.images.AstroUI.pullPolicy`: The [pull policy](https://kubernetes.io/docs/concepts/containers/images/#updating-images) for updating images.

#### .Values.global.images.dbBootstrapper

Specifies image settings for Astronomer's dbBootstrapper service. Each of the following subvalues must be configured:

- `.Values.global.images.dbBootstrapper.repository`: The repository from which you pull the image.
- `.Values.global.images.dbBootstrapper.tag`: The tag for the image you want to use.
- `.Values.global.images.dbBootstrapper.pullPolicy`: The [pull policy](https://kubernetes.io/docs/concepts/containers/images/#updating-images) for updating images.

#### .Values.global.images.cliInstall

Specifies image settings for the Astronomer CLI service. Each of the following subvalues must be configured:

- `.Values.global.images.cliInstall.repository`: The repository from which you pull the image.
- `.Values.global.images.cliInstall.tag`: The tag for the image you want to use.
- `.Values.global.images.cliInstall.pullPolicy`: The [pull policy](https://kubernetes.io/docs/concepts/containers/images/#updating-images) for updating images.


#### .Values.global.astroUI.replicas

The number of replica pods running for the Astronomer UI.


| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| Integer       | 2             | Any integer         | Low          |

#### .Values.global.astroUI.env

Environment variables for running the Astronomer UI. Do not configure this setting without guidance from Astronomer support.

| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| Key-value pairs       | [ ]             | N/A        | Low          |


#### .Values.global.astroUI.resources

Specifies CPU and memory usage limits and requests for the Astronomer UI. CPU usage is specified in megabytes, while memory usage is specified in mebibytes. For example:

```yaml
resources: {
    limits:
     cpu: 100m
     memory: 128Mi
    requests:
     cpu: 100m
     memory: 128Mi
}
```

| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| Key-value pairs       | { }             | See above for valid examples   | Medium          |

#### .Values.global.houston.prismaConnectionLimit

The maximum number of connections allowed for Prisma.

| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| Integer       | 5            | Any        | Low          |
