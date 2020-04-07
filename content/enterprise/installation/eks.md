---
title: "AWS EKS Installation Guide"
description: "How to install Astronomer on Amazon Web Services (AWS)."
date: 2018-10-12T00:00:00.000Z
slug: "ee-installation-eks"
---

This guide describes the steps to install Astronomer on Amazon Web Services (AWS), which allows you to deploy and scale any number of [Apache Airflow](https://airflow.apache.org/) deployments within an [AWS Elastic Kubernetes Service](https://aws.amazon.com/eks/) cluster.

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

## 3. Spin up the EKS Control Plane and a Kubernetes Cluster

You'll need to spin up the [EKS Control Plane](https://aws.amazon.com/eks/) as well as the worker nodes in your Kubernetes cluster. Amazon built EKS off of their pre-existing EC2 service, so you can manage your Kubernetes nodes the same way you would manage your EC2 nodes.

[This guide](https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html) by Amazon will take you through this process. **Before you go through this, keep in mind:**

* We generally advise running the EKS control plane in a single security group. The worker nodes you spin up should have the same setup as the EKS control plane.
* All security/access settings needed for your worker nodes should be configured in your Cloud Formation template.
* If you are creating the EKS cluster from the UI **only the user who created the cluster will have kubectl access to the cluster**. To give more users `kubectl` access, you'll have to configure that manually. [This post](http://marcinkaszynski.com/2018/07/12/eks-auth.html) goes through how IAM plays with EKS.
* You'll be able to see each of your underlying nodes in the EC2 console. We recommend using 3 [t2.2xlarge](https://aws.amazon.com/ec2/instance-types/) nodes as a starting cluster size. You are free to use whatever node types you'd like, but Astronomer takes ~11 CPUs and ~40GB of memory as the default overhead. You can customize the default resource requests (see step 9).

**Note:** If you work with multiple Kubernetes environments, `kubectx` is an incredibly useful tool for quickly switching between Kubernetes clusters. Learn more [here](https://github.com/ahmetb/kubectx).

## 4. Create a Namespace and Configure Helm+Tiller

Create a namespace to host the core Astronomer Platform. If you are running through a standard installation, each Airflow deployment you provision will be created in a _seperate_ namespace that our platform will provision for you, this initial namespace will just contain the core Astronomer platform.

```bash
$ kubectl create ns astronomer
```

### Create a tiller Service Account

Save the following in a file named `rbac-config.yaml`:

```yaml
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

```bash
$ kubectl create -f rbac-config.yaml
```

### Deploy a tiller Pod

Your Helm client communicates with your kubernetes cluster through a `tiller` pod.  To deploy your tiller, run:

```bash
$ helm init --service-account tiller
```

Confirm your `tiller` pod was deployed successfully:

```bash
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

## 6. Configure the Database

**Note:** This step is optional for development environnets - Astronomer will deploy with the PostgresQL helm chart as the backend database. While this is fine for any sort of testing or non-production environments, it is **not** recommended for production environments - a managed Postgres solution is much preferred.

To connect to an external database, create an `astronomer-bootstrap` secret that points to your database.

```bash
kubectl create secret generic astronomer-bootstrap \
  --from-literal connection="postgres://USERNAME:$PASSWORD@host:5432" \
  --namespace astronomer
```

> Note: We recommend using a [t2 medium](https://aws.amazon.com/rds/instance-types/) as the minimum RDS instance size.

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
* SMTP credentails as a houston config

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
    config:
      email:
        enabled: true
        smtpUrl: YOUR_URI_HERE
```

The SMTP URI will take the form:

```
smtpUrl: smtps://USERNAME:PW@HOST/?pool=true
```

**Note:** If you are using Amazon SES, your URL will look like:
`smtpUrl: smtp://USERNAME:PW@HOST/?requireTLS=true`

If there are `/` or other escape characters in your username or password, you may need to [URL encode](https://www.urlencoder.org/) those characters.


Check out our `Customizing Your Install` section for guidance on setting an [auth system](https://www.astronomer.io/docs/ee-integrating-auth-system/) and [resource request](https://www.astronomer.io/docs/ee-configuring-resources/) in this `config.yaml`.

## 9. Install Astronomer

```
$ helm install -f config.yaml . --namespace <my-namespace>
```

## 10. Verify Pods are Up

To verify all pods are up and running, run:

```
kubectl get pods --namespace <my-namespace>
```

You should see something like this:

```command
kubectl get pods --namespace astronomer

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

## 11. Configure DNS

Now that you've successfully installed Astronomer, a new load balancer will have spun up for your Kubernetes cluster.  You will need to create a new CNAME record in your DNS to route traffic to the ELB. 

```

$ kubectl get svc -n astronomer
NAME                                 TYPE           CLUSTER-IP       EXTERNAL-IP                                                               PORT(S)                                      AGE
astronomer-alertmanager              ClusterIP      172.20.48.232    <none>                                                                    9093/TCP                                     24d
astronomer-cli-install               ClusterIP      172.20.95.132    <none>                                                                    80/TCP                                       24d
astronomer-commander                 ClusterIP      172.20.167.227   <none>                                                                    8880/TCP,50051/TCP                           24d
astronomer-elasticsearch             ClusterIP      172.20.161.0     <none>                                                                    9200/TCP,9300/TCP                            24d
astronomer-elasticsearch-discovery   ClusterIP      172.20.225.200   <none>                                                                    9300/TCP                                     24d
astronomer-elasticsearch-exporter    ClusterIP      172.20.2.113     <none>                                                                    9108/TCP                                     24d
astronomer-elasticsearch-nginx       ClusterIP      172.20.154.232   <none>                                                                    9200/TCP                                     24d
astronomer-grafana                   ClusterIP      172.20.120.247   <none>                                                                    3000/TCP                                     24d
astronomer-houston                   ClusterIP      172.20.25.26     <none>                                                                    8871/TCP                                     24d
astronomer-kibana                    ClusterIP      172.20.134.149   <none>                                                                    5601/TCP                                     24d
astronomer-kube-state                ClusterIP      172.20.123.56    <none>                                                                    8080/TCP,8081/TCP                            24d
astronomer-kubed                     ClusterIP      172.20.4.200     <none>                                                                    443/TCP                                      24d
astronomer-nginx                     LoadBalancer   172.20.54.142    ELB_ADDRESS.us-east-1.elb.amazonaws.com                                   80:31925/TCP,443:32461/TCP,10254:32424/TCP   24d
astronomer-nginx-default-backend     ClusterIP      172.20.186.254   <none>                                                                    8080/TCP                                     24d
astronomer-orbit                     ClusterIP      172.20.186.166   <none>                                                                    8080/TCP                                     24d
astronomer-prisma                    ClusterIP      172.20.144.188   <none>                                                                    4466/TCP                                     24d
astronomer-prometheus                ClusterIP      172.20.72.196    <none>                                                                    9090/TCP                                     24d
astronomer-registry                  ClusterIP      172.20.100.102   <none>                                                                    5000/TCP                                     24d

```


Navigate to your newly created load balancer and copy the DNS name: route and use this to create a new wildcard CNAME record in you DNS. If your base domain is *organization.io* your wildcard record should be *.organization.io* and will route traffic to your ELB using that DNS name.

If you used a LetsEncrypt wildcard cert:

![aws-elb](https://assets2.astronomer.io/main/docs/ee/route53.png)


## 12. Verify You Can Access the Orbit UI

Go to `app.BASEDOMAIN` to see the Astronomer UI.


## 13 Verify SSL

To make sure that the certificates were accepted, log into the platform and head to `app.BASEDOMAIN/token` and run:

`curl -v -X POST https://houston.BASEDOMAIN/v1 -H "Authorization: Bearer <token>"`

Verify that this output matches with:

`curl -v -k -X POST https://houston.BASEDOMAIN/v1 -H "Authorization: Bearer <token>"`
(The `-k` flag will run the command without looking for SSL)

Finally, to make sure the registry accepted SSL, try to log into the registry:

```
docker login registry.BASEDOMAIN -u _ p <token>
```