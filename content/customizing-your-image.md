---
title: "Image Customization"
description: "Customize your Docker image by running commands on build, adding dependencies, or bringing in Environment Variables."
date: 2018-07-17T00:00:00.000Z
slug: "customizing-your-image"
---

## Containers and Volumes

Now that you've started running Airflow with the Astro CLI, there will be some Docker images running on your machine with their own mounted volumes.

When going through this doc, keep in mind that the Astro CLI is built on top of Docker Compose.

```
docker ps

CONTAINER ID        IMAGE                                COMMAND                  CREATED             STATUS              PORTS                                        NAMES
b32be577f24d        airflow-code_66a665/airflow:latest   "tini -- /entrypoint…"   4 hours ago         Up About an hour    5555/tcp, 8793/tcp, 0.0.0.0:8080->8080/tcp   airflowcode66a665_webserver_1
28c8a7db90bd        airflow-code_66a665/airflow:latest   "tini -- /entrypoint…"   4 hours ago         Up About an hour    5555/tcp, 8080/tcp, 8793/tcp                 airflowcode66a665_scheduler_1
c572fe53093e        postgres:10.1-alpine                 "docker-entrypoint.s…"   4 hours ago         Up About an hour    0.0.0.0:5432->5432/tcp                       airflowcode66a665_postgres_1
```

These containers will mount volumes for their respective metadata.

```
docker volumes ls

DRIVER              VOLUME NAME
local               airflow6f4ef6_airflow_logs
local               airflow6f4ef6_postgres_data
local               airflowcode66a665_airflow_logs
```

To enter one of these containers:

```
docker exec -it c572fe53093e /bin/bash

bash-4.4$ ls
Dockerfile  airflow.cfg  airflow_settings.yaml  dags  include  logs  packages.txt  plugins  requirements.txt  unittests.cfg
bash-4.4$
```

All default configurations can be found in the [Astronomer CLI repository](https://github.com/astronomer/astro-cli/blob/master/airflow/include/composeyml.go). Any of these settings can be overriden by adding a `docker-compose.override.yml` file in the Astronomer project directory.

For example, adding another volume mount for a directory named `custom_depedencies` can be done with:

```
version: "2"
services:
  scheduler:
    volumes:
      - /home/astronomer_project/custom_depedencies:/usr/local/airflow/custom_depedencies:ro
```

Now when this image is built, changes made to files within the `custom_dependencies` directory will be picked up automatically the same way they are with files in the `dags` directory:

```
$ docker exec -it astronomer_project239673_scheduler_1 ls -al
total 76
drwxr-xr-x    1 astro    astro         4096 Dec 30 17:21 .
drwxr-xr-x    1 root     root          4096 Dec 14  2018 ..
-rw-rw-r--    1 root     root            38 Oct  8 00:07 .dockerignore
-rw-rw-r--    1 root     root            31 Oct  8 00:07 .gitignore
-rw-rw-r--    1 root     root            50 Oct  8 00:10 Dockerfile
-rw-r--r--    1 astro    astro        20770 Dec 30 17:21 airflow.cfg
drwxrwxr-x    2 1000     1000          4096 Oct  8 00:07 dags
-rw-r--r--    1 root     root           153 Dec 30 17:21 docker-compose.override.yml
drwxrwxr-x    2 1000     1000          4096 Oct  8 00:07 include
drwxr-xr-x    4 astro    astro         4096 Oct  8 00:11 logs
drwxr-xr-x    2 1000     1000          4096 Dec 30 17:15 custom_dependencies
-rw-rw-r--    1 root     root             0 Oct  8 00:07 packages.txt
drwxrwxr-x    2 1000     1000          4096 Oct  8 00:07 plugins
-rw-rw-r--    1 root     root             0 Oct  8 00:07 requirements.txt
-rw-r--r--    1 astro    astro         2338 Dec 30 17:21 unittests.cfg
```

**Note:** This will only affect how the image runs locally and will not have any impact on what gets built and deployed. 

### Running Commands on Build

Any extra commands you want to run when the image builds can be added in the `Dockerfile` as a `RUN` command - these will run as the last step in the image build.

For example, suppose I wanted to run `ls` when my image builds. The `Dockerfile` would look like:

```
FROM astronomerinc/ap-airflow:0.8.2-1.10.3-onbuild
RUN ls
```

## Adding Dependencies

Any additional python packages or OS level packages can be added in `requirements.txt` or `packages.txt`. For example, suppose I wanted to add `pymongo` into my Airflow instance.

This can be added to `requirements.txt`, run `astro dev stop` and `astro dev start` to rebuild my image with this new python package. Every package in the `requirements.txt` file will be installed by `pip` when the image builds (`astro dev start`).

```
docker exec -it dff1aaef15cf pip freeze | grep pymongo
pymongo==3.7.2
```
This package is now installed.

A list of default packages included in the Astronomer base image can be found [here](https://forum.astronomer.io/t/which-python-packages-come-default-with-astronomer/38).


**Note:** We run Alpine linux as our base image so you may need to add a few os-level packages in `packages.txt` to get your image to build. You can also "throw the kitchen sink" at it if image size is not a concern:

```
libc-dev
musl
libc6-compat
gcc
python3-dev
build-base
gfortran
freetype-dev
libpng-dev
openblas-dev
gfortran
build-base
g++
make
musl-dev
```

In the same way, you can add a folder of `helper_functions` (or any other files for your DAGs to use) to build into your image. To do so, just add the folder into your project directory and rebuild your image.


```
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

Now going into my scheduler image:

```
docker exec -it c2c7d3bb5bc1 /bin/bash
bash-4.4$ ls
Dockerfile  airflow_settings.yaml  helper_functions  logs  plugins  unittests.cfg
airflow.cfg  dags  include  packages.txt  requirements.txt
```


Notice the `helper_functions` folder has been built into the image.

You can also pass direct Airflow CLI commands into your local image following this pattern:

For example, a connection can be added with:

```bash
docker exec -it SCHEDULER_CONTAINER bash -c "airflow connections -a --conn_id test_three  --conn_type ' ' --conn_login etl --conn_password pw --conn_extra {"account":"blah"}"
```

## Environment Variables

Astronomer's CLI comes with the ability to  bring in Environment Variables from a specified file by running `astro dev start` with an `--env` flag as seen below:

```
astro dev start --env .env
```

**Note**: This feature is currently only functional for local development. Whatever `.env` you use locally will _not_ be bundled up when you deploy to Astronomer. To add Environment Variables when you deploy to Astronomer, you'll have to add them via the Astronomer UI (`Deployment` > `Configure` > `Environment Vars`).

**Guidelines:**

1. Add your Environment Variables of choice in an `.env` file

2. Airflow configuration variables found in [`airflow.cfg`](https://github.com/apache/incubator-airflow/blob/master/airflow/config_templates/default_airflow.cfg) can be overwritten with the following format:

```
AIRFLOW__SECTION__PARAMETER=VALUE
```
For example, setting `max_active_runs` to 3 would look like:

```
AIRFLOW__CORE__MAX_ACTIVE_RUNS=3
```

3. Confirm the Environment Variable configuration names match up with the version of Airflow you're using

4. The CLI will look for `.env` by default, but if you have different settings you need to toggle between and want to specify multiple .env files, you can do following:

```
my_project
  ├── .astro
  └──  dags
    └── my_dag
  ├── plugins
    └── my_plugin
  ├── .env
  ├── dev.env
  └── prod.env
```

 5. On `astro dev start`, just specify which file to use (if not `.env`) with the `--env` or `-e` flag.

 ```
 astro dev start --env dev.envs
 astro dev start -e prod.env
 ```

## CLI Debugging

### Error on Building Image

If your image  is failing to build after running `astro dev start`?

 - You might be getting an error message in your console, or finding that Airflow is not accessible on `localhost:8080/admin`
 - If so, you're likely missing OS-level packages in `packages.txt` that are needed for any python packages specified in `requirements.text`
