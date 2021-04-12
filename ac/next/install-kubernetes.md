---
title: "Install Apache Airflow on Kubernetes"
navTitle: "Install on a Virtual Machine"
description: "Install Apache Airflow on one or more virtual machines with the Astronomer Core Python wheel."
---

This chart will bootstrap an [Airflow](https://github.com/astronomer/ap-airflow) deployment on a [Kubernetes](http://kubernetes.io) cluster using the [Helm](https://helm.sh) package manager.

## Prerequisites

To complete this setup, you need:

- Docker
- An accessible Docker registry
- Kubernetes 1.12+
- Helm 3
- PV provisioner support in your underlying infrastructure

## Step 1: Create a Project Folder

In an empty directory, run the following command to initialize some of the key files you'll need to run Astronomer Core:

```sh
touch packages.txt requirements.txt Dockerfile dags
```

Kubernetes containerizes these files whenever your image is built:

- `packages.txt` stores Python-level dependencies.
- `requirements.txt` stores OS-level dependencies.
- `Dockerfile` pulls an Astronomer Core image from Astronomer's Docker registry. It can also include runtime commands and logic. In Airflow Deployments on Kubernetes, this file is used to create a custom Docker image that can be referenced from your Helm configuration.
- `dags` stores your Airflow DAGs.

## Step 2: Install the Helm Chart

You have a few options when installing the Helm chart itself:

- To install this Helm chart remotely, run:

    ```bash
    kubectl create namespace airflow
    helm repo add astronomer https://helm.astronomer.io
    helm install airflow --namespace airflow astronomer/airflow
    ```

- To install this Helm chart repository from source, run:

    ```bash
    kubectl create namespace airflow
    helm install --namespace airflow .
    ```

- To install this Helm chart with [KEDA](https://keda.sh/), run:

    ```bash
    $ helm repo add kedacore https://kedacore.github.io/charts
    $ helm repo add astronomer https://helm.astronomer.io

    $ helm repo update

    $ kubectl create namespace keda

    $ helm install keda \
        --namespace keda kedacore/keda \
        --version "v1.5.0"

    $ kubectl create namespace airflow

    $ helm install airflow \
        --set executor=CeleryExecutor \
        --set workers.keda.enabled=true \
        --set workers.persistence.enabled=false \
        --namespace airflow \
        astronomer/airflow
   ```

The first two commands deploy Airflow on your Kubernetes cluster in the default configuration, while the third deploys Airflow with some configurations which are required for running KEDA. See the [Parameters](#parameters) section of this guide for additional parameters that can be configured during this installation.

## Step 3: Import the Default Configuration File

In your project directory, run:

```
curl -LfO https://raw.githubusercontent.com/astronomer/airflow-chart/master/values.yaml
```

This command imports a `values.yaml` file which you can use to update your Airflow configuration. The workflow for changing your Airflow configuration is as follows:

1. Update values in your local `values.yaml` file.
2. Push those local changes to Airflow using the following command:

    ```
    helm upgrade airflow -n airflow -f values.yaml astronomer/airflow       
    ```

    Alternatively, you can update individual values within the CLI:

    ```
    helm install --name my-release \
      --set executor=CeleryExecutor \
      --set enablePodLaunching=false .
    ```

    We recommend this method only for testing or non-production environments. When deploying configurations to a production environment, maintaining a local `values.yaml` with your most recent configuration is a best practice.

If you want to see the current state of values in your Airflow Deployment, you can run `helm get values -n airflow [flags]`.

## Step 4: Customize the Airflow Docker Image

The recommended workflow for deploying DAGs to Airflow on Kubernetes is to add DAGs directly to a customized version of the Astronomer Core Docker image. This process is also known as "baking" DAGs into the image.

To bake DAGs into a Docker image:

1. Add your DAGs to the `dags` folder in your project directory. The DAGs should be uncompiled `.py` files at the top level in the directory (as in, not in a `pycache` folder).
2. In your Dockerfile, add the following lines:

    ```
    FROM quay.io/astronomer/docker-airflow:latest-onbuild

    COPY ./dags/ \${AIRFLOW_HOME}/dags
    ```

    If you want to run a specific version of Airflow, replace `latest` with the image tag that corresponds to your desired version. For a list of all image tags, refer to the [Astronomer quay.io repository](https://quay.io/repository/astronomer/ap-airflow?tab=tags).

3. In your project directory, build a custom Docker image by running the following command:  

    ```
    docker build --tag <your-registry>/airflow:<your-tag> . -f Dockerfile
    ```

4. Push your custom image to an accessible  
registry by running the following command:

    ```
    docker push <your-registry>/airflow:<your-tag>
    ````

5. In your `values.yaml` file, update the following key-value pairs:

    ```yaml
    images:
      airflow:
        repository: <your-registry>/airflow
        tag: <your-tag>
        pullPolicy: IfNotPresent
    ```

6. Upgrade your Helm chart using the following command:

    ```bash
    helm upgrade airflow -n airflow -f values.yaml astronomer/airflow       
    ```

7. If the upgrade was successful, the CLI should prompt you to run a command that looks something like the following:

    ```
    kubectl port-forward svc/airflow-webserver 8080:8080 --namespace airflow
    ```

    This command gives your local computer access to Airflow's webserver, which is responsible for rendering the Airflow UI.

8. Run the command suggested by the CLI and open `localhost:8080` in a web browser. If your connection was successful, you should see the Airflow login screen.

9. Log in using `admin` for both your username and your password. Once you've successfully logged in, you should see the Airflow UI and your example DAG:

    ![Airflow UI Home Screen with example DAG](https://assets2.astronomer.io/main/docs/airflow-ui/ac-kubernetes.png)

## Next Steps

This guide provided a basic setup for running Airflow on Kubernetes using Helm. From here, you'll want to complete the following additional setup to make the most of Airflow:

- Automate DAG deployment across your installation
- Upgrade to a new version of Apache Airflow
- Integrate an authentication system
- Set up a destination for Airflow task logs

## Reference: Helm Configuration Options

The following table lists the configurable parameters of the Helm chart and their default values.

| Parameter                                             | Description                                                                                               | Default                                                           |    |
|:------------------------------------------------------|:----------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------|:---|
| `uid`                                                 | UID to run Airflow pods under                                                                             | `nil`                                                             |    |
| `gid`                                                 | GID to run Airflow pods under                                                                             | `nil`                                                             |    |
| `nodeSelector`                                        | Node labels for pod assignment                                                                            | `{}`                                                              |    |
| `affinity`                                            | Affinity labels for pod assignment                                                                        | `{}`                                                              |    |
| `tolerations`                                         | Toleration labels for pod assignment                                                                      | `[]`                                                              |    |
| `labels`                                              | Common labels to add to all objects defined in this chart                                                 | `{}`                                                              |    |
| `ingress.enabled`                                     | Enable Kubernetes Ingress support                                                                         | `false`                                                           |    |
| `ingress.acme`                                        | Add acme annotations to Ingress object                                                                    | `false`                                                           |    |
| `ingress.tlsSecretName`                               | Name of Kubernetes secret that contains a TLS secret                                                                 | `~`                                                               |    |
| `ingress.webserverAnnotations`                        | Annotations added to Webserver Ingress object                                                             | `{}`                                                              |    |
| `ingress.flowerAnnotations`                           | Annotations added to Flower Ingress object                                                                | `{}`                                                              |    |
| `ingress.baseDomain`                                  | Base domain for VHOSTs                                                                                    | `~`                                                               |    |
| `ingress.auth.enabled`                                | Enable auth with Astronomer Platform                                                                      | `true`                                                            |    |
| `networkPolicies.enabled`                             | Enable Network Policies to restrict traffic                                                               | `true`                                                            |    |
| `airflowHome`                                         | Location of Airflow home directory                                                                        | `/usr/local/airflow`                                              |    |
| `rbacEnabled`                                         | Deploy pods with Kubernetes RBAC enabled                                                                  | `true`                                                            |    |
| `airflowVersion`                                      | Default Airflow image version                                                                             | `1.10.5`                                                          |    |
| `executor`                                            | Airflow executor (eg SequentialExecutor, LocalExecutor, CeleryExecutor, KubernetesExecutor)               | `KubernetesExecutor`                                              |    |
| `allowPodLaunching`                                   | Allow Airflow pods to talk to Kubernetes API to launch more pods                                          | `true`                                                            |    |
| `defaultAirflowRepository`                            | Fallback Docker repository to pull Airflow image from                                                     | `quay.io/astronomer/ap-airflow`                                   |    |
| `defaultAirflowTag`                                   | Fallback Docker image tag to deploy. This image is also used to Run Database Migrations for Airflow.      | `1.10.7-alpine3.10`                                               |    |
| `images.airflow.repository`                           | Docker repository to pull image from. Update this to deploy a custom image.                                | `quay.io/astronomer/ap-airflow`                                   |    |
| `images.airflow.tag`                                  | Docker image tag to pull image from. Update this to deploy a new custom image tag.                         | `~`                                                               |    |
| `images.airflow.pullPolicy`                           | Pull policy for Airflow image                                                                              | `IfNotPresent`                                                    |    |
| `images.flower.repository`                            | Docker repository to pull image from. Update this to deploy a custom image.                                | `quay.io/astronomer/ap-airflow`                                   |    |
| `images.flower.tag`                                   | Docker image tag to pull image from. Update this to deploy a new custom image tag.                         | `~`                                                               |    |
| `images.flower.pullPolicy`                            | PullPolicy for flower image                                                                               | `IfNotPresent`                                                    |    |
| `images.statsd.repository`                            | Docker repository to pull image from. Update this to deploy a custom image.                                | `quay.io/astronomer/ap-statsd-exporter`                           |    |
| `images.statsd.tag`                                   | Docker image tag to pull image from. Update this to deploy a new custom image tag.                         | `~`                                                               |    |
| `images.statsd.pullPolicy`                            | PullPolicy for statsd-exporter image                                                                      | `IfNotPresent`                                                    |    |
| `images.redis.repository`                             | Docker repository to pull image from. Update this to deploy a custom image.                                | `quay.io/astronomer/ap-redis`                                     |    |
| `images.redis.tag`                                    | Docker image tag to pull image from. Update this to deploy a new custom image tag.                         | `~`                                                               |    |
| `images.redis.pullPolicy`                             | PullPolicy for redis image                                                                                | `IfNotPresent`                                                    |    |
| `images.pgbouncer.repository`                         | Docker repository to pull image from. Update this to deploy a custom image.                                | `quay.io/astronomer/ap-pgbouncer`                                 |    |
| `images.pgbouncer.tag`                                | Docker image tag to pull image from. Update this to deploy a new custom image tag.                         | `~`                                                               |    |
| `images.pgbouncer.pullPolicy`                         | PullPolicy for pgbouncer image                                                                            | `IfNotPresent`                                                    |    |
| `images.pgbouncerExporter.repository`                 | Docker repository to pull image from. Update this to deploy a custom image                                | `quay.io/astronomer/ap-pgbouncer-exporter`                        |    |
| `images.pgbouncerExporter.tag`                        | Docker image tag to pull image from. Update this to deploy a new custom image tag                         | `~`                                                               |    |
| `images.pgbouncerExporter.pullPolicy`                 | PullPolicy for pgbouncer-exporter image                                                                   | `IfNotPresent`                                                    |    |
| `env`                                                 | Environment variables key/values to mount into Airflow pods                                               | `[]`                                                              |    |
| `secret`                                              | Secret name/key pairs to mount into Airflow pods                                                          | `[]`                                                              |    |
| `data.metadataSecretName`                             | Secret name to mount Airflow connection string from                                                       | `~`                                                               |    |
| `data.resultBackendSecretName`                        | Secret name to mount Celery result backend connection string from                                         | `~`                                                               |    |
| `data.metadataConection`                              | Field separated connection data (alternative to secret name)                                              | `{}`                                                              |    |
| `data.resultBackendConnection`                        | Field separated connection data (alternative to secret name)                                              | `{}`                                                              |    |
| `fernetKey`                                           | String representing an Airflow fernet key                                                                 | `~`                                                               |    |
| `fernetKeySecretName`                                 | Secret name for Airflow fernet key                                                                        | `~`                                                               |    |
| `workers.replicas`                                    | Replica count for Celery workers (if applicable)                                                          | `1`                                                               |    |
| `workers.keda.enabled`                                | Enable KEDA autoscaling features                                                                          | `false`                                                           |    |
| `workers.keda.pollingInverval`                        | How often KEDA should poll the backend database for metrics in seconds                                    | `5`                                                               |    |
| `workers.keda.cooldownPeriod`                         | How often KEDA should wait before scaling down in seconds                                                 | `30`                                                              |    |
| `workers.keda.maxReplicaCount`                        | Maximum number of Celery workers KEDA can scale to                                                        | `10`                                                              |    |
| `workers.persistence.enabled`                         | Enable log persistence in workers via StatefulSet                                                         | `false`                                                           |    |
| `workers.persistence.size`                            | Size of worker volumes (if persistence is enabled)                                                                         | `100Gi`                                                           |    |
| `workers.persistence.storageClassName`                | StorageClass worker volumes should use (if persistence is enabled)                                                         | `default`                                                         |    |
| `workers.extraInitContainers`                         | Extra init containers for workers, including `pod_template_file`                                          | `[]`                                                              |    |
| `workers.extraVolumes`                                | Extra volumes for workers, including `pod_template_file`                                                  | `[]`                                                              |    |
| `workers.extraVolumeMounts`                           | Extra volume mounts for workers, including `pod_template_file`                                            | `[]`                                                              |    |
| `workers.resources.limits.cpu`                        | CPU Limit of workers                                                                                      | `~`                                                               |    |
| `workers.resources.limits.memory`                     | Memory Limit of workers                                                                                   | `~`                                                               |    |
| `workers.resources.requests.cpu`                      | CPU Request of workers                                                                                    | `~`                                                               |    |
| `workers.resources.requests.memory`                   | Memory Request of workers                                                                                 | `~`                                                               |    |
| `workers.terminationGracePeriodSeconds`               | How long Kubernetes should wait for Celery workers to gracefully drain before force killing               | `600`                                                             |    |
| `workers.autoscaling.enabled`                         | Traditional HorizontalPodAutoscaler                                                                       | `false`                                                           |    |
| `workers.autoscaling.minReplicas`                     | Minimum amount of workers                                                                                 | `1`                                                               |    |
| `workers.autoscaling.maxReplicas`                     | Maximum amount of workers                                                                                 | `10`                                                              |    |
| `workers.targetCPUUtilization`                        | Target CPU Utilization of workers                                                                         | `80`                                                              |    |
| `workers.targetMemoryUtilization`                     | Target Memory Utilization of workers                                                                      | `80`                                                              |    |
| `workers.safeToEvict`                                 | Allow Kubernetes to evict worker pods if needed (node downscaling)                                        | `true`                                                            |    |
| `workers.extraContainers`                             | Add additional containers to worker pod(s) including `pod_template_file`                                  | `[]`                                                              |    |
| `workers.updateStrategy`                              | The strategy used to replace old Pods by new ones.                                                        | `{"rollingUpdate": {"maxSurge": "100%", "maxUnavailable": "50%"}` |    |
| `scheduler.podDisruptionBudget.enabled`               | Enable PDB on Airflow scheduler                                                                           | `false`                                                           |    |
| `scheduler.podDisruptionBudget.config.maxUnavailable` | MaxUnavailable pods for scheduler                                                                         | `1`                                                               |    |
| `scheduler.resources.limits.cpu`                      | CPU Limit of scheduler                                                                                    | `~`                                                               |    |
| `scheduler.resources.limits.memory`                   | Memory Limit of scheduler                                                                                 | `~`                                                               |    |
| `scheduler.resources.requests.cpu`                    | CPU Request of scheduler                                                                                  | `~`                                                               |    |
| `scheduler.resources.requests.memory`                 | Memory Request of scheduler                                                                               | `~`                                                               |    |
| `scheduler.airflowLocalSettings`                      | Custom Airflow local settings python file                                                                 | `~`                                                               |    |
| `scheduler.safeToEvict`                               | Allow Kubernetes to evict scheduler pods if needed (node downscaling)                                     | `true`                                                            |    |
| `scheduler.extraContainers`                           | Extra containers for the scheduler                                                                        | `[]`                                                              |    |
| `scheduler.extraInitContainers`                       | Extra init containers for the scheduler                                                                   | `[]`                                                              |    |
| `scheduler.extraVolumes`                              | Extra volumes for the scheduler                                                                           | `[]`                                                              |    |
| `scheduler.extraVolumeMounts`                         | Extra volume mounts for the scheduler                                                                     | `[]`                                                              |    |
| `webserver.livenessProbe.initialDelaySeconds`         | Webserver LivenessProbe initial delay                                                                     | `15`                                                              |    |
| `webserver.livenessProbe.timeoutSeconds`              | Webserver LivenessProbe timeout seconds                                                                   | `30`                                                              |    |
| `webserver.livenessProbe.failureThreshold`            | Webserver LivenessProbe failure threshold                                                                 | `20`                                                              |    |
| `webserver.livenessProbe.periodSeconds`               | Webserver LivenessProbe period seconds                                                                    | `5`                                                               |    |
| `webserver.readinessProbe.initialDelaySeconds`        | Webserver ReadinessProbe initial delay                                                                    | `15`                                                              |    |
| `webserver.readinessProbe.timeoutSeconds`             | Webserver ReadinessProbe timeout seconds                                                                  | `30`                                                              |    |
| `webserver.readinessProbe.failureThreshold`           | Webserver ReadinessProbe failure threshold                                                                | `20`                                                              |    |
| `webserver.readinessProbe.periodSeconds`              | Webserver ReadinessProbe period seconds                                                                   | `5`                                                               |    |
| `webserver.replicas`                                  | How many Airflow webserver replicas should run                                                            | `1`                                                               |    |
| `webserver.resources.limits.cpu`                      | CPU Limit of webserver                                                                                    | `~`                                                               |    |
| `webserver.resources.limits.memory`                   | Memory Limit of webserver                                                                                 | `~`                                                               |    |
| `webserver.resources.requests.cpu`                    | CPU Request of webserver                                                                                  | `~`                                                               |    |
| `webserver.resources.requests.memory`                 | Memory Request of webserver                                                                               | `~`                                                               |    |
| `webserver.jwtSigningCertificateSecretName`           | Name of secret to mount Airflow Webserver JWT singing certificate from                                    | `~`                                                               |    |
| `webserver.defaultUser`                               | Optional default Airflow user information                                                                 | `{}`                                                              |    |
| `extraObjects`                                        | Extra K8s Objects to deploy (these are passed through `tpl`). More about [Extra Objects](#extra-objects). | `[]`                                                              |    |
| `webserver.extraContainers`                           | Add additional containers to webserver pod(s)                                                             | `[]`                                                              |    |
