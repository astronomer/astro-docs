---
title: "Platform Configuration Reference Guide"
navTitle: "Platform Configurations"
description: "A list of they key platform settings you can configure on Astronomer Enterprise."
---

## Astronomer Global Configuration

#### astronomer.airflowChartVersion

The default Airflow chart version that will be installed when creating a new deployment in the system. This is also used to ensure all child airflow deployments are kept up to date and on the latest version.

| Value Type | Default Value | Valid Values                                                                  | Importance |
| ---------- | ------------- | ----------------------------------------------------------------------------- | ---------- |
| Integer    | 0.19.0        | Any [released version](https://github.com/astronomer/airflow-chart/releases/) | High       |

#### astronomer.nodeSelector

Specifies the Kubernetes clusters on which you run the Astronomer platform.

| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| Key-value pairs     |  { }            | [Node values](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/)            | Low          |


#### astronomer.affinity

Further specifies constraints for Kubernetes pods running the Astronomer platform.

| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| Key-value pairs          | { }             | [Affinity values](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity)            | Low          |


#### astronomer.tolerations

Specifies whether Kubernetes pods can schedule onto nodes with certain qualities.

| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| Key-value pairs          | [ ]             | [Taint values](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/)             | Low          |


#### astronomer.images.commander

Specifies image settings for Astronomer's Commander service. Each of the following subvalues must be configured:

- `astronomer.images.commander.repository`: The repository from which you pull the image.
- `astronomer.images.commander.tag`: The tag for the image you want to use.
- `astronomer.images.commander.pullPolicy`: The [pull policy](https://kubernetes.io/docs/concepts/containers/images/#updating-images) for updating images.


#### astronomer.images.registry

Specifies image settings for Astronomer's Registry service. Each of the following subvalues must be configured:

- `astronomer.images.registry.repository`: The repository from which you pull the image.
- `astronomer.images.registry.tag`: The tag for the image you want to use.
- `astronomer.images.registry.pullPolicy`: The [pull policy](https://kubernetes.io/docs/concepts/containers/images/#updating-images) for updating images.

#### astronomer.images.houston

Specifies image settings for Astronomer's Houston API service. Each of the following subvalues must be configured:

- `astronomer.images.houston.repository`: The repository from which you pull the image.
- `astronomer.images.houston.tag`: The tag for the image you want to use.
- `astronomer.images.houston.pullPolicy`: The [pull policy](https://kubernetes.io/docs/concepts/containers/images/#updating-images) for updating images.

#### astronomer.images.astroUI

Specifies image settings for the Astronomer UI service. Each of the following subvalues must be configured:

- `astronomer.images.AstroUI.repository`: The repository from which you pull the image.
- `astronomer.images.AstroUI.tag`: The tag for the image you want to use.
- `astronomer.images.AstroUI.pullPolicy`: The [pull policy](https://kubernetes.io/docs/concepts/containers/images/#updating-images) for updating images.

#### astronomer.images.dbBootstrapper

Specifies image settings for Astronomer's dbBootstrapper service. Each of the following subvalues must be configured:

- `astronomer.images.dbBootstrapper.repository`: The repository from which you pull the image.
- `astronomer.images.dbBootstrapper.tag`: The tag for the image you want to use.
- `astronomer.images.dbBootstrapper.pullPolicy`: The [pull policy](https://kubernetes.io/docs/concepts/containers/images/#updating-images) for updating images.

#### astronomer.images.cliInstall

Specifies image settings for the Astronomer CLI service. Each of the following subvalues must be configured:

- `astronomer.images.cliInstall.repository`: The repository from which you pull the image.
- `astronomer.images.cliInstall.tag`: The tag for the image you want to use.
- `astronomer.images.cliInstall.pullPolicy`: The [pull policy](https://kubernetes.io/docs/concepts/containers/images/#updating-images) for updating images.


#### astronomer.astroUI.replicas

The number of replica pods running for the Astronomer UI.


| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| Integer       | 2             | Any integer         | Low          |

#### astronomer.astroUI.env

Environment variables for running the Astronomer UI. Do not configure this setting without guidance from Astronomer support.

| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| Key-value pairs       | []             | N/A        | Low          |


#### astronomer.astroUI.maxUnavailable

Specifies what percentage of pods are allowed to be unavailable during a rolling update of the service.

| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| Percentage (integer + `%`)     | 25%             | [0%, 1%, ... 100%]       | Low          |

#### astronomer.astroUI.resources

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

#### astronomer.houston.prismaConnectionLimit

The maximum number of connections allowed for Prisma.

| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| Integer       | 5            | Any        | Low        |

#### astronomer.houston.maxUnavailable

Specifies what percentage of pods are allowed to be unavailable during a rolling update of the service.

| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| Percentage (integer + `%`)     | 25%             | [0%, 1%, ... 100%]       | Low          |

#### astronomer.houston.livenessProbe

Specifies various details about [liveness probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/), which are used to determine when to restart a failing container. Use the following subvalues to configure liveness probes:

- initialDelaySeconds: The number of seconds to wait before starting liveness probes on a new container. Default value is `30`.
- periodSeconds: How often to perform the liveness probe, in seconds. Default value is `10`.
- failureThreshold: The number of times to retry a failing liveness probe before giving up and restarting the container. Default value is `10`.

#### astronomer.houston.livenessProbe

Specifies various details about [readiness probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes), which are used to determine when a container is ready to start accepting traffic. Use the following subvalues to configure liveness probes:

- initialDelaySeconds: The number of seconds to wait before starting readiness probes on a new container. Default value is `30`.
- periodSeconds: How often to perform the readiness probe, in seconds. Default value is `10`.
- failureThreshold: The number of times to retry a failing readiness probe before giving up and marking a pod as Unready. Default value is `10`.

#### astronomer.houston.regenerateCaEachUpgrade

Specifies whether Houston regenerates its certificate authority every time you run `helm upgrade`. If this is set to `true`, then all users are logged out upon each use of `helm upgrade`. For Enterprise organizations, we recommend setting this to `true`.

| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| Boolean    | false           | [true, false]       | Low          |

#### astronomer.houston.backendSecretName

The name of the secret for the backend Houston datastore.

| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| String    | ~           | Any     | High          |

#### astronomer.houston.backendSecretName

The details of the connection to your backend Houston datastore, defined in key-value pairs. Possible keys are `user`, `pass`, `host`, `port`, and `db`.

| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| Key-value pairs    | {}           | N/A     | High          |

#### astronomer.houston.backendConnection

The details of the connection to your backend Houston datastore, defined in key-value pairs. Possible keys are `user`, `pass`, `host`, `port`, and `db`.

| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| Key-value pairs    | {}           | N/A     | High     |

#### astronomer.houston.airflowBackendSecretName

The details of the connection to your Airflow backend, defined in key-value pairs. Possible keys are `user`, `pass`,`host`, `port`, and `db`.

| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| Key-value pairs    | ~           | N/A     | High          |

#### astronomer.houston.airflowBackendConnection

The details of the connection to your Airflow backend, defined in key-value pairs. Possible keys are `user`, `pass`,`host`, `port`, and `db`.

| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| Key-value pairs    | {}           | N/A     | High          |

#### astronomer.houston.jwtSigningKeySecretName

The key for an optional secret name for signing JSON web tokens (JWTs). By default, Astronomer uses auto-generated, self-signed certificates.

| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| String    | ~           | N/A     | Low          |

#### astronomer.houston.jwtSigningCertificateSecretName

The certificate for an optional secret name for signing JSON web tokens (JWTs). By default, Astronomer uses auto-generated, self-signed certificates.

| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| String    | ~           | N/A     | Low          |

#### astronomer.houston.env

Environment variables for running Houston. Do not configure this setting without guidance from Astronomer support.

| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| Key-value pairs       | []             | N/A        | Low          |

#### astronomer.houston.secret

A collection of generic Kubernetes secrets for Airflow environment variables. To create a generic secret name and key, run:

```sh
kubectl create secret generic <secret-name> --from-literal=connection=smtps://USERNAME:PW@HOST/?pool=true
```

Each secret needs the following configured:

- `envName`: The Airflow environment variable.
- `secretName`: The secret name.
- `secretKey`: The secret key.

Together, the each object in the configuration should look something like this.

```yaml
secret:
- envName: "EMAIL__SMTP_URL"
  secretName: "<secret-name>"
  secretKey: "<connection>"
```

| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| Key-value pairs       | []             | See above for valid examples        | Low          |

#### astronomer.houston.resources

Specifies CPU and memory usage limits and requests for Houston. CPU usage is specified in megabytes, while memory usage is specified in mebibytes. For example:

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

#### astronomer.houston.config

System configuration values for Houston. Do not configure this setting without guidance from Astronomer support.

| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| Key-value pairs       | {}             | N/A  | Low          |

#### astronomer.houston.worker.enabled

Specifies whether worker pods should connect to the NATS server.

| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| Boolean     | true           | true/ false   | Low          |

#### astronomer.houston.worker.replicas

Specifies the number of replica pods for worker pods connecting to the NATS server.

| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| Integer     | 2           |  Any integer   | Low          |


#### astronomer.houston.upgradeDeployments.enabled

Determines whether Deployments on your Astronomer platform are automatically upgraded to use the latest version of Astronomer's [Airflow Helm chart](https://github.com/astronomer/airflow-chart) after running `helm upgrade`. The latest version number for the Airflow Helm chart is pulled from `astronomer.airflowChartVersion`.

If you want to deploy a configuration change that is intended to reconfigure something inside Airflow, then you should set this value to `true`. When set to true `true`, each Airflow Deployment will restart and upgrade to use the latest version of the Airflow chart.

If this value is set to `false`, your Deployments' Airflow charts are not upgraded when you run `helm upgrade`.

| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| Boolean     | true           |  [true, false]   | High          |


#### astronomer.houston.upgradeDeployments.canary

Determines whether non-canary Deployments are excluded from upgrading to the latest version of Astronomer's [Airflow Helm chart](https://github.com/astronomer/airflow-chart) after running `helm upgrade`. This value is only functional when `astronomer.houston.upgradeDeployments.enabled=true`.

If `astronomer.houston.upgradeDeployments.canary` is set to `false`, all Deployments are upgraded to use the latest version of Astronomer's [Airflow Helm chart](https://github.com/astronomer/airflow-chart) after running `helm upgrade`. If it's set to `true`, only Deployments marked as `canary` are upgraded.

| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| Boolean     | false           |  [true, false]   | Low          |


#### astronomer.houston.expireDeployments

Determines whether non-canary Deployments are excluded from upgrading to the latest version of Astronomer's [Airflow Helm chart](https://github.com/astronomer/airflow-chart) after running `helm upgrade`. This value is only functional when `astronomer.houston.upgradeDeployments.enabled=true`.

If `astronomer.houston.upgradeDeployments.canary` is set to `false`, all Deployments are upgraded to use the latest version of Astronomer's [Airflow Helm chart](https://github.com/astronomer/airflow-chart) after running `helm upgrade`. If it's set to `true`, only Deployments marked as `canary` are upgraded.

| Value Type | Default Value | Valid Values | Importance |
| ---------- | ------------- | ------------ | ---------- |
| Boolean     | false           |  [true, false]   | Low          |
