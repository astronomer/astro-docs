---
title: "Install Dependencies in a Production Environment"
navTitle: "Install Dependencies"
description: "."
---

## Overview

By default, the Astronomer Core (AC) image includes several additional third party packages in order to better integrate between applications. For a full list of built in packages, read our image breakdown.

If you want to install additional packages,

## Add Python-level Packages at Production Scale

To build Python and OS-level packages into a production environment running AC, run the following command on all of your Airflow machines:

```sh
sudo -u astro ~astro/airflow-venv/bin/pip install --extra-index-url=https://pip.astronomer.io/simple/ 'astronomer-certified[<your-dependency>]==1.10.10.*'
```

## Add Python-level Packages to a Local Installation

If you installed AC locally using the [Quickstart] and the Astro CLI, you can add Python packages to your `requirements.txt` file and OS-level packages to your `packages.txt` file.

To pin a version of a package, use the following syntax:

```
<package-name>==<version>
```

If you'd like to exclusively use Pymongo 3.7.2, for example, you'd add the following in your `requirements.txt` file:

```
pymongo==3.7.2
```

If you don't pin a package to a version, the latest version of the package that's publicly available will be installed by default.

Once you've saved those packages in your text editor or version control tool, rebuild your image by running:

```sh
$ astro dev stop
```

followed by

```sh
$ astro dev start
```

This process stops your running Docker containers and restarts them with your updated image.

## Confirm a Package Installation

If you run Astronomer Core on Docker, you can confirm that a package was installed by running a `$ docker exec` command into your Scheduler. To do so:

1. Run `$ docker ps` and retrieve the container ID of your Scheduler container.
2. Run the following command:

    ```
    $ docker exec -it <scheduler-container-id> pip freeze | grep <package-name>
    ```

    If the package was successfully installed, you should see the following output:

    ```
    <package-name>==<version>
    ```

## Build Other Dependencies into an Image

In the same way you can build Python and OS-level Packages into your image, you can also build additional dependencies and files for your DAGs to use.

In the example below, we'll add a folder of `helper_functions` with a file (or set of files) that our Airflow DAGs can then use.

### Local scale

1. Add the folder into your project directory

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

2. Rebuild your image by running:

   ```sh
   $ astro dev stop
   ```

   followed by:

   ```sh
   $ astro dev start
   ```

To confirm the files were successfully installed:

1. Run `$ docker ps` to identify the 3 running docker containers on your machine.

2. Grab the container ID of your Scheduler container.

3. Run the following:

    ```bash
    docker exec -it <scheduler-container-id> /bin/bash
    bash-4.4$ ls
    Dockerfile  airflow_settings.yaml  helper_functions  logs  plugins  unittests.cfg
    airflow.cfg  dags  include  packages.txt  requirements.txt
    ```

  Notice that the `helper_functions` folder has been built into your image.


### Production scale

Adding other dependencies at a production scale requires more thoroughly connecting the dependencies to your DAGs.

We recommend creating a new `common` folder in your DAG repository that includes all DAG-level dependencies and an `init` file to import functions from the dependencies. That structure might look something like this:

```bash
.
├── dags
│   └── common
│       └──__init__.py
│       └──helper1.py
│       └──helper2.py
│   └── project1
│       └──dag1.py
│   └── project2
│       └──dag2.py
```

You then have to import the functions in your helper method within the code for your DAGs.
