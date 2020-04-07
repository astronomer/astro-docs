---
title: "General Kubernetes Installation Guide"
description: "How to install Astronomer on a Kubernetes cluster."
date: 2018-10-12T00:00:00.000Z
slug: "ee-installation-general-kubernetes"
---

This guide describes the process to install Astronomer on a Kubernetes Cluster.

## 1. Install Necessary Tools

* [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
* [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)
* [Kubernetes CLI (kubectl)](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
* [Helm v2.16.1](https://github.com/helm/helm/releases/tag/v2.16.1)
* SMTP Credentials (Mailgun, Sendgrid) or any service will  work!
* Permissions to create/modify resources on AWS
* A certificate that covers a handful of subdomains (we'll show you how to create a free 90 day wildcard cert in this guide)

**Note:** You cannot use a self-signed certificate.


## 2. Choose a Suitable Domain

All Astronomer services will be tied to a base domain of your choice. You will need the ability to add / edit DNS records under this domain.

Here are some examples of accessible services when we use the base domain `astro.mydomain.com`:

* Astronomer UI: `app.astro.mydomain.com`
* New Airflow Deployments: `deployments.astro.mydomain.com/uniquely-generated-airflow-name`
* Grafana Dashboard: `grafana.astro.mydomain.com`
* Kibana Dashboard: `kibana.astro.mydomain.com`

## 3. Configure Helm on your Cluster

Helm is a package manager for Kubernetes. It allows you to easily deploy complex Kubernetes applications. You'll use Helm to install and manage the Astronomer platform. Learn more about Helm [here](https://helm.sh/).

### Create a Kubernetes Namespace

Create a namespace to host the core Astronomer Platform. If you are running through a standard installation, each Airflow deployment you provision will be created in a separate namespace that our platform will provision for you, this initial namespace will just contain the core Astronomer platform.

```
$ kubectl create namespace <my-namespace>
```

### Create a Tiller Service Account

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

### Deploy a Tiller Pod

Your Helm client communicates with your kubernetes cluster through a `tiller` pod.  To deploy your tiller, run:
```
$ helm init --service-account tiller
```

Confirm your `tiller` pod was deployed successfully:
```
$ helm version
```

## 4. Configure the Database

**Note:** This step is optional for development environnets - Astronomer will deploy with the PostgresQL helm chart as the backend database. While this is fine for any sort of testing or non-production environments, it is **not** recommended for production environments - a managed Postgres solution is much preferred.

To connect to an external database, create an `astronomer-bootstrap` secret that points to your database.

```bash
kubectl create secret generic astronomer-bootstrap \
  --from-literal connection="postgres://USERNAME:$PASSWORD@host:5432" \
  --namespace astronomer
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

Linux:
```
$ docker run -it --rm --name letsencrypt -v /etc/letsencrypt:/etc/letsencrypt -v /var/lib/letsencrypt:/var/lib/letsencrypt certbot/certbot:latest certonly -d "*.astro.mydomain.com" --manual --preferred-challenges dns --server https://acme-v02.api.letsencrypt.org/directory
```

macOS:
```
$ docker run -it --rm --name letsencrypt -v /Users/<my-username>/<my-project>/letsencrypt1:/etc/letsencrypt -v /Users/<my-username>/<my-project>/letsencrypt2:/var/lib/letsencrypt certbot/certbot:latest certonly -d "*.astro.mydomain.com" --manual --preferred-challenges dns --server https://acme-v02.api.letsencrypt.org/directory
```

Follow the on-screen prompts and create a TXT record through your DNS provider. Wait a few minutes before continuing in your terminal.

### Create TLS Secret

Create a TLS secret named `astronomer-tls` using the previously generated SSL certificate files:
```
$ sudo kubectl create secret tls astronomer-tls --key /etc/letsencrypt/live/astro.mydomain.com/privkey.pem --cert /etc/letsencrypt/live/astro.mydomain.com/fullchain.pem --namespace <my-namespace>
```
**Note:** If you generated your certs using LetsEncrypt, you will need to run the command above as `sudo`

## 6. Configure your Helm Chart

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

**Note:** Depending on how your K8s cluster is configured, you may first have to create a static IP address **OR** use the IP address created by the load balancer after you deploy your cluster. If an IP is generated for you after you deploy, you can leave teh `NGNIX` section below blank.

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
  preserveSourceIP: true

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

## 7. Install Astronomer

```
$ helm install -f config.yaml . --namespace <my-namespace>
```

## 8. Verify Pods are Up

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

If you are seeing issues here, check out our [guide on debugging your installation](https://astronomer.io/docs/ee-debugging-install/)


## 9. Access Astronomer's Orbit UI

Navigate to `app.BASEDOMAIN` in your browser to see the Astronomer UI in action.

## 10. Verify SSL

To make sure that the certificates were accepted, log into the platform and head to `app.BASEDOMAIN/token` and run:

`curl -v -X POST https://houston.BASEDOMAIN/v1 -H "Authorization: Bearer <token>"`

Verify that this output matches with:

`curl -v -k -X POST https://houston.BASEDOMAIN/v1 -H "Authorization: Bearer <token>"`
(The `-k` flag will run the command without looking for SSL)

Finally, to make sure the registry accepted SSL, try to log into the registry:

```
docker login registry.BASEDOMAIN -u _ p <token>
```
