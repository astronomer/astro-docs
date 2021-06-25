---
title: "Platform Configuration Reference Guide"
navTitle: "Platform Configurations"
description: "A list of they key platform settings you can configure on Astronomer Enterprise."
---

## Astronomer Global Configuration

The settings for Astronomer's global Kubernetes resource configuration are located under the `astronomer` key:

```yaml
# This version number controls the default Airflow chart version that will be installed
# when creating a new deployment in the system. This is also used to ensure all
# child airflow deployments are kept up to date and on the latest version.
airflowChartVersion: 0.19.0

nodeSelector: {}
affinity: {}
tolerations: []
```

### Parameters

| Parameter Name | Description | Valid Values | Default Value |
|----------------|-------------|-------|----------------------|
|`astronomer.airflowChartVersion`| The default Airflow chart version that will be installed when creating a new deployment in the system. This is also used to ensure all child Airflow Deployments are kept up to date and on the latest version. | Any released chart version | [Latest release version number](https://github.com/astronomer/airflow-chart) |
|`astronomer.nodeSelector`| The Kubernetes clusters on which you run the Astronomer platform. |  [Node values](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/)    | `{ }` |
|`astronomer.affinity`| Further specifies constraints for Kubernetes pods running the Astronomer platform. | [Affinity values](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity)    | `{ }` |
|`astronomer.tolerations`| Specifies whether Kubernetes pods can schedule onto nodes with certain qualities. |  [Taint values](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/)   | `[ ]` |


## Astronomer Images Configurations

The settings Astronomer images to use on your platform are located under the `astronomer.images` key.

```yaml
# Images for Astronomer
images:
  commander:
    repository: quay.io/astronomer/ap-commander
    tag: 0.25.0
    pullPolicy: IfNotPresent
  registry:
    repository: quay.io/astronomer/ap-registry
    tag: 3.13.7
    pullPolicy: IfNotPresent
  houston:
    repository: quay.io/astronomer/ap-houston-api
    tag: 0.25.5
    pullPolicy: IfNotPresent
  astroUI:
    repository: quay.io/astronomer/ap-astro-ui
    tag: 0.25.0
    pullPolicy: IfNotPresent
  dbBootstrapper:
    repository: quay.io/astronomer/ap-db-bootstrapper
    tag: 0.25.0
    pullPolicy: IfNotPresent
  cliInstall:
    repository: quay.io/astronomer/ap-cli-install
    tag: 0.13.1
    pullPolicy: IfNotPresent
```

### Parameters

| Parameter Name | Description | Valid Values | Default Value |
|----------------|-------------|-------|----------------------|
|`astronomer.images.commander.repository`| The repository for Astronomer's Commander service. | Any Docker repository | `quay.io/astronomer/ap-commander` |
|`astronomer.images.commander.tag`| The image tag for Astronomer's Commander service. |  Any available image tag    | `0.25.0`|
|`astronomer.images.commander.pullpolicy`| The [pull policy](https://kubernetes.io/docs/concepts/containers/images/#updating-images) for updating images. | A valid [pull policy](https://kubernetes.io/docs/concepts/containers/images/#updating-images).  | `IfNotPresent` |
|`astronomer.images.registry.repository`| The repository for Astronomer's Registry service. | Any Docker repository | `quay.io/astronomer/ap-registry` |
|`astronomer.images.registry.tag`| The image tag for Astronomer's Registry service. |  Any available image tag    | `3.13.7`|
|`astronomer.images.registry.pullpolicy`| The [pull policy](https://kubernetes.io/docs/concepts/containers/images/#updating-images) for updating images. | A valid [pull policy](https://kubernetes.io/docs/concepts/containers/images/#updating-images).  | `IfNotPresent` |
|`astronomer.images.houston.repository`| The repository for Astronomer's Houston service. | Any Docker repository | `quay.io/astronomer/ap-houston-api` |
|`astronomer.images.houston.tag`| The image tag for Astronomer's Houston service. |  Any available image tag    | `0.25.5`|
|`astronomer.images.houston.pullpolicy`| The [pull policy](https://kubernetes.io/docs/concepts/containers/images/#updating-images) for updating images. | A valid [pull policy](https://kubernetes.io/docs/concepts/containers/images/#updating-images).  | `IfNotPresent` |
|`astronomer.images.astroUI.repository`| The repository for Astronomer's UI. | Any Docker repository | `quay.io/astronomer/ap-astro-ui` |
|`astronomer.images.astroUI.tag`| The image tag for Astronomer's UI. |  Any available image tag    | `0.25.0`|
|`astronomer.images.astroUI.pullpolicy`| The [pull policy](https://kubernetes.io/docs/concepts/containers/images/#updating-images) for updating images. | A valid [pull policy](https://kubernetes.io/docs/concepts/containers/images/#updating-images).  | `IfNotPresent` |
|`astronomer.images.dbBootstrapper.repository`| The repository for Astronomer's dbBoostrapper service. | Any Docker repository | `quay.io/astronomer/ap-db-bootstrapper` |
|`astronomer.images.dbBootstrapper.tag`| The image tag for Astronomer's dbBoostrapper service. |  Any available image tag    | `0.25.0`|
|`astronomer.images.dbBootstrapper.pullpolicy`| The [pull policy](https://kubernetes.io/docs/concepts/containers/images/#updating-images) for updating images. | A valid [pull policy](https://kubernetes.io/docs/concepts/containers/images/#updating-images).  | `IfNotPresent` |
|`astronomer.images.cliInstall.repository`| The repository for Astronomer's CLI service. | Any Docker repository | `quay.io/astronomer/ap-cli-install` |
|`astronomer.images.cliInstall.tag`| The image tag for Astronomer's CLI service. |  Any available image tag    | `0.13.1`|
|`astronomer.images.cliInstall.pullpolicy`| The [pull policy](https://kubernetes.io/docs/concepts/containers/images/#updating-images) for updating images. | A valid [pull policy](https://kubernetes.io/docs/concepts/containers/images/#updating-images).  | `IfNotPresent` |


## Astronomer UI Configuration

The configuration settings for the Astronomer UI are located in the `astronomer.astroUI` key.

```yaml
astroUI:
  replicas: 2
  env: []
  # This only applies when replicas > 3
  maxUnavailable: 25%
  resources: {}
  #  limits:
  #   cpu: 100m
  #   memory: 128Mi
  #  requests:
  #   cpu: 100m
  #   memory: 128Mi
```

### Parameters

| Parameter Name | Description | Valid Values | Default Value |
|----------------|-------------|-------|----------------------|
|`astronomer.astroUI.replicas`| The number of replica pods running for the Astronomer UI.
 | Any integer > 0 | `2` |
|`astronomer.astroUI.env`| Environment variables for running the Astronomer UI. **Do not configure this setting without guidance from Astronomer support.**
 | N/A    | `[ ]`|
|`astronomer.astroUI.maxUnavailable`| The percentage of pods that are allowed to be unavailable during a rolling update of the service.
| Whole Percentages  | `25` |
|`astronomer.astroUI.resources`| Specifies CPU and memory usage limits and requests for the Astronomer UI. | CPU usage is specified in megabytes, while memory usage is specified in mebibytes. | `{ }`] |

## Houston Configuration

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| houston.airflowBackendConnection | object | `{}` |  |
| houston.airflowBackendSecretName | string | `nil` |  |
| houston.airflowReleasesConfig | string | `nil` |  |
| houston.backendConnection | object | `{}` |  |
| houston.backendSecretName | string | `nil` |  |
| houston.cleanupDeployments.canary | bool | `false` |  |
| houston.cleanupDeployments.dryRun | bool | `false` |  |
| houston.cleanupDeployments.enabled | bool | `true` |  |
| houston.cleanupDeployments.olderThan | int | `14` |  |
| houston.cleanupDeployments.schedule | string | `"0 0 * * *"` |  |
| houston.config | object | `{}` |  |
| houston.env | list | `[]` |  |
| houston.expireDeployments.canary | bool | `false` |  |
| houston.expireDeployments.dryRun | bool | `false` |  |
| houston.expireDeployments.enabled | bool | `false` |  |
| houston.expireDeployments.schedule | string | `"0 0 * * *"` |  |
| houston.jwtSigningCertificateSecretName | string | `nil` |  |
| houston.jwtSigningKeySecretName | string | `nil` |  |
| houston.livenessProbe.failureThreshold | int | `10` |  |
| houston.livenessProbe.initialDelaySeconds | int | `30` |  |
| houston.livenessProbe.periodSeconds | int | `10` |  |
| houston.maxUnavailable | string | `"25%"` |  |
| houston.prismaConnectionLimit | int | `5` |  |
| houston.readinessProbe.failureThreshold | int | `10` |  |
| houston.readinessProbe.initialDelaySeconds | int | `30` |  |
| houston.readinessProbe.periodSeconds | int | `10` |  |
| houston.regenerateCaEachUpgrade | bool | `false` |  |
| houston.replicas | int | `2` |  |
| houston.resources | object | `{}` |  |
| houston.secret | list | `[]` |  |
| houston.updateAirflowCheck.enabled | bool | `true` |  |
| houston.updateAirflowCheck.schedule | string | `"0 0 * * *"` |  |
| houston.updateAirflowCheck.url | string | `"https://updates.astronomer.io/astronomer-certified"` |  |
| houston.updateCheck.enabled | bool | `true` |  |
| houston.updateCheck.schedule | string | `"0 0 * * *"` |  |
| houston.updateCheck.url | string | `"https://updates.astronomer.io/astronomer-platform"` |  |
| houston.upgradeDeployments.canary | bool | `false` |  |
| houston.upgradeDeployments.enabled | bool | `true` |  |
| houston.worker.enabled | bool | `true` |  |
| houston.worker.replicas | int | `2` |  |

## Images

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| images.astroUI.pullPolicy | string | `"IfNotPresent"` |  |
| images.astroUI.repository | string | `"quay.io/astronomer/ap-astro-ui"` |  |
| images.astroUI.tag | string | `"0.25.2"` |  |
| images.cliInstall.pullPolicy | string | `"IfNotPresent"` |  |
| images.cliInstall.repository | string | `"quay.io/astronomer/ap-cli-install"` |  |
| images.cliInstall.tag | string | `"0.13.1"` |  |
| images.commander.pullPolicy | string | `"IfNotPresent"` |  |
| images.commander.repository | string | `"quay.io/astronomer/ap-commander"` |  |
| images.commander.tag | string | `"0.25.0"` |  |
| images.dbBootstrapper.pullPolicy | string | `"IfNotPresent"` |  |
| images.dbBootstrapper.repository | string | `"quay.io/astronomer/ap-db-bootstrapper"` |  |
| images.dbBootstrapper.tag | string | `"0.25.0"` |  |
| images.houston.pullPolicy | string | `"IfNotPresent"` |  |
| images.houston.repository | string | `"quay.io/astronomer/ap-houston-api"` |  |
| images.houston.tag | string | `"0.25.6"` |  |
| images.registry.pullPolicy | string | `"IfNotPresent"` |  |
| images.registry.repository | string | `"quay.io/astronomer/ap-registry"` |  |
| images.registry.tag | string | `"3.13.7"` |  |

## Install

| install.cliVersion | string | `"0.20.0"` |  |
| install.resources | object | `{}` |  |
| nodeSelector | object | `{}` |  |

## Ports

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| ports.astroUIHTTP | int | `8080` |  |
| ports.commanderGRPC | int | `50051` |  |
| ports.commanderHTTP | int | `8880` |  |
| ports.houstonHTTP | int | `8871` |  |
| ports.installHTTP | int | `80` |  |
| ports.prismaHTTP | int | `4466` |  |
| ports.registryHTTP | int | `5000` |  |
| ports.registryScrape | int | `5001` |  |

## Prisma

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| prisma.env | list | `[]` |  |
| prisma.podLabels | object | `{}` |  |
| prisma.resources | object | `{}` |  |

## Registry

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| registry.auth.connection | string | `nil` |  |
| registry.auth.issuer | string | `"houston"` |  |
| registry.auth.secretName | string | `nil` |  |
| registry.auth.service | string | `"docker-registry"` |  |
| registry.azure.accountkey | string | `nil` |  |
| registry.azure.accountname | string | `nil` |  |
| registry.azure.container | string | `nil` |  |
| registry.azure.enabled | bool | `false` |  |
| registry.azure.realm | string | `nil` |  |
| registry.gcs.bucket | string | `nil` |  |
| registry.gcs.chunksize | string | `"5242880"` |  |
| registry.gcs.enabled | bool | `false` |  |
| registry.gcs.keyfile | string | `"/var/gcs-keyfile/astronomer-gcs-keyfile"` |  |
| registry.gcs.rootdirectory | string | `"/"` |  |
| registry.gcs.useKeyfile | bool | `true` |  |
| registry.persistence.enabled | bool | `true` |  |
| registry.persistence.size | string | `"100Gi"` |  |
| registry.persistence.storageClassName | string | `nil` |  |
| registry.podLabels | object | `{}` |  |
| registry.replicas | int | `1` |  |
| registry.resources | object | `{}` |  |
| registry.s3.accesskey | string | `nil` |  |
| registry.s3.bucket | string | `nil` |  |
| registry.s3.enabled | bool | `false` |  |
| registry.s3.encrypt | bool | `false` |  |
| registry.s3.keyid | string | `nil` |  |
| registry.s3.region | string | `nil` |  |
| registry.s3.rootdirectory | string | `nil` |  |
| registry.s3.secretkey | string | `nil` |  |
| tolerations | list | `[]` |  |
