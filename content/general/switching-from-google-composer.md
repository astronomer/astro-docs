---
title: "Google Composer Switch Guide"
description: "How to switch from Google Cloud Composer to Astronomer."
date: 2019-04-29T00:00:00.000Z
slug: "switching-from-google-composer"
---

When coming to Astronomer, you may be transitioning a project from Google Cloud Composer. Both tools are similar in ways and different in others. We've put together this guide to make switching as straightforward as possible.

### Creating an Airflow Environment
When provisioning a new Airflow environment in Google Composer, you're asked to provision a number of nodes (minimum 3) and choose their resources and region location. In contrast, Astronomer has a concept of "Astronomer Units", which is a bundling of CPU and Memory that allows fractional uses of full nodes. 10 AUs correspond to the same amount of resources as a single `n1-standard-1` GKE node. Generally, a single deployment of Airflow on Astronomer using the Celery executor is going to require 25 AUs.

### Choosing an Python Version
Because Python 2 is being fully deprecated on Dec 31, 2019, Astronomer strongly discourages use of Python 2 when building your Airflow project. By default all Astronomer deployments are instantiated with a Python 3 base image.

If absolutely necessary, a Python 2 image can be provided on request but please bear in mind that Airflow will be dropping support for Python 2 as of the Airflow 2.0 release and it is highly recommended you transition your code sooner rather than later.

### Starting a New Project
The main method of interaction with the Astronomer Cloud when developing is through the [Astro CLI](https://github.com/astronomer/astro-cli) which also provides a useful environment to develop locally. To start a new project simply create a new project, initialize a new Astronomer project, and then start it up.
```
mkdir new_project
cd new_project
astro dev init
astro dev start
```

### Dags
Similar to Composer, all DAGs in Astronomer should be kept in a `dags` directory, which is created by default when you start a new project with `astro dev init`.

### Plugins
Similar to Composer, all Plugins in Astronomer should be kept in a `plugins` directory, which is created by default when you start a new project with `astro dev init`.

### Include Directory
For anything else that may be required for your DAGs, a `include/` directory is created on `astro dev init` and can be accessed from your DAGs with the path convention `/include/my_custom_directory/my_driver.jar`.

### Pushing New Code
Whereas Composer reads DAGs and Plugins from a GCS bucket while keeping dependencies separate, everything in an Astronomer project is kept together in the various files and directories created with `astro dev init`. When pushing new code to your Astro deployment, whether it is a new dependency or new DAG, the process is the same. Simply `astro dev deploy` from the CLI, authenticate if you need to, and select the appropriate workspace and deployment name. A new image will be built containing all code and dependencies that is then pushed up to the Astronomer Cloud.

### Choosing an Airflow Version
Astronomer offers at least one major version of each Airflow release from 1.9 onwards. But where you would otherwise choose your Airflow version in the Composer UI, you specify it in your Dockerfile when starting a new Astronomer project. For example, a Dockerfile with the following contents will run Airflow 1.9.0.
```
FROM astronomerinc/ap-airflow:0.7.5-1.9.0-onbuild
```
Whereas a project with the following will run Airflow 1.10.1.
```
FROM astronomerinc/ap-airflow:0.7.5-1.10.1-onbuild
```
The version preceeding the Airflow version indicates the version of Astronomer your project is using. Keep your CLI up to date to make you're using the most recent version when starting a new project.

### Environment Variables
Environment variables are entered similarly in Astronomer to Composer with a simple key:value option in the "Config" section of your UI. When developing locally, as of Astronomer v0.8, you also have the option of maintaining multiple `.env` files in your project. For example, if you have production settings you want to test in a `prod.env` file but development settings you want to test in a `dev.env` file, you would specify which variables to be brought in via the `-e` flag.
```
astro dev start -e dev.env
astro dev stop
astro dev start -e prod.env
```

### Airflow Config Variables
In Google Cloud Composer, you need to specify the section, key, and value of the config variable you're looking to set. In Astronomer, these Airflow config variables are treated as ordinary environment variables and added in the same "Config" section of your deployment settings with the added `AIRFLOW__` prefix. For example, if you were looking to add an SMTP server and needed to specify the port, you would add the variable `AIRFLOW__SMTP__SMTP_PORT` and specify the relevant port value. For added convenience, you can just being typing `SMTP_PORT` and the option with the full prefix will appear from a dropdown that you can select.

### Base Image Versions
Both Astronomer and Composer use Kubernetes to manage Airflow deployments. The difference, however, is in the base image that the two are based on. Composer's base image is pre-built and (as of the time of this writing) based on an unknown base image with unknown dependencies.

Astronomer uses an Alpine Linux distribution and is [open-source](https://github.com/astronomer/astronomer/) so everything that goes into it can be viewed. We chose Alpine to keep the base image as small and lean as possible but also offer the option to install additional dependencies from the [Alpine Linux Package Manager](https://pkgs.alpinelinux.org/packages) by simply adding them to the packages.txt file in your Astronomer project.

### Python Packages
Everything you have added to the PyPi packages section of the Composer UI should go in the `requirements.txt` of your Astronomer project with the appropriate version as necessary. For example, if you had matplotlib installed in your Composer project, simply add the following to your `requirements.txt` file.
```
matplotlib
```
And to add a specific version:
```
matplotlib==3.0.3
```
With Astronomer, you can also [specify a Github repo to install a package](https://stackoverflow.com/questions/16584552/how-to-state-in-requirements-txt-a-direct-github-source) from as well as add necessary RSA Keys for [installing from a private Github repo](https://forum.astronomer.io/t/how-do-i-install-something-from-my-orgs-private-github-repo-without-exposing-credentials/45). These keys are kept in a intermediary layer during the build process that is inaccessible after the final image is built.
