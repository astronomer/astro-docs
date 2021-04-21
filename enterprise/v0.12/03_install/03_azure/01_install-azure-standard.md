---
title: "Azure AKS Installation Guide"
navTitle: "Standard Installation"
description: "Deploy a Kubernetes native Apache Airflow platform onto Azure Kubernetes Service (AKS)."
---

# Installing Astronomer on Azure AKS
_Deploy a Kubernetes native [Apache Airflow](https://airflow.apache.org/) platform onto [Azure Kubernetes Service](https://azure.microsoft.com/en-us/services/kubernetes-service/) (AKS)._


## 1. Install Necessary Tools
* [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
* [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)
* [Kubernetes CLI (kubectl)](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
* [Helm v2.14.1](https://github.com/helm/helm/releases/tag/v2.14.1)
* SMTP Creds (Mailgun, Sendgrid) or any service will  work!
* Permissions to create / modify resources on Microsoft Azure
* A wildcard SSL cert (we'll show you how to create a free 90 day cert in this guide)!


## 2. Choose a Suitable Domain
All Astronomer services will be tied to a base domain of your choice. You will need the ability to add / edit DNS records under this domain. Here are some examples of accessible services when we use the base domain `astro.mydomain.com`:

* Astronomer UI: `app.astro.mydomain.com`
* New Airflow Deployments: `unique-name-airflow.astro.mydomain.com`
* Grafana Dashboard: `grafana.astro.mydomain.com`
* Kibana Dashboard: `kibana.astro.mydomain.com`

## 3. Configure Azure for Astronomer Deployment

*NOTE - You can view Microsoft Azure's Web Portal at https://portal.azure.com/*
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
*NOTE - For a list of available locations, run `az account list-locations`.*

### Create an AKS Cluster
Astronomer will deploy to Azure's managed Kubernetes service (Azure Kubernetes Service). Learn more about AKS [here.](https://docs.microsoft.com/en-us/azure/aks/)
You can choose the machine type to use, but we recommend using larger nodes vs smaller nodes.*

Create your Kubernetes cluster:
```
$ az aks create --name <my_cluster_name> --resource-group <my_resource_group> --node-vm-size Standard_D8s_v3 --node-count 3
```

You may need to increase your resource quota in order to provision these nodes.

*NOTE - If you work with multiple Kubernetes environments, `kubectx` is an incredibly useful tool for quickly switching between Kubernetes clusters. Learn more [here](https://github.com/ahmetb/kubectx).*

### Create a Static IP Address
You'll need to create a static IP address within your cluster's infrastructure resource group. This resource group is different from the one previously created.

List the name of your cluster's infrastructure resource group:
```
$ az aks show --resource-group <my-resource-group> --name <my_cluster_name> --query nodeResourceGroup -o tsv
```

Create a static IP in your infrastructure resource group. Record the output for use later on:
```
$ az network public-ip create --resource-group <infrastructure-resource-group-name> --name astro-ip --allocation-method static
```

### Authenticate with your AKS Cluster

Run the following command to set your AKS cluster as current context in your kubeconfig. This will configure `kubectl` to point to your new AKS cluster:
```
$ az aks get-credentials --resource-group <my_resource_group> --name <my_cluster_name>
```

## 4. Configure Helm with your AKS Cluster
Helm is a package manager for Kubernetes. It allows you to easily deploy complex Kubernetes applications. You'll use helm to install and manage the Astronomer platform. Learn more about helm [here](https://helm.sh/).
### Create a Kubernetes Namespace
Create a namespace to host the core Astronomer Platform. If you are running through a standard installation, each Airflow deployment you provision will be created in a seperate namespace that our platform will provision for you, this initial namespace will just contain the core Astronomer platform.

```
$ kubectl create namespace <my-namespace>
```

### Create a tiller Service Account
Save the following in a file named `rbac-config.yaml`:
```
apiVersion: v1
kind: ServiceAccount
metadata:
  name: tiller
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1beta1
kind: ClusterRoleBinding
metadata:
  name: tiller
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
  - kind: ServiceAccount
    name: tiller
    namespace: kube-system
```

Run the following command to apply these configurations to your Kubernetes cluster:
```
$ kubectl create -f rbac-config.yaml
```

### Deploy a tiller Pod

Your Helm client communicates with your kubernetes cluster through a `tiller` pod.  To deploy your tiller, run:
```
$ helm init --service-account tiller
```

Confirm your `tiller` pod was deployed successfully:
```
$ helm version
```

## 5. Configure the Database

Astronomer by default requires a central Postgres database that will act as the backend for Astronomer's Houston API and will host individual Metadata Databases for all Airflow Deployments spun up on the platform.

Set the following values in your `config.yaml` to enable a production-ready PostgreSQL server on your AKS cluster:

```
global:
  postgresqlEnabled: true
postgresql:
  replication:
    enabled: true
    slaveReplicas: 2
    synchronousCommit: on
    numSynchronousReplicas: 1
  metrics:
    enabled: true
```

> **Note:** Due to performance related issues, we cannot recommend using Azure Database for PostgreSQL.

## 6. SSL Configuration

You'll need to obtain a wildcard SSL certificate for your domain (e.g. `*.astro.mydomain.com`). This allows for web endpoint protection and encrypted communication between pods. Your options are:
* Purchase a wildcard SSL certificate from your preferred vendor.
* Obtain a free 90-day wildcard certificate from [Let's Encrypt](https://letsencrypt.org/).

### Obtain a Free SSL Certificate from Let's Encrypt

Linux:
```
$ docker run -it --rm --name letsencrypt -v /etc/letsencrypt:/etc/letsencrypt -v /var/lib/letsencrypt:/var/lib/letsencrypt certbot/certbot:latest certonly -d "*.astro.mydomain.com" --manual --preferred-challenges dns --server https://acme-v02.api.letsencrypt.org/directory
```

macOS:
```
$ docker run -it --rm --name letsencrypt -v /Users/<my-username>/<my-project>/letsencrypt1:/etc/letsencrypt -v /Users/<my-username>/<my-project>/letsencrypt2:/var/lib/letsencrypt certbot/certbot:latest certonly -d "*.astro.mydomain.com" --manual --preferred-challenges dns --server https://acme-v02.api.letsencrypt.org/directory
```

Follow the on-screen prompts and create a TXT record through your DNS provider. Wait a few minutes before continuing in your terminal.


### Create a DNS A Record

Create an A record through your DNS provider for `*.astro.mydomain.com` using your previously created static IP address.


## 7. Create Kubernetes Secrets

You'll need to create two Kubernetes secrets - one for the databases to be created and one for TLS.

### Create Database Connection Secret

Set an environment variable `$PGPASSWORD` containing your PostgreSQL database password:
```
$ export PGPASSWORD=$(kubectl get secret --namespace <my-namespace> <my-astro-db>-postgresql -o jsonpath="{.data.postgresql-password}" | base64 --decode; echo)
```

Confirm your `$PGPASSWORD` variable is set properly:
```
$ echo $PGPASSWORD
```

Create a Kubernetes secret named `astronomer-bootstrap` to hold your database connection string:
```
$ kubectl create secret generic astronomer-bootstrap --from-literal connection="postgres://postgres:$PGPASSWORD@<my-astro-db>-postgresql.<my-namespace>.svc.cluster.local:5432" --namespace <my-namespace>
```

### Create TLS Secret

Create a TLS secret named `astronomer-tls` using the previously generated SSL certificate files:
```
$ sudo kubectl create secret tls astronomer-tls --key /etc/letsencrypt/live/astro.mydomain.com/privkey.pem --cert /etc/letsencrypt/live/astro.mydomain.com/fullchain.pem --namespace <my-namespace>
```
**Note:** If you generated your certs using LetsEncrypt, you will need to run the command above as `sudo`

## 8. Configure your Helm Chart

Now that your Kubernetes cluster has been configured with all prerequisites, you can deploy Astronomer!

Clone the Astronomer helm charts locally and checkout your desired branch:
```
$ git clone https://github.com/astronomer/astronomer.git
$ git checkout <branch-name>
```
**Do not deploy off of the master branch. Be sure to check out the latest stable branch. Be sure to check out the latest `release-0.X` branch that can be found on our [CHANGELOG](https://github.com/astronomer/astronomer/blob/master/CHANGELOG.md)**

Create your `config.yaml` by copying our `starter.yaml` template:
```
$ cp ./configs/starter.yaml ./config.yaml
```


Set the following values in `config.yaml`:
* `baseDomain: astro.mydomain.com`
* `tlsSecret: astronomer-tls`
* `loadBalancerIP: <my-static-ip>`
* SMTP credentials as a houston config

Here is an example of what your `config.yaml` might look like:
```
#################################
## Astronomer global configuration
#################################
global:
  # Base domain for all subdomains exposed through ingress
  baseDomain: astro.mydomain.com

  # Name of secret containing TLS certificate
  tlsSecret: astronomer-tls


#################################
## Nginx configuration
#################################
nginx:
  # IP address the nginx ingress should bind to
  loadBalancerIP: 0.0.0.0

#################################
## SMTP configuration
#################################

astronomer:
  houston:
    config:
      email:
        enabled: true
        smtpUrl: YOUR_URI_HERE

```
Note - the SMTP URI will take the form:
```
smtpUrl: smtps://USERNAME:PW@HOST/?pool=true
```

## 9. Install Astronomer

```
$ helm install -f config.yaml . --namespace <my-namespace>
```

Check out our `Customizing Your Install` section for guidance on setting an [auth system](/docs/enterprise/v0.12/manage-astronomer/integrate-auth-system/) and [resource requests](https://www.astronomer.io/docs/enterprise/v0.12/manage-astronomer/configure-platform-resources/) in this `config.yaml`.

## 10. Verify all pods are up

To verify all pods are up and running, run:

```
$ kubectl get pods --namespace <my-namespace>
```

You should see something like this:

```
$ kubectl get pods --namespace astronomer
NAME                                                    READY   STATUS      RESTARTS   AGE
newbie-norse-alertmanager-0                            1/1     Running     0          30m
newbie-norse-cli-install-565658b84d-bqkm9              1/1     Running     0          30m
newbie-norse-commander-7d9fd75476-q2vxh                1/1     Running     0          30m
newbie-norse-elasticsearch-client-7cccf77496-ks2s2     1/1     Running     0          30m
newbie-norse-elasticsearch-client-7cccf77496-w5m8p     1/1     Running     0          30m
newbie-norse-elasticsearch-curator-1553734800-hp74h    1/1     Running     0          30m
newbie-norse-elasticsearch-data-0                      1/1     Running     0          30m
newbie-norse-elasticsearch-data-1                      1/1     Running     0          30m
newbie-norse-elasticsearch-exporter-748c7c94d7-j9cvb   1/1     Running     0          30m
newbie-norse-elasticsearch-master-0                    1/1     Running     0          30m
newbie-norse-elasticsearch-master-1                    1/1     Running     0          30m
newbie-norse-elasticsearch-master-2                    1/1     Running     0          30m
newbie-norse-elasticsearch-nginx-5dcb5ffd59-c46gw      1/1     Running     0          30m
newbie-norse-fluentd-gprtb                             1/1     Running     0          30m
newbie-norse-fluentd-qzwwn                             1/1     Running     0          30m
newbie-norse-fluentd-rv696                             1/1     Running     0          30m
newbie-norse-fluentd-t8mqt                             1/1     Running     0          30m
newbie-norse-fluentd-wmjvh                             1/1     Running     0          30m
newbie-norse-grafana-57df948d9-jv2m9                   1/1     Running     0          30m
newbie-norse-houston-dbc647654-tcxbz                   1/1     Running     0          30m
newbie-norse-kibana-58bdf9bdb8-2j67t                   1/1     Running     0          30m
newbie-norse-kube-state-549f45544f-mcv7m               1/1     Running     0          30m
newbie-norse-nginx-7f6b5dfc9c-dm6tj                    1/1     Running     0          30m
newbie-norse-nginx-default-backend-5ccdb9554d-5cm5q    1/1     Running     0          30m
newbie-norse-astro-ui-d5585ccd8-h8zkr                  1/1     Running     0          30m
newbie-norse-prisma-699bd664bb-vbvlf                   1/1     Running     0          30m
newbie-norse-prometheus-0                              1/1     Running     0          30m
newbie-norse-registry-0                                1/1     Running     0          30m
```
If you are seeing issues here, check out our [guide on debugging your installation](/docs/enterprise/v0.12/troubleshoot/debug-install/)


## 11. Access the Astronomer UI

Go to `app.BASEDOMAIN` to see the Astronomer UI.


## 12 Verify SSL

To make sure that the certificates were accepted, log into the platform and head to `app.BASEDOMAIN/token` and run:

`curl -v -X POST https://houston.BASEDOMAIN/v1 -H "Authorization: Bearer <token>"`

Verify that this output matches with:

`curl -v -k -X POST https://houston.BASEDOMAIN/v1 -H "Authorization: Bearer <token>"`
(The `-k` flag will run the command without looking for SSL)

Finally, to make sure the registry accepted SSL, try to log into the registry:

```
docker login registry.BASEDOMAIN -u _ -p <token>
```
