---
title: "Run the Kubernetes Executor on Astronomer"
navTitle: "Kubernetes Executor"
description: "How to run the Kubernetes Executor on Astronomer."
---

## Overview

The Kubernetes Executor relies on a fixed single Pod that dynamically delegates work and resources. For each and every task that needs to run, the Executor talks to the Kubernetes API to dynamically launch Pods which terminate when that task is completed.

This enables the Executor to scale up and down based on how many Airflow tasks you're running at a given time. It also means that you can configure the following differently for each individual Airflow task or Deployment:

- Memory allocation
- Service accounts
- Airflow image

Each pod is spun up according to a [pod template](https://github.com/astronomer/airflow-chart/blob/master/files/pod-template-file.yaml). This template can be copied and modified for individual use cases. For example, one Airflow task might require more GPUs than all other tasks; for this task alone, you can provision additional GPUs via a modified pod template.

This guide explains how to configure the pod template and apply it to both Airflow Deployments and tasks. For more information on configuring specific pod template values, reference the [Kubernetes API documentation](https://v1-16.docs.kubernetes.io/docs/reference/generated/kubernetes-api/v1.14/#podspec-v1-core).

Note that you must have an Airflow Deployment on Astronomer running with the Kubernetes Executor to follow these steps. For more information on configuring an Executor, read [Configure a Deployment](/docs/enterprise/next/deploy/configure-deployment)

## Configure the Kubernetes Executor Using an Existing Pod Template

By default, Airflow Deployments on Astronomer use a [pod template](https://github.com/astronomer/airflow-chart/blob/master/files/pod-template-file.yaml) to construct each pod. If you're creating a new Deployment, you can simply modify the default pod template and apply that template to the Deployment or an individual task as described in the next two sections.

If you need to update a pod template for an existing Deployment, we recommend pulling the template directly from the Deployment and editing that version instead. To do so:

1. Run the following command to find the namespace (release-name) of your Airflow deployment:

    ```sh
    $ kubectl get ns
    ```

2. Run the following command to get pod names for the namespace:

    ```sh
    $ kubectl get pods -n <your-namespace>
    ```

    Note the name of the `scheduler` pod in this list.

3. Run the following command to open the running pod.

    ```sh
    $ kubectl exec -it <scheduler-pod-name> -n <your-namespace>
    ```

4. `cd` into the `pod_templates` folder, then run the following:

    ```sh
    $ cat pod_template_file.yaml
    ```

5. Copy the template file's contents into a new local file.

You now have a local version of your Deployment's pod template file. From here, you can modify the file and push it to your Deployment as described in the next section.

## Add the Pod Template to a Deployment

If you want your pod template to apply to all DAGs within a given Airflow Deployment, you can add the pod template as an environment variable to the Deployment. To do this:

1. Update your Dockerfile to include a line which copies the customized pod template into Docker image that's pushed whenever you deploy code. For instance, if your customized pod template file name is `new_pod_template.yaml`, the line would look like this:

    ```
    COPY new_pod_template.yaml /tmp/new_pod_template.yaml
    ```

    > **Note:** Depending on your configuration, you may also need to change your `USER` line to `root` in order to have the appropriate copy permissions.

2. In the Astronomer UI, add the `AIRFLOW__KUBERNETES__POD_TEMPLATE_FILE` Environment Variable to your Deployment. Its value should be the location the pod template will be stored in the Docker image; in this case its /tmp/new_pod_template.yaml.

3. In your terminal, run `astro deploy -f` to deploy your code and rebuild your Docker image.

4. To confirm that the deploy was successful, launch the Airflow UI for your Deployment, click into any single task, and click `K8s Pos Spec`. You should see the updates you made to the pod template in this specification.

## Add the Pod Template to a Task

Some tasks require a more specific pod configuration than other tasks. For instance, one task might require significantly more GPU than another task. In cases like this, you can deploy a pod template to a single task within a DAG. To do so:

1. Update your Dockerfile to include a line which copies the customized pod template into Docker image that's pushed whenever you deploy code. For instance, if your customized pod template file name is `new_pod_template.yaml`, the line would look like this:

    ```
    COPY new_pod_template.yaml /tmp/new_pod_template.yaml
    ```

    > **Note:** Depending on your configuration, you may also need to change your `USER` line to `root` in order to have the appropriate copy permissions.

2. Add the Executor config to the task where you want to override the pod template and specify your custom pod template. It should look something like this:

    ```py
    task_with_template = PythonOperator(
        task_id="task_with_template",
        python_callable=do_something,
        executor_config={
            "pod_template_file": "/tmp/new_pod_template.yaml",
        },
    )
    ```

3. In your terminal, run `astro deploy -f` to deploy your code and rebuild your Docker image.

4. To confirm that the deploy was successful, launch the Airflow UI for your Deployment, click into any single task, and click `K8s Pos Spec`. You should see the updates you made to the pod template in this specification.
