---
title: "Upgrade Astronomer"
description: "How to upgrade to a newer Astronomer release by using Helm."
date: 2018-07-17T00:00:00.000Z
slug: "ee-administration-update"
---

## Upgrade Astronomer

Once the Astronomer umbrella chart is installed, you may want to make config changes, or upgrade to a newer release.

Helm makes it easy to update a Kubernetes cluster.

Start by finding your Astronomer platform release name:

```
helm ls
```

The Astronomer platform release is identified by the CHART name, in this case our platform release name is `quiet-moose`

```
quiet-moose        	2       	Thu Aug  2 09:18:35 2018	DEPLOYED	astronomer-platform-0.3.1	astronomer-cloud
```

Ensure you do not attempt to run the helm upgrade command on your airflow release, this can create issues with the airflow deployment.

Switch to your astronomer EE helm chart cirectory:

```
cd astronomer
```

Pull the latest version from the astronomer repository:

```
git pull
```

Run the helm update command using your astronomer platform release name:

```
helm upgrade -f config.yaml quiet-moose .
```

You should see a successful helm upgrade message in your terminal. You're Astronomer EE instance is now up to date.

There are some cases where Helm cannot do an automatic upgrade which can be resolved by doing a fresh install.

## Astronomer Roadmap

For more about future updates, check out our [Astronomer Platform Roadmap](https://www.astronomer.io/docs/roadmap/).
