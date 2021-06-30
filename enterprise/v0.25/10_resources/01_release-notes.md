---
title: "Astronomer v0.25 Release Notes"
navTitle: "Release Notes"
description: "Astronomer Enterprise release notes."
---

## Overview

Astronomer v0.25 is the latest available minor version in our long-term support (LTS) release model for Astronomer Enterprise.

If you're looking to upgrade to Astronomer v0.25, refer to [Upgrade to Astronomer v0.25](/docs/enterprise/v0.25/manage-astronomer/upgrade-to-0-25/). For instructions on how to upgrade to a patch version within the Astronomer v0.25 series, refer to [Upgrade to a Patch Version of Astronomer Enterprise](/docs/enterprise/v0.25/manage-astronomer/upgrade-astronomer-patch/).

We're committed to testing all Astronomer Enterprise versions for scale, reliability and security on Amazon EKS, Google GKE and Azure AKS. If you have any questions or an issue to report, don't hesitate to [reach out to us](https://support.astronomer.io).

## v0.25.3

Release Date: June 30th, 2021

### Support for Any Ingress Controller

You can now use any Ingress controller for your Astronomer platform. This is particularly useful if you're installing Astronomer onto platforms like OpenShift, which favor a specific type of Ingress controller, or if you want to take advantage of any features not available through the default NGINX Ingress controller.

The default NGINX Ingress controller has two responsibilities: to be a reverse proxy and to tell your authorization server how to authorize incoming requests. To use your own Ingress controller, you need to disable Astronomer's default NGINX Ingress controller, set up your own Ingress controller to work with Astronomer's backend services, and enable `authSideCar` to authorize the incoming requests in place of the NGINX Ingress controller.

For example, to use your own Ingress controller for OpenShift, you would need to:

1. Annotate the Kubernetes secret containing your certificate so that your Ingress controller recognizes your Astronomer certificate:

    ```sh
    kubectl annotate secret/astronomer-tls kubed.appscode.com/sync="platform-release=astronomer"
    ```

2. Patch your Ingress operator to enable OpenShift routes to bind the same hostname to multiple routes on different namespaces:

    ```sh
    oc -n openshift-ingress-operator patch ingresscontroller/default --patch '{"spec":{"routeAdmission":{"namespaceOwnership":"InterNamespaceAllowed"}}}' --type=merge
    ```

3. Add an annotation to your network policy to connect to Astronomer's backend services from your Ingress controller:

    ```sh
    kubectl label namespace/ingress-nginx network.openshift.io/policy-group=ingress
    ```

4. Configure the Astronomer Helm chart to deploy a sidecar for authenticating to various components of the Astronomer platform. That configuration might look something like this:

    ```yaml
    global:
      baseDomain: <base-domain>
      helmRepo: "https://github.io/company-helm-repo"
      tlsSecret: astronomer-tls
      nginxEnabled: false # Disable nginx ingress
      nodeExporterEnabled: false
      sccEnabled: true # Required for OpenShift
      postgresqlEnabled: true
      authSidecar:  # Deploy auth sidecar to use different Ingress controller
        enabled: true
        repository: nginxinc/nginx-unprivileged
        tag: stable
        pullPolicy: IfNotPresent
        port: 8084
        resources:
          limits: {}
          requests: {}
        default_nginx_settings: |
          internal;
          proxy_pass_request_body     off;
          proxy_set_header            Content-Length          "";
          proxy_set_header            X-Forwarded-Proto       "";
          proxy_set_header            X-Original-URL          https://$http_host$request_uri;
          proxy_set_header            X-Original-Method       $request_method;
          proxy_set_header            X-Real-IP               $remote_addr;
          proxy_set_header            X-Forwarded-For         $remote_addr;
          proxy_set_header            X-Auth-Request-Redirect $request_uri;
          proxy_buffering             off;
          proxy_buffer_size           4k;
          proxy_buffers               4 4k;
          proxy_request_buffering     on;
          proxy_http_version          1.1;
          proxy_ssl_server_name       on;
          proxy_pass_request_headers  on;
          client_max_body_size        1024m;
        default_nginx_settings_location: |
          auth_request     /auth;
          auth_request_set $auth_status $upstream_status;
          auth_request_set $auth_cookie $upstream_http_set_cookie;
          add_header       Set-Cookie $auth_cookie;
          auth_request_set $authHeader0 $upstream_http_authorization;
          proxy_set_header 'authorization' $authHeader0;
          auth_request_set $authHeader1 $upstream_http_username;
          proxy_set_header 'username' $authHeader1;
          auth_request_set $authHeader2 $upstream_http_email;
          proxy_set_header 'email' $authHeader2;
          error_page 401 = @401_auth_error;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection 'connection_upgrade';
          proxy_set_header X-Real-IP              $remote_addr;
          proxy_set_header X-Forwarded-For        $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_cache_bypass $http_upgrade;
          proxy_set_header X-Original-Forwarded-For $http_x_forwarded_for;
          proxy_connect_timeout                   15s;
          proxy_send_timeout                      600s;
          proxy_read_timeout                      600s;
          proxy_buffering                         off;
          proxy_buffer_size                       4k;
          proxy_buffers                           4 4k;
          proxy_max_temp_file_size                1024m;
          proxy_request_buffering                 on;
          proxy_http_version                      1.1;
          proxy_cookie_domain                     off;
          proxy_cookie_path                       off;
          proxy_redirect                          off;

      ## If you need to add any extra annotations, the below option can be used to
      ## pass those values
      extraAnnotations: {}
      #kubernetes.io/ingress.class: "nginx"
    ```

### Support for Kubernetes 1.19 and 1.20

The Astronomer platform is now compatible with Kubernetes 1.19 and 1.20. As an Enterprise user, you can now upgrade your clusters to either of these two versions and take advantage of the latest Kubernetes features. For more information, refer to [Kubernetes 1.20 release notes](https://kubernetes.io/blog/2020/12/08/kubernetes-1-20-release-announcement/).

### Bypass Email Verification for Users via Houston API

The Houston API `workspaceAddUser` mutation now includes a `bypassInvite` field. When this field is set to true, users invited to a Workspace no longer need to first verify their email addresses before accessing the Workspace. This type of query can be useful to minimize friction when programmatically inviting many users to your platform. For more information, see [Sample Mutations](/docs/enterprise/v0.25/manage-astronomer/houston-api#sample-mutations).

### Minor Improvements

- Added support for installing Astronomer via ArgoCD, which facilitates continuous delivery for Kubernetes applications. For more information, read the [Astronomer Forum].
- Workspace Admins can now perform CRUD operations on any Deployment within their Workspace, even if they don't have Deployment Admin permissions for the given Deployment.
- Prevented `NginxIngressHigh4XXRate` and `NginxIngressHigh5XXRate` alerts from over-firing during periods of low traffic.
- Added the ability to use non-RFC address spaces for Alertmanager.
- Added support for using Workload Identity to configure a GCP registry backend.
- Changed sidecar naming convention from `nginx` to `auth-proxy`.
- Added `fsGroup` to the Webserver `securityContext` to enable [role assumption](https://docs.aws.amazon.com/eks/latest/userguide/security_iam_service-with-iam.html) for EKS 1.17.

### Bugfixes

- Fixed an issue where private root CAs did not work due to an unmounted certificate.
- Fixed broken links to Deployments in alert emails.
- Fixed an issue where historical logs did not appear in the Astronomer UI.
- Fixed an issue where System Admins were unable to create Deployments.
- Fixed a visual bug where some Deployments with only 1 Scheduler were shown as having 2 in the Astronomer UI.
- Fixed a visual bug where users without Workspace Admin permissions had a non-functional **Invite Users** button in the Astronomer UI.

## v0.25.2

Release Date: May 18, 2021

### Bug Fixes

- Fixed an API issue that caused the migration script from Astronomer v0.23 to v0.25 to fail if the NFS volume-based deployment mechanism was not enabled.

## v0.25.1

Release Date: May 11, 2021

### Support for NFS Volume-based DAG Deploys

We are pleased to offer an NFS volume-based DAG deploy mechanism on Astronomer. This new deployment method is an alternative to image-based DAG deploys.

With NFS volume-based DAG deploys, you no longer need to rebuild and restart your environment when deploying changes to your DAGs. When a DAG is added to an external NFS volume, such as Azure File Storage or Google Cloud Filestore, it automatically appears in your Airflow Deployment a short time later. Compared to image-based deploys, this new mechanism limits downtime and better enables continuous development.

This feature must be explicitly enabled on your platform and requires the use of an external NFS volume. For more information, read [Deploy to an NFS Volume](/docs/enterprise/v0.25/deploy/deploy-nfs).

> **Note:** To take advantage of this feature, your Airflow Deployments must be running on Airflow 2.0 or greater. To upgrade your Deployments, read [Manage Airflow Versions](docs/enterprise/v0.25/customize-airflow/manage-airflow-versions).

### Bug Fixes

- Fixed an issue where Grafana pods did not run properly when `global.ssl.mode` was set to `prefer`. ([Source](https://github.com/astronomer/astronomer/pull/1082))
