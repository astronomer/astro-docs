---
title: "Azure AKS Installation Guide"
navTitle: "Standard Installation"
description: "How to install Astronomer Enterprise on Azure Kubernetes Service (AKS) to run Apache Airflow."
---

This guide describes the steps to install Astronomer Enterprise on Azure, which allows you to deploy and scale [Apache Airflow](https://airflow.apache.org/) on an [Azure Kubernetes Service](https://azure.microsoft.com/en-us/services/kubernetes-service/) (AKS) cluster.

## Prerequisites

To install Astronomer on AKS, you'll need access to the following tools and permissions:

* [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
* [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)
* [Kubernetes CLI (kubectl)](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
* [Helm v3.2.1](https://github.com/helm/helm/releases/tag/v3.2.1)
* SMTP Service & Credentials (e.g. Mailgun, Sendgrid, etc.)
* Permission to create and modify resources on AKS
* Permission to generate a certificate (not self-signed) that covers a defined set of subdomains

## 1. Choose a Suitable Domain

All Astronomer services will be tied to a base domain of your choice, under which you will need the ability to add and edit DNS records.

Once created, your Astronomer base domain will be linked to a variety of sub-services that your users will access via the internet to manage, monitor and run Airflow on the platform.

For the base domain `astro.mydomain.com`, for example, here are some corresponding URLs that your users would be able to reach:

* Astronomer UI: `app.astro.mydomain.com`
* Airflow Deployments: `deployments.astro.mydomain.com/uniquely-generated-airflow-name/airflow`
* Grafana Dashboard: `grafana.astro.mydomain.com`
* Kibana Dashboard: `kibana.astro.mydomain.com`

For the full list of subdomains you need a certificate for, read below.

## 2. Configure Azure for Astronomer Deployment

The steps below will walk you through how to:

- Create an Azure Resource Group
- Create an AKS Cluster - Note that Astronomer currently supports Kubernetes versions 1.14, 1.15 and 1.16 in AKS.
- Create a Static IP Address
- Authenticate with your AKS Cluster

> **Note:** You can view Microsoft Azure's Web Portal at https://portal.azure.com/.

### Create an Azure Resource Group

A resource group is a collection of related resources for an Azure solution. Your AKS cluster will reside in the resource group you create. Learn more about resource groups [here](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-overview#resource-groups).

Login to your Azure account with the `az` CLI:
```
$ az login
```

Your active Azure subscriptions will print to your terminal.  Set your preferred Azure subscription:

```
$ az account set --subscription <subscription_id>
```

Confirm your preferred subscription is set:

```
$ az account show
```

Create a resource group:
```
$ az group create --location <location> --name <my_resource_group>
```
> **Note:** For a list of available locations, run `$ az account list-locations`.

### Create an AKS Cluster

Astronomer will deploy to Azure's Kubernetes service (AKS). Learn more about AKS [here.](https://docs.microsoft.com/en-us/azure/aks/)
You can choose the machine type to use, but we recommend using larger nodes vs smaller nodes.

Create your Kubernetes cluster:

```
$ az aks create --name <my_cluster_name> --resource-group <my_resource_group> --node-vm-size Standard_D8s_v3 --node-count 3
```

You may need to increase your resource quota in order to provision these nodes.

> **Note:** If you work with multiple Kubernetes environments, `kubectx` is an incredibly useful tool for quickly switching between Kubernetes clusters. Learn more [here](https://github.com/ahmetb/kubectx).

### Create a Static IP Address

You'll need to create a static IP address within your cluster's infrastructure resource group. This resource group is different than the one previously created.

List the name of your cluster's infrastructure resource group:

```
$ az aks show --resource-group <my-resource-group> --name <my_cluster_name> --query nodeResourceGroup -o tsv
```

Create a static IP in your infrastructure resource group:

```
$ az network public-ip create --resource-group <infrastructure-resource-group-name> --name astro-ip --allocation-method static --sku Standard
```

Save the output from this command - we'll use it again later in this guide.

### Authenticate with your AKS Cluster

Run the following command to set your AKS cluster as current context in your kubeconfig. This will configure `kubectl` to point to your new AKS cluster:

```
$ az aks get-credentials --resource-group <my_resource_group> --name <my_cluster_name>
```

## 3. Create a Kubernetes Namespace

Now that you have a base domain and an AKS cluster up and running, you'll need to create a namespace to host the core Astronomer Platform.

For standard installs, each Airflow Deployment provisioned on the platform will automatically be created within an additional, isolated namespace.

The initial namespace we're creating below will just contain the core Astronomer platform.

```bash
$ kubectl create ns astronomer
```

## 4. Configure SSL

We recommend running Astronomer Enterprise on a dedicated domain (`BASEDOMAIN`) or subdomain (`astro.BASEDOMAIN`).

As mentioned above, you'll need an SSL Certificate that covers the following subdomians:

```
BASEDOMAIN
app.BASEDOMAIN
deployments.BASEDOMAIN
registry.BASEDOMAIN
houston.BASEDOMAIN
grafana.BASEDOMAIN
kibana.BASEDOMAIN
install.BASEDOMAIN
alertmanager.BASEDOMAIN
prometheus.BASEDOMAIN
```

Read below for guidelines on how to obtain a free SSL Cert from [Let's Encrypt](https://letsencrypt.org/) (optional) and how to create a [Kubernetes Secret](https://kubernetes.io/docs/concepts/configuration/secret/) that points to your certificates (required).

> **Note:** You're free to use a wildcard cert for your domain (e.g. `*.astro.BASEDOMAIN.com`), but you _cannot_ use a self-signed certificate.

### Obtain a Free SSL Certificate from Let's Encrypt

Let's Encrypt is a free and secure service that provides automated SSL Certificates.

If you are on a Mac, run the following:

```bash
$ docker run -it --rm --name letsencrypt -v /Users/<my-username>/<my-project>/letsencrypt1:/etc/letsencrypt -v /Users/<my-username>/<my-project>/letsencrypt2:/var/lib/letsencrypt certbot/certbot:latest certonly -d "*.astro.BASEDOMAIN.com" --manual --preferred-challenges dns --server https://acme-v02.api.letsencrypt.org/directory
```

If you are running Linux:

```bash
$ docker run -it --rm --name letsencrypt -v /etc/letsencrypt:/etc/letsencrypt -v /var/lib/letsencrypt:/var/lib/letsencrypt certbot/certbot:latest certonly -d "*.astro.BASEDOMAIN.com" --manual --preferred-challenges dns --server https://acme-v02.api.letsencrypt.org/directory
```

Follow the on-screen prompts and create a TXT record through your DNS provider. Wait a few minutes before continuing in your terminal.

## 5. Create Kubernetes Secrets

### Create a Bootstrap Secret (Database Connection)

If you're connecting to an external database, you will need to create a secret named `astronomer-bootstrap` to hold your database connection string:

```
$ kubectl create secret generic astronomer-bootstrap --from-literal connection="postgres://<USERNAME>:<PASSWORD>@HOST:5432" --namespace <my-namespace>
```

> **Note:** You cannot use the Azure Database offering with Astronomer v0.16 due to performance issues. You can skip this command and instead enable a production-ready PostgreSQL server on your AKS cluster in step 6. 

### Create a TLS Secret

Finally, create a TLS Kubernetes Secret named `astronomer-tls` that points to your certificates.

If you used LetsEncrypt, the command looks like the following:

```bash
sudo kubectl create secret tls astronomer-tls --key /etc/letsencrypt/live/astro.mydomain.com/privkey.pem --cert /etc/letsencrypt/live/astro.mydomain.com/fullchain.pem --namespace <my-namespace>
```

Make sure to subsitute the appropriate values for your domain.

> **Note:** If you generated your certs using LetsEncrypt, you will need to run the command above as `sudo`.

## 6. Configure your Helm Chart

As a next step, create a file named `config.yaml` in an empty directory.

For context, this `config.yaml` file will assume a set of default values for our platform that specify everything from user role definitions to the Airflow images you want to support. As you grow with Astronomer and want to customize the platform to better suit your team and use case, your `config.yaml` file is the best place to do so.

In the newly created file, copy the example below and replace `baseDomain` and `smtpUrl` with your own values. For more example configuration files, go [here](https://github.com/astronomer/astronomer/tree/release-0.14/configs).


```yaml
#################################
### Astronomer global configuration
#################################
global:
  # Base domain for all subdomains exposed through ingress
  baseDomain: astro.mydomain.com

  # Name of secret containing TLS certificate
  tlsSecret: astronomer-tls

  postgresqlEnabled: true # Keep True if deploying a database on your AKS cluster.

# Settings for database deployed on AKS cluster.
  postgresql:
    replication:
      enabled: true
      slaveReplicas: 2
      synchronousCommit: on
      numSynchronousReplicas: 1
    metrics:
      enabled: true

#################################
### Nginx configuration
#################################
nginx:
  # IP address the nginx ingress should bind to
  loadBalancerIP: YOUR_EXTERNAL_IP_HERE

#################################
### SMTP configuration
#################################

astronomer:
  houston:
    publicSignups: false # Users need to be invited to have access to Astronomer. Set to true otherwise
    emailConfirmation: true # Users get an email verification before accessing Astronomer
    config:
      deployments:
        manualReleaseNames: true # Allows you to set your release names
      email:
        enabled: true
        smtpUrl: YOUR_URI_HERE
        reply: "noreply@astronomer.io" # Emails will be sent from this address
      auth:
        # Local database (user/pass) configuration.
        github:
          enabled: true # Lets users authenticate with Github
        local:
          enabled: false # Disables logging in with just a username and password
        openidConnect:
          google:
            enabled: true # Lets users authenticate with Google
```

SMTP is required and will allow users to send and accept email invites to Astronomer. The SMTP URI will take the following form:

```
smtpUrl: smtps://USERNAME:PW@HOST/?pool=true
```

> **Note:** If there are `/` or other escape characters in your username or password, you may need to [URL encode](https://www.urlencoder.org/) those characters.

Information on other auth systems can be found [here](/docs/enterprise/v0.16/manage-astronomer/integrate-auth-system/). For more insight into how you might be able to customize Astronomer for your team, refer to step 11 at the bottom of this guide.

## 7. Install Astronomer

Now that you have an AKS cluster set up and your `config.yaml` defined, you're ready to deploy all components of our platform.

First, run:

```
$ helm repo add astronomer https://helm.astronomer.io/
```

Now, run:

```
$ helm install astronomer -f config.yaml --version=<platform-version> astronomer/astronomer --namespace astronomer
```

Replace `<platform-version>` above with the version of the Astronomer platform you want to install in the format of `0.16.x`. For the latest version of Astronomer made generally available to Enterprise customers, refer to our ["Enterprise Release Notes"](/docs/enterprise/stable/resources/release-notes/). We recommend installing our latest as we regularly ship patch releases with bug and security fixes incorporated.

Running the commands above will generate a set of Kubernetes pods that will power the individual services required to run our platform, including the Astronomer UI, our Houston API, etc.

## 8. Verify all pods are up

To verify all pods are up and running, run:

```
$ kubectl get pods --namespace <my-namespace>
```

You should see something like this:

```command
$ kubectl get pods --namespace astronomer

NAME                                                       READY   STATUS              RESTARTS   AGE
astronomer-alertmanager-0                                  1/1     Running             0          24m
astronomer-astro-ui-7f94c9bbcc-7xntd                       1/1     Running             0          24m
astronomer-astro-ui-7f94c9bbcc-lkn5b                       1/1     Running             0          24m
astronomer-cli-install-88df56bbd-t4rj2                     1/1     Running             0          24m
astronomer-commander-84f64d55cf-8rns9                      1/1     Running             0          24m
astronomer-commander-84f64d55cf-j6w4l                      1/1     Running             0          24m
astronomer-elasticsearch-client-7786447c54-9kt4x           1/1     Running             0          24m
astronomer-elasticsearch-client-7786447c54-mdxpn           1/1     Running             0          24m
astronomer-elasticsearch-data-0                            1/1     Running             0          24m
astronomer-elasticsearch-data-1                            1/1     Running             0          24m
astronomer-elasticsearch-exporter-6495597c9f-ks4jz         1/1     Running             0          24m
astronomer-elasticsearch-master-0                          1/1     Running             0          24m
astronomer-elasticsearch-master-1                          1/1     Running             0          23m
astronomer-elasticsearch-master-2                          1/1     Running             0          23m
astronomer-elasticsearch-nginx-b954fd4d4-249sh             1/1     Running             0          24m
astronomer-fluentd-5lv2c                                   1/1     Running             0          24m
astronomer-fluentd-79vv4                                   1/1     Running             0          24m
astronomer-fluentd-hlr6v                                   1/1     Running             0          24m
astronomer-fluentd-l7zj9                                   1/1     Running             0          24m
astronomer-fluentd-m4gh2                                   1/1     Running             0          24m
astronomer-fluentd-q987q                                   1/1     Running             0          24m
astronomer-grafana-c487d5c7b-pjtmc                         1/1     Running             0          24m
astronomer-houston-544c8855b5-bfctd                        1/1     Running             0          24m
astronomer-houston-544c8855b5-gwhll                        1/1     Running             0          24m
astronomer-houston-upgrade-deployments-stphr               1/1     Running             0          24m
astronomer-kibana-596599df6-vh6bp                          1/1     Running             0          24m
astronomer-kube-state-6658d79b4c-hf2hf                     1/1     Running             0          24m
astronomer-kubed-6cc48c5767-btscx                          1/1     Running             0          24m
astronomer-nginx-746589b744-h6r5n                          1/1     Running             0          24m
astronomer-nginx-746589b744-hscb9                          1/1     Running             0          24m
astronomer-nginx-default-backend-8cb66c54-4vjmz            1/1     Running             0          24m
astronomer-nginx-default-backend-8cb66c54-7m86w            1/1     Running             0          24m
astronomer-prisma-57d5bf6c64-zcmsh                         1/1     Running             0          24m
astronomer-prometheus-0                                    1/1     Running             0          24m
astronomer-prometheus-blackbox-exporter-65f6c5f456-865h2   1/1     Running             0          24m
astronomer-prometheus-blackbox-exporter-65f6c5f456-szr4s   1/1     Running             0          24m
astronomer-registry-0                                      1/1     Running             0          24m
```

If you are seeing issues here, check out our [guide on debugging your installation](/docs/enterprise/v0.16/troubleshoot/debug-install/).


## 9. Verify You Can Access the Astronomer UI

Go to `app.BASEDOMAIN` to see the Astronomer UI.

Consider this your new Airflow control plane. From the Astronomer UI, you'll be able to both invite and manage users as well as create and monitor Airflow Deployments on the platform.

## 10. Verify SSL

To make sure that the certificates were accepted, log into the platform and head to `app.BASEDOMAIN/token` and run:

```
curl -v -X POST https://houston.BASEDOMAIN/v1 -H "Authorization: Bearer <token>"
```

Verify that this output matches with:

```
curl -v -k -X POST https://houston.BASEDOMAIN/v1 -H "Authorization: Bearer <token>"
```

> **Note:** The `-k` flag will run the command without looking for SSL.

Finally, to make sure the registry accepted SSL, try to log into the registry:

```
docker login registry.BASEDOMAIN -u _ p <token>
```

## 11. What's Next

To help you make the most of Astronomer Enterprise, take note of the following resources:

* [Integrating an Auth System](/docs/enterprise/v0.16/manage-astronomer/integrate-auth-system/)
* [Configuring Platform Resources](/docs/enterprise/v0.16/manage-astronomer/configure-platform-resources/)
* [Managing Users on Astronomer Enterprise](/docs/enterprise/v0.16/manage-astronomer/manage-platform-users/)

### Astronomer Support Team

If you have any feedback or need help during this process and aren't in touch with our team already, a few resources to keep in mind:

* [Community Forum](https://forum.astronomer.io): General Airflow + Astronomer FAQs
* [Astronomer Support Portal](https://support.astronomer.io/hc/en-us/): Platform or Airflow issues

For detailed guidelines on reaching out to Astronomer Support, reference our guide [here](/docs/enterprise/v0.16/resources/support/).