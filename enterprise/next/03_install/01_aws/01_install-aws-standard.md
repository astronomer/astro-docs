---
title: "AWS EKS Installation Guide"
navTitle: "Standard Installation"
description: "How to install Astronomer on Amazon Web Services (AWS)."
---

This guide describes the steps to install Astronomer Enterprise on Amazon Web Services (AWS), which allows you to deploy and scale [Apache Airflow](https://airflow.apache.org/) within an AWS [Elastic Kubernetes Service](https://aws.amazon.com/eks/) (EKS) cluster.

## Prerequisites

To install Astronomer on EKS, you'll need access to the following tools and permissions:

* The [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)
* Kubernetes 1.16 or later
* The [Kubernetes CLI (kubectl)](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
* The [OpenSSL CLI](https://www.openssl.org/docs/man1.0.2/man1/openssl.html)
* [Helm v3.2.1](https://github.com/helm/helm/releases/tag/v3.2.1)
* An SMTP Service & Credentials (e.g. Mailgun, Sendgrid, etc.)
* Permission to create and modify resources on AWS
* Permission to generate a certificate (not self-signed) that covers a defined set of subdomains

## Step 1: Choose a Base Domain

All Astronomer services will be tied to a base domain of your choice, under which you will need the ability to add and edit DNS records.

Once created, your Astronomer base domain will be linked to a variety of sub-services that your users will access via the internet to manage, monitor and run Airflow on the platform.

For the base domain `astro.mydomain.com`, for example, here are some corresponding URLs that your users would be able to reach:

* Astronomer UI: `app.astro.mydomain.com`
* Airflow Deployments: `deployments.astro.mydomain.com/uniquely-generated-airflow-name/airflow`
* Grafana Dashboard: `grafana.astro.mydomain.com`
* Kibana Dashboard: `kibana.astro.mydomain.com`

For the full list of subdomains, see Step 4.

## Step 2: Spin up the EKS Control Plane and a Kubernetes Cluster

To proceed with the installation, you'll need to spin up an [EKS Control Plane](https://aws.amazon.com/eks/) as well as worker nodes in your Kubernetes cluster by following [this AWS guide](https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html).

EKS is built off of Amazon's pre-existing EC2 service, so you can manage your Kubernetes nodes the same way you would manage your EC2 nodes.

As you follow the guide linked above, keep in mind:

* Astronomer currently supports Kubernetes versions 1.14, 1.15, 1.16 and 1.17 on EKS.
* We generally advise running the EKS control plane in a single security group. The worker nodes you spin up should have the same setup as the EKS control plane.
* All security and access settings needed for your worker nodes should be configured in your Cloud Formation template.
* If you create an EKS cluster from the UI, `kubectl` access will be limited to the user who created the cluster by default.
    * To give more users `kubectl` access, you'll have to do so manually.
    * [This post](https://web.archive.org/web/20190323035848/http://marcinkaszynski.com/2018/07/12/eks-auth.html) goes through how IAM plays with EKS.
* Expect to see each of your underlying nodes in the EC2 console.
    * Given Astronomer's default resource request of ~11 CPUs and ~40GB of memory, we recommend using either six m5.xlarge or three m5.2xlarge [instances](https://aws.amazon.com/ec2/instance-types/) for your cluster. To modify Astronomer's default resource requests, see step 6.

> **Note:** If you work with multiple Kubernetes environments, `kubectx` is an incredibly useful tool for quickly switching between Kubernetes clusters. Learn more [here](https://github.com/ahmetb/kubectx).

## Step 3: Create a Namespace

Now that you have a base domain and an EKS cluster up and running, you'll need to create a namespace to host the core Astronomer Platform.

For standard installations, each Airflow Deployment provisioned on the platform will automatically be created within an additional, isolated namespace.

The initial namespace we're creating below will just contain the core Astronomer platform.

```bash
$ kubectl create ns astronomer
```

## Step 4: Configure TLS

We recommend running Astronomer Enterprise on a dedicated domain (`BASEDOMAIN`) or subdomain (`astro.BASEDOMAIN`).

In order for users to access the web applications they need to manage Astronomer, you'll need a TLS certificate that covers the following subdomains:

```sh
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

To obtain a TLS certificate, complete one of the following setup options:

* **Option 1:** Obtain a TLS certificate from Let's Encrypt. We recommend this option for smaller organizations where your DNS administrator and Kubernetes cluster administrator are either the same person or on the same team.
* **Option 2:** Request a TLS certificate from your organization's security team. We recommend this option for large organizations with their own  protocols for generating TLS certificates.

### Option 1: Create automatically renewed TLS certificates using Let's Encrypt

Let's Encrypt is a free and secure service that provides automatically renewed TLS certificates. Use this option if you are configuring Astronomer for a smaller organization without a dedicated security team.

To set up TLS certificates this way, complete the setup in [Automatically Renew TLS Certificates Using Let's Encrypt](https://www.astronomer.io/docs/enterprise/stable/manage-astronomer/renew-tls-cert#automatically-renew-tls-certificates-using-lets-encrypt).

### Option 2: Request a TLS certificate from your security team

If you're installing Astronomer for a large organization, you'll need to request a TLS certificate and private key from your enterprise security team. This certificate needs to be valid for your the `BASEDOMAIN` your organization uses for Astronomer, as well as the subdomains listed at the beginning of Step 4. You should be given two `.pem` files: one for your encrypted certificate and one for your private key.

To confirm that your enterprise security team generated the correct certificate, run the following command using the openssl command line tool:

```sh
openssl x509 -in  <your-certificate-filepath> -text -noout
```

This command will generate a report. If the `X509v3 Subject Alternative Name` section of this report includes either a single `*.BASEDOMAIN` wildcard domain or the subdomains listed at the beginning of Step 4, then the certificate creation was successful.

Depending on your organization, you might receive either a globally trusted certificate or a certificate from a private certificate authority. If you received a globally trusted certificate, simply run the following command and proceed to Step 5:

```sh
kubectl create secret tls astronomer-tls --cert <your-certificate-filepath> --key <your-private-key-filepath>
```

If you received a certificate from a private certificate authority, complete the following setup instead:

1. Add the root certificate provided by your security team to a Kubernetes secret in the Astronomer namespace using the following command:
```sh
kubectl create secret generic private-root-ca --from-file=cert.pem=./<your-certificate-filepath>
```
> **Note:** The root certificate is you specify here should be the certificate of the authority that signed the Astronomer certificate, rather than the Astronomer certificate itself. This is the same certificate you need to install with all clients to get them to trust your services.

2. Note the value of `private-root-ca` for when you configure your Helm chart in Step 6. You'll need to additionally specify the `privateCaCerts` key-value pair with this value for that step.

## Step 5: Configure the Database

By default, Astronomer requires a central Postgres database that will act as the backend for Astronomer's Houston API and will host individual Metadata Databases for all Airflow Deployments spun up on the platform.

While you're free to configure any database, most AWS users on Astronomer run [Amazon RDS for PostgreSQL](https://aws.amazon.com/rds/postgresql/). For production environments, we _strongly_ recommend a managed Postgres solution.

> **Note:** If you're setting up a development environment, this step is optional. Astronomer can be configured to deploy the PostgreSQL helm chart as the backend database with the following set in your `config.yaml`:
> ```yml
> global:
>   postgresqlEnabled: true
> ```

To connect to an external database to your EKS cluster, create a Kubernetes Secret named `astronomer-bootstrap` that points to your database.

```bash
kubectl create secret generic astronomer-bootstrap \
  --from-literal connection="postgres://USERNAME:$PASSWORD@host:5432" \
  --namespace astronomer
```

> **Note:** We recommend using a [t2 medium](https://aws.amazon.com/rds/instance-types/) as the minimum RDS instance size.

## Step 6: Configure your Helm Chart

As a next step, create a file named `config.yaml` in an empty directory.

For context, this `config.yaml` file will assume a set of default values for our platform that specify everything from user role definitions to the Airflow images you want to support. As you grow with Astronomer and want to customize the platform to better suit your team and use case, your `config.yaml` file is the best place to do so.

In the newly created file, copy the example below and replace `baseDomain`, `private-root-ca`, `/etc/docker/certs.d`, `ssl.enabled`, and `smtpUrl` with your own values. For more example configuration files, go [here](https://github.com/astronomer/astronomer/tree/master/configs).


```yaml
#################################
### Astronomer global configuration
#################################
global:
  # Base domain for all subdomains exposed through ingress
  baseDomain: astro.mydomain.com

  # Name of secret containing TLS certificate
  tlsSecret: astronomer-tls

  # Enable privateCaCerts only if your enterprise security team
  # generated a certificate from a private certificate authority.
  privateCaCerts:
  - private-root-ca

  # Enable privateCaCertsAddToHost only when your nodes do not already
  # include the private CA in their docker trust store.
  # Most enterprises already have this configured,
  # and in that case 'enabled' should be false.
  privateCaCertsAddToHost:
    enabled: true
    hostDirectory: /etc/docker/certs.d
  # For development or proof-of-concept, you can use an in-cluster database
  postgresqlEnabled: false

  # SSL support for using SSL connections to
  # encrypt client/server communication
  # between database and the Astronomer platform.
  # If your database enforces SSL for connections,
  # change this value to true
  ssl:
    enabled: false
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
      publicSignups: false # Users need to be invited to have access to Astronomer. Set to true otherwise
      emailConfirmation: true # Users get an email verification before accessing Astronomer
      deployments:
        manualReleaseNames: true # Allows you to set your release names
        serviceAccountAnnotationKey: eks.amazonaws.com/role-arn # Flag to enable using IAM roles (don't enter a specific role)
      email:
        enabled: true
        smtpUrl: YOUR_URI_HERE
        reply: "noreply@astronomer.io" # Emails will be sent from this address
      auth:
        github:
          enabled: true # Lets users authenticate with Github
        local:
          enabled: false # Disables logging in with just a username and password
        openidConnect:
          google:
            enabled: true # Lets users authenticate with Google
```

 SMTP is required and will allow users to send and accept email invites to Astronomer. The SMTP URI will take the following form:

```yml
smtpUrl: smtps://USERNAME:PW@HOST/?pool=true
```

> **Note:** If you are using Amazon SES, your URL will look like the following:
`smtpUrl: smtp://USERNAME:PW@HOST/?requireTLS=true`. If there are `/` or other escape characters in your username or password, you may need to [URL encode](https://www.urlencoder.org/) those characters.

Information on other auth systems can be found [here](/docs/enterprise/stable/manage-astronomer/integrate-auth-system/). For more insight into how you might be able to customize Astronomer for your team, refer to step 12 at the bottom of this guide.

## Step 7: Install Astronomer

Now that you have an EKS cluster set up and your `config.yaml` file defined, you're ready to deploy all components of our platform.

First, run:

```sh
$ helm repo add astronomer https://helm.astronomer.io/
```

Then, run:

```sh
$ helm install astronomer -f config.yaml --version=<platform-version> astronomer/astronomer --namespace astronomer
```

Replace `<platform-version>` above with the version of the Astronomer platform you want to install in the format of `0.16.x`. For the latest version of Astronomer made generally available to Enterprise customers, refer to our ["Enterprise Release Notes"](/docs/enterprise/stable/resources/release-notes/). We recommend installing our latest as we regularly ship patch releases with bug and security fixes incorporated.

Running the commands above will generate a set of Kubernetes pods that will power the individual services required to run our platform, including the Astronomer UI, our Houston API, etc.

## Step 8: Verify Pods are Up

To verify all pods are up and running, run:

```sh
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

If you are seeing issues here, check out our [guide on debugging your installation](/docs/enterprise/stable/troubleshoot/debug-install/).

## Step 9: Configure DNS

Now that you've successfully installed Astronomer, a new Elastic Load Balancer (ELB) will have spun up in your AWS account. This ELB routes incoming traffic to our NGINX ingress controller.

Run `$ kubectl get svc -n astronomer` to view your ELB's CNAME, located under the `EXTERNAL-IP` column for the `astronomer-nginx` service.

```sh
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

You will need to create a new CNAME record through your DNS provider using the ELB CNAME listed above. You can create a single wildcard CNAME record such as `*.astro.mydomain.com`, or alternatively create individual CNAME records for the following routes:

```sh
app.astro.mydomain.com
deployments.astro.mydomain.com
registry.astro.mydomain.com
houston.astro.mydomain.com
grafana.astro.mydomain.com
kibana.astro.mydomain.com
install.astro.mydomain.com
alertmanager.astro.mydomain.com
prometheus.astro.mydomain.com
```

Example wildcard CNAME record:
![aws-elb](https://assets2.astronomer.io/main/docs/ee/route53.png)

## Step 10: Verify You Can Access the Astronomer UI

Go to `app.BASEDOMAIN` to see the Astronomer UI.

Consider this your new Airflow control plane. From the Astronomer UI, you'll be able to both invite and manage users as well as create and monitor Airflow Deployments on the platform.

## Step 11: Verify Your TLS Setup Was Successful

To check if your TLS certificates were accepted, log into the platform and head to `app.BASEDOMAIN/token` and run:

```
curl -v -X POST https://houston.BASEDOMAIN/v1 -H "Authorization: Bearer <token>"
```

Verify that this output matches with:

```
curl -v -k -X POST https://houston.BASEDOMAIN/v1 -H "Authorization: Bearer <token>"
```

> **Note:** The `-k` flag will run the command without looking for TLS

Finally, to make sure the registry is accepted by Astronomer's local docker client, try logging into Astronomer with the Astronomer CLI:

```
astro auth login <your-astronomer-base-domain>
```

If you can log in, then your Docker client trusts the registry. If Docker does not trust the Astronomer registry, run the following and restart Docker:
```
$ mkdir -p /etc/docker/certs.d
$ cp privateCA.pem /etc/docker/certs.d/
```
Next, try running `astro deploy` on a test deployment. Create a deployment in the Astronomer UI, then run:
```sh
$ mkdir demo
$ cd demo
$ astro airflow init
$ astro deploy -f
```
Check the Airflow namespace. If pods are changing at all, then the Houston API trusts the registry.

If you have Airflow pods in the state "ImagePullBackoff", check the pod description. If you see an x509 error, ensure that you added the `privateCaCertsAddToHost` key-value pairs to your Helm chart. If you missed these during installation, follow the steps in [Apply a Platform Configuration Change on Astronomer](https://www.astronomer.io/docs/enterprise/stable/manage-astronomer/apply-platform-config) to add them after installation.

## What's Next

To help you make the most of Astronomer Enterprise, check out the following additional resources:

* [Renew TLS Certificates on Astronomer Enterprise]((/docs/enterprise/stable/manage-astronomer/renew-tls-cert/)
* [Integrating an Auth System](/docs/enterprise/v0.16/manage-astronomer/integrate-auth-system/)
* [Configuring Platform Resources](/docs/enterprise/v0.16/manage-astronomer/configure-platform-resources/)
* [Managing Users on Astronomer Enterprise](/docs/enterprise/v0.16/manage-astronomer/manage-platform-users/)

### Astronomer Support Team

If you have any feedback or need help during this process and aren't in touch with our team already, a few resources to keep in mind:

* [Community Forum](https://forum.astronomer.io): General Airflow + Astronomer FAQs
* [Astronomer Support Portal](https://support.astronomer.io/hc/en-us/): Platform or Airflow issues

For detailed guidelines on reaching out to Astronomer Support, reference our guide [here](/docs/enterprise/stable/resources/support/).
