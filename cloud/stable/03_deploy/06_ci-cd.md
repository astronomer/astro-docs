---
title: "Deploy to Astronomer via CI/CD"
navTitle: "CI/CD"
description: "Automate the deploy process to your Airflow Deployment by setting up a CI/CD pipeline with a Service Account on Astronomer."
---
<!-- markdownlint-disable-file -->
Astronomer's support for Service Accounts allows users to push code and deploy to an Airflow Deployment on Astronomer via a Continuous Integration/Continuous Delivery (CI/CD) tool of your choice.

This guide will walk you through configuring your CI/CD pipeline on Astronomer Cloud.

For background and best practices on CI/CD, we recommend reading ["An Introduction to CI/CD Best Practices"](https://www.digitalocean.com/community/tutorials/an-introduction-to-ci-cd-best-practices) from DigitalOcean.

## Overview

There are many benefits to deploying your DAGs or changes to Airflow itself through CI/CD, which mirror the general benefits of CI/CD itself:

- It serves as a framework for deploying new and updated DAGs, which streamlines and organizes the development process between all team members.
- It increases the speed of deployment, allowing your team to quickly respond to changes in needs.
- It facilitates continuous, automating testing, which ensures that changes don't break your DAGs in production.

### Example CI/CD setup

For example, consider an Airflow project hosted on Github and deployed to Astronomer. In this scenario, `dev` and `main` branches of an Astronomer project are hosted on GitHub, and `dev` and `prd` Airflow Deployments are hosted on Astronomer.

Using CI/CD, you can automatically push DAGs to a Deployment whenever you push or merge code to its respective Github branch. The general setup would look something like this:

1. Create two Airflow Deployments within your Astronomer workspace, one for `dev` and one for `prd`.
2. Create a code repository that will host your Astronomer project code for this workspace.
3. Create a `dev` branch for your repository off of your `main` branch.
4. Configure your CI/CD tool to deploy to your `dev` Airflow Deployment whenever you push to your `dev` branch, and to deploy to your `prd` Airflow Deployment whenever you merge your `dev` branch into `main`.

Visually, that would like something like this:

![New Deployment Celery Dashboard](https://assets2.astronomer.io/main/docs/ci-cd/ci-cd-flow.png)

### CI/CD on Astronomer

Automating the deploy process to Astronomer starts with creating a Service Account, which will assume a user role and some set of permissions to your Workspace or Deployment.

From there, you'll write a script that allows your Service Account to do the following:

1. Build and tag a Docker Image
2. Authenticate to a Docker Registry
3. Push your Image to that Docker Registry

From there, a webhook triggers an update to your Airflow Deployment. At its core, the Astronomer CLI does the equivalent of the above upon every manual `astro deploy`.

The rest of this guide describes how to create a Service Account and what your CI/CD script should look like based on the tool you're using.

## Prerequisites

Before completing this setup, make sure you:

- Have access to a running Airflow Deployment on Astronomer Cloud.
- Installed the [Astronomer CLI](https://github.com/astronomer/astro-cli).
- Are familiar with your CI/CD tool of choice.

## Step 1: Create a Service Account

In order to authenticate your CI/CD pipeline to Astronomer's private Docker registry, you'll need to create a Service Account and grant it an appropriate set of permissions. You can do so via the Astronomer UI or CLI. Once created, you can always delete this Service Account at any time. In both cases, creating a Service Account will generate an API key that will be used for the CI/CD process.

Note that you're able to create Service Accounts at the:

- Workspace Level
- Airflow Deployment Level

Creating a Service Account at the Workspace level allows you to deploy to *multiple* Airflow deployments with one code push, while creating them at the Deployment level ensures that your CI/CD pipeline only deploys to one particular deployment on Astronomer.

Read below for guidelines on how to create a service account via the CLI and via the Astronomer UI.

### Create a Service Account via the CLI

#### Deployment Level Service Account

To create a Deployment Level Service account via the CLI, first run:

```bash
$ astro deployment list
```

This will output the list of running Airflow deployments you have access to, and their corresponding UUID.

With that UUID, run:

```bash
$ astro deployment service-account create -d <deployment-id> --label <service-account-label> --role <deployment-role>
```

#### Workspace Level Service Account

To create a Workspace Level Service account via the CLI, first run:

```bash
$ astro workspace list
```

This will output the list of running Astronomer Workspaces you have access to, and their corresponding UUID.

With that UUID, run:

```bash
$ astro workspace service-account create -w <workspace-id> --label <service-account-label> --role <workspace-role>
```

### Create a Service Account via the Astronomer UI

If you prefer to provision a Service Account through the Astronomer UI, start by logging into Astronomer.

#### Navigate to your Deployment's "Configure" Page

From the Astronomer UI, navigate to: `Deployment` > `Service Accounts`

![New Service Account](https://assets2.astronomer.io/main/docs/ci-cd/ci-cd-new-service-account.png)

#### Configure your Service Account

Upon creating a Service Account, make sure to:

* Give it a Name
* Give it a Category (optional)
* Grant it a User Role

> **Note:** In order for a Service Account to have permission to push code to your Airflow Deployment, it must have either the "Editor" or "Admin" role. For more information on Workspace roles, refer to our ["Roles and Permissions"](/docs/cloud/stable/manage-astronomer/workspace-permissions/) doc.

![Name Service Account](https://assets2.astronomer.io/main/docs/ci-cd/ci-cd-name-service-account.png)

#### Copy the API Key

Once you've created your new Service Account, grab the API Key that was immediately generated. Depending on your use case, you might want to store this key in an Environment Variable or secret management tool of choice.

> **Note:** This API key will only be visible during the session.

![Service Account](https://assets2.astronomer.io/main/docs/ci-cd/ci-cd-api-key.png)

## Step 2: Authenticate and Push to Docker

The first step of this pipeline will authenticate against the Docker registry that stores an individual Docker image for every code push or configuration change:

```bash
docker login registry.$${BASE_DOMAIN} -u _ -p $${API_KEY_SECRET}
```

In this example:

- `BASEDOMAIN` = `gcp0001.us-east4.astronomer.io`
- `API_KEY_SECRET` = The API Key that you got from the CLI or the UI and stored in your secret manager

### Building and Pushing an Image

Once you are authenticated you can build, tag and push your Airflow image to the private registry, where a webhook will trigger an update to your Airflow Deployment on the platform.

#### Registry Address

*Registry Address* tells Docker where to push images to. On Astronomer Cloud, the registry is:

```
registry.gcp0001.us-east4.astronomer.io
```

#### Release Name

*Release Name* refers to the release name of your Airflow Deployment. It will follow the pattern of `spaceyword-spaceyword-4digits` (e.g. `infrared-photon-7780`).

#### Tag Name

*Tag Name*: Each deploy to Astronomer Cloud generated a Docker image with a corresponding tag. If you deploy via the CLI, the tag will by default read `deploy-n`, with `n` representing the number of deploys made to that Airflow Deployment. If you're using CI/CD, you get to customize this tag. We typically recommend specifying the source and the build number in the name.

In the example below, we use the prefix `ci-` and the ENV `${DRONE_BUILD_NUMBER}`. This guarantees that we always know which CI/CD build triggered the build and push.

Example:

```bash
docker build -t registry.${BASE_DOMAIN}/${RELEASE_NAME}/airflow:ci-${DRONE_BUILD_NUMBER} .
```

If you would like to see a more complete working example please visit our [full example using Drone-CI](https://github.com/astronomer/airflow-example-dags/blob/main/.drone.yml).

## Step 3: Configure Your CI/CD Pipeline

Depending on your CI/CD tool, configuration will be slightly different. This section will focus on outlining what needs to be accomplished, not the specifics of how.

At its core, your CI/CD pipeline will first authenticate to Astronomer Cloud's private registry and then build, tag and push your Docker Image to that registry.

## DroneCI

```yaml
pipeline:
  build:
    image: quay.io/astronomer/ap-airflow:1.10.12-buster
    commands:
      - docker build -t registry.gcp0001.us-east4.astronomer.io/infrared-photon-7780/airflow:ci-${DRONE_BUILD_NUMBER} .
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    when:
      event: push
      branch: [ master, release-* ]

  push:
    image: quay.io/astronomer/ap-airflow:1.10.12-buster
    commands:
      - echo $${SERVICE_ACCOUNT_KEY}
      - docker login registry.gcp0001.us-east4.astronomer.io -u _ -p $${SERVICE_ACCOUNT_KEY}
      - docker push registry.gcp0001.us-east4.astronomer.io/infrared-photon-7780/airflow:ci-${DRONE_BUILD_NUMBER}
    secrets: [ SERVICE_ACCOUNT_KEY ]
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    when:
      event: push
      branch: [ master, release-* ]
```

## CircleCI

```yaml
# Python CircleCI 2.0 configuration file
#
# Check https://circleci.com/docs/2.0/language-python/ for more details
#
version: 2
jobs:
  build:
    machine: true
    steps:
      - checkout
      - restore_cache:
          keys:
          - v1-dependencies-{{ checksum "requirements.txt" }}
          # fallback to using the latest cache if no exact match is found
          - v1-dependencies-
      - run:
          name: Install test deps
          command: |
            # Use a virtual env to encapsulate everything in one folder for
            # caching. And make sure it lives outside the checkout, so that any
            # style checkers don't run on all the installed modules
            python -m venv ~/.venv
            . ~/.venv/bin/activate
            pip install -r requirements.txt
      - save_cache:
          paths:
            - ~/.venv
          key: v1-dependencies-{{ checksum "requirements.txt" }}
      - run:
          name: run linter
          command: |
            . ~/.venv/bin/activate
            pycodestyle .
  deploy:
    docker:
      - image:  quay.io/astronomer/ap-airflow:1.10.12-buster
    steps:
      - checkout
      - setup_remote_docker:
          docker_layer_caching: true
      - run:
          name: Push to Docker Hub
          command: |
            TAG=0.1.$CIRCLE_BUILD_NUM
            docker build -t registry.gcp0001.us-east4.astronomer.io/infrared-photon-7780/airflow:ci-$TAG .
            docker login registry.gcp0001.us-east4.astronomer.io -u _ -p $SERVICE_ACCOUNT_KEY
            docker push registry.gcp0001.us-east4.astronomer.io/infrared-photon-7780/airflow:ci-$TAG

workflows:
  version: 2
  build-deploy:
    jobs:
      - build
      - deploy:
          requires:
            - build
          filters:
            branches:
              only:
                - master
```

## Jenkins Script

```yaml
pipeline {
 agent any
   stages {
     stage('Deploy to astronomer') {
       when { branch 'master' }
       steps {
         script {
           sh 'docker build -t registry.gcp0001.us-east4.astronomer.io/infrared-photon-7780/airflow:ci-${BUILD_NUMBER} .'
           sh 'docker login registry.gcp0001.us-east4.astronomer.io -u _ -p ${SERVICE_ACCOUNT_KEY}'
           sh 'docker push registry.gcp0001.us-east4.astronomer.io/infrared-photon-7780/airflow:ci-${BUILD_NUMBER}'
         }
       }
     }
   }
 post {
   always {
     cleanWs()
   }
 }
}
```

## Bitbucket

If you are using [Bitbucket](https://bitbucket.org/), this script should work (courtesy of our friends at [Das42](https://www.das42.com/))

```yaml
image: quay.io/astronomer/ap-airflow:1.10.12-buster

pipelines:
  branches:
    master:
      - step:
          name: Deploy to production
          deployment: production
          script:
            - echo ${SERVICE_ACCOUNT_KEY}
            - docker build -t registry.gcp0001.us-east4.astronomer.io/infrared-photon-7780/airflow:ci-${BITBUCKET_BUILD_NUMBER}
            - docker login registry.gcp0001.us-east4.astronomer.io -u _ -p ${SERVICE_ACCOUNT_KEY}
            - docker push registry.gcp0001.us-east4.astronomer.io/infrared-photon-7780/airflow:ci-${BITBUCKET_BUILD_NUMBER}
          services:
            - docker
          caches:
            - docker
```

## Gitlab

```yaml
astro_deploy:
  stage: deploy
  image: docker:latest
  services:
    - docker:dind
  script:
    - echo "Building container.."
    - docker build -t registry.gcp0001.us-east4.astronomer.io/infrared-photon-7780/airflow:CI-$CI_PIPELINE_IID .
    - docker login registry.gcp0001.us-east4.astronomer.io -u _ -p $${SERVICE_ACCOUNT_KEY}
    - docker push registry.gcp0001.us-east4.astronomer.io/infrared-photon-7780/airflow:CI-$CI_PIPELINE_IID
  only:
    - master
```

## AWS Codebuild

```yaml
version: 0.2
phases:
  install:
    runtime-versions:
      python: latest
​
  pre_build:
    commands:
      - echo Logging in to dockerhub ...
      - docker login "registry.$BASE_DOMAIN" -u _ -p "$API_KEY_SECRET"
      - export GIT_VERSION="$(git rev-parse --short HEAD)"
      - echo "GIT_VERSION = $GIT_VERSION"
      - pip install -r requirements.txt
​
  build:
    commands:
      - docker build -t "registry.$BASE_DOMAIN/$RELEASE_NAME/airflow:ci-$GIT_VERSION" .
      - docker push "registry.$BASE_DOMAIN/$RELEASE_NAME/airflow:ci-$GIT_VERSION"
```

## GitHub Actions CI/CD

GitHub supports a growing set of native CI/CD features in ["GitHub Actions"](https://github.com/features/actions), including a "Publish Docker" action that works well with Astronomer.

This setup assumes your Astronomer repo on Github consists of one `dev` branch and one `master` branch. You will have to modify the Github Action slightly if you have a different branch architecture.

Once you've [created a Service Account](/docs/cloud/stable/deploy/ci-cd#create-a-service-account), add the Service Account as a secret to your Github repository as described in GitHub's [Encrypted Secrets](https://docs.github.com/en/actions/reference/encrypted-secrets) document. In this setup, the secret is named `SERVICE_ACCOUNT_KEY`.

Then, create a new action in your repo at `.github/workflows/main.yml` with the following configuration:

```yaml
name: CI
on:
  push:
    branch: [dev, master]
jobs:
  dev-push:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - name: Push to registry
      uses: elgohr/Publish-Docker-Github-Action@2.6
      if: github.ref == 'refs/heads/dev'
      with:
          name: ds-dev1/airflow:ci-${{ github.sha }}
          username: _
          password: ${{ secrets.SERVICE_ACCOUNT_KEY }}
          registry: registry.astro.astronomerdemo.com
  prod-push:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - name: Push to registry
      uses: elgohr/Publish-Docker-Github-Action@2.6
      if: github.ref == 'refs/heads/master'
      with:
          name: ds-prd1/airflow:ci-${{ github.sha }}
          username: _
          password: ${{ secrets.SERVICE_ACCOUNT_KEY }}
          registry: registry.astro.astronomerdemo.com
```

Ensure the branches match the names of the branches in your repository, and replace `ds-dev1` and `ds-prd1` with the release names of your development and production Airflow Deployments, respectively.

>**Note:** Note: The `prod-push` action will run on any push to the `master` branch, including a pull request and merge from the `dev` branch as recommended.
>
>To further restrict this to run only on a pull request, you can limit whether your users can push directly to the `master` branch within your repository or your CI tool, or you could modify the action to make it more limited.

## Azure DevOps

This example uses [Azure Key Vault](https://azure.microsoft.com/en-us/services/key-vault/) to store secrets as variable groups that are then made available to the CI/CD pipeline running on [Azure Devops](https://azure.microsoft.com/en-us/services/devops/).

```yaml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

variables:
- group: Variable-Group
- group: Key-Vault-Group
steps:
- script: |
    echo "Building container.."
    docker build -t registry.gcp0001.us-east4.astronomer.io/extraterrestrial-aperature-9667/airflow:$CI_PIPELINE_ID .
    docker login registry.gcp0001.us-east4.astronomer.io -u _ -p $(DEPLOYMENT-SERVICE-ACCOUNT-KEY)
    docker push registry.gcp0001.us-east4.astronomer.io/extraterrestrial-aperature-9667/airflow:$CI_PIPELINE_ID
```

### Video Tutorial

Check out this video for a full walkthrough of this process:

<iframe width="560" height="315" src="https://www.youtube.com/embed/8h9lXzGa4sQ" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
