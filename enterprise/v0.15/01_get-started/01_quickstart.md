---
title: "Astronomer Enterprise Quickstart"
navTitle: "Quickstart"
description: "A guide to getting started on Astronomer Enterprise."
---

## Getting Started on Astronomer Enterprise

## 1. Start with Astronomer Cloud

At its core, Astronomer Cloud is a large-scale deployment of Astronomer Enterprise that is fully managed by our team. Cloud provides parallel Airflow functionality to Enterprise with just a few differences.

Astronomer Cloud:

- Runs in Astronomer's VPC and uses the public internet, whereas Astronomer Enterprise will run in *your* environment according to your own security settings
- Is billed by usage, whereas Enterprise is billed through an annual license
- Does not give users access to the same monitoring stack

If you want to get a sense of Astronomer Enterprise without going through the installation process, try out Cloud by [starting a 14-Day Trial](/trial/).

## 2. Install Astronomer Enterprise

If you are in charge of setting up Astronomer for your org, head over to our [Enterprise Edition](/docs/enterprise/) section to get Astronomer running on your Kubernetes Cluster.

We have documentation to deploy Astronomer on:
- AWS EKS ([Manually](/docs/enterprise/v0.15/install/aws/install-aws-standard/) or through [Terraform](/docs/enterprise/v0.15/install/aws/install-aws-terraform/))
- [GCP Google Kubernetes Service](/docs/enterprise/v0.15/install/gcp/install-gcp-standard/)
- [Azure Azure Kubernetes Service](/docs/ee-installation-aks/)
- [Digital Ocean Kubernetes](/docs/ee-installation-do/)


## 3. Install the CLI

Run:

```
curl -sSL https://install.astronomer.io | sudo bash

```

**Note:** The `curl` command will work for Unix (Linux+Mac) based systems. If you want to run on Windows 10, you'll need to run through [this guide](/docs/enterprise/v0.15/develop/cli-install-windows-10/) on getting Docker for WSL working.


Let's make sure you have Astro CLI installed on your machine, and that you have a project to work from.

```bash
astro
```

If you're set up properly, you should see the following:

```
astro is a command line interface for working with the Astronomer Platform.

Usage:
astro is a command line interface for working with the Astronomer Platform.

Usage:
  astro [command]

Available Commands:
  auth            Manage astronomer identity
  cluster         Manage Astronomer EE clusters
  completion      Generate autocompletions script for the specified shell (bash or zsh)
  config          Manage astro project configurations
  deploy          Deploy an airflow project
  deployment      Manage airflow deployments
  dev             Manage airflow projects
  help            Help about any command
  upgrade         Check for newer version of Astronomer CLI
  user            Manage astronomer user
  version         Astronomer CLI version
  workspace       Manage Astronomer workspaces

Flags:
  -h, --help   help for astro

Use "astro [command] --help" for more information about a command.
```

### Create a project

Your first step is to create a project to work from that lives in on your local machine.

 ```
mkdir hello-astro && cd hello-astro
astro dev init
 ```

## 3. Find your basedomain and log in

Since Astronomer is running entirely on your infrastructure, it will be located at a subdomain specific to your organization. Most of our customers will deploy something to `airflow.COMPANY.com`. Head to `app.BASEDOMAIN` to log in - you should see a log in in screen:

![Log In](https://assets2.astronomer.io/main/docs/enterprise_quickstart/log_into_astro.png)


**Note** If you are not the first person to log in, you will need an email invite to the platform.

## 4. Authenticate from the CLI

You can authenticate with

```
astro auth login BASEDOMAIN
```

and run through the authentication flow that was set up (most likely be the OAuth flow). You'll be prompted for the workspace that you want to log into - as you are added to more workspaces, there will be more values on this prompt.

The first user to login will become the Admin. Additional users can be added from the Astronomer UI. More information on Astronomer's users and permissions model can be found [here](/docs/enterprise/v0.15/manage-astronomer/manage-platform-users/).

## 5. Create an Airflow deployment

Run through the prompts in the UI to create your first workspace and Airflow deployment.

![ETL Workspace](https://assets2.astronomer.io/main/docs/enterprise_quickstart/etl_workspace.png)


![Dev Deployment](https://assets2.astronomer.io/main/docs/enterprise_quickstart/create_env.png)


![Create Deployment](https://assets2.astronomer.io/main/docs/enterprise_quickstart/create_deployment.png)

Generally, it'll take 1-2 minutes for each environment to spin up.

## 6. Deploy some DAGs

Now there's an Airflow deployment running on your Astronomer installation, you're ready to push code!

### Run Airflow Locally

You can use the Astronomer CLI to get started with a development environment.

Navigate to the `hello-astro` project created before:

```
$ /hello-astro$ ls
airflow_settings.yaml  Dockerfile  packages.txt  requirements.txt
dags                   include     plugins

$ astro dev start
Env file ".env" found. Loading...
Sending build context to Docker daemon  11.26kB
Step 1/1 : FROM astronomerinc/ap-airflow:latest-onbuild
# Executing 5 build triggers
 ---> Using cache
 ---> Using cache
 ---> Using cache
 ---> Using cache
 ---> Using cache
 ---> d6e82b576ce5
Successfully built d6e82b576ce5
Successfully tagged hello-astro_fc483c/airflow:latest
Creating network "helloastrofc483c_airflow" with driver "bridge"
Creating volume "helloastrofc483c_postgres_data" with driver "local"
Creating volume "helloastrofc483c_airflow_logs" with driver "local"
INFO[0015] [0/3] [postgres]: Starting
INFO[0015] [1/3] [postgres]: Started
INFO[0015] [1/3] [scheduler]: Starting
INFO[0016] [2/3] [scheduler]: Started
INFO[0016] [2/3] [webserver]: Starting
INFO[0016] [3/3] [webserver]: Started
Airflow Webserver: http://localhost:8080
Postgres Database: localhost:5432/postgres
The default credentials are admin:admin

```
Navigate to `http://localhost:8080` in the browser to get to Airflow.

![Astronomer Locally](https://assets2.astronomer.io/main/docs/enterprise_quickstart/astronomer_locally.png)

### Deploy Code

The sample dag running from the CLI can now be deployed to Astronomer.

```
$ astro auth login BASEDOMAIN
```
where `BASEDOMAIN` is where your instance is running (Note: use the root base domain, not `app.BASEDOMAIN` or any of the other subdomains generated).

Once authenticated, run:

```
/hello-astro$ astro deploy
Authenticated to democluster.astronomer-trials.com

Select which airflow deployment you want to deploy to:
 #     LABEL     DEPLOYMENT NAME          WORKSPACE     DEPLOYMENT ID
 1     Dev       dynamical-flare-3582     ETLs          ck8g10xxc1zfq0966xlefcpxu

> 1
Deploying: dynamical-flare-3582
dynamical-flare-3582/airflow
Building image...
WARNING! You are about to push an image using the 'latest-onbuild' tag. This is not recommended.
Please use one of the following tags: 1.10.7-alpine3.10-onbuild.
Are you sure you want to continue? (y/n) y
Sending build context to Docker daemon  11.26kB
Step 1/1 : FROM astronomerinc/ap-airflow:latest-onbuild
# Executing 5 build triggers
 ---> Using cache
 ---> Using cache
 ---> Using cache
 ---> Using cache
 ---> Using cache
 ---> d6e82b576ce5
Successfully built d6e82b576ce5
Successfully tagged dynamical-flare-3582/airflow:latest
Pushing image to Astronomer registry
The push refers to repository [registry.democluster.astronomer-trials.com/dynamical-flare-3582/airflow]
e5b0f4e97557: Pushed
e4f165f2c539: Pushed
7ae85d63186e: Pushed
3d6737106ee1: Pushed
cc0e1283f9aa: Pushed
7e57912de03a: Mounted from elementary-rocket-7360/airflow
e1aaa247f09d: Mounted from elementary-rocket-7360/airflow
c33dcb91918f: Mounted from elementary-rocket-7360/airflow
1cb60be4a43a: Mounted from elementary-rocket-7360/airflow
3fc755cc03d0: Mounted from elementary-rocket-7360/airflow
e09740f41293: Mounted from elementary-rocket-7360/airflow
5c858070b896: Mounted from elementary-rocket-7360/airflow
95df7c26d7c5: Mounted from elementary-rocket-7360/airflow
77cae8ab23bf: Mounted from elementary-rocket-7360/airflow
deploy-1: digest: sha256:9e69b7b81efc95c3f024f7656646b523f5b611c1954d52be6dca203c888fc842 size: 3230
Untagged: registry.democluster.astronomer-trials.com/dynamical-flare-3582/airflow:deploy-1
Untagged: registry.democluster.astronomer-trials.com/dynamical-flare-3582/airflow@sha256:9e69b7b81efc95c3f024f7656646b523f5b611c1954d52be6dca203c888fc842
Deploy succeeded!

```

## 7. Naviate to the Deployment you created

You'll be able to view the DAGs in your UI - turn on the `example_dag` to see task runs start accumulating (The Airflow UI is not real time so you'll have to refresh a few times).

## 8. View Metrics

Once the `example_dag` has been turned on, navigate to the `Metrics` tab in the Astronomer UI to see the metrics flow in in real time.

![Metrics](https://assets2.astronomer.io/main/docs/enterprise_quickstart/metrics.png)

## 9. Use the Admin tools

If you are the first user to authenticate into Astronomer, you'll have access to Grafana and Kibana.

![Admin](https://assets2.astronomer.io/main/docs/enterprise_quickstart/admin_panel.png)


These views show logs and metrics (respectively) acosss all deployments running on that deployment of Astronomer. You can set up Kibana with the instructions found [here](/docs/ee-kibana/)


## 10. Start inviting Users

Now that you've run through all of the functionality on Astronomer enterprise, you're ready to start inviting users!

To change the authentication system, naviate to our [Auth Systems](/docs/enterprise/v0.15/manage-astronomer/integrate-auth-system/) doc.
