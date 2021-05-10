---
title: "Run the Kubernetes Executor on Astronomer"
navTitle: "Kubernetes Executor"
description: "How to run and configure the Kubernetes Executor on Astronomer."
---

## Overview

Apache Airflow's [Kubernetes Executor](https://airflow.apache.org/docs/apache-airflow/stable/executor/kubernetes.html) relies on a fixed single Pod that dynamically delegates work and resources. For each task that needs to run, the Executor talks to the Kubernetes API to dynamically launch Pods which terminate when that task is completed.

This enables the Executor to scale depending on how many Airflow tasks you're running at a given time. It also means you can configure the following for each individual Airflow task:

- Memory allocation
- Service accounts
- Airflow image

To configure these resources for each pod, you configure a [pod template](https://github.com/astronomer/airflow-chart/blob/master/files/pod-template-file.yaml). Read this guide to learn how to configure a pod template and apply it to both Airflow Deployments and individual Airflow tasks. For more information on configuring pod template values, reference the [Kubernetes API documentation](https://v1-16.docs.kubernetes.io/docs/reference/generated/kubernetes-api/v1.14/#podspec-v1-core).

Note that you must have an Airflow Deployment on Astronomer running with the Kubernetes Executor to follow this setup. For more information on configuring an Executor, read [Configure a Deployment](/docs/cloud/stable/deploy/configure-deployment). To learn more about different Executor types, read [Airflow Executors Explained](https://www.astronomer.io/guides/airflow-executors-explained).

## Use a Pod Template in a Deployment

If you want to use a pod template for all DAGs within a given Airflow Deployment, you can add a configured pod template to the Deployment as an environment variable. To do so:

1. Create a copy of Astronomer's default [pod template](https://github.com/astronomer/airflow-chart/blob/master/files/pod-template-file.yaml) and update the values as needed for your Deployment.

2. Update your Dockerfile to copy your configured pod template into your Docker image. For instance, if your customized pod template file name is `pod_template.yaml`, you would add the following line:

    ```
    COPY pod_template.yaml /tmp/pod_template.yaml
    ```

    > **Note:** Depending on your configuration, you may also need to change your `USER` line to `root` in order to have the appropriate copy permissions.

3. In the Astronomer UI, add the `AIRFLOW__KUBERNETES__POD_TEMPLATE_FILE` environment variable to your Deployment. Its value should be the directory path for the pod template in your Docker image. In this example, the file path would be `/tmp/new_pod_template.yaml`.

4. In your terminal, run `astro deploy -f` to deploy your code and rebuild your Docker image.

5. To confirm that the deploy was successful, launch the Airflow UI for your Deployment, click into any single task, and click `K8s Pod Spec`. You should see the updates you made to the pod template in this specification.

## Use a Pod Template in a Task

Some tasks require a more specific pod configuration than other tasks. For instance, one task might require significantly more GPU than another task. In cases like this, you can deploy a pod template to a single task within a DAG. To configure a pod template for a specific task:

1. Create a copy of Astronomer's default [pod template](https://github.com/astronomer/airflow-chart/blob/master/files/pod-template-file.yaml) and update the values as needed for your Deployment.

2. Update your Dockerfile to copy your customized pod template into your Docker image. For instance, if your customized pod template file name is `new_pod_template.yaml`, you would add the following line:

    ```
    COPY new_pod_template.yaml /tmp/new_pod_template.yaml
    ```

    > **Note:** Depending on your configuration, you may also need to change your `USER` line to `root` in order to have the appropriate copy permissions.

3. Add the Executor config to the task and specify your custom pod template. It should look something like this:

    ```py
    task_with_template = PythonOperator(
        task_id="task_with_template",
        python_callable=do_something,
        executor_config={
            "pod_template_file": "/tmp/new_pod_template.yaml",
        },
    )
    ```

4. In your terminal, run `astro deploy -f` to deploy your code and rebuild your Docker image.

5. To confirm that the deploy was successful, launch the Airflow UI for your Deployment, click into any single task, and click `K8s Pod Spec`. You should see the updates you made to the pod template in this specification.
