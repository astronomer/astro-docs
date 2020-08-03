---
title: "Customize your Airflow Image on Astronomer"
navTitle: "Customize Images"
description: "How to customize your Airflow Image on Astronomer, including guidance on adding dependencies and running commands on build."
---

## Overview

The Astronomer CLI was built to be the easiest way to develop with Apache Airflow, whether you're developing on your local machine or deploying code to Astronomer. The guidelines below will cover a few ways you can customize the Docker Image that gets pushed up to Airflow every time you rebuild your image locally via `$ astro dev start` or deploy to Astronomer via `$ astro deploy`.

More specifically, this doc includes instructions for how to:

- Add Python and OS-level Packages
- Add Helper Functions
- Run commands on Build
- Access the Airflow CLI
- Add Environment Variables Locally
- Build from a Private Repository

> **Note:** The guidelines below assume that you've initialized a project on Astronomer via `$ astro dev init`. If you haven't done so already, refer to our ["CLI Quickstart" doc](https://www.astronomer.io/docs/cli-quickstart/).

## Add Python and OS-level Packages

To build Python and OS-level packages into your Airflow Deployment, add them to your `requirements.txt` and `packages.txt` files on Astronomer. Both files were automatically generated when you intialized an Airflow project locally via `$ astro dev init`. Steps below.

### Add your Python or OS-Level Package

Add all Python packages to your `requirements.txt` and any OS-level packages you'd like to include to your `packages.txt` file.

To pin a version of that package, use the following syntax:

```
<package-name>=<version>
```

If you'd like to exclusively use Pymongo 3.7.2, for example, you'd add the following in your `requirements.txt`:

```
pymongo=3.7.2
```

If you do _not_ pin a package to a version, the latest version of the package that's publicly available will be installed by default.

### Rebuild your Image

Once you've saved those packages in your text editor or version control tool, rebuild your image by running:

```
$ astro dev stop
```

followed by

```
$ astro dev start
```

This process stops your running Docker containers and restarts them with your updated image.

### Confirm your Package was Installed (_Optional_)

If you added `pymongo` to your `requirements.txt` file, for example, you can confirm that it was properly installed by running a `$ docker exec` command into your Scheduler.

1. Run `$ docker ps` to identify the 3 running docker containers on your machine
2. Grab the container ID of your Scheduler container
3. Run the following:

```
$ docker exec -it <scheduler-container-id> pip freeze | grep pymongo

pymongo==3.7.2
```

> **Note:** Astronomer Certified, Astronomer's distribution of Apache Airflow, is available both as a Debian and Alpine base. We strongly recommend using Debian, as it's much easier to install dependencies and often presents less incompatability issues than an Alpine Linux image. For details on both, refer to our [Airflow Versioning Doc](www.astronomer.io/docs/airflow-versioning).

## Add Helper Functions

In the same way you can add Python and OS-level Packages into existing files, you're free to add a folder of `helper_functions` (or any other files for your DAGs to use) to build into your image.

To do so, follow the guidelines below.

### Add the folder into your project directory

```bash
virajparekh@orbiter:~/cli_tutorial$ tree
.
├── airflow_settings.yaml
├── dags
│   └── example-dag.py
├── Dockerfile
├── helper_functions
│   └── helper.py
├── include
├── packages.txt
├── plugins
│   └── example-plugin.py
└── requirements.txt
```

### Rebuild your Images

Follow the instructions in the "Rebuild your Image" section above.

### Confirm your files were added (_Optional_)

Similar to the `pymongo` example above, you can confirm that `helper.py` was properly built into your image by running a `$ docker exec` command into your Scheduler.

1. Run `$ docker ps` to identify the 3 running docker containers on your machine
2. Grab the container ID of your Scheduler container
3. Run the following:

```bash
docker exec -it <scheduler-container-id> /bin/bash
bash-4.4$ ls
Dockerfile  airflow_settings.yaml  helper_functions  logs  plugins  unittests.cfg
airflow.cfg  dags  include  packages.txt  requirements.txt
```

Notice that `helper_functions` folder has been built into your image.

## Run Commands on Build

If you're interested in running any extra commands when your Airflow Image builds, it can be added to your `Dockerfile` as a `RUN` command. These will run as the last step in the image build process.

For example, if you wanted to run `ls` when your image builds, your `Dockerfile` would look like this:

```
FROM astronomerinc/ap-airflow:0.8.2-1.10.3-onbuild
RUN ls
```

## Access to the Airflow CLI

You're free to use native Airflow CLI commands on Astronomer when developing locally by wrapping them around docker commands.

To add a connection, for example, you can run:

```bash
docker exec -it SCHEDULER_CONTAINER bash -c "airflow connections -a --conn_id test_three  --conn_type ' ' --conn_login etl --conn_password pw --conn_extra {"account":"blah"}"
```

Refer to the native [Airflow CLI](https://airflow.apache.org/cli.html) for a list of all commands.

> **Note:** Direct access to the Airflow CLI is an Enterprise-only feature. If you're an Astronomer Cloud customer, you'll only be able to access it while developing locally for reasons related to the multi-tenant architecture of our Cloud. If you'd like to use a particular Airflow CLI command, reach out and we're happy to help you find a workaround.

## Add Environment Variables Locally

The Astronomer CLI comes with the ability to  bring in Environment Variables from a specified file by running `$ astro dev start` with an `--env` flag as seen below:

```
$ astro dev start --env .env
```

> **Note:** This feature is limited to local development only. Whatever `.env` you use locally will _not_ be bundled up when you deploy to Astronomer.
>
> For more detail on how to add Environment Variables both locally and on Astronomer, refer to our [Environment Variables doc](www.astronomer.io/docs/environment-variables).

## Build from a Private Repository

If you're interested in bringing in custom Python Packages stored in a Private GitHub Repo, you're free to do that on Astronomer.

Read below for guidelines.

## Pre-Requisites

- The Astronomer CLI
- An intialized Astronomer Airflow project and corresponding directory
- An [SSH Key](https://help.github.com/en/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) to your Private GitHub Repo

If you haven't initialized an Airflow Project on Astronomer (by running `$ astro dev init`), reference our [CLI Quickstart Guide](https://www.astronomer.io/docs/cli-quickstart/).

## Building your Image

### Create a file called `Dockerfile.build`

1. In your directory, create a file called `Dockerfile.build` that's parallel to your `Dockerfile`.

2. To the first line of that file, add a "FROM" statement that specifies the Airflow Image you want to run on Astronomer and ends with `AS stage`.

If you're running the Alpine-based, Airflow 1.10.10 Astronomer Certified image, this would be:

```
FROM astronomerinc/ap-airflow:1.10.10-alpine3.10 AS stage1
```

For a list of all Airflow Images supported on Astronomer, refer to our ["Airflow Versioning" doc](https://www.astronomer.io/docs/airflow-versioning/).

> **Note:**  Do NOT include `on-build` at the end of your Airflow Image as you typically would in your Dockerfile.

3. Immediately below the `FROM...` line specified above, add the folllowing:

```
LABEL maintainer="Astronomer <humans@astronomer.io>"
ARG BUILD_NUMBER=-1
LABEL io.astronomer.docker=true
LABEL io.astronomer.docker.build.number=$BUILD_NUMBER
LABEL io.astronomer.docker.airflow.onbuild=true
# Install Python and OS-Level Packages
COPY packages.txt .
RUN cat packages.txt | xargs apk add --no-cache

FROM stage1 AS stage2
RUN mkdir -p /root/.ssh
ARG PRIVATE_RSA_KEY=""
ENV PRIVATE_RSA_KEY=${PRIVATE_RSA_KEY}
RUN echo "${PRIVATE_RSA_KEY}" >> /root/.ssh/id_rsa
RUN chmod 600 /root/.ssh/id_rsa
RUN apk update && apk add openssh-client
RUN ssh-keyscan -H github.com >> /root/.ssh/known_hosts
# Install Python Packages
COPY requirements.txt .
RUN pip install --no-cache-dir -q -r requirements.txt

FROM stage1 AS stage3
# Copy requirements directory
COPY --from=stage2 /usr/lib/python3.6/site-packages/ /usr/lib/python3.6/site-packages/
ONBUILD COPY . .
```

In 3 stages, this file is bundling up your SSH keys, OS-Level packages in `packages.txt` and Python Packages in `requirements.txt` from your private directory into a Docker image.

A few notes:
- The `Private RSA Key` = [SSH Key generated via GitHub](https://help.github.com/en/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)
- Make sure to replace the first line of this file (`FROM`..) with your Airflow Image (Step 2 above)
- If you don't want keys in this file to be pushed back up to your GitHub repo, consider adding this file to `.gitignore`
- Make sure your custom OS-Level packages are in `packages.txt` and your Python packages in `requirements.txt` within your repo
- If you're running Python 3.7 on your machine, replace the reference to Python 3.6 under `## # Copy requirements directory` with `/usr/lib/python3.7/site-packages/` above

### 2. Build your Image

Now, let's build a Docker image based on the requirements above that we'll then reference in your Dockerfile, tag, and push to Astronomer.

Run the following in your terminal:

```
$ docker build -f Dockerfile.build --build-arg PRIVATE_RSA_KEY="$(cat ~/.ssh/id_rsa)" -t custom-<airflow-image> .
```

If you have `astronomerinc/ap-airflow:1.10.10-alpine3.10` in your `Dockerfile.build`, for example, this command would be:

```
$ docker build -f Dockerfile.build --build-arg PRIVATE_RSA_KEY="$(cat ~/.ssh/id_rsa)" -t custom-ap-airflow:1.10.10-alpine3.10 .
```

### 3. Replace your Dockerfile

Now that we've built your custom image, let's reference that custom image in your `Dockerfile`. Replace the current contents of your `Dockerfile` with the following:

```
FROM custom-<airflow-image>
```

If you're running `astronomerinc/ap-airflow:1.10.10-alpine3.10` as specified above, this line would read:

```
FROM custom-ap-airflow:1.10.10-alpine3.10
```

### 4. Push your Custom Image to Astronomer

Now, let's push your new image to Astronomer.

- If you're developing locally, run `$ astro dev stop` > `$ astro dev start`
- If you're pushing up to Astronomer, you're free to deploy by running `$ astro deploy` or by triggering your CI/CD pipeline

For more detail on the Astronomer deployment process, refer to our [Code Deployment doc](https://www.astronomer.io/docs/create-deployment-deploying-code/).