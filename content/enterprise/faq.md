---
title: "Enterprise FAQ"
description: "Commonly asked questions and answers for Astronomer Enterprise."
date: 2019-12-06T00:00:00.000Z
slug: "ee-faq"
---

### What are the components of the Astronomer platform, with their respective versions?

See the [Astronomer Platform Images](https://docs.google.com/spreadsheets/d/1jE8EA4YapKEghVvk0-4K_MdwoVe6-O7v4uCI03ke6yg/edit#gid=0) Google sheet.

### What Docker version is used for deployment?

* You may bring their own AMI to the solution.
* We’re flexible to deploy on any Kubernetes
* For standard installations:
  * AWS: Astronomer prefers to use the EKS-optimized AMIs provided by AWS. These will automatically include the latest, stable Docker version tested by Amazon with EKS. We recommend [looking up the AMI ID](https://docs.aws.amazon.com/eks/latest/userguide/eks-optimized-ami.html) to find the image appropriate for your Kubernetes version and AWS region. You may have additional requirements that necessitate building your own AMI. You might build these with Packer, in which case you may want to reference the EKS [optimized Packer configuration](https://github.com/awslabs/amazon-eks-ami). Assuming that you are using Kubernetes 1.14, it looks like AWS is using Docker version 18.09 for the [latest release of the EKS AMI](https://github.com/awslabs/amazon-eks-ami/blob/da2d05a60929f9d258355b8a597f2917c35896f4/eks-worker-al2.json#L17).
  * GKE: has a similar set up to EKS where they provide an optimized machine image that is ideal for running in their managed kubernetes service. For Astronomer cloud, we are making use of these GKE images, using Kubernetes 1.14. This is also using Docker version 18.09. [This page includes the release notes](https://cloud.google.com/container-optimized-os/docs/release-notes) for the GKE optimized machine images (called ‘container optimized OS’ or ‘COS’ for short). This page indicates the [release notes for GKE in general](https://cloud.google.com/kubernetes-engine/docs/release-notes). GKE has a nice feature introduced last year called “Release channels” that are nice for automatically upgrading Kubernetes version. GKE also has [a few other machine images besides COS](https://cloud.google.com/kubernetes-engine/docs/concepts/node-images).

### What are the + minimum permissions required for the application to perform?

The platform does not need root access to the Kubernetes cluster.

Astronomer makes use of Kubernetes cluster-level features (including K8s RBAC) by design. These features include creating / deleting namespaces, daemonsets, roles, cluster-roles, service-accounts, resource-quotas, limit-ranges, etc. Additionally, Astronomer dynamically creates new airflow instances in separate namespaces, which protects data engineer users from noisy neighbors.

* Roles
  * [Houston](https://github.com/astronomer/astronomer/blob/v0.10.3-fix.4/charts/astronomer/templates/houston/houston-bootstrap-role.yaml)
  * [Prisma](https://github.com/astronomer/astronomer/blob/v0.10.3-fix.4/charts/astronomer/templates/prisma/prisma-bootstrap-role.yaml)
  * [Kubed](https://github.com/astronomer/astronomer/blob/v0.10.3-fix.4/charts/kubed/templates/kubed-clusterrole.yaml)
  * [NGINX](https://github.com/astronomer/astronomer/blob/v0.10.3-fix.4/charts/nginx/templates/nginx-role.yaml)
  * [Commander](https://github.com/astronomer/astronomer/blob/v0.10.3-fix.4/charts/astronomer/templates/commander/commander-role.yaml)
  * [Fluentd](https://github.com/astronomer/astronomer/blob/v0.10.3-fix.4/charts/fluentd/templates/fluentd-clusterrole.yaml)
  * [Prometheus](https://github.com/astronomer/astronomer/blob/v0.10.3-fix.4/charts/prometheus/templates/prometheus-role.yaml)
  * [Grafana](https://github.com/astronomer/astronomer/blob/v0.10.3-fix.4/charts/grafana/templates/grafana-bootstrap-role.yaml)
  * [Kubestate](https://github.com/astronomer/astronomer/blob/v0.10.3-fix.4/charts/kube-state/templates/kube-state-role.yaml)
  * [Tiller](https://github.com/astronomer/astronomer/blob/tiller-clusterrole/charts/astronomer/templates/commander/tiller-clusterrole.yaml)

> NOTE: We also have  “Single Namespace mode” option (see https://www.astronomer.io/docs/ee-single-namespace-mode/) which reduces the standard permission/role requirements outlined below. The generated roles/permissions for single namespace [can be viewed here](https://gist.github.com/ianstanton/ee7b4785914c12ad47c18571504d614d).

### What scripts are used for deployment?

We provide [a terraform module](https://registry.terraform.io/modules/astronomer/astronomer-enterprise/aws/) that deploys the infrastructure on AWS (optionally network, DB, EKS), then installs Astronomer on top of that. This also supports deploying a DB and EKS into existing subnets created by the customer. We have some Terraform available for GKE as well, which we can dig into if we go that path.

You may have special requirements of your infrastructure such that you want to set up Kubernetes on your own, then install Astronomer with Helm. In that case, you can use the Helm chart. The [latest stable version](https://github.com/astronomer/astronomer) is v0.10.3.

### How can we integrate this setup with LDAP?

See https://www.astronomer.io/docs/ee-integrating-auth-systems/

### How can we restrict the application from getting full access?

We have defined the exact Roles or ClusterRoles that we need for the platform to function. The default mode requires a ClusterRole that has access to create namespaces and other objects for new Airflow deployments.

> Note: Single Namespace mode requires only a Role but comes with trade-offs.

### How can implement RBAC with this solution?

Astronomer has built-in Airflow RBAC support. See https://www.astronomer.io/docs/rbac/

### How can we turn on SSL and use our own CA?

Astronomer platform uses SSL throughout by default. During installation, a wildcard certificate for the base domain must be provided. See https://www.astronomer.io/docs/ee-installation-base-domain/

### How can we restrict Web-UI to internet?

The platform API and web UI are served over a single highly available AWS load balancer. By using an internal load balancer, the entire platform will only be accessible in a private network.

### What kind of management is available for security logs?

All platform components and Airflow deployment logs are retained within the platform’s logging stack for 15 days. This is useful for searching recent logs using the Kibana interface to ElasticSearch. For log backup to comply with policy, container stdout and stderr logs may also be collected in AWS CloudWatch and can be persisted according to your CloudWatch logs retention policy. For AWS API security and auditing, Astronomer recommends enabling AWS CloudTrail.

### How do we manage application and system logs?

Astronomer's Enterprise offering has a robust logging structure sitting atop Airflow. See https://www.astronomer.io/docs/ee-logging/

How does patching work for this setup?

Kubernetes and node upgrades are generally managed by the customer. Platform version upgrades are performed with Helm, assisted by Astronomer support team if required.

See https://www.astronomer.io/docs/ee-upgrade-guide/

### How can we get multi-factor auth?

Astronomer has a flexible auth front end, with pre-built integrations for Google Auth, Okta, Auth0, and others https://www.astronomer.io/docs/ee-integrating-auth-systems/.

If you choose to use Google Auth, we have documentation available for setting that up: https://www.astronomer.io/docs/ee-installation-google-oauth/
