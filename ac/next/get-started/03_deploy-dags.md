---
title: "Deploy DAGs in a Production Environment"
navTitle: "Deploy DAGs"
description: "Use open source automation tools to ensure that DAGs are accurately updated across all of your machines. ."
---

Every machine running Airflow needs a copy of the DAG files, with all DAG files appearing in the same DAG folder. While there are many ways to make this happen, this guide will cover two of the most popular and recommended methods for deploying DAGs across your machines:

- Use a cron job to regularly pull DAGs into your local files. Note that this method requires hosting your DAGs in a Git repository. 
- Add DAGs directly to a Docker image and rebuild the image whenever DAGs are updated. Note that this option is limited only to users running Airflow on Docker.


## Automate DAG Deployment with a Cron Job

We recommend using an automation tool to continuously pull new or updated DAGs to your Airflow machines. If you host your DAGs in a Git repository, you can use a cron job to pull new DAGs onto your machines on a regular basis. For each of your machines running Airflow:

1. Open your DAGs directory and ensure that the folder is empty. If you followed the Installing at Production Scale guide, this folder would be `/usr/local/airflow`.

2. Clone your DAG repository into the folder using `$ git clone`.

3. As your `airflow` system user, run `crontab -e`.

4. Create a cron job that continuously pulls from the DAG repository. For example, if you want to pull to the `/usr/local/airflow` folder every 3 minutes, your cron job would look something like this:

    ```
    * */3 * * * cd /usr/local/airflow && git pull
    ```

## Kubernetes via Helm Chart

If you run Airflow on a Kubernetes cluster, you can deploy DAGs via the [Astronomer Core Helm chart](https://github.com/astronomer/airflow-chart). This is also known as "baking in" DAGs because you're installing DAGs as part of the image itself.  To use this method, you'll need:

- A Kubernetes cluster running Airflow
- The kubectl command line tool
- Helm
- A Docker registry where you can push and pull images

1. Create a Helm repository using the following command:

    ```sh
    $ helm repo add astronomer https://helm.astronomer.io
    ```

2. Install the Helm chart using the following command:

    ```sh
    $ helm install --name <your-release-name>
    ```

3. Create or edit an existing Dockerfile with the following lines:

    ```
    FROM quay.io/astronomer/ap-airflow:latest-onbuild

    COPY <your-dag-directory> ~astro/airflow-venv
    ```

4. Build the Dockerfile using the following command:

    ```sh
    docker build -t your-organization/ap-airflow:<your-tag>
    ```

5. Push the Dockerfile to your registry with the following command:

    ```sh
    docker push <your-filepath>/ap-airflow:<your-tag>
    ```

6. Upgrade your image using the following Helm command:

    ```sh
    helm upgrade <your-release-name> . \
    --set images.airflow.repository=<your-filepath>/ap-airflow \
    --set images.airflow.tag=<your-image-tag>
    ```

### Next Steps

While baking DAGs into an image is a great way to keep all of the code for your project running in one place, it's labor-intensive to continuously rebuild.

As a next step, we recommend hosting your DAG folder in a Git repository and implementing a CI/CD tool to automatically rebuild your image whenever code is pushed or merged to the repository.  
