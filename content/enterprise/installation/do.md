---
title: "Digital Ocean Kubernetes Installation Guide"
description: "How to deploy a Kubernetes native Apache Airflow platform onto Digital Ocean Kubernetes."
date: 2018-10-12T00:00:00.000Z
slug: "ee-installation-do"
---

# Installing Astronomer on Digital Ocean Kubernetes
_Deploy a Kubernetes native [Apache Airflow](https://airflow.apache.org/) platform onto [Digital Ocean Kubernetes](https://www.digitalocean.com/products/kubernetes/)_


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

## 3. Create and connect to a Kubernetes Cluster

Login to your DO account and navigate to Kubernetes -> Create Cluster:

![Create Cluster](https://assets2.astronomer.io/main/docs/ee/create_do_cluster.png)


You'll probably want to use 3 6CPU 16GB of memory nodes. You can read more about our resource requirements [here](https://www.astronomer.io/docs/ee-configuring-resources/)!
**Note:** - If you work with multiple Kubernetes environments, `kubectx` is an incredibly useful tool for quickly switching between Kubernetes clusters. Learn more [here](https://github.com/ahmetb/kubectx).*


### Connecting

Now that you have your cluster up, navigate to it and download the `kubeconfig` file associated with it.


![Kube Config](https://assets2.astronomer.io/main/docs/ee/kube_config.png)

You can either add this file to your `.kube/config` or you can refer to it explicility when you run your `kubectl` commands. For the rest of this guide, we will refer to it specifically.


## 4. Configure Helm with your Digital Ocean Cluster
Helm is a package manager for Kubernetes. It allows you to easily deploy complex Kubernetes applications. You'll use helm to install and manage the Astronomer platform. Learn more about helm [here](https://helm.sh/).

### Create a Kubernetes Namespace
Create a namespace to host the core Astronomer Platform. If you are running through a standard installation, each Airflow deployment you provision will be created in a separate namespace that our platform will provision for you, this initial namespace will just contain the core Astronomer platform.

```
$ kubectl  --kubeconfig="astro-do-test-kubeconfig.yaml" create namespace <my-namespace>
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

Run the following command to apply these configurations to your Kubernetes cluster:
```
$ kubectl apply --kubeconfig="astro-do-test-kubeconfig.yaml" -f rbac-config.yaml
```

### Deploy a `tiller` Pod

Your Helm client communicates with your kubernetes cluster through a `tiller` pod.  To deploy your tiller, run:

```
$ KUBECONFIG="astro-do-test-kubeconfig.yaml" helm init --service-account tiller
```

Confirm your `tiller` pod was deployed successfully:
```
$ KUBECONFIG="astro-do-test-kubeconfig.yaml" helm version
```

**Note:** This command pings the tiller pod to see if it's ready or not. If this command returns the client version but _not_ the server version, that's an indication that tiller was not successfully deployed.

## 5. Deploy a PostgreSQL Database

**Note:** This step is optional for development environnets - Astronomer will deploy with the PostgresQL helm chart as the backend database. While this is fine for any sort of testing or non-production environments, it is **not** recommended for production environments - a managed Postgres solution is much preferred.

To connect to an external database, create an `astronomer-bootstrap` secret that points to your database.

```bash
kubectl create secret generic astronomer-bootstrap \
  --from-literal connection="postgres://USERNAME:$PASSWORD@host:5432" \
  --namespace astronomer
```

## 6. SSL Configuration
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
  loadBalancerIP:

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

## 8. Install Astronomer
```
$ KUBECONFIG="astro-do-test-kubeconfig.yaml" helm install -f config.yaml . --namespace <my-namespace>
```

## 9. Find your loadbalancer IP and update DNS

Now you'll need to find the LoadBalancer IP that was created when you deployed the cluster.


```
kubectl --kubeconfig="astro-do-test-kubeconfig.yaml" get svc -n astronomer
NAME                                      TYPE           CLUSTER-IP       EXTERNAL-IP      PORT(S)                                      AGE
astro-db-postgresql                       ClusterIP      10.245.222.3     <none>           5432/TCP                                     32d
astro-db-postgresql-headless              ClusterIP      None             <none>           5432/TCP                                     32d
eyewitness-hare-alertmanager              ClusterIP      10.245.224.74    <none>           9093/TCP                                     32d
eyewitness-hare-cli-install               ClusterIP      10.245.184.224   <none>           80/TCP                                       32d
eyewitness-hare-commander                 ClusterIP      10.245.142.117   <none>           8880/TCP,50051/TCP                           32d
eyewitness-hare-elasticsearch             ClusterIP      10.245.124.110   <none>           9200/TCP,9300/TCP                            32d
eyewitness-hare-elasticsearch-discovery   ClusterIP      10.245.170.0     <none>           9300/TCP                                     32d
eyewitness-hare-elasticsearch-exporter    ClusterIP      10.245.145.30    <none>           9108/TCP                                     32d
eyewitness-hare-elasticsearch-nginx       ClusterIP      10.245.131.6     <none>           9200/TCP                                     32d
eyewitness-hare-grafana                   ClusterIP      10.245.58.245    <none>           3000/TCP                                     32d
eyewitness-hare-houston                   ClusterIP      10.245.178.9     <none>           8871/TCP                                     32d
eyewitness-hare-kibana                    ClusterIP      10.245.39.224    <none>           5601/TCP                                     32d
eyewitness-hare-kube-state                ClusterIP      10.245.47.39     <none>           8080/TCP,8081/TCP                            32d
eyewitness-hare-nginx                     LoadBalancer   10.245.243.143   157.230.64.157   80:30337/TCP,443:32158/TCP,10254:31337/TCP   32d
eyewitness-hare-nginx-default-backend     ClusterIP      10.245.158.110   <none>           8080/TCP                                     32d
eyewitness-hare-orbit                     ClusterIP      10.245.36.202    <none>           8080/TCP                                     32d
eyewitness-hare-prisma                    ClusterIP      10.245.137.44    <none>           4466/TCP                                     32d
eyewitness-hare-prometheus                ClusterIP      10.245.126.175   <none>           9090/TCP                                     32d
eyewitness-hare-registry                  ClusterIP      10.245.44.125    <none>           5000/TCP                                     32d
```

The loadBalancerIP above is `157.230.64.157` - update the helm chart accordingly:

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
  loadBalancerIP: 157.230.64.157

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

Check out our `Customizing Your Install` section for guidance on setting an [auth system](https://www.astronomer.io/docs/ee-integrating-auth-system/) and [resource requests(https://www.astronomer.io/docs/ee-configuring-resources/) in this `config.yaml`.

### Create a DNS A Record
Create an A record through your DNS provider for `*.astro.mydomain.com` (if you used a wildcard cert) using your previously created static IP address.

### Update your helm chart

Find your platform name:

```
$ KUBECONFIG="astro-do-test-kubeconfig.yaml" helm ls
NAME                   	REVISION	UPDATED                 	STATUS  	CHART           	NAMESPACE                         
astro-db               	1       	Fri Mar 15 08:31:23 2019	DEPLOYED	postgresql-3.9.5	astronomer                        
eyewitness-hare        	4       	Tue Mar 26 11:13:26 2019	DEPLOYED	astronomer-0.8.2	astronomer                        
```

Now upgrade accordingly:

```
$ KUBECONFIG="astro-do-test-kubeconfig.yaml" helm upgrade -f config.yaml eyewitness-hare  . --namespace <my-namespace>
```

## 10. Verify all pods are up
To verify all pods are up and running, run:

```
$ kubectl --kubeconfig="astro-do-test-kubeconfig.yaml" get pods --namespace <my-namespace>
```

You should see something like this:

```
$ kubectl --kubeconfig="astro-do-test-kubeconfig.yaml" get pods -n astronomer
NAME                                                     READY   STATUS      RESTARTS   AGE
astro-db-postgresql-0                                    1/1     Running     0          22d
eyewitness-hare-alertmanager-0                           1/1     Running     0          22d
eyewitness-hare-cli-install-7c7c89f8ff-sjg22             1/1     Running     0          22d
eyewitness-hare-commander-6bbffb5d78-nzc6q               1/1     Running     15         22d
eyewitness-hare-elasticsearch-client-d4bcc6885-svl8z     1/1     Running     1          22d
eyewitness-hare-elasticsearch-data-0                     1/1     Running     0          22d
eyewitness-hare-elasticsearch-data-1                     1/1     Running     0          22d
eyewitness-hare-elasticsearch-exporter-8679c6bb5-gzpnx   1/1     Running     0          22d
eyewitness-hare-elasticsearch-master-0                   1/1     Running     0          22d
eyewitness-hare-elasticsearch-master-1                   1/1     Running     0          22d
eyewitness-hare-elasticsearch-master-2                   1/1     Running     0          22d
eyewitness-hare-elasticsearch-nginx-588c9d6dbb-bvsb4     1/1     Running     0          22d
eyewitness-hare-fluentd-9rg87                            1/1     Running     0          22d
eyewitness-hare-fluentd-mrz9l                            1/1     Running     0          22d
eyewitness-hare-fluentd-t7s6r                            1/1     Running     0          22d
eyewitness-hare-grafana-84f4c9bdc9-hgpxf                 1/1     Running     13         22d
eyewitness-hare-houston-7c48cc7d46-7wttz                 1/1     Running     0          21d
eyewitness-hare-kibana-675967d59f-qvn7n                  1/1     Running     0          22d
eyewitness-hare-kube-state-78f6fbf9f4-z7kx2              1/1     Running     0          22d
eyewitness-hare-nginx-647c488b5c-gqtf2                   1/1     Running     0          22d
eyewitness-hare-nginx-default-backend-65774b49b9-2ksw4   1/1     Running     0          22d
eyewitness-hare-orbit-7d79d47f59-9s8hr                   1/1     Running     0          22d
eyewitness-hare-prisma-5f58648495-wpkw6                  1/1     Running     0          22d
eyewitness-hare-prometheus-0                             1/1     Running     0          22d
eyewitness-hare-registry-0                               1/1     Running     0          22d

```

If you are seeing issues here, check out our [guide on debugging your installation](https://astronomer.io/docs/ee-debugging-install/)


## 11. Access Astronomer's Orbit UI
Go to app.BASEDOMAIN to see the Astronomer UI!


## 12. Verify SSL  

To make sure that the certs were accepted, log into the platform and head to `app.BASEDOMAIN/token` and run:

`curl -v -X POST https://houston.BASEDOMAIN/v1 -H "Authorization: Bearer <token>"`

Verify that this output matches with:

`curl -v -k -X POST https://houston.BASEDOMAIN/v1 -H "Authorization: Bearer <token>"`
(The `-k` flag will run the command without looking for SSL)

Finally, to make sure the registry accepted SSL, try to log into the registry:

```
docker login registry.BASEDOMAIN -u _ p <token>
```
  