---
title: "Install Dependencies in a Production Environment"
navTitle: "Install Dependencies"
description: "."
---

## Add Python-level Packages to a Production Environment

To build Python and OS-level packages into a production environment running AC, run the following command on all of your Airflow machines:

```sh
sudo -u astro ~astro/airflow-venv/bin/pip install --extra-index-url=https://pip.astronomer.io/simple/ 'astronomer-certified[<your-dependency>]==1.10.10.*'
```

## Add Python-level Packages to a Local Environment

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

You can confirm that a package was installed by running a `$ docker exec` command into your Scheduler. To do so:

1. Run `$ docker ps` and retrieve the container ID of your Scheduler container.
2. Run the following command:

    ```
    $ docker exec -it <scheduler-container-id> pip freeze | grep <package-name>
    ```

    If the package was successfully installed, you should see the following output:

    ```
    <package-name>==<version>
    ```

## Add Other Dependencies

In the same way you can build Python and OS-level Packages into your image, you can also build additional dependencies and files for your DAGs to use.

In the example below, we'll add a folder of `helper_functions` with a file (or set of files) that our Airflow DAGs can then use.

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

1. Run `$ docker ps` to identify the 3 running docker containers on your machine
2. Grab the container ID of your Scheduler container
3. Run the following:

    ```bash
    docker exec -it <scheduler-container-id> /bin/bash
    bash-4.4$ ls
    Dockerfile  airflow_settings.yaml  helper_functions  logs  plugins  unittests.cfg
    airflow.cfg  dags  include  packages.txt  requirements.txt
    ```

   Notice that the `helper_functions` folder has been built into your image.
