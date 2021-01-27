---
title: "Astronomer CLI Reference Guide"
navTitle: "CLI Reference Guide"
description: "A list of every command and setting in the Astronomer CLI."
---

## Overview

Astronomer's [open source CLI](https://github.com/astronomer/astro-cli) is the easiest way to run Apache Airflow on your local machine. From the CLI, you can create a local Apache Airflow instance with a dedicated Webserver, Scheduler and Postgres Database. If you're an Astronomer customer, you can use the Astronomer CLI to create and manage users, Workspaces, Airflow Deployments, Service Accounts, and more.

This document contains information about all commands and settings available in the Astronomer CLI, including examples and flags. It does not contain detailed guidelines on each command, but each section provides resources for additional information in a **Related Documentation** section if it's available.

Additionally, this document does not contain installation instructions for the CLI itself. For installation instructions, see [CLI Quickstart](/docs/enterprise/stable/develop/cli-quickstart).

## astro auth

Authenticates you to Astronomer.

### Usage

Run `$ astro auth <subcommand> <base-domain>` in your terminal to log in or out of your Astronomer platform. This is equivalent to using the login screen of the Astronomer UI.

If you have access to more than one Astronomer platform, you'll have access to multiple `<base-domains>`. When switching between platforms, make sure to log out of one `<base domain>` before logging into another.

### Subcommands

| Subcommand | Usage                                                                                                                                                 |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `login`    | To authenticate to Astronomer Cloud, run `$ astro auth login gcp0001.us-east4.astronomer.io`. For Enterprise, run `$ astro auth login <base-domain>`. |
| `logout`   | After logging in, run `$ astro auth logout` to log out of Astronomer.                                                                                 |

## astro cluster

Allows Astronomer Enterprise users to switch between the Astronomer clusters they have access to.

### Usage

Run `$ astro cluster <subcommand>` in your terminal to see or access available Astronomer clusters.

### Subcommands

| Subcommand | Usage                                                                                                                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `list`     | Run `$ astro cluster list` to retrieve a list of all available clusters.                                                                                                                                                                    |
| `switch`   | Run `$ astro cluster switch` to retrieve a list of available clusters, then enter the ID of the cluster you want to switch to. Once that command is successful, authenticate to that cluster by running `$ astro auth login <base-domain>`. |

## astro completion

Generates autocompletion scripts for Astronomer.

### Usage

Use `$ astro completion <subcommand>` to generate autocompletion scripts for Astronomer.

Note that MacOS users need to install [Bash Completion](https://github.com/scop/bash-completion) before creating autocompletion scripts. To install Bash Completion via Homebrew, run the following command:

```sh
$ brew install bash-Completion
```

### Subcommands

| Subcommand | Usage                                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `bash`     | Run `$ astro completion bash` to show the bash shell script for autocompletion in Astronomer. Use this output to modify or view your autocompletion scripts. |
| `zsh`      | Run `$ astro completion bash` to show the zsh shell script for autocompletion in Astronomer. Use this output to modify or view your autocompletion scripts.  |

## astro config

Modifies certain platform-level settings on Astronomer Enterprise without you needing to manually adjust settings in your `config.yaml` and apply them.

### Usage

Run `$ astro config get` to list values for all settings in your `config.yaml` file. To update or override a value, run `$ astro config set <value-name>:<value>`

The values that you can update via the command line are:

- cloud.api.protocol
- cloud.api.port
- cloud.api.ws_protocol
- cloud.api.token
- context
- contexts
- local.houston
- local.orbit
- postgres.user
- postgres.password
- postgres.host
- postgres.port
- project.deployment
- project.name
- project.workspace
- webserver.port
- show_warnings

### Subcommands

| Subcommand | Usage                                                  |
| ---------- | ------------------------------------------------------ |
| `get`      | Shows your current configuration                       |
| `set`      | Updates a setting in your configuration to a new value |

### Related documentation

- [Apply a Platform Configuration Change on Astronomer](https://www.astronomer.io/docs/enterprise/v0.16/manage-astronomer/apply-platform-config)

## astro deploy

Deploys code in your Airflow project directory to any Airflow Deployment on Astronomer.

### Usage

Run `$ astro deploy <your-deployment-release-name> <flags>` in your terminal to push a local Airflow project to your Airflow Deployment on Astronomer. If you have the appropriate Workspace and Deployment-level permissions, the code will begin to deploy.

To identify your Deployment's release name, go to **Settings** >**Basics** > **Release Name** in the Astronomer UI or run `$ astro deployment list`.

If you run `$ astro deploy` without specifying `your-deployment-release-name`, the Astronomer CLI will output a list of Airflow Deployments in your Workspace to choose from.

### Flags

| Flag             | Value Type | Usage                                                                                                                      |
| ---------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| `--force`        | None       | Forces deploy even if there are uncommitted changes.                                                                       |
| `--prompt`       | None       | Forces prompt for choosing a target Deployment.                                                                            |
| `--save`         | None       | Saves this directory/Deployment combination for future deploys.                                                            |
| `--workspace-id` | String     | Specifies the Workspace that the Airflow Deployment belongs to. Useful if you want to deploy without switching Workspaces. |

### Related documentation

- [Deploy to Astronomer via the CLI](https://www.astronomer.io/docs/enterprise/stable/deploy/deploy-cli)

## astro deployment

Manages various Deployment-level actions on Astronomer.

### Usage

Run `$ astro deployment <subcommand>` in your terminal to create, delete, or manage an Airflow Deployment on Astronomer. See the following entries of this guide for more information on each subcommand.

When managing an existing Deployment using subcommands such as `delete` and `logs`, you additionally need to specify a Deployment in your command. In this case, you would run `$ astro deployment <subcommand> <your-deployment>`.

### Related documentation

- [Configure an Airflow Deployment on Astronomer](https://www.astronomer.io/docs/enterprise/stable/deploy/manage-workspaces)

## astro deployment airflow upgrade

Initializes the Airflow version upgrade process on any Airflow Deployment on Astronomer.

### Usage

Run `$ astro deployment airflow upgrade --deployment-id` to initialize the Airflow upgrade process. To finalize the Airflow upgrade process, complete all of the steps as described in [Upgrade Apache Airflow on Astronomer](https://www.astronomer.io/docs/enterprise/stable/customize-airflow/manage-airflow-versions).

If you do not specify `--desired-airflow-version`, this command will output a list of available versions of Airflow you can choose from and prompt you to pick one. The Astronomer CLI will only make available versions of Airflow that are higher than the version you're currently running in your `Dockerfile`.

### Flags

| Flag                        | Value Type | Usage                                                                                                                       |
| --------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------- |
| `--deployment-id`           | String     | The ID of the Deployment you want to upgrade Airflow for. To find the ID of your Deployment, run `$ astro deployment list`. |
| `--desired-airflow-version` | String     | The Airflow version you're upgrading to (e.g. `1.10.14`).                                                                   |

### Related documentation

- [Upgrade Apache Airflow on Astronomer](https://www.astronomer.io/docs/enterprise/stable/customize-airflow/manage-airflow-versions)

## astro deployment create

Creates a new Airflow Deployment in your current Astronomer Workspace.

### Usage

`$ astro deployment create <new-deployment-name> <flags>`

### Flags

| Flag                | Value Type | Usage                                                                                                                                |
| ------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `--airflow-version` | String     | The Airflow version for the new Deployment.                                                                                          |
| `--cloud-role`      | String     | The role that annotates service accounts in the Deployment                                                                           |
| `--executor`        | String     | The Executor type for the Deployment. Can be `local`, `celery`, or `kubernetes`. If no executor is specified, then `celery` is used. |
| `--release-name`    | String     | A custom release name for the Airflow Deployment. Applies only to deployments on Astronomer Enterprise.                                            |

### Related documentation

- [Configure an Airflow Deployment on Astronomer](https://www.astronomer.io/docs/enterprise/stable/deploy/manage-workspaces)

## astro deployment delete

Deletes an Airflow Deployment from an Astronomer Workspace. This is equivalent to the **Delete Deployment** action in the Astronomer UI.

### Usage

`$ astro deployment delete <your-deployment-id>`

## astro deployment list

Generates a list of Airflow Deployments in your current Astronomer Workspace.

### Usage

`$ astro deployment list <flags>`

### Flags

| Flag    | Value Type | Usage                                                |
| ------- | ---------- | ---------------------------------------------------- |
| `--all` | None       | Generates a list of running Airflow Deployments across all Workspaces that you have access to. |

## astro deployment logs

Returns logs from your Airflow Deployment's Scheduler, Webserver, and Celery Workers.

### Usage

You can run any of the following commands depending on which logs you want to return:

- `$ astro deployment logs scheduler <flags>`
- `$ astro deployment logs webserver <flags>`
- `$ astro deployment logs workers <flags>`

### Flags

| Flag       | Value Type                                    | Usage                                                               |
| ---------- | --------------------------------------------- | ------------------------------------------------------------------- |
| `--follow` | None                                          | Subscribe to watch more logs.                                       |
| `--search` | String                                        | Searches for the specified string inside the logs you're following. |
| `--since`  | Lookback time in `h` or `m` (e.g. `5m`, `2h`) | Limits past logs to those generated in the lookback window.         |

### Related documentation

- [Deployment Logs](https://www.astronomer.io/docs/enterprise/stable/deploy/deployment-logs)

## astro deployment service-account create

Creates a Deployment-level Service Account on Astronomer, which you can use to configure a CI/CD pipeline or otherwise interact with the Astronomer Houston API.

### usage

`$ astro deployment service-account create <flags>`

### Flags

| Flag                         | Value Type | Usage                                                                                                        |
| ---------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------ |
| `--category`                 | String     | The Category for the Service Account. The default value is `default`.                                        |
| `--deployment-id` (Required) | String     | The Deployment you're creating a Service Account for.                                                        |
| `--label` (Required)         | String     | A label for the Service Account.                                                                             |
| `--role`                     | String     | The User Role for the Service Account. Can be `viewer`, `editor`, or `admin`. The default value is `viewer`. |
| `--system-sa`                | None       | ??                                                                                                           |
| `--user-id`                  | String     | ??                                                                                                           |

### Related documentation

- [Deploy to Astronomer via CI/CD](https://www.astronomer.io/docs/enterprise/stable/deploy/ci-cd)

## astro deployment service-account delete

Deletes a Service Account for a given Deployment.

### Usage

`$ astro deployment service-account delete <your-service-account-id> <flags>`

### Flags

| Flag              | Value Type | Usage                                                                                                                              |
| ----------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `--deployment-id` | String     | The Deployment you're getting the Service Account from. Use this flag as an alternative to specifying `<your-service-account-id>`. |

### Related documentation

- [Deploy to Astronomer via CI/CD](https://www.astronomer.io/docs/enterprise/stable/deploy/ci-cd)

## astro deployment service-account get

Shows the name, ID, and API key for each Service Account on a given Deployment.

### Usage

Run `$ astro deployment service-account get <service-account-id> --deployment-id=<your-deployment-id>` to get information on a single Service Account within a Deployment. To see a list of all Service Accounts on a Deployment, run `$ astro deployment service-account get --deployment-id=<your-deployment-id>`.

### Flags

| Flag              | Value Type | Usage                                                                                                                              |
| ----------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `--deployment-id` | String     | The Deployment you're getting the Service Account from. Use this flag as an alternative to specifying `<your-service-account-id>`. |

### Related documentation

- [Deploy to Astronomer via CI/CD](https://www.astronomer.io/docs/enterprise/stable/deploy/ci-cd)

## astro deployment update

This command appends an IAM role to the Webserver, Scheduler and Worker pods within any individual Airflow Deployment on the platform. Only applicable to teams running Astronomer Enterprise on Amazon EKS.

### Usage

`$ astro deployment update <your-deployment-id> <flags>`

### Flags

| Flag           | Value Type | Usage                     |
| -------------- | ---------- | ------------------------- |
| `--cloud-role` | String     | The ARN for the IAM role. |

### Related Documentation

- [Integrate IAM Roles](https://www.astronomer.io/docs/enterprise/stable/customize-airflow/integrate-iam)

## astro deployment user add

Gives an existing Workspace user access to an Airflow Deployment within that Workspace. You must be a Deployment Admin to perform this action.

### Usage

`$ astro deployment user add <flags> <user-email-address>`

### Flags

| Flag                         | Value Type | Usage                                                                                                                                            |
| ---------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--deployment-id` (Required) | String     | The Deployment that the user will be added to.                                                                                                   |
| `--role` (Required)          | String     | The role assigned to the user. Can be `DEPLOYMENT_VIEWER`, `DEPLOYMENT_EDITOR`, or `DEPLOYMENT_ADMIN`. The default value is `DEPLOYMENT_VIEWER`. |

### Related documentation

- [Manage User Permissions on Astronomer](https://www.astronomer.io/docs/enterprise/stable/manage-astronomer/workspace-permissions)

## astro deployment user delete

Removes access to an Airflow Deployment for an existing Workspace user. To grant that same user a different set of permissions instead, modify their existing Deployment-level role by running `$ astro deployment user update`. You must be a Deployment Admin to perform this action.

### Usage

`$ astro deployment user delete --deployment-id=<deployment-id> <user-email-address>`

### Flags

| Flag                         | Value Type | Usage                                              |
| ---------------------------- | ---------- | -------------------------------------------------- |
| `--deployment-id` (Required) | String     | The Deployment that the user will be removed from. |

### Related documentation

- [Manage User Permissions on Astronomer Cloud](https://www.astronomer.io/docs/enterprise/stable/manage-astronomer/workspace-permissions)

## astro deployment user list

Searches for users on a given Deployment. Use the optional flags to find specific users based on their name, email, or ID.

### Usage

`$ astro deployment user list --deployment-id=<deployment-id> <flags>`

### Flags

| Flag                         | Value Type | Usage                                        |
| ---------------------------- | ---------- | -------------------------------------------- |
| `--deployment-id` (Required) | String     | The Deployment that you're searching in.     |
| `--email`                    | String     | The email for the user you're searching for. |
| `--name`                     | String     | The name of the user to search for.          |
| `--user-id`                  | String     | The ID of the user to search for.            |

### Related documentation

- [Manage User Permissions on Astronomer](https://www.astronomer.io/docs/enterprise/stable/manage-astronomer/workspace-permissions)

## astro deployment user update

Updates a user's role in a given Deployment.

### Usage

`$ astro deployment user update <flags>`

### Flags

| Flag                         | Value Type | Usage                                                                                                                      |
| ---------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| `--deployment-id` (Required) | String     | The Deployment that you're searching in.                                                                                   |
| `--role`                     | String     | The role you're updating the user to. Possible values are `DEPLOYMENT_VIEWER`, `DEPLOYMENT_EDITOR`, or `DEPLOYMENT_ADMIN`. If `--role` is unspecified, then `DEPLOYMENT_VIEWER` is the default value. |

### Related documentation

- [Manage User Permissions on Astronomer](https://www.astronomer.io/docs/enterprise/stable/manage-astronomer/workspace-permissions)

## astro dev

Starts, stops, or manages Airflow clusters.

### Usage

`$ astro dev <subcommand> <flags>`

Refer to the following sections for information on each subcommand.

## astro dev init

Creates a new Airflow project in the directory you're in.

### Usage

`$ astro dev init <flags>`

When you run this command, the following skeleton files are generated in your current directory:

```py
.
├── dags # Where your DAGs go
│   ├── example-dag.py # An example dag that comes with the initialized project
├── Dockerfile # For Astronomer's Docker image and runtime overrides
├── include # For any other files you'd like to include
├── plugins # For any custom or community Airflow plugins
├──airflow_settings.yaml #For your Airflow Connections, Variables and Pools (local only)
├──packages.txt # For OS-level packages
└── requirements.txt # For any Python packages
```

### Flags

| Flag                | Value Type | Usage                                                                             |
| ------------------- | ---------- | --------------------------------------------------------------------------------- |
| `--airflow-version` | String     | The version of Airflow you want to use. The default is to use the latest version. |
| `--name`            | String     | The name for the Airflow project.                                                 |

## astro dev kill

Kills a locally running Airflow cluster. This command can only be used in a project directory.

### Usage

`$ astro dev kill`

## astro dev logs

Shows the output log for a locally running Airflow cluster. This command can only be used in a project directory.

### Usage

`$ astro dev logs <flags>`

### Flags

| Flag          | Value Type | Usage                                              |
| ------------- | ---------- | -------------------------------------------------- |
| `--follow`    | None       | Continues to show the latest outputs from the log. |
| `--scheduler` | None       | Outputs only Scheduler logs.                       |
| `--webserver` | None       | Outputs only Webserver logs.                       |

## astro dev ps

Lists all locally running Airflow containers for an Airflow project. This command can only be used in a project directory.

### Usage

`$ astro dev ps`

## astro dev run

Runs a single [Airflow command](https://airflow.apache.org/docs/apache-airflow/stable/cli-ref.html) on a locally running Airflow webserver.

### Usage

`$ astro dev run`

### Related documentation

* [CLI Quickstart](https://www.astronomer.io/docs/enterprise/v0.16/develop/cli-quickstart)

## astro dev start

Initializes a local Airflow environment on your machine by creating a Docker container for each of Airflow's 3 core components:

- Postgres
- Scheduler
- Webserver

### Usage

`$ astro dev run <flags>`

### Flags

| Flag    | Value Type | Usage                                                                            |
| ------- | ---------- | -------------------------------------------------------------------------------- |
| `--env` | String     | Specifies the filepath containing environment variables for the Airflow cluster. |

## astro dev stop

Stops all 3 running Docker containers on your local Airflow environment. Running this command followed by `$ astro dev start` is required to finalize changes to an existing Airflow project directory. This command does not prune mounted volumes and will preserve data associated with your local Postgres Metadata Database.

### Usage

`$ astro dev stop`

## astro dev upgrade-check

Runs a script that checks whether all files in your local Airflow project are compatible with Airflow 2.0 by reviewing your DAG code, deployment-level configurations, and Environment Variables, as well as metadata from the Airflow Database. You must be on Airflow 1.0.14 and in a project directory to run this command.

### Usage

`$ astro dev upgrade-check`

### Related documentation

- [Upgrade to Apache Airflow 2.0 on Astronomer](https://www.astronomer.io/docs/enterprise/stable/customize-airflow/upgrade-to-airflow-2)
- [Running the Airflow Upgrade Check Package](https://airflow.apache.org/docs/apache-airflow/stable/upgrade-check.html#upgrade-check)
## astro upgrade

Checks for a newer version of the Astronomer CLI.

### Usage

`$ astro upgrade`

> **Note:** This command only checks whether or not a new version of the Astronomer CLI is available. To actually upgrade the CLI to the latest version, run:
> 
> ```sh
> $ brew install astronomer/tap/astro
> ```
## astro user create

Creates a new user on Astronomer that's not associated with an existing Astronomer Workspace. An invitation email will be sent to the email address you specify. Once this user creates an account on Astronomer, they'll be able create a new Workspace and be a Workspace Admin within it.

### Usage

`$ astro user create <flags>`

### flags

| Flag         | Value Type | Usage                                                                                                                                     |
| ------------ | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `--email`    | String     | Specifies the email address for the new user. If not specified, you'll be prompted to enter an address during runtime.                    |
| `--password` | String     | Specifies a password for the new user to access Astronomer with. If not specified, you'll be prompted to enter a password during runtime. |

### Related documentation

- [Manage Workspace Permissions on Astronomer](https://www.astronomer.io/docs/enterprise/stable/manage-astronomer/workspace-permissions)
- [Manage Users on Astronomer Enterprise](https://www.astronomer.io/docs/enterprise/v0.23/manage-astronomer/manage-platform-users)

## astro version

Displays the running versions of both the Astronomer CLI and the Astronomer platform to which you are authenticated. If the minor versions of the Astronomer CLI and your Astronomer platform don't match, we encourage you to upgrade.

### Usage

`$ astro version`

### Related documentation

* [CLI Quickstart](https://www.astronomer.io/docs/enterprise/v0.16/develop/cli-quickstart)

## astro workspace

Manages various Workspace-level actions on Astronomer.

### Usage

`astro workspace <subcommand> <flags>`

For more information on each subcommand, refer to the following sections.

## astro workspace create

Creates a new Workspace.

### Usage

`$ astro workspace create <new-workspace-name> <flags>`

### Flags

| Flag     | Value Type | Usage                                  |
| -------- | ---------- | -------------------------------------- |
| `--desc` | String     | The description for the new Workspace. |

### Related documentation

- [Manage Workspaces and Deployments on Astronomer](https://www.astronomer.io/docs/enterprise/stable/deploy/manage-workspaces)

## astro workspace delete

Deletes a Workspace.

### Usage

`$ astro workspace delete <your-workspace-name>`

### Related documentation

- [Manage Workspaces and Deployments on Astronomer](https://www.astronomer.io/docs/enterprise/stable/deploy/manage-workspaces)

## astro workspace list

Generates a list of all Workspaces.

### Usage

`$ astro workspace list`

### Related documentation

- [Manage Workspaces and Deployments on Astronomer](https://www.astronomer.io/docs/enterprise/stable/deploy/manage-workspaces)

## astro workspace service-account create

Creates a Service Account for a given Workspace.

### Usage

`$ astro workspace service-account create <flags>`

### Flags

| Flag                        | Value Type | Usage                                                                                                        |
| --------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------ |
| `--category`                | String     | The Category for the Service Account. The default value is `default`.                                        |
| `--workspace-id` (Required) | String     | The Workspace you're creating a Service Account for.                                                         |
| `--label` (Required)        | String     | A label for the Service Account.                                                                             |
| `role`                      | String     | The User Role for the Service Account. Can be `viewer`, `editor`, or `admin`. The default value is `viewer`. |
| `--system-sa`               | None       | ??                                                                                                           |
| `--user-id`                 | String     | ??                                                                                                           |

### Related documentation

- [Manage Workspaces and Deployments on Astronomer](https://www.astronomer.io/docs/enterprise/stable/deploy/manage-workspaces)
- [Deploy to Astronomer via CI/CD](https://www.astronomer.io/docs/enterprise/stable/deploy/ci-cd)

## astro workspace service-account delete

Deletes a Service Account for a given Workspace.

### Usage

`$ astro workspace service-account delete <your-service-account-id> <flags>`

### Flags

| Flag             | Value Type | Usage                                                                                                                                                                                                                               |
| ---------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--workspace-id` | String     | The Workspace you're getting the Service Account from. If this flag is used instead of specifying `<your-service-account-id>`, you'll be prompted to select a Service Account from a list of all Service Accounts on the Workspace. |

### Related documentation

- [Manage Workspaces and Deployments on Astronomer](https://www.astronomer.io/docs/enterprise/stable/deploy/manage-workspaces)
- [Deploy to Astronomer via CI/CD](https://www.astronomer.io/docs/enterprise/stable/deploy/ci-cd)

## astro workspace service-account get

Shows the name, ID, and API key for each Service Account on a given Workspace.

### Usage

Run `$ astro deployment service-account get <service-account-id> --workspace-id=<your-workspace-id>` to get information on a single Service Account within a Workspace. To see a list of all Service Accounts on a Workspace, run `$ astro deployment service-account get --workspace-id=<your-workspace-id>`.

### Flags

| Flag             | Value Type | Usage                                                                                                                             |
| ---------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `--workspace-id` | String     | The Workspace you're getting the Service Account from. Use this flag as an alternative to specifying `<your-service-account-id>`. |

### Related documentation

- [Manage Workspaces and Deployments on Astronomer](https://www.astronomer.io/docs/enterprise/stable/deploy/manage-workspaces)
- [Deploy to Astronomer via CI/CD](https://www.astronomer.io/docs/enterprise/stable/deploy/ci-cd)

## astro workspace update

Updates a Workspace name, as well as the users and roles assigned to a Workspace.

### Usage

`$ astro workspace update <flags>`

### Flags

[These flags are undocumented].

### Related documentation

- [Manage Workspaces and Deployments on Astronomer](https://www.astronomer.io/docs/enterprise/stable/deploy/manage-workspaces)

## astro workspace user add

Adds an existing user from the Workspace to a given Workspace.

### Usage

`$ astro workspace user add <flags> <user-email-address>`

### Flags

| Flag                        | Value Type | Usage                                                                                                                                        |
| --------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `--workspace-id` (Required) | String     | The Workspace that the user will be added to.                                                                                                |
| `--role` (Required)         | String     | The role assigned to the user. Can be `WORKSPACE_VIEWER`, `WORKSPACE_EDITOR`, or `WORKSPACE_ADMIN`. The default value is `WORKSPACE_VIEWER`. |

### Related documentation

- [Manage Workspaces and Deployments on Astronomer](https://www.astronomer.io/docs/enterprise/stable/deploy/manage-workspaces)

## astro workspace user remove

Removes an existing user from your current Workspace.

### Usage

`$ astro workspace user remove <user-email-address> <flags>`

### Related documentation

- [Manage Workspaces and Deployments on Astronomer](https://www.astronomer.io/docs/enterprise/stable/deploy/manage-workspaces)

## astro workspace user list

Searches for users on a given Workspace.

### Usage

`$ astro workspace user list USERS <flags>`

### Flags

| Flag                        | Value Type | Usage                                        |
| --------------------------- | ---------- | -------------------------------------------- |
| `--workspace-id` (Required) | String     | The Workspace that you're searching in.      |
| `--email`                   | String     | The email for the user you're searching for. |
| `--name`                    | String     | The name of the user to search for.          |
| `--user-id`                 | String     | The ID of the user to search for.            |

### Related documentation

- [Manage Workspaces and Deployments on Astronomer](https://www.astronomer.io/docs/enterprise/stable/deploy/manage-workspaces)

## astro workspace user update

Updates a user's role in your current Workspace.

### Usage

`$ astro workspace user update <user-id> <flags>`

### Flags

| Flag | Value Type | Usage |
| --------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------- | |
| `--role` (Required) | String | The role you're updating the user to. Possible values are `WORKSPACE_VIEWER`, `WORKSPACE_EDITOR`, or `WORKSPACE_ADMIN`. |

### Related documentation

- [Manage Workspaces and Deployments on Astronomer](https://www.astronomer.io/docs/enterprise/stable/deploy/manage-workspaces)
