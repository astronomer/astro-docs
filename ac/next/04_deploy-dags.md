---
title: "Deploy DAGs to Airflow"
navTitle: "Deploy DAGs"
description: "Use automation tools to continuously deploy DAGs on both virtual machines and Docker."
---

## Overview

Whether you're running Airflow on virtual machines or in Docker, every node in your Airflow cluster needs a copy of your DAG files. In addition, these DAG files all need to appear in the same directory. This guide will cover two popular methods for deploying DAGs across your machines:

- Deploy Airflow on Virtual Machines by using a cron job that pulls DAGs into your local directories from a central Git repository.
- Deploy Airflow on Containers by building DAGs into a Docker image and rebuilding the image whenever DAGs are updated. To implement this method, Kubernetes and Helm are required.

## Deploy DAGs to Multiple Machines via Cron Job

If you installed Airflow on a virtual machine, you can use a simple cron job, as well as open source file detection tools like `incron`, to regularly pull new DAGs onto your Airflow machines and restart Airflow when those DAG files are updated. This setup assumes that you:

- Installed Airflow via Python wheel according to [Installing at Production Scale].
- Host your DAGs in a Git repository.
- Have a system user named `airflow`.
- Have [incron](https://github.com/sschober/kqwait) installed on all machines running Airflow.
- Are using a Debian-like OS.

For each of your machines running Airflow:

1. `cd` to your local DAGs directory and ensure that the folder is empty. If you followed the Installing at Production Scale guide, this folder would be `/usr/local/airflow`.

2. Clone your Git repository for DAGs into the folder using `git clone`.

3. As your `airflow` system user, run `crontab -e` to create a new cron job. You can specify an editor using the `EDITOR` environment variable (for example, `env EDITOR=atom crontab -e`).

4. Create a cron job that regularly pulls from your Git repository, then checks to see if any files were modified from the pull. For example, if you want to pull from GitHub to your `/usr/local/airflow` directory every 3 minutes, your cron job would look something like this:

    ```
    * */3 * * * cd /usr/local/airflow && git pull
    /usr/local/airflow IN_MODIFY systemctl restart airflow
    ```

    If a file was modified from the pull, the cron job restarts Airflow and triggers a deploy to your Airflow environment with any updated DAGs.

5. Run `systemctl start incron.service` to begin monitoring the DAG directory for changes.

Once you have this simple cron job saved, you can scale it and use tools such as [Ansible](https://docs.ansible.com/ansible/latest/user_guide/index.html) to integrate into a larger CI/CD workflow. If you are running MacOS, you can complete a similar setup using [kqwait](https://github.com/sschober/kqwait).

## Deploy DAGs on Kubernetes via Helm

If you run Airflow in Docker, the most efficient transition to a production-scale workflow is to deploy DAGs onto a Kubernetes environment via the [Astronomer Helm chart](https://github.com/astronomer/airflow-chart), which is built off of the Apache Airflow Project's community chart to provide more extensibility.

With this setup, you build a custom Docker image that contains your DAGs, also known as "baking" DAGs into the image. This custom image is then pushed to your Docker registry and passed to each of your core Airflow components for execution.

For this setup, you'll need:

- A Dockerfile that pulls Astronomer Core's [Docker image](https://github.com/astronomer/docker-airflow)
- A Kubernetes Namespace
- The [Kubernetes CLI (kubectl)](https://kubernetes.io/docs/tasks/tools/)
- The Astronomer CLI
- Helm
- A Docker registry

First, get your environment ready for deployment:

1. Create a Helm repository using the following command:

    ```sh
    helm repo add astronomer https://helm.astronomer.io
    ```

2. Install the Helm chart using the following command:

    ```sh
    helm install --name <your-release-name>
    ```

    To find your release name for Airflow, you can run:

    ```sh
    kubectl get ns
    ```

3. Add the following line to your Dockerfile:

    ```
    COPY <your-dag-directory> ~astro/airflow-venv
    ```

Then, for every time that you update a DAG:

1. Build the Docker image using the following command:

    ```sh
    docker build -t /path/to/file/docker-airflow:<your-image-tag>
    ```

2. Push the Dockerfile to your registry with the following command:

    ```sh
    docker push /path/to/file/docker-airflow:<your-image-tag>
    ```

3. Upgrade your Helm release using the following command:

    ```sh
    helm upgrade <your-release-name> . \
    --set images.airflow.repository=/path/to/file/docker-airflow \
    --set images.airflow.tag=<your-image-tag>
    ```

4. Restart your Airflow services.

When you bake your DAGs into a single Docker image and deploy that image to a Kubernetes environment using Helm, you don't need to install dependencies and store your DAGs on each individual machine running Airflow in the way you would on a VM.

However, needing to re-build your image every time you update a DAG file can be labor-intensive. As a next step, we recommend hosting your DAG folder in a Git repository and implementing a CI/CD tool to automatically rebuild your image whenever code is pushed or merged to the repository.  
