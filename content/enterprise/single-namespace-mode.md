---
title: "Single Namespace Mode"
description: "Run Astronomer in a single namespace."
date: 2018-07-17T00:00:00.000Z
slug: "ee-single-namespace-mode"
---

Astronomer can be deployed into a single namespace for clusters where obtaining an Admin role isn't possible. However, this does disable access to webserver, scheduler, and task logs via the Astronomer UI and CLI. Airflow tasks logs will be available in the Airflow UI.

If you are running your own EFK stack, you could implement a fluentd config to possibly regain this functionality.

### Configuration

This change can be made directly in the `config.yaml`

```yaml
# Disable EFK stack which requires a CluterRole
tags:
  logging: false

# Put the rest of platform in single namespace mode.
# This will only provision Roles, instead of ClusterRoles.
# This also configures Houston to deploy airflows to its own namespace.
global:
  singleNamespace: true
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

###############################
## Single Namespace Mode
###############################

# Disable EFK stack which requires a ClusterRole
tags:
  logging: false

# Put the rest of platform in single namespace mode.
# This will only provision Roles, instead of ClusterRoles.
# This also configures Houston to deploy airflows to its own namespace.
global:
  singleNamespace: true

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
