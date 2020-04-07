---
title: "Registry Back Ends in Astronomer Enterprise"
description: "How to configure a registry back end."
date: 2019-06-26T00:00:00.000Z
slug: "ee-registry-backend"
---

The Astronomer platform uses a Docker Registry to store Airflow images pushed with the Astro CLI. The default storage back end for this Docker Registry is a Kubernetes Persistent Volume. This works great for most enterprise solutions. For those who desire a more scalable storage back end solution, we've added the ability to back the Astronomer Registry with a Google Cloud Storage bucket. Additional registry storage back end solutions such as Amazon's S3 will be added in future releases.

# Google Cloud Storage

1. Download your Google Cloud Platform service account JSON key from https://console.cloud.google.com/apis/credentials/serviceaccountkey . Make sure the service account you use has roles `Storage Legacy Bucket Owner` and `Storage Object Admin`.
2. Create Kubernetes secret using the downloaded key: 
```
kubectl create secret generic astronomer-gcs-keyfile --from-file astronomer-gcs-keyfile=/path/to/key.json -n <your-namespace>
```
3. Add the following to your `config.yaml`

```yaml
astronomer:
  registry:
    gcs:
      enabled: true
      bucket: <your-gcs-bucket-name>
```

The rest of the `config.yaml` can go unchanged. An example could look like:


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
  registry:
    gcs:
      enabled: true
      bucket: <your-gcs-bucket-name>

```
