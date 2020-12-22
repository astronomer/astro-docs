---
title: "AWS EKS Terraform Guide"
navTitle: "Terraform Installation"
description: "Install Astronomer with Terraform to build, change, and version your infrastructure safely and efficiently."
---

Terraform is a tool for building, changing, and versioning infrastructure safely and efficiently. Terraform can manage existing and popular service providers as well as custom in-house solutions.

You can read more about it here https://www.terraform.io/intro/index.html

### Install Astronomer with Terraform

Astronomer’s terraform scripts can be used to automate the provisioning of a production grade Airflow environment.

The [Astronomer Enterprise module for AWS](https://registry.terraform.io/modules/astronomer/astronomer-enterprise/aws) can be used to provision the Astronomer platform in your AWS account. The automation deploys the following by default:

* VPC
* Network
* Database
* Kubernetes
* TLS certificate
* Astronomer

More detailed information can also be found here:
https://github.com/astronomer/terraform-aws-astronomer-enterprise

## Prerequisites

Install the necessary tools:

* [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)
* [AWS IAM Authenticator](https://docs.aws.amazon.com/eks/latest/userguide/install-aws-iam-authenticator.html)
* [Terraform](https://www.terraform.io/downloads.html) *Use version 0.12.3 or later*
* [Helm client](https://github.com/helm/helm#install) *Use version 2.16.1*
* [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) *Use the version appropriate for your Kubernetes cluster version*
* [Python 3](https://www.python.org/download/releases/3.0/) *Must be available under the name `python3`*

## Installation

### Configure the AWS CLI

Run the following command and enter the appropriate values when prompted. If you don't know the `AWS Access Key ID` or `AWS Secret Access Key` for your account, contact your AWS admin.

```
aws configure
```

Confirm you are authenticated

```
aws sts get-caller-identity
```

### Write the Terraform

A sample configuration:

```
module "astronomer-enterprise" {
  source = "astronomer/astronomer-enterprise/aws"
  email                       = "your-name@your-domain.com"
  deployment_id               = "<id>"
  route53_domain              = "<domain>"
  allow_public_load_balancers = true
  management_api              = "public"
  astronomer_helm_values      = <<EOM
  global:
    # Replace to match your certificate, less the wildcard.
    # If you are using Let's Encrypt + Route 53, then it should be <deployment_id>.<route53_domain>
    # For example, astro.your-route53-domain.com
    baseDomain: <deployment_id>.<route53_domain>
    tlsSecret: astronomer-tls
    postgresqlEnabled: false
  nginx:
    privateLoadBalancer: true
  astronomer:
    houston:
      config:
        email:
          enabled: true
          smtpUrl: smtp://USERNAME:PW@HOST/?requireTLS=true
  EOM

}
provider "aws" {
  region = "<region>"
}
provider "acme" {
  server_url = "https://acme-v02.api.letsencrypt.org/directory"
}
provider "kubernetes" {
  version = "1.10.0"
}
```

**Note:** If you are using Amazon SES, your URL will look like:
`smtpUrl: smtp://USERNAME:PW@HOST/?requireTLS=true`

If there are `/` or other escape characters in your username or password, you may need to [URL encode](https://www.urlencoder.org/) those characters.

The above options will deploy the Astronomer platform in a new VPC, with new subnets, a dedicated database, a new EKS, and DNS record for `*.<deployment_id>.<route53_domain>` with a LetsEncrypyt 90 wildcard certificate.

Other options to review include:

- db_instance_type
- worker_instance_type
- max_cluster_size
- tags

A full list of configuration options, and more detailed descriptions, can be found on the [Terraform Registry](https://registry.terraform.io/modules/astronomer/astronomer-aws/aws).

![diagram](https://raw.githubusercontent.com/astronomer/terraform-aws-astronomer-enterprise/master/images/Astronomer_AWS_Architecture_EE.svg?sanitize=true)

## Network Configurations

By default, **a new VPC and subnets will be created**. Pre-existing VPCs and subnets can be supplied as parameters:

```
module "astronomer-enterprise" {
  source                = "astronomer/astronomer-enterprise/aws"
  # Look up the most recent version in the Terraform Registry
  email                 = "your-name@your-domain.com"
  deployment_id         = "<id>"
  route53_domain        = "<domain>"
  management_api        = "public"
  vpc_id                = "<vpc>"
  private_subnets       = ["<subnet_one>", "<subnet_two>"]
  db_subnets            = ["<subnet_one>", "<subnet_two>"]
}
```

If using private subnets, be sure to change the `private_load_balancer` value in the  `astronomer_helm_values` to `true` and `allow_public_load_balancers` to `false`.

By default, a public subnet is created only to allow egress internet traffic. The cluster, database, and load balancer (where the application is accessed) are placed in the private networks by default.


The Kubernetes API will be deployed into the public internet by default (if you're deploying into a private network, it'll only be accessible on that internal network). This is to enable a one-click solution (deploy network, deploy Kubernetes in that network, deploy application on Kubernetes all in one go). Once the cluster is avaliable, you can toggle it to private in the AWS console (in the EKS settings). Just be sure to set it back to public if running any Terraform updates.

To use Terraform completely privately from scratch, you will need to deploy from an existing VPC into the same VPC. Once again, be sure to set `private_load_balancer` in  `astronomer_helm_values` to `true`.

## Certificates and DNS Provider

By default, the Terraform creates a wilcard certificate for `*.deployment_id.route53domain` from LetsEncrypt. If you cannot generate a wildcard cert, you will need a cert that covers:

```
deploymentid.route53_domain
app.deploymentid.route53_domain
deployments.deploymentid.route53_domain
registry.deploymentid.route53_domain
houston.deploymentid.route53_domain
grafana.deploymentid.route53_domain
kibana.deploymentid.route53_domain
install.deploymentid.route53_domain
```

To use your own certificates, export them as a `.pem` file and add the contents to the `tls_cert` and `tls_key` variables, respesctively.

```
tls_cert = <<EOF
-----BEGIN CERTIFICATE-----
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
-----END CERTIFICATE-----
  EOF
tls_key = <<EOF
-----BEGIN PRIVATE KEY-----
-----END PRIVATE KEY-----
  EOF
```
Make sure that your TLS cert is properly chained, including both the certificate and issuer pem in the same file, with the issuer second and no newline in between.


## Deploy the Platform


* `terraform init`
* `terraform apply`

Be sure to review the output from `terraform init` command, be sure to review the output before typing 'yes'.

This step generally takes 15-30 minutes - the platform is ready when the `app.<deployment_id>.<route53_domain>` presents an option to log in or sign up.

A `kubeconfig` file will be generated in your working directory. Be sure to reference this file when running `kubectl` or `helm` commands. Example:
```
export KUBECONFIG=./kubeconfig

kubectl get pods -n astronomer
helm ls
```

The kubeconfig file along with other secrets such as the TLS certificate are backed up in the remote Terraform state S3 bucket (if applicable).

## Configuring the Platform

We recommend using Terraform only for your initial installation of Astronomer. Afterwards, all post-install upgrades and configurations to Astronomer should be completed using the [Helm](https://helm.sh) package manager. For more information on how to configure Astronomer after installation, read [Apply a Platform Configuration Change](/docs/enterprise/v0.15/manage-astronomer/apply-platform-config).
