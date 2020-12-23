---
title: "Upgrade Airflow Versions on Astronomer"
navTitle: "Upgrade Airflow"
description: "How to adjust and upgrade Airflow versions on Astronomer."
---

## Overview

On Astronomer, the process of pushing up your code to an individual Airflow Deployment involves customizing a locally built Docker image —— with your DAG code, Python Packages, plugins, and so on —— that's then bundled, tagged, and pushed to Astronomer Cloud's Docker Registry.

Included in that build is your `Dockerfile`, a file that is automatically generated when you initialize an Airflow project on Astronomer via our CLI. Every successful build on Astronomer must include a `Dockerfile` that references an Astronomer Certified Docker Image. Astronomer Certified (AC) is a production-ready distribution of Apache Airflow that mirrors the open source project and undergoes additional levels of rigorous testing conducted by our team.

To upgrade your Airflow Deployment to a higher version of Airflow, there are three steps:

1. Initialize the upgrade by selecting a new Airflow version via the Astronomer UI or CLI
2. Change the FROM statement in your project's Dockerfile to reference an AC image that corresponds to the Airflow version indicated in Step 1
3. Deploy to Astronomer

Read below for details.

> **Note:** For more thorough guidelines on customizing your image, reference our ["Customize Your Image" doc](/docs/cloud/stable/develop/customize-image/).

## Available Astronomer Certified Versions

Astronomer Certified offers support for the following versions of Apache Airflow:

- [Airflow 2.0.0](https://airflow.apache.org/blog/airflow-two-point-oh-is-here/)
- [Airflow 1.10.14](https://github.com/apache/airflow/releases/tag/1.10.14)
- [Airflow 1.10.12](https://airflow.apache.org/blog/airflow-1.10.12/)
- [Airflow 1.10.10](https://airflow.apache.org/blog/airflow-1.10.10/)
- [Airflow 1.10.7](https://github.com/apache/airflow/releases/tag/1.10.7)
- [Airflow 1.10.5](https://github.com/apache/airflow/releases/tag/1.10.5)

## Step 1. Initialize the Upgrade Process

The first step to upgrading your Deployment to a higher version of Apache Airflow is to indicate your intent to do so via the Astronomer UI or CLI.

> **Note:** The Astronomer UI and CLI will only make available versions of Airflow that are _higher_ than the version you're currently running in your `Dockerfile`. For example, Airflow `1.10.7` would not be available for an Airflow Deployment running `1.10.10`.

### via the Astronomer UI

To initialize the Airflow upgrade process via the Astronomer UI, navigate to **Deployment** > **Settings** > **Basics** > **Airflow Version**. Next to **Airflow Version**,

1. Select your desired version of Airflow
2. Click **Upgrade**

![Airflow Upgrade via Astronomer UI](https://assets2.astronomer.io/main/docs/manage-airflow-versions/airflow-upgrade-astro-ui.gif)

This action will NOT interrupt or otherwise impact your Airflow Deployment or trigger a code change - it is simply a signal to our platform that you _intend_ to upgrade such that we can guide your experience through the rest of the process.

Once you select a version, you can expect to see a banner next to **Airflow Version** indicating that the upgrade is in progress. For a user upgrading from 1.10.7 to 1.10.12, that banner would read `Upgrade from 1.10.7 to 1.10.12 in progress…`

> **Note:** If you'd like to change the version of Airflow you'd like to upgrade to, you can do so at anytime by clicking **Cancel**, re-selecting a new version and once again clicking **Upgrade**. More on that below.

### via the Astronomer CLI

To initialize the Airflow upgrade process via the Astronomer CLI, first make sure you're authenticated by running `$ astro auth login gcp0001.us-east4.astronomer.io`.

Once authenticated, grab the `Deployment ID` of the Airflow Deployment you'd like to upgrade by running:

```
$ astro deployment list
```

You can expect the following output:

```
astro deployment list
 NAME                                            DEPLOYMENT NAME                 DEPLOYMENT ID                 AIRFLOW VERSION
 new-deployment-1-10-10-airflow-k8s-2            elementary-rotation-5522        ckgwdq8cs037169xtbt2rtu15     1.10.12
```

With that `Deployment ID`, run:

```
$ astro deployment airflow upgrade --deployment-id=<deployment-id>
```

This command will output a list of available versions of Airflow you can choose from and prompt you to pick one. For example, a user upgrading from Airflow 1.10.5 to Airflow 1.10.12 should see the following:

```
astro deployment airflow upgrade --deployment-id=ckguogf6x0685ewxtebr4v04x
#     AIRFLOW VERSION
1     1.10.7
2     1.10.10
3     1.10.12

> 3
 NAME                  DEPLOYMENT NAME       ASTRO       DEPLOYMENT ID                 AIRFLOW VERSION
 Astronomer Stagings   new-velocity-8501     v0.17.0     ckguogf6x0685ewxtebr4v04x     1.10.12

The upgrade from Airflow 1.10.5 to 1.10.12 has been started. To complete this process, add an Airflow 1.10.12 image to your Dockerfile and deploy to Astronomer.
```

As noted above, this action will NOT interrupt or otherwise impact your Airflow Deployment or trigger a code change - it is simply a signal to our platform that you _intend_ to upgrade such that we can guide your experience through the rest of the process.

To complete the upgrade, all you have to do is add a corresponding AC image to your Dockerfile.

## Step 2: Deploy a New Astronomer Certified Image

### 1. Locate your Dockerfile in your Project Directory

First, open the `Dockerfile` within your Astronomer directory. When you initialized an Airflow project via the Astronomer CLI, the following files should have been automatially generated:

```
.
├── dags # Where your DAGs go
│   ├── example-dag.py # An example dag that comes with the initialized project
├── Dockerfile # For Astronomer's Docker image and runtime overrides
├── include # For any other files you'd like to include
├── packages.txt # For OS-level packages
├── plugins # For any custom or community Airflow plugins
└── requirements.txt # For any Python packages
```

Depending on the OS distribution and version of Airflow you want to run, you'll want to reference the corresponding Astronomer Certified image in the FROM statement of your Dockerfile.

### 2. Choose your new Astronomer Certified Image

Below you'll find a matrix of all Astronomer Certified images supported on Astronomer. Depending on the Airflow version you'd like to run or upgrade to, copy one of the images below to your `Dockerfile` and proceed to Step 3.

Once you upgrade Airflow versions, you CANNOT downgrade to an earlier version. The Airflow metadata database structurally changes with each release, making for backwards incompatibility across versions.

For our platform's full collection of Docker Images, reference [Astronomer on Quay.io](https://quay.io/repository/astronomer/ap-airflow?tab=tags). For more information on Alpine and Debian as distinct system distributions, read the "Migrate from Alpine to Debian" section below.

| Airflow Version                                                                       | Debian-based Image                                        | Alpine-based Image                                            |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------- |
| [v1.10.5](https://github.com/astronomer/ap-airflow/blob/master/1.10.5/CHANGELOG.md)   | FROM quay.io/astronomer/ap-airflow:1.10.5-buster-onbuild  | FROM quay.io/astronomer/ap-airflow:1.10.5-alpine3.10-onbuild  |
| [v1.10.7](https://github.com/astronomer/ap-airflow/blob/master/1.10.7/CHANGELOG.md)   | FROM quay.io/astronomer/ap-airflow:1.10.7-buster-onbuild  | FROM quay.io/astronomer/ap-airflow:1.10.7-alpine3.10-onbuild  |
| [v1.10.10](https://github.com/astronomer/ap-airflow/blob/master/1.10.10/CHANGELOG.md) | FROM quay.io/astronomer/ap-airflow:1.10.10-buster-onbuild | FROM quay.io/astronomer/ap-airflow:1.10.10-alpine3.10-onbuild |
| [v1.10.12](https://github.com/astronomer/ap-airflow/blob/master/1.10.12/CHANGELOG.md) | FROM quay.io/astronomer/ap-airflow:1.10.12-buster-onbuild | FROM quay.io/astronomer/ap-airflow:1.10.12-alpine3.10-onbuild  |
| [v1.10.14](https://github.com/astronomer/ap-airflow/blob/master/1.10.14/CHANGELOG.md) | FROM quay.io/astronomer/ap-airflow:1.10.14-buster-onbuild | N/A                                                           |
| [v2.0.0](https://github.com/astronomer/ap-airflow/blob/master/2.0.0/CHANGELOG.md)     | FROM quay.io/astronomer/ap-airflow:2.0.0-buster-onbuild   | N/A                                                           |

> **Note:** We recently migrated from [DockerHub](https://hub.docker.com/r/astronomerinc/ap-airflow) to Quay.io as our Docker Registry due to a [recent change](https://www.docker.com/blog/what-you-need-to-know-about-upcoming-docker-hub-rate-limiting/) in DockerHub's rate limit policy. If you're using a legacy `astronomerinc/ap-airflow` image, replace it with a corresponding `quay.io/astronomer` image to avoid rate limiting errors from DockerHub when you deploy to Astronomer (e.g. `toomanyrequests: You have reached your pull rate limit`).

## Step 3: Rebuild your Image

### Local Development

If you're developing locally, make sure to save your changes and issue the following from your command line:

1. `$ astro dev stop`

   This will stop all 3 running Docker containers for each of the necessary Airflow components (Webserver, Scheduler, Postgres).

2. `$ astro dev start`

   This will start those 3 Docker containers needed to run Airflow.

### On Astronomer

Once you're ready to push to Astronomer Cloud, you can issue:

```bash
$ astro deploy
```

This will bundle your updated directory, re-build your image and push it to your remote Airflow deployment on Astronomer.

## Step 4: Confirm your version in the Airflow UI

Once you've issued that command, navigate to your Airflow UI to confirm that you're now running the correct Airflow version.

### Local Development

If you're developing locally, you can:

1. Head to http://localhost:8080/
2. Navigate to `About` > `Version`

Once there, you should see your correct Airflow version listed.

> **Note:** The URL listed above assumes your Webserver is at Port 8080 (default). To change that default, read [this forum post](https://forum.astronomer.io/t/i-already-have-the-ports-that-the-cli-is-trying-to-use-8080-5432-occupied-can-i-change-the-ports-when-starting-a-project/48).

### On Astronomer

If you're on Astronomer Cloud, navigate to your Airflow Deployment via Astronomer and navigate to **About** > **Version**.

![Verify Airflow Version in Airflow UI](https://assets2.astronomer.io/main/docs/manage-airflow-versions/airflow-ui-version.png)

> **Note:** In Airflow 2.0, the **Version** page referenced above will be deprecated. Check the footer of the Airflow UI to validate Airflow version instead.

## Migrate from Alpine to Debian

Astronomer exclusively builds [Debian Buster](https://www.debian.org/) Docker images, though we support [Alpine Linux](https://alpinelinux.org/) images for AC versions 1.10.5 - 1.10.12.

In an effort to standardize our offering and optimize for reliability, Debian Buster proved most suitable to handle complex dependencies and integrate well with Machine Learning Python Liberaries that are commonly used with Airflow.

Aside from the initial Docker image build and deploy process, both base images offer the exact same Apache Airflow experience. For best practices on migrating from Alpine to Debian, read below.

### Before you Begin

To avoid unexpected impact to your Airflow Deployment, we strongly recommend two things:

1. Do not upgrade Airflow versions simultaneously.
2. Test your changes locally before you push a new image to Astronomer.

If you're runnning an Alpine-based 1.10.12 image, for example, try the Debian-based AC 1.10.12 image locally *before* you push that image to Astronomer and before you upgrade to a higher version of Airflow.

> **Note:** If your `packages.txt` and `requirements.txt` files are empty, skip to step 3.

### Step 1. Remove Packages.

Debian Buster has many common packages installed by default, which means that you should be able to remove some dependencies.

If you have any Python packages installed primarily *because* they're native to another library  (e.g. `pandas`, `numpy`, `pyarrow`, `scipy`, `sci-kit learn`), we recommend that you remove those additional packages from your `requirements.txt` or `packages.txt` files and see if your image builds successfully.

If you test a Debian-based image and encounter an error, you can always add packages back as needed.

### Step 2. Rename Existing Packages.

For the dependencies you *do* have installed, a primary concern in migrating from Alpine to Debian is that Python and OS-level packages may be named differently.

To identify a difference in package names, refer to [Debian Buster Packages](https://packages.debian.org/stable/) and [Alpine Linux Packages](https://pkgs.alpinelinux.org/packages) for a full breakdown of both collections.

Modify your `requirements.txt` and `packages.txt` files as needed.

### Step 3. Modify your Dockerfile.

Now, try to build your Debian-based image via the Astronomer CLI locally. To do so, replace the Alpine image in your `Dockerfile` with an available Debian Image.

For AC 1.10.12, you would replace:

```
FROM quay.io/astronomer/ap-airflow:1.10.12-alpine3.10-onbuild
```

with:

```
FROM quay.io/astronomer/ap-airflow:1.10.12-buster-onbuild
```

For all available images, refer to the matrix above or the [Astronomer Docker Registry](https://quay.io/repository/astronomer/ap-airflow?tab=tags).

### Step 4. Test your Image Locally.

Now, test your new change locally via the Astronomer CLI by running:

1. `$ astro dev stop`, then
2. `$ astro dev start`

If your image does not build successfully, it's likely you're missing additional dependencies.

### Step 5. Push to Astronomer.

If your image *does* build successfully, you're ready to push it to Astronomer.

To do so, simply run:

```bash
 $ astro deploy
 ```

## Cancel Airflow Upgrade Initialization

If you begin the upgrade process for your Airflow Deployment and would like to cancel it, you can do so at any time either via the Astronomer UI or CLI as long as you have NOT changed the Astronomer Certified Image in your Dockerfile and deployed it.

Via the Astronomer UI, select **Cancel** next to **Airflow Version**.

![Cancel Airflow Upgrade via Astronomer UI](https://assets2.astronomer.io/main/docs/manage-airflow-versions/airflow-upgrade-astro-ui-cancel.gif)

Via the Astronomer CLI, run:

```
$ astro deployment airflow upgrade --cancel --deployment-id=<deployment-id>
```

For example, if a user cancels an initialized upgrade from Airflow 1.10.7 to Airflow 1.10.12 via the CLI, they would see the following:

```bash
$ astro deployment airflow upgrade --cancel --deployment-id=ckguogf6x0685ewxtebr4v04x

Airflow upgrade process has been successfully canceled. Your Deployment was not interrupted and you are still running Airflow 1.10.7.
```

Canceling the Airflow upgrade process will NOT interrupt or otherwise impact your Airflow Deployment or code that's running with it. To re-initialize an upgrade, follow the steps above.

## Patch Versions of Astronomer Certified

In addition to supporting the latest versions of open source Airflow on Astronomer Certified (AC), our team regularly ships bug and security fixes to AC images as _patch_ releases.

For example, Astronomer Certified 1.10.10 has been enhanced with 4 additional patches since its initial release:

- 1.10.10-2
- 1.10.10-3
- 1.10.10-4 etc.

All generally available patch releases are listed in a corresponding changelog, which specifies the date the patch was released and all individual changes made to it. Bugs that are reported by the wider Airflow community are often backported by our team and made available prior to the subsequent open source release.

### Upgrade to an AC Patch Version

To upgrade to the latest patch version of Astronomer Certified, replace the image referenced in your `Dockerfile` with a pinned version that specifies a particular patch.

If you're looking for the latest Astronomer Certified 1.10.10, for example, you would:

1. Check the AC [1.10.10 Changelog](https://github.com/astronomer/ap-airflow/blob/master/1.10.10/CHANGELOG.md)
2. Identify the latest patch (e.g. `1.10.10-5`)
3. Pin the Astronomer Certified Image in your Dockerfile to that patch version

In this case, that would be: `FROM quay.io/astronomer/ap-airflow:1.10.10-5-buster-onbuild` (Debian).

> **Note:** If you're pushing code to an Airflow Deployment via the Astronomer CLI and install a new Astronomer Certified image for the first time _without_ pinning a specific patch, the latest version available will automatically be pulled.
>
> If a patch release becomes available _after_ you've already built an Astronomer Certified image for the first time, subsequent code pushes will _not_ automatically pull the latest corresponding patch. You must follow the process above to pin your image to a particular version.
