---
title: "Manage SSL Certificate on Astronomer Enterprise"
navTitle: "SSL Certificate Renewal"
description: "How to update and auto-renew SSL Certificate"
---

## Overview

Renewing certificate
To renew your cert, you have two options:
- Set to auto-renew via a cert-manager through kube-lego. More info about that here: http://docs.cert-manager.io/en/latest/index.html
Steps to configure to manage via route53 DNS

```sh
kubectl create namespace cert-manager
helm repo add jetstack https://charts.jetstack.io
helm repo update
helm install --name cert-manager --namespace cert-manager --version v<latest_version>
```

**Create secret containing your AWS Secret Access Key**
`kubectl create secret generic acme --from-literal secret-access-key="****************BnmZ" --namespace astronomer`

**Create and apply astronomer-cert.yaml**

```yaml
apiVersion: cert-manager.io/v1alpha2
kind: Issuer
metadata:
  name: letsencrypt-prod
  namespace: astronomer
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: example@astronomer.io
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - selector:
        dnsZones:
          - "example.astronomer-development.com"
      dns01:
        route53:
          region: us-east-1
          accessKeyID: ****************CCGW
          secretAccessKeySecretRef:
            name: acme
            key: secret-access-key
---
apiVersion: cert-manager.io/v1alpha2
kind: Certificate
metadata:
  name: astronomer-tls
  namespace: astronomer
spec:
  secretName: astronomer-tls
  issuerRef:
    name: letsencrypt-prod
  dnsNames:
  - '*.example.astronomer-development.com'
```


`kubectl create -f astronomer-cert.yaml`

**View secret containing key pair** 
`kubectl get secret astronomer-tls -n astronomer -o yaml`


- Generate a new short-lived certificate and follow the same process to recreate your astronomer-tls secret after deleting the current one.


```sh
kubectl delete secret astronomer-tls
kubectl create secret tls astronomer-tls --cert <certfile> --key <keyfile>
```


Note: After updating your secret, you'll also want to restart the houston, nginx and registry pods to ensure they pick up the new certificate.