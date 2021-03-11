---
title: "Deploy DAGs to Airflow"
navTitle: "Deploy DAGs"
description: "Use automation tools to continuously deploy DAGs at production scale."
---

When running Airflow at production scale, every machine running Airflow needs a copy of your DAG files. In addition, these DAG files all need to appear in the same folder. This guide will cover two popular methods for deploying DAGs across your machines:

- Using a cron job to regularly pull DAGs into your local directories from a central Git repository.
- Adding DAGs directly to a Docker image and rebuilding the image whenever DAGs are updated. Note that this method works only for users running Airflow on Kubernetes.


## Automate DAG Deployment with a Cron Job

We recommend using an automation tool to continuously pull new or updated DAGs to your Airflow machines. If you host your DAGs in a Git repository, you can use a cron job to pull new DAGs onto your machines on a regular basis. For each of your machines running Airflow:

1. Open your DAGs directory and ensure that the folder is empty. If you followed the Installing at Production Scale guide, this folder would be `/usr/local/airflow`.

2. Clone your DAG repository into the folder using `$ git clone`.

3. As your `airflow` system user, run `crontab -e`.

4. Create a cron job that continuously pulls from the DAG repository. For example, if you want to pull to the `/usr/local/airflow` folder every 3 minutes, your cron job would look something like this:

    ```
    * */3 * * * cd /usr/local/airflow && git pull
    ```

Once you have this simple cron job in place, you can modify it to run on a per-merge basis using automation tools such as [Ansible](https://docs.ansible.com/ansible/latest/user_guide/index.html).

## Deploy DAGs on Kubernetes via Helm Chart

If you run Airflow in Docker, you can deploy DAGs via the [Astronomer Core Helm chart](https://github.com/astronomer/airflow-chart). This is also known as "baking in" DAGs because you're adding DAGs to the image itself.  To use this method, you'll need:

- A Dockerfile that pulls Astronomer Core's [Docker image](https://hub.docker.com/r/astronomerinc/ap-airflow).
- A Kubernetes deployment.
- The kubectl command line tool.
- Helm.
- A Docker registry.

1. Create a Helm repository using the following command:

    ```sh
    $ helm repo add astronomer https://helm.astronomer.io
    ```

2. Install the Helm chart using the following command:

    ```sh
    $ helm install --name <your-release-name>
    ```

    To find your release name for Airflow, you can run:

    ```sh
    kubectl get ns
    ```

3. Edit your Dockerfile with the following minimum lines:

    ```
    FROM quay.io/astronomer/ap-airflow:latest-onbuild

    COPY <your-dag-directory> ~astro/airflow-venv
    ```

4. Build the Docker image using the following command:

    ```sh
    docker build -t <filepath>/ap-airflow:<your-image-tag>
    ```

5. Push the Dockerfile to your registry with the following command:

    ```sh
    docker push <filepath>/ap-airflow:<your-image-tag>
    ```

6. Upgrade your image using the following Helm command:

    ```sh
    helm upgrade <your-release-name> . \
    --set images.airflow.repository=<filepath>/ap-airflow \
    --set images.airflow.tag=<your-image-tag>
    ```

With this method, you no longer need to store your DAG folder on each individual machine running Airflow. While baking DAGs into an image is a great way to keep all of the code for your project running in one place, it can be labor-intensive to rebuild your image each time you update a DAG.

As a next step, we recommend hosting your DAG folder in a Git repository and implementing a CI/CD tool to automatically rebuild your image whenever code is pushed or merged to the repository.  
