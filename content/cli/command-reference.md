---
title: "CLI Command Reference"
description: "Deploy, set project configurations, and more directly from the command line."
date: 2018-10-12T00:00:00.000Z
slug: "cli-command-reference"
---

# Available Commands

At the highest level running `astro` will give you the following options:

```
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
```

Running `astro dev`:

```
  init        Scaffold a new airflow project
  kill        Kill a development airflow cluster
  logs        Output logs for a development airflow cluster
  ps          List airflow containers
  run         Run any command inside airflow webserver
  start       Start a development airflow cluster
  stop        Stop a development airflow cluster
```

Running `astro auth`:

```
  login       Login to Astronomer services
  logout      Logout of Astronomer services
```

Running `astro cluster`:

```
  list        List known Astronomer Enterprise clusters
  switch      Switch to a different cluster context
```

Running `astro config`:

```
  get         Get astro project configuration
  set         Set astro project configuration
```

Running `astro deployment`:

```
  create          Create a new Astronomer Deployment
  delete          Delete an airflow deployment
  list            List airflow deployments
  logs            Stream logs from an Airflow deployment
  service-account Manage astronomer service accounts
  update          Update airflow deployments
```

Running `astro user`:

```
  create      Create a user in the astronomer platform
```

Running `astro workspace`:

```
  create          Create a new Astronomer Deployment
  delete          Delete an airflow deployment
  list            List airflow deployments
  logs            Stream logs from an Airflow deployment
  service-account Manage astronomer service accounts
  update          Update airflow deployments
```
