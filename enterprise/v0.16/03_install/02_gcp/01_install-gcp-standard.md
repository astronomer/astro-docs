---
title: "GCP GKE Installation Guide"
navTitle: "Standard Installation"
description: "How to install Astronomer on Google Cloud Platform (GCP)."
---

This guide describes the steps to install Astronomer on Google Cloud Platform (GCP), which allows you to deploy and scale any number of [Apache Airflow](https://airflow.apache.org/) deployments within an [GCP Google Kubernetes Engine (GKE)](https://cloud.google.com/kubernetes-engine/) cluster.

## 1. Install Necessary Tools

* [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
* [Google Cloud SDK](https://cloud.google.com/sdk/install)
* [Kubernetes CLI (kubectl)](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
* [Helm v3.2.1](https://github.com/helm/helm/releases/tag/v3.2.1)
* SMTP Creds (Mailgun, Sendgrid) or any service will  work!
* Permissions to create / modify resources on Google Cloud Platform
* A wildcard SSL cert (we'll show you how to create a free 90 day cert in this guide)!


## 2. Choose a Suitable Domain

All Astronomer services will be tied to a base domain of your choice. You will need the ability to add / edit DNS records under this domain.

You will need a certificate that covers:

```
BASEDOMAIN
app.BASEDOMAIN
deployments.BASEDOMAIN
registry.BASEDOMAIN
houston.BASEDOMAIN
grafana.BASEDOMAIN
kibana.BASEDOMAIN
install.BASEDOMAIN

```

Here are some examples of accessible services when we use the base domain `astro.mydomain.com`:

* Astronomer UI: `app.astro.mydomain.com`
* New Airflow Deployments: `deployments.astro.mydomain.com/uniquely-generated-airflow-name`
* Grafana Dashboard: `grafana.astro.mydomain.com`
* Kibana Dashboard: `kibana.astro.mydomain.com`


## 3. Configure GCP for Astronomer Deployment

> Note: You can view Google Cloud Platform's Web Console at https://console.cloud.google.com/

### Create a GCP Project

Login to your Google account with the `gcloud` CLI:
```
$ gcloud auth login
```

Create a project:
```
$ gcloud projects create [PROJECT_ID]
```

Confirm the project was successfully created:
```
$ gcloud projects list
PROJECT_ID             NAME                PROJECT_NUMBER
astronomer-project     astronomer-project  364686176109
```

Configure the `gcloud` CLI for use with your new project:
```
$ gcloud config set project [PROJECT_ID]
```

Set your preferred compute zone, which will have a compute region tied to it.

You'll need this later on:

```
$ gcloud compute zones list
$ gcloud config set compute/zone [COMPUTE_ZONE]
```

### Create a GKE Cluster

Now that you have a GCP project to work with, the next step is to create a GKE (Google Kubernetes Engine) cluster that the Astronomer platform can be deployed into. Learn more about GKE [here](https://cloud.google.com/kubernetes-engine/).

First, enable the [Google Kubernetes Engine API](https://console.cloud.google.com/apis/library/container.googleapis.com?q=kubernetes%20engine).

Then, create a Kubernetes cluster via the `gcloud` CLI:

```
$ gcloud container clusters create [CLUSTER_NAME] --zone [COMPUTE_ZONE] --cluster-version [VERSION] --machine-type n1-standard-8 --enable-autoscaling --max-nodes 10 --min-nodes 3
```

A few important notes:

- Astronomer currently supports Kubernetes versions 1.14, 1.15 and 1.16 on GKE.
- We recommend using the [`n1-standard-8` machine type](https://cloud.google.com/compute/docs/machine-types#n1_standard_machine_types) with a minimum of 3 nodes (24 CPUs) as a starting point.
- The Astronomer platform and all components within it will consume ~11 CPUs and ~40GB of memory as the default overhead, so we generally recommend using larger vs smaller nodes.
- For more detailed instructions and a full list of optional flags, refer to GKE's ["Creating a Cluster"](https://cloud.google.com/kubernetes-engine/docs/how-to/creating-a-cluster).

If you work with multiple Kubernetes environments, `kubectx` is an incredibly useful tool for quickly switching between Kubernetes clusters. Learn more [here](https://github.com/ahmetb/kubectx).


### Create a Static IP Address

Generate a static IP address:
```
$ gcloud compute addresses create astronomer-ip --region [COMPUTE_REGION] --project [PROJECT_ID]
```

View your newly generated IP address and record the output for use later on:
```
$ gcloud compute addresses describe astronomer-ip --region [COMPUTE_REGION] --project [PROJECT_ID] --format 'value(address)'
```

## 4. Configure Helm with your GKE Cluster

Helm is a package manager for Kubernetes. It allows you to easily deploy complex Kubernetes applications. You'll use helm to install and manage the Astronomer platform. Learn more about helm [here](https://helm.sh/).

### Create a Kubernetes Namespace

Create a namespace to host the core Astronomer Platform. If you are running through a standard installation, each Airflow deployment you provision will be created in a seperate namespace that our platform will provision for you, this initial namespace will just contain the core Astronomer platform.

```
$ kubectl create namespace <my-namespace>
```

## 5. SSL Configuration

It is recommended to run Astronomer on a dedicated domain (`BASEDOMAIN`) or subdomain (`astro.BASEDOMAIN`)


Reiterating from above, you'll need a certificate that covers:
```
BASEDOMAIN
app.BASEDOMAIN
deployments.BASEDOMAIN
registry.BASEDOMAIN
houston.BASEDOMAIN
grafana.BASEDOMAIN
kibana.BASEDOMAIN
install.BASEDOMAIN

```

You can also use a wildcard cert for yourdomain (e.g. `*.astro.BASEDOMAIN.com`).
**Note:** You cannot use a self-signed certificate.


### Obtain a Free SSL Certificate from Let's Encrypt

If you are on a Mac:

```bash
$ docker run -it --rm --name letsencrypt -v /Users/<my-username>/<my-project>/letsencrypt1:/etc/letsencrypt -v /Users/<my-username>/<my-project>/letsencrypt2:/var/lib/letsencrypt certbot/certbot:latest certonly -d "*.astro.BASEDOMAIN.com" --manual --preferred-challenges dns --server https://acme-v02.api.letsencrypt.org/directory
```

If you are running Linux:

```bash
$ docker run -it --rm --name letsencrypt -v /etc/letsencrypt:/etc/letsencrypt -v /var/lib/letsencrypt:/var/lib/letsencrypt certbot/certbot:latest certonly -d "*.astro.BASEDOMAIN.com" --manual --preferred-challenges dns --server https://acme-v02.api.letsencrypt.org/directory
```

Follow the on-screen prompts and create a TXT record through your DNS provider. Wait a few minutes before continuing in your terminal.

Finally, create a Kubernetes secret that points to your certficates. If you used LetsEncrypt, the command looks like:


```bash
sudo kubectl create secret tls astronomer-tls --key /etc/letsencrypt/live/astro.mydomain.com/privkey.pem --cert /etc/letsencrypt/live/astro.mydomain.com/fullchain.pem --namespace <my-namespace>
```

(with the appropriate values substituted for your domain).

> **Note:** If you'd like to use another SSL Certificate authority, replace the paths to the Let's Encrypt cert and key .pem files with the paths to your certification's files in the command above.
> ```bash
> kubectl create secret tls astronomer-tls --key <path_to_key> --cert <path_to_cert> --namespace <my-namespace>
> ```

### Create a DNS A Record

If using a wildcard cert, create an A record through your DNS provider for  your domain (e.g. `*.astro.mydomain.com`) using your previously created static IP address.


## 6. Configure the Database

Astronomer by default requires a central Postgres database that will act as the backend for Astronomer's Houston API and will host individual Metadata Databases for all Airflow Deployments spun up on the platform.

While you're free to configure any database, most GCP users on Astronomer run [Google Cloud SQL](https://cloud.google.com/sql/). For production environments, we _strongly_ recommend a managed Postgres solution.

> **Note:** If you're setting up a development environment, this step is optional. Astronomer can be configured to deploy the PostgreSQL helm chart as the backend database with the following set in your `config.yaml`:
> ```
> global:
>   postgresqlEnabled: true
> ```

To connect to an external database to your GKE cluster, create a Kubernetes Secret named `astronomer-bootstrap` that points to your database.

```bash
kubectl create secret generic astronomer-bootstrap \
  --from-literal connection="postgres://USERNAME:$PASSWORD@host:5432" \
  --namespace astronomer
```

## 7. Configure your Helm Chart

Now that your Kubernetes cluster has been configured with all prerequisites, you can deploy Astronomer!

Create a file named `config.yaml` in an empty directory.

For context, this `config.yaml` file will assume a set of default values for our platform that specify everything from user role definitions to the Airflow images you want to support. As you grow with Astronomer and want to customize the platform to better suit your team and use case, your `config.yaml` file is the best place to do so.

Set the following values in `config.yaml`:

* `baseDomain: astro.mydomain.com`
* `tlsSecret: astronomer-tls`
* `loadBalancerIP: <my-static-ip>`
* SMTP credentials as a houston config

Add the following line in the `nginx:` section:

* `preserveSourceIP: true`

Here is an example of what your `config.yaml` might look like:

```yaml
#################################
### Astronomer global configuration
#################################
global:
  # Base domain for all subdomains exposed through ingress
  baseDomain: astro.mydomain.com

  # Name of secret containing TLS certificate
  tlsSecret: astronomer-tls

#################################
### Nginx configuration
#################################
nginx:
  # IP address the nginx ingress should bind to
  loadBalancerIP: ~

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
        serviceAccountAnnotationKey: iam.gke.io/gcp-service-account # Flag to enable using IAM roles (don't enter a specific role)
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
            enabled: true # Lets users authenticate with Github
```

Note - the SMTP URI will take the form:

```
smtpUrl: smtps://USERNAME:PW@HOST/?pool=true
```

For more example configuration files, go [here](https://github.com/astronomer/astronomer/tree/release-0.16/configs).

Check out our `Customizing Your Install` section for guidance on setting an [auth system](/docs/enterprise/v0.16/manage-astronomer/integrate-auth-system/) and [resource requests](https://www.astronomer.io/docs/enterprise/v0.16/manage-astronomer/configure-platform-resources/) in this `config.yaml`.

## 8. Install Astronomer

Now that you have a GCP cluster set up and your `config.yaml` defined, you're ready to deploy all components of our platform.

First, run:

```
$ helm repo add astronomer https://helm.astronomer.io/
```

Then, run:

```sh
$ helm install astronomer -f config.yaml --version=0.16 astronomer/astronomer --namespace astronomer
```

This command will install the latest available patch version of Astronomer Enterprise v0.16. To specify a patch, add it to the `--version=` flag in the format of `0.16.x`. To install Astronomer Enterprise v0.16.9, for example, specify `--version=0.16.9`. For information on all available patch versions, refer to [Enterprise Release Notes](/docs/enterprise/v0.16/resources/release-notes/).

Once you run the commands above, a set of Kubernetes pods will be generated in your namespace. These pods power the individual services required to run our platform, including the Astronomer UI, our Houston API, etc.

## 9. Verify all pods are up

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
newbie-norse-orbit-d5585ccd8-h8zkr                     1/1     Running     0          30m
newbie-norse-prisma-699bd664bb-vbvlf                   1/1     Running     0          30m
newbie-norse-prometheus-0                              1/1     Running     0          30m
newbie-norse-registry-0                                1/1     Running     0          30m
```

If you are seeing issues here, check out our [guide on debugging your installation](/docs/enterprise/v0.16/troubleshoot/debug-install/)

## 10. Access Astronomer's Orbit UI

Go to app.BASEDOMAIN to see the Astronomer UI.

## 11. Verify SSL

To make sure that the certs were accepted, log into the platform and head to `app.BASEDOMAIN/token` and run:

`curl -v -X POST https://houston.BASEDOMAIN/v1 -H "Authorization: Bearer <token>"`

Verify that this output matches with:

`curl -v -k -X POST https://houston.BASEDOMAIN/v1 -H "Authorization: Bearer <token>"`
(The `-k` flag will run the command without looking for SSL)

Finally, to make sure the registry accepted SSL, try to log into the registry:

```
docker login registry.BASEDOMAIN -u _ -p <token>
```
