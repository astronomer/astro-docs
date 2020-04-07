---
title: "CLI Installation"
description: "How to install the Astronomer CLI."
date: 2018-10-12T00:00:00.000Z
slug: "cli-installation"
---

The Astronomer CLI provides a local and dockerized version of Apache Airflow to use while writing your DAGs. Even if you're not using Astronomer, our CLI is an easy way to use Apache Airflow on your local machine.

## Prerequisites

To install the CLI, make sure you have the following on your machine:

- [Docker](https://www.docker.com/)

## Install

### Latest Version

For the most recent version of our CLI, run the following command.

Via `curl`:

  ```bash
   curl -sSL https://install.astronomer.io | sudo bash
   ```

### Previous Versions

If you'd like to install a previous version of our CLI

Via `curl`:
   ```bash
    curl -sSL https://install.astronomer.io | sudo bash -s -- [TAGNAME]
   ```

To install CLI v0.7.5, for example, run:
   ```
curl -sSL https://install.astronomer.io | sudo bash -s -- v0.7.5-2
   ```

**Note:** If you get a mkdir error while going through the install, please download and run the [godownloader](https://raw.githubusercontent.com/astronomer/astro-cli/master/godownloader.sh) script locally.

    cat godownloader.sh | bash -s -- -b /usr/local/bin

## Alternative Option for Install
If you would rather not provide root access to the install script, you can alternatively install the CLI by downloading the relevant version [here](https://github.com/astronomer/astro-cli/tags). Click into the version and scroll down to the `Assets` section of the corresponding release page. Click on the CLI version corresponding to your local machine (e.g. `astro_0.7.5_linux_386.tar.gz`) and unzip the `.tar.gz` that downloads. Place it in a location that ensures it will not be deleted and add an alias to the `astro` binary or quick access.

```
alias astro-='~/astro-cli-0.7.5/astro'
```

## Windows 10

If you're interested in running the Astronomer CLI on the Windows 10 subsystem for Linux, [check out this doc](https://astronomer.io/docs/cli-installation-windows-10).

## Build from Source
To build from source, navigate to your `GOPATH` and `git clone https://github.com/astronomer/astro-cli.git`. If you don't already have `go` installed, install it now by following the [instructions](https://golang.org/doc/install) relevant to your local machine.

Once you have `go` installed, issue `make build` from the main directory (the one with `Makefile` in it). You will  see a message like the following:
```
go build -o astro -ldflags "-X github.com/astronomer/astro-cli/version.CurrVersion=SNAPSHOT-2571362  -X github.com/astronomer/astro-cli/version.CurrCommit=2571362770b7540ec5d37382d03c176f9e25cc41" main.go
```
Check that there is now a `astro` binary in the directory. If there is, the build was successful. If there are any errors, the build will fail to compile.

Alias the location of this local build for quick access.
```
export GOPATH=${HOME}/go
alias astro-local=${GOPATH}/src/github.com/astronomer/astro-cli/astro
```
