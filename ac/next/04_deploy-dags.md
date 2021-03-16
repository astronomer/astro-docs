---
title: "Deploy DAGs to Airflow"
navTitle: "Deploy DAGs"
description: "Use automation tools to continuously deploy DAGs on both virtual machines and Docker."
---

## Overview

Whether you're running Airflow on virtual machines or in Docker, every node in your Airflow cluster needs a copy of your DAG files. In addition, these DAG files all need to appear in the same directory. This guide will cover two popular methods for deploying DAGs across your machines:

- Using a cron job to regularly pull DAGs into your local directories from a central Git repository.
- Adding DAGs directly to a Docker image and rebuilding the image whenever DAGs are updated. To implement this method, Kubernetes is required.


## Deploy DAGs to Multiple Machines via Cron Job

If you installed Airflow on a virtual machine, you can use a simple cron job, as well as open source file detection tools like `incron`, to pull new DAGs onto your Airflow machines on a regular basis and restart Airflow when necessary. This setup assumes that you:

- Installed Airflow via Python wheel according to [Installing at Production Scale].
- Host your DAGs in a Git repository.
- Have a system user named `airflow`.
- Have [incron](https://github.com/sschober/kqwait) installed on all machines running Airflow.
- Are using a Debian-like OS.

For each of your machines running Airflow:

1. Open your DAGs directory and ensure that the folder is empty. If you followed the Installing at Production Scale guide, this folder would be `/usr/local/airflow`.

2. Clone the Git repository holding your DAGs into the folder using `git clone`.

3. As your `airflow` system user, run `crontab -e` to create a new cron job. You can specify an editor using the `EDITOR` environment variable (e.g. `env EDITOR=atom crontab -e`).

4. Create a cron job that continuously pulls from the DAG repository. For example, if you want to pull to the `/usr/local/airflow` folder every 3 minutes, your cron job would look something like this:

    ```
    * */3 * * * cd /usr/local/airflow && git pull
    /usr/local/airflow IN_MODIFY systemctl restart airflow
    ```

    This cron job first pulls from a Git repository, then checks to see if any files in the repository have been modified since the last pull. If a file was modified, the cron job restarts Airflow so that the updated DAGs are successfully deployed.

5. Run `systemctl start incron.service` to begin monitoring the DAG directory for changes.

Once you have this simple cron job saved, you can scale it and use tools such as [Ansible](https://docs.ansible.com/ansible/latest/user_guide/index.html) to integrate into a larger CI/CD workflow. If you are running MacOS, you can complete a similar setup using [kqwait](https://github.com/sschober/kqwait).

## Deploy DAGs on Kubernetes via Helm Chart

If you run Airflow in Docker, you can deploy DAGs via the [Astronomer Core Helm chart](https://github.com/astronomer/airflow-chart). This is also known as "baking in" DAGs because you're adding DAGs to the image itself.  To use this method, you'll need:

- A Dockerfile that pulls Astronomer Core's [Docker image](https://hub.docker.com/r/astronomerinc/ap-airflow)
- A Kubernetes Cluster
- The [Kubernetes CLI (kubectl)](https://kubernetes.io/docs/tasks/tools/)
- The Astronomer CLI
- Helm
- A Docker registry

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

3. Edit your Dockerfile with the following minimum lines:

    ```
    # Use a different tag to run a different version of Airflow
    FROM quay.io/astronomer/ap-airflow:latest-onbuild

    COPY <your-dag-directory> ~astro/airflow-venv
    ```

4. Build the Docker image using the following command:

    ```sh
    docker build -t <filepath>/ap-airflow:<your-image-tag>
    ```

    As a best practice, the image tag you specify here should indicate which version of Airflow you're using.

5. Push the Dockerfile to your registry with the following command:

    ```sh
    docker push etc/ap-airflow:<your-image-tag>
    ```

6. Upgrade your image using the following Helm command:

    ```sh
    helm upgrade <your-release-name> . \
    --set images.airflow.repository=etc/ap-airflow \
    --set images.airflow.tag=<your-image-tag>
    ```

7. `cd` to your Airflow project folder and run `astro dev stop && astro dev start` to restart your Airflow services.

With this method, you no longer need to store your DAG folder on each individual machine running Airflow. While baking DAGs into an image is a great way to keep all of the code for your project running in one place, it can be labor-intensive to rebuild your image each time you update a DAG.

As a next step, we recommend hosting your DAG folder in a Git repository and implementing a CI/CD tool to automatically rebuild your image whenever code is pushed or merged to the repository.  
