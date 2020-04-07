---
title: "Configuring Resources with Helm"
description: "Change your platform's default resources"
date: 2018-07-17T00:00:00.000Z
slug: "ee-configuring-resources"
---

# Default Resources

By default, Astronomer needs around 10 CPUs and 44Gi of memory:

| Pod                        | Request CPU  | Request Mem  | Limit CPU  | Limit Mem  | Storage |
|-------------------------|--------------|---|---|---|---|
| `orbit`                 | 100m         | 256Mi  | 500m  | 1024Mi  | NA |
| `houston`               | 250m         | 512Mi  | 800m  | 1024Mi  | NA |
| `prisma`                | 250m         | 512Mi  | 500m  | 1024Mi  | NA |
| `commander`             | 250m         | 512Mi  | 500m  | 1024Mi  | NA |
| `registry`              | 250m         | 512Mi  | 500m  | 1024Mi  | 100Gi |
| `install`               | 100m         | 256Mi  | 500m  | 1024Mi  | NA |
| `nginx`                 | 500m         | 1024Mi  | 1  | 2048Mi  | NA |
| `grafana`               | 250m         | 512Mi  | 500m  | 1024Mi  | NA |
| `prometheus`            | 1000m        | 4Gi  | 1000m  | 4Gi  | 100Gi |
| `elasticsearch client replica-1`  | 1            | 2Gi  | 2  | 4Gi  | NA |
| `elasticsearch client replica-2`  | 1            | 2Gi  | 2  | 4Gi  | NA |
| `elasticsearch data replica-1`    | 1            | 2Gi  | 2  | 4Gi  | 100Gi |
| `elasticsearch data replica-2`    | 1            | 2Gi  | 2  | 4Gi  | 100Gi |
| `elasticsearch master replica-1`  | 1            | 2Gi  | 2  | 4Gi  | 20Gi|
| `elasticsearch master replica-2`  | 1            | 2Gi  | 2  | 4Gi  | 20Gi|
| `elasticsearch master replica-3`  | 1            | 2Gi  | 2  | 4Gi  | 20Gi|
| `kibana`                | 250m         | 512Mi  | 500m  | 1024Mi  | NA |
| `fluentd`               | 250m         | 512Mi  | 500m  | 1024Mi  | NA |
| `kubeState`             | 250m         | 512Mi  | 500m  | 1024Mi  | NA |
| Total                   | 10.7          | 23.5Gi  | 21.3  | 44Gi  | 460Gi |

## Changing Values

You can change the request and limit of any of the components above in your `config.yaml` or in `values.yaml` (`config.yaml` will overwrite `values.yaml`).

To change something like the resources allocated to `Orbit`, add the following fields to your `config.yaml`:
```
#####
#Changing Orbit CPU
####

astronomer:
  orbit:
    resources:
      requests:
        cpu: "200m"
        memory: "256Mi"
      limits:
        cpu: "700m"
        memory: "1024Mi"
```

Once all the changes are made, run `helm upgrade` to switch your platform to the new config:

```
helm upgrade -f config.yaml $release_name . --namespace $namespace
```
Be sure to specify the platform namespace, not an Airflow namespace.


## Infrastructure Estimates

To ensure plenty of room to run Airflow environments and hefty jobs, these estimates are going to be for a cluster with around 24CPUs in the US-East region.

### AWS

| Component | Item          | Yearly Cost (annual upfront pricing)  |
| -------------- | ------------- | ------------- |
| Compute        | 3 t2.2xlarge (8 vCPU 32 GiB)  | $5640 |
| EKS Control Plane     | $0.20 * 24 * 365 | $1752 |
| Database       | db.t2.medium Postgres, Multi-AZ at $0.29/hr \*24hr \* 365 | $424 |
| Total            |  | $7816 |


### GCP

| Component | Item          | Yearly Cost (annual upfront pricing)  |
| -------------- | ------------- | ------------- |
| Compute        | 3 t2.2xlarge (8 vCPU 32 GiB) at $0.376/hr \* 24hr \* 365 days | $6,291.17 |
| Database       | db.t2.medium Postgres, Multi-AZ at $0.29/hr \*24hr \* 365 | $1397.98 |
| Total            |  | $7689.15 |

For added customization, check out the [GCP Pricing Calculator](https://cloud.google.com/products/calculator/#id=f899c077-6b8b-4ccd-8f8c-974e04cbe872).

### Azure

| Component | Item          | Yearly Cost (annual upfront pricing)  |
| -------------- | ------------- | ------------- |
| Compute        | 3 x D8s v3 (8 vCPU(s), 32 GiB) | $8343.12 |
| Database       | 1 x Gen 5 (2 vCore), 25 GB Storage,LRS redundancy	 | $1568 |
| Total            |  | $9911.12 |

The [Azure Price Calculator](https://azure.microsoft.com/en-us/pricing/calculator/?service=kubernetes-service) can be used to get an estimate for further customization.
