---
title: "Using a Private Repository"
navTitle: "Use a Private Repo"
description: "Build a custom Docker image using Python and OS-level packages from a private repository."
---

If you're using Airflow on Astronomer, you might want to use custom Python packages that are stored in a private GitHub repo.

This doc will guide you through adding corresponding secrets to a custom Docker image you'll be ready to build and push to Astronomer via our CLI.

## Pre-Requisites

- The Astronomer CLI
- An intialized Astronomer Airflow project and corresponding directory
- An [SSH Key](https://help.github.com/en/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) to your Private GitHub Repo

If you haven't initialized an Airflow Project on Astronomer (by running `astro dev init`), reference our [CLI Quickstart Guide](https://www.astronomer.io/docs/cli-quickstart/).

## Building your Image

### Create a file called `Dockerfile.build`

1. In your directory, create a file called `Dockerfile.build` that's parallel to your `Dockerfile`.

2. To that file, add the following:

```
FROM astronomerinc/ap-airflow:0.7.5-1.10.2 AS stage1
LABEL maintainer="Astronomer <humans@astronomer.io>"
ARG BUILD_NUMBER=-1
LABEL io.astronomer.docker=true
LABEL io.astronomer.docker.build.number=$BUILD_NUMBER
LABEL io.astronomer.docker.airflow.onbuild=true
# Install OS-Level Packages
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
- Make sure to replace the first line of this file (`FROM`..) with your _current_ Docker image
- If you don't want keys in this file to be pushed back up to your GitHub repo, consider adding this file to `.gitignore`
- Make sure your custom OS-Level packages are in `packages.txt` and your Python packages in `requirements.txt` within your repo

### 2. Build your Image

Now, let's build a Docker image based on the requirements above that we'll then reference in your Dockerfile, tag, and push to Astronomer.

Run the following in your terminal:

```
$ docker build -f Dockerfile.build --build-arg PRIVATE_RSA_KEY="$(cat ~/.ssh/id_rsa)" -t custom-ap-airflow
```

### 3. Replace your Dockerfile

Now that we've built your custom image, let's reference that custom image in your Dockerfile.

Replace the current contents of your Dockerfile with the following:

```
FROM custom-ap-airflow
```

### 4. Push your Custom Image to Astronomer

Now, let's push your new image to Astronomer.

- If you're developing locally, run `astro dev stop` > `astro dev start`

- If you're pushing up to Astronomer Cloud or an Astronomer Enterprise installation, you're free to deploy by running `astro dev deploy` or by triggering a CI/CD pipeline



