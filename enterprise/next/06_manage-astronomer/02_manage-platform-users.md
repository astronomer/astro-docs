---
title: "Manage Users on Astronomer Enterprise"
navTitle: "Platform User Management"
description: "How to add and customize user permissions on the platform, enable public sign-ups and add system administrators."
---

## Overview

In addition to the [Role-Based Access Control (RBAC) functionality](https://www.astronomer.io/docs/rbac/) core to our platform, Astronomer Enterprise allows teams to customize *how* they want users to create accounts on Astronomer and what they're able to do on the platform - both on Astronomer and Airflow.

Read below for a high-level overview of user management and guidelines around public sign-ups, role customization and adding System Admins.

### Adding Users to Astronomer

When Astronomer Enterprise is first deployed, the first user to log in is granted "System Admin" permissions by default. From there, a user is created on Astronomer Enterprise by:

- Invitation to a Workspace by a Workspace Admin
- Invitation to Astronomer by a System Admin
- Signing up via the Astronomer UI without an invitation (requires "Public Sign-Ups")

On Astronomer, administrators have the option to either open the platform to public sign-ups or limit sign-ups to users invited by others.

### Managing Users

Once on the platform, administrators can customize permissions across teams. On Astronomer, users can be assigned roles at 2 levels:

1. Workspace Level (Viewer, Editor, Admin)
2. System Level (Viewer, Editor, Admin)

Workspace roles apply to all Airflow Deployments within a single Workspace, whereas System Roles apply to *all* Workspaces across a single cluster. For a detailed breakdown of the 3 Workspace Level Roles on Astronomer (Viewer, Editor and Admin), refer to our [Role Based Access Control](https://www.astronomer.io/docs/rbac/) doc.

## Public Sign-Ups

As noted above, public sign-ups allow any user with access to the platform URL (the Astronomer UI) to create an account. If Public sign-ups are *disabled*, users that try to access Astronomer without an invitation from another user will be met with an error.

In cases where SMTP credentials are difficult to acquire, enabling this flag might facilitate initial setup, as disabling public sign-ups requires that a user accept an email invitation.

### Enable Public Sign-Ups

Public Sign-Ups are a configuration available in Astronomer's Houston API and can be enabled in the `config.yaml` file of your Helm chart.

#### Modify your Configuration

To *enable* Public Sign-Ups, add the following yaml snippet to your `config.yaml` file:

```
astronomer:
  houston:
    config:
      publicSignups: true
      emailConfirmation: false # If you wish to also disable other SMTP-dependent features
```

An example `config.yaml` would look like:

```
global:
  baseDomain: mybasedomain
  tlsSecret: astronomer-tls
nginx:
  loadBalancerIP: 0.0.0.0
  preserveSourceIP: true

astronomer:
  houston:
    config:
      publicSignups: true
      emailConfirmation: false

```

#### Run a Platform Upgrade

To push the new configuration, run a platform upgrade from the `astronomer` repo:

```
$ helm ls
```

```
$ helm upgrade <platform-release-name> -f config.yaml --version=<platform-version> astronomer/astronomer -n <your-namespace>
```

For example, you might run:

```
$ helm ls
NAME                	REVISION	UPDATED                 	STATUS  	CHART                           	APP VERSION	NAMESPACE                                       
calico-crab         	4       	Fri Nov 22 09:36:51 2019	DEPLOYED	astronomer-platform-0.10.3-fix.1	0.10.3     	astro                    

$ helm upgrade calico-crab -f config.yaml --version=0.15.5 astronomer/astronomer -n calico-crab
```

## System Admins

### Overview

The System Admin role on Astronomer Enterprise brings a range of cluster-wide permissions that supercedes Workspace-level access and allows a user to monitor and take action across Workspaces, Deployments and Users within a single cluster.

On Astronomer, System Admins can:

- List and search *all* users
- List and search *all* deployments
- Access the Airflow UI for *all* deployments
- Delete a user
- Delete an Airflow Deployment
- Access Grafana and Kibana for cluster-level monitoring
- Add other System Admins

By default, the first user to log into an Astronomer Enterprise installation is granted the System Admin permission set.

#### System Editor, Viewer

In addition to the commonly used System Admin role, the Astronomer platform also supports both a System Editor and System Viewer permission set.

No user is assigned the System Editor or Viewer Roles by default, but they can be added by System Admins via our API. Once assigned, System Viewers, for example, can access both Grafana and Kibana but don't have permission to delete a Workspace they're not a part of. 

All three permission sets are entirely customizable on Astronomer Enterprise. For a full breakdown of the default configurations attached to the System Admin, Editor and Viewer Roles, refer to our [Houston API source code](https://github.com/astronomer/houston-api/blob/main/config/default.yaml#L220).

For guidelines on assigning users any System Level role, read below.

### Assigning Users System-Level Roles

System Admins can be added to Astronomer Enterprise via the 'System Admin' tab of the Astronomer UI.

Keep in mind that:
- Only existing System Admins can grant the SysAdmin role to another user
- The user must have a verified email address and already exist in the system

> **Note:** If you'd like to assign a user a different System-Level Role (either [`SYSTEM_VIEWER`](https://github.com/astronomer/houston-api/blob/main/config/default.yaml#L220) or [`SYSTEM_EDITOR`](https://github.com/astronomer/houston-api/blob/main/config/default.yaml#L227)), you'll have to do so via an API call from your platform's GraphQL playground. For guidelines, refer to our ["Houston API" doc](https://www.astronomer.io/docs/houston-api/).

#### Verify SysAdmin Access

To verify a user was successfully granted the SysAdmin role, ensure they can do the following:

- Navigate to `grafana.BASEDOMAIN`
- Navigate to `kibana.BASEDOMAIN`
- Access the 'System Admin' tab from the top left menu of the Astronomer UI

## Customizing Roles and Permissions 

On Astronomer Enterprise, platform administrators can customize the definitions of both Workspace and System Level roles from the same `config.yaml` file.

For guidelines on how a user might limit the permission to create a Workspace, read below. For step-by-step instructions on how to customize and apply changes to permission sets across the platform, refer to our [Configuring Permissions](https://www.astronomer.io/docs/ee-configuring-permissions/) doc.

### Limiting Workspace Creation

For larger teams on Astronomer Enterprise, our platform supports limiting the ability for any user on the platform to create a Workspace and provision Airflow resources.

By default, all users have the ability to create a new Workspace. Unless otherwise configured, a user who creates a Workspace is automatically granted the "Workspace Admin" role and is thus able to create an unlimited number of Airflow Deployments within that Workspace.

For those who want to limit user access to the Workspace creation function, administrators can leverage and customize our platform's `USER` role.

#### Astronomer's `USER` Role

Astronomer ships with a `USER` role that is synthetically bound to _all_ users within a single cluster. By default, this [role includes the `system.workspace.create` permission](https://github.com/astronomer/houston-api/blob/main/config/default.yaml#L324).

If you're an administrator on Astronomer who wants to limit its scope, you can remove the `system.workspace.create` permission from all users and instead attach it to a separate role of your choice. If you'd like to reserve the ability to create a Workspace _only_ to System Admins who otherwise manage cluster-level resources and costs, you might limit that permission to the `SYSTEM_ADMIN` role on the platform.

To configure and apply this change, follow the steps in our [Configuring Permissions](https://www.astronomer.io/docs/ee-configuring-permissions/) doc.