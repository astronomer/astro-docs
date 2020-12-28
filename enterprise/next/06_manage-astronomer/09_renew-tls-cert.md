---
title: "Renew TLS Certificates on Astronomer Enterprise"
navTitle: "Renew a TLS Certificate"
description: "How to update and auto-renew your organization's SSL Certificate for Astronomer"
---

## Overview

Once you set up an SSL certificate for your Astronomer platform, you'll need to establish a process for renewing the certificate. This can be done in one of two ways:

* **Automatic renewal**: Let's Encrypt provides a service which automatically renews your SLL certificate every 90 days. We recommend this option for smaller organizations where your DNS administrator and Kubernetes cluster administrator are either the same person or on the same team.
* **Manual renewal**: We recommend that large organizations manually follow their normal protocol for renewing certificates. This should be done within 90 days of your certificate's expiration date.

Refer to the following topics for more information on these two options:

## Automatically Renew SSL Certificates Using Let's Encrypt

Let's Encrypt is a Certificate Authority that provides free, 90-day certificates using the ACME protocol. You can use the Cert Manager project for Kubernetes to automatically renew certificates.

1. Install the Kubernetes Cert Manager by following [the official installation guide](https://cert-manager.io/docs/installation/kubernetes/).
2. If you use AWS, grant Cert Manager access to your nodes by updating your `NodeInstanceRole` to include the following policies (if you don't use AWS, skip this step):
```yaml
Type: "AWS::IAM::Role"
Properties:
  RoleName: instance-profile-role
  Policies:
    - PolicyName: instance-profile-policy
      PolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Action: route53:GetChange
            Resource: arn:aws:route53:::change/*
          - Effect: Allow
            Action:
              - route53:ChangeResourceRecordSets
              - route53:ListResourceRecordSets
            Resource: !Sub arn:aws:route53:::hostedzone/${HostedZoneIdLookup.HostedZoneId}
          - Effect: Allow
            Action: route53:ListHostedZonesByName
            Resource: '*'
  AssumeRolePolicyDocument:
    Version: "2012-10-17"
    Statement:
      - Effect: "Allow"
        Principal:
          Service:
            - "ec2.amazonaws.com"
        Action:
          - "sts:AssumeRole"
```
For more information on how to complete this setup, refer to the [AWS documentation](https://docs.aws.amazon.com/eks/latest/userguide/create-node-role.html).
3. Create a "ClusterIssuer" resource that declares how requests for certificates will be fulfilled. To do so, first create the a `clusterissuer.yaml` file with the following values:
```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    email: <your-email>
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: cert-manager-issuer-secret-key
    solvers:
    - selector: {}
      dns01:
        route53:
          region: <your-server-region>
```
Then, create the cluster by running the following command:
```sh
kubectl apply -f clusterissuer.yaml
```
4. Create a "Certificate" resource that declares the type of certificate you'll request from Let's Encrypt. To do so, first create the a `certificate.yaml` file, replacing `BASE_DOMAIN` with your organization's own base domain:
```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: acme-crt
spec:
  secretName: astronomer-tls
  dnsNames:
  - BASE_DOMAIN
  - app.BASE_DOMAIN
  - deployments.BASE_DOMAIN
  - registry.BASE_DOMAIN
  - houston.BASE_DOMAIN
  - grafana.BASE_DOMAIN
  - kibana.BASE_DOMAIN
  - install.BASE_DOMAIN
  - prometheus.BASE_DOMAIN
  - alertmanager.BASE_DOMAIN
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
    group: cert-manager.io
```
Then, create the cluster by running the following command:
```sh
kubectl apply -f certificate.yaml
```
5. After a few minutes, ensure that the certificate was created by running:
```sh
kubectl get certificates
```

## Manually Renew SSL certificates

Larger organizations with dedicated security teams will likely have their own process for requesting and renewing SSL certificates. Regardless of your own process for this, there are steps you will always have to take for your Astronomer platform when renewing SSL/TSL certificates:

1. Delete your current SSL certificate by running the following command:
```sh
kubectl delete secret astronomer-tls
```
2. Follow the instructions for requesting an SSL certificate from your organization's security team as described in [Option 2 of Step 4: Configure SSL](https://www.astronomer.io/docs/enterprise/stable/install/aws/install-aws-standard#step-4-configure-ssl). The linked guide is for setting up with AWS, but this step is the same regardless of your cloud service.
3. Restart your Houston, nginx, and registry pods to ensure they are using the new certificate.
