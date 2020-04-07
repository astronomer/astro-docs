---
title: "Security"
description: "Security of the Astronomer platform"
date: 2018-10-12T00:00:00.000Z
slug: "security"
---

A deep respect for our customers and their sensitive data workflows has always been central to to our values at Astronomer. This is why we have implemented rigorous security policies that we continue to build upon, with every product release.

Astronomer Cloud is our growing family of Airflow-based SaaS offerings. For each Astronomer Cloud service, we strive to provide security and privacy for your data.

## We are Committed to Information Security and Privacy

Astronomer maintains a comprehensive information security program that includes appropriate technical and organizational measures designed to protect our customers' cluster data against unauthorized access, modification or deletion.

## Our Privacy Statement is Transparent and Clear

Astronomer respects the privacy rights of individuals. Our [privacy policy](https://www.astronomer.io/privacy/) make it very clear when we collect personal data and how we use it. We've written our privacy policy in plain language to be transparent to our users and customers.

## We Operate a Modern Cloud SaaS Platform

We use Google Cloud Platform for our Cloud datacenter, which means our customers benefit from GCP's comprehensive security practices and compliance certifications. We do not host customer data on our premises or store customer data with any other third party services. GCP is a leading cloud provider that holds industry best security certifications such as SOC2 and ISO 27001 and provides encryption in transit and at rest.

Astronomer Cloud is hosted on infrastructure that we control via [GCP's Google Kubernetes Engine](https://cloud.google.com/kubernetes-engine/docs/concepts/security-overview), in GCP us-east1. To allow it to communicate with your systems, we run a single NAT that all internet bound traffic flows through. We don't persist any of your data, and all computation runs in short-lived containers that terminate after tasks are completed.

Our cluster and databases are all hosted in a private VPC with all private IPs. We connect to the cluster via SSH to a bastion node set up with authorized networks. We use the [GKE managed firewall rules]((https://cloud.google.com/kubernetes-engine/docs/concepts/security-overview#node_security) at the VPC layer.

## We encrypt all data

We use AES to encrypt all data that is stored in underlying databases.

Secrets, credentials, and connection details pertaining to an Astronomer Workspace are stored as Environment Variables in the Astronomer UI and are encrypted both at rest and in transit as Kubernetes Secrets.

Our platform is additionally configured with a valid TLS certificate for our Cloud's base domain. All traffic to the system API and the docker registry is encrypted with this cert. Our system ensures that any sensitive data is encrypted in our database. We also ensure Airflow deployments are secured and configured with a Fernet Key to encrypt connection / variable data. All data related to payment is stored in Stripe and not in our database.

## We isolate customers from each other

All customers are isolated within their own Postgres database with unique and randomly generated credentials, secured and encrypted using Kubernetes Secrets. All customers are isolated inside of their own namespace within Kubernetes, with network policies, roles, and other security measures in place to ensure each tenant is truly isolated.

## We provide real-time access to Airflow logs

We allow user access to your scheduler, webserver, and worker logs via an EFK stack. Airflow-specific alerts for task and DAG run failures (or other triggers) can be configured via environment variables as needed.

## We provide SSO access to the platform

Users have the option to authenticate with their Google account, GitHub account, or standard username/password.

## We proactively monitor the service

We also have a full Prometheus/Grafana monitoring stack that allows our employees to keep an eye on the health of all Airflow deployments running in Astronomer Cloud. We regularly check these dashboards and have alerts set up to notify our team if anything ever looks out of place.

## We audit continuously during the development process

Astronomer audits changes to our application throughout the development lifecycle via architecture reviews and stringent automated and manual code review processes.

## We've Built In Security Controls

We've taken significant measures to ensure that Astronomer Cloud customer data cannot be read, copied, modified, or deleted during electronic transmission, transport, or storage through unauthorized means. To reduce the likelihood of vulnerability-related incidents, the Astronomer Cloud team deploys Airflow instances based on the latest operating system kernels, and patches the computing “fleet” whenever a critical CVE (i.e., "Common Vulnerability and Exposure," in security-speak) is discovered in any component software. Similarly, Astronomer software, including Astronomer Enterprise, used in the provisioning of Astronomer Cloud SaaS offerings, is updated soon after released to ensure that latest versions are deployed.

Clusters are deployed behind proxies and are not visible to internet scanning. Transport Layer Security (TLS) encrypted communication from the Internet is provided in the default configuration. Astronomer nodes run in isolated containers, configured according to the principle of least privilege, and with restrictions on system calls and allowed root operations. Astronomer nodes communicate using TLS. Cluster data is encrypted at rest. API access is limited to Astronomer APIs, and no remote access to the instance or container at the Linux level is allowed. Containers have no means of setting up communication with containers from another cluster.

We do not perform Internet-based penetration testing against production Astronomer Cloud SaaS offerings, however, we do use third parties to perform application security assessments against the Astronomer software components used to deliver these services.

## We Practice Responsible Vulnerability Management

Astronomer recognizes that software development inherently includes the possibility of introducing vulnerabilities. We accept and disclose vulnerabilities discovered in our software in a transparent manner.

## We Operate in Compliance with the Principles of GDPR

The only personal information data we have access to is the email address associated with each account created on Astronomer Cloud. We never share any personal information data with external services.

Astronomer has prepared for GDPR by carefully reviewing and documenting how it handles personal data, implementing technical and organizational measures to protect the personal data it does handle, and defining and implementing processes to respect the rights of data subjects, across all its products and services. Astronomer is operating in compliance with the principles of GDPR. Astronomer Cloud customers can request a Data Processing Addendum (DPA) by creating a [support case](mailto:support@astronomer.io).

## Protecting Your Account

At Astronomer, we know that security is everyone's responsibility. That's why we bake security into the development of our products and into the foundation of Astronomer Cloud. The security and privacy of your Astronomer Cloud SaaS data also relies on you maintaining the confidentiality of your Astronomer Cloud login credentials.

Here's a quick checklist:

* Don't share your credentials with others.
* Update your account profile to make sure information is correct and current.
* Ensure that you've set secure passwords.
* If you believe an account has been compromised, please email [security@astronomer.io](mailto:security@astronomer.io). If you need to make an erasure request, please email [privacy@astronomer.io](mailto:privacy@astronomer.io).

## Learn more details

1. https://www.astronomer.io/docs/ee-overview/
1. Astronomer Cloud is hosted on third-party platforms that have the following certifications:
SOC 1, SOC 2, ISO 27001, ISO 27017, ISO 27018. Please see: https://cloud.google.com/security/compliance
1. Astronomer Cloud provides availability monitoring, backups for critical platform data, and 24/7 operations.
1. Astronomer Enterprise is deployed in your cloud, on your Kubernetes. As such, it will comply with your internal security specifications.
