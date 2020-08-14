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
* [Helm v2.16.1](https://github.com/helm/helm/releases/tag/v2.14.1)
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

Astronomer will deploy to Google's managed Kubernetes service (Google Kubernetes Engine). Learn more about GKE [here](https://cloud.google.com/kubernetes-engine/).

Enable the [Google Kubernetes Engine API](https://console.cloud.google.com/apis/library/container.googleapis.com?q=kubernetes%20engine).

We recommend using `n1-standard-8` nodes as a starting sport, with a minimum of 3 nodes (24 CPUs). Astronomer platform and components takes ~11 CPUs and ~40GB of memory as the default overhead.

Create your Kubernetes cluster:

> Note: You can choose the machine type to use, but we recommend using larger nodes vs smaller nodes.

```
$ gcloud container clusters create [CLUSTER_NAME] --zone [COMPUTE_ZONE] --machine-type n1-standard-8 --enable-autoscaling --max-nodes 10 --min-nodes 3
```

**Note:** If you work with multiple Kubernetes environments, `kubectx` is an incredibly useful tool for quickly switching between Kubernetes clusters. Learn more [here](https://github.com/ahmetb/kubectx).


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

### Deploy a tiller pod

Your Helm client communicates with your kubernetes cluster through a `tiller` pod.  To deploy your tiller, run:

```
$ helm init --service-account tiller
```

Confirm your `tiller` pod was deployed successfully:

```
$ helm version
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
* SMTP credentails as a houston config

Add the following line in the `nginx:` section:

* `preserveSourceIP: true`

Here is an example of what your `config.yaml` might look like:

```
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
  loadBalancerIP: 0.0.0.0
  preserveSourceIP: true

#################################
### SMTP configuration
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

Check out our `Customizing Your Install` section for guidance on setting an [auth system](https://www.astronomer.io/docs/enterprise/v0.16/manage-astronomer/integrate-auth-system/) and [resource requests(https://www.astronomer.io/docs/ee-configuring-resources/) in this `config.yaml`.

## 8. Install Astronomer

```
$ helm install -f config.yaml . --namespace <my-namespace>
```

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

If you are seeing issues here, check out our [guide on debugging your installation](https://www.astronomer.io/docs/ee-debugging-install/)

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
docker login registry.BASEDOMAIN -u _ p <token>
```