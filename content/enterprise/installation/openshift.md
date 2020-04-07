---
title: "Openshift Kubernetes Installation Guide"
description: "How to deploy a Kubernetes native Apache Airflow platform onto Red Hat OpenShift."
date: 2019-10-11T00:00:00.000Z
slug: "ee-installation-openshift"
---

# Installing Astronomer on Red Hat OpenShift
Deploy a Kubernetes native [Apache Airflow](https://airflow.apache.org/) platform onto [Red Hat OpenShift](https://www.openshift.com/).

## 1. Install Necessary Tools
* [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
* [OpenShift CLI](https://github.com/openshift/origin/releases)
* [Helm v2.14.3](https://github.com/helm/helm/releases/tag/v2.14.3)
* SMTP Creds (Mailgun, Sendgrid) or any service will  work!
* A wildcard SSL cert (we'll show you how to create a free 90 day cert in this guide)!

*NOTE - If you work with multiple Kubernetes environments, `kubectx` is an incredibly useful tool for quickly switching between Kubernetes clusters. Learn more [here](https://github.com/ahmetb/kubectx).*

## 2. Choose a Suitable Domain
All Astronomer services will be tied to a base domain of your choice. You will need the ability to add / edit DNS records under this domain. Here are some examples of accessible services when we use the base domain `astro.mydomain.com`:

* Astronomer UI: `app.astro.mydomain.com`
* New Airflow Deployments: `unique-name-airflow.astro.mydomain.com`
* Grafana Dashboard: `grafana.astro.mydomain.com`
* Kibana Dashboard: `kibana.astro.mydomain.com`

## 3. Astronomer Ingress on OpenShift
Astronomer uses its own NGINX Load Balancer to handle ingress and authorization. Ingress traffic must be routed to Astronomer's NGINX Load Balancer. This can be accomplished a few different ways, depending on the version of your OpenShift cluster:

### OpenShift 3.9 and Below
In OpenShift 3.9 and below, we are able to create custom Routes to direct ingress traffic through OpenShift's Router to Astronomer's NGINX Load Balancer. These Routes will be configured in step 11 of this guide.

### OpenShift 3.10 and Above
As of OpenShift 3.10, Kubernetes ingress objects are fully supported and recognized by OpenShift. This means that ingress objects are directly translated to Routes. With this addition, we lose the ability to create custom routes as we were able to in version 3.9 and below. You can find more information on this feature addition [here](https://docs.openshift.com/container-platform/3.10/architecture/networking/routes.html#architecture-routes-support-for-ingress).

To solve for this, we need to assign a static IP address to our NGINX Load Balancer. This requires the ability to assign unique IPs (external to your cluster) to service types such as `LoadBalancer`. You can find detailed instructions on how to do so [here](https://docs.openshift.com/container-platform/3.10/admin_guide/tcp_ingress_external_ports.html#unique-external-ips-ingress-traffic-configure-cluster). You'll assign the IP address to the NGINX Load Balancer in step 9 of this guide. When choosing an IP, make sure it is within the `ingressIPNetworkCIDR` range that you've configured your cluster to use.

## 4. Configure Helm with your OpenShift Cluster
Helm is a package manager for Kubernetes. It allows you to easily deploy complex Kubernetes applications. You'll use helm to install and manage the Astronomer platform. Learn more about helm [here](https://helm.sh/).

### Create an OpenShift Project
Create a namespace (project) to host the core Astronomer Platform. If you are running through a standard installation, each Airflow deployment you provision will be created in a separate namespace that our platform will provision for you, this initial namespace will just contain the core Astronomer platform.

```
$ oc create namespace <my-namespace>
```

### Create a `tiller` Service Account
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

Run the following command to apply these configurations to your OpenShift cluster:
```
$ oc create -f rbac-config.yaml
```

### Deploy a `tiller` Pod
Your Helm client communicates with your OpenShift cluster through a `tiller` pod.  To deploy your tiller, run:
```
$ helm init --service-account tiller
```

Confirm your `tiller` pod was deployed successfully:
```
$ helm version
```

## 5. Apply Security Context Constraints
Astronomer's core components will require security context constraints to be applied to their service accounts.  
* Most components require the `anyuid` security context constraint in order to run the container as the `root` user.
* Logging components (`elasticsearch`, `fluentd`) require the `privileged` security context constraint as they work at the node level to collect container logs. 

The value used for `<release-name>` here will be the same used later on in step 10. We recommend using something like `astronomer` or `astro`.

More information on Security Context Constraints can be found [here](https://blog.openshift.com/understanding-service-accounts-sccs/).

*NOTE - The following SCCs will be integrated into our helm charts in a future release of Astronomer.*

### Apply `anyuid` SCC
```
$ oc adm policy add-scc-to-user anyuid system:serviceaccount:<my-namespace>:default
```

```
$ oc adm policy add-scc-to-user anyuid system:serviceaccount:<my-namespace>:<release-name>-commander
```

```
$ oc adm policy add-scc-to-user anyuid system:serviceaccount:<my-namespace>:<release-name>-houston-bootstrapper
```

```
$ oc adm policy add-scc-to-user anyuid system:serviceaccount:<my-namespace>:<release-name>-nginx
```

```
$ oc adm policy add-scc-to-user anyuid system:serviceaccount:<my-namespace>:<release-name>-prisma-bootstrapper
```

```
$ oc adm policy add-scc-to-user anyuid system:serviceaccount:<my-namespace>:<release-name>-prometheus
```

### Apply `privileged` SCC
```
oc adm policy add-scc-to-user privileged system:serviceaccount:<my-namespace>:default
```

```
oc adm policy add-scc-to-user privileged system:serviceaccount:<my-namespace>:<release-name>-fluentd
```

## 6. Deploy a PostgreSQL Database
To serve as the backend-db for Airflow and our API, you'll need a running Postgres instance that will be able to talk to your OpenShift cluster. We recommend using a dedicated Postgres since Airflow will create a new database inside of that Postgres for each Airflow deployment.

We recommend you deploy a PostgreSQL database through a cloud provider database service like Google Cloud SQL.  This will require the full connection string for a user that has the ability to create, delete, and updated databases and users.

For demonstration purposes, we'll use the PostgreSQL helm chart:
```
$ helm install --name <my-astro-db> stable/postgresql --namespace <my-namespace>
```

*NOTE - We recommend using a Postgres instance with 3CPUs and 10GB of memory.* 


## 7. SSL Configuration

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
Create an A record through your DNS provider for `*.astro.mydomain.com`:
* If you are using OpenShift 3.9 or below, use your OpenShift Router's IP for the value of this A record.
* If you are using OpenShift 3.10 or above, use a static IP for the value of this A record.

## 8. Create OpenShift Secrets
You'll need to create two OpenShift secrets - one for the databases to be created and one for TLS.

### Create Database Connection Secret
Set an environment variable `$PGPASSWORD` containing your PostgreSQL database password:
```
$ export PGPASSWORD=$(oc get secret --namespace <my-namespace> <my-astro-db>-postgresql -o jsonpath="{.data.postgresql-password}" | base64 --decode; echo)
```

Confirm your `$PGPASSWORD` variable is set properly:
```
$ echo $PGPASSWORD
```

Create an OpenShift secret named `astronomer-bootstrap` to hold your database connection string:
```
$ oc create secret generic astronomer-bootstrap --from-literal connection="postgres://postgres:$PGPASSWORD@<my-astro-db>-postgresql.<my-namespace>.svc.cluster.local:5432" --namespace <my-namespace>
```

### Create TLS Secret
Create a TLS secret named `astronomer-tls` using the previously generated SSL certificate files:
```
$ oc create secret tls astronomer-tls --key /etc/letsencrypt/live/astro.mydomain.com/privkey.pem --cert /etc/letsencrypt/live/astro.mydomain.com/fullchain.pem --namespace <my-namespace>
```
*Note - If you generated your certs using LetsEncrypt, you will need to run the command above as `sudo`*

## 9. Configure your Helm Chart
Now that your OpenShift cluster has been configured with all prerequisites, you can deploy Astronomer!

Clone the Astronomer helm charts locally and checkout your desired branch:
```
$ git clone https://github.com/astronomer/astronomer.git
$ git checkout <branch-name>
```

Create your `config.yaml` by copying our `starter.yaml` template:
```
$ cp ./configs/starter.yaml ./config.yaml
```

Set the following values in `config.yaml`:
* `baseDomain: astro.mydomain.com`
* `tlsSecret: astronomer-tls`
* `loadBalancerIP:`
  * Leave blank for OpenShift 3.9 and below
  * Use a static IP within your cluster's `ingressIPNetworkCIDR` range for OpenShift 3.10 and above
* SMTP credentails as a houston config


Here is an example of what your `config.yaml` might look like:
```
global:
  # Base domain for all subdomains exposed through ingress
  baseDomain: astro.mydomain.com

  # Name of secret containing TLS certificate
  tlsSecret: astronomer-tls

nginx:
  # IP address the nginx ingress should bind to
  loadBalancerIP: 0.0.0.0

# SMTP configuration
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


Check out our `Customizing Your Install` section for guidance on setting an [auth system](https://www.astronomer.io/docs/ee-integrating-auth-system/) and [resource requests(https://www.astronomer.io/docs/ee-configuring-resources/) in this `config.yaml`.

## 10. Install Astronomer
Install the Astronomer platform using `helm`. Be sure to use the same value for `<release-name>` that was used in step 5.

```
$ helm install --name <release-name> -f config.yaml . --namespace <my-namespace>
```

## 11. Configure OpenShift Routes
### OpenShift 3.9 and Below
Create Routes for the following URLs. We'll use `astro.mydomain.com` as an example base domain:

*NOTE - The following Routes will be integrated into our helm charts in a future release of Astronomer.*

* `astro.mydomain.com`
* `app.astro.mydomain.com`
* `houston.astro.mydomain.com`
* `registry.astro.mydomain.com`
* `grafana.astro.mydomain.com`
* `kibana.astro.mydomain.com`
* `install.astro.mydomain.com`

Create each of these Routes with the following configurations:
* Path: `/`
* Service: `<release-name>-nginx`
* Target Port: `443`
* TLS Termination: `Passthrough`
* Insecure Traffic: `Redirect`

### OpenShift 3.10 and Above
There is no need to configure Routes if you are using OpenShift 3.10 or later.

## 12. Verify You Can Access the Orbit UI
Go to `app.BASEDOMAIN` to see the Astronomer UI.

## 13. Security Context Constraints for Airflow Deployments
Each Airflow deployment that you create will be provisioned in a new namespace (project). You'll need to apply the `anyuid` SCC to the `default` service account for each Airflow deployment.

*NOTE - The following SCCs will be integrated into our helm charts in a future release of Astronomer.*

```
oc adm policy add-scc-to-user privileged system:serviceaccount:<airflow-deployment-namespace>:default
```
