---
title: "Manage Users on Astronomer Enterprise"
navTitle: "Platform User Management"
description: "How to add and customize user permissions on the platform, enable public sign-ups and add system administrators."
---

## Overview

In addition to the [Role-Based Access Control (RBAC) functionality](/docs/enterprise/v0.12/manage-astronomer/workspace-permissions/) core to our platform, Astronomer Enterprise allows teams to customize *how* they want users to create accounts on Astronomer and what they're able to do on the platform - both on Astronomer and Airflow.

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

Workspace roles apply to all Airflow Deployments within a single Workspace, whereas System Roles apply to *all* Workspaces across a single cluster. For a detailed breakdown of the 3 Workspace Level Roles on Astronomer (Viewer, Editor and Admin), refer to our [Role Based Access Control](/docs/enterprise/v0.12/manage-astronomer/workspace-permissions/) doc.

## Public Sign-Ups

As noted above, public sign-ups allow any user with access to the platform URL (the Astronomer UI) to create an account. If Public sign-ups are *disabled*, users that try to access Astronomer without an invitation from another user will be met with an error.

In cases where SMTP credentials are difficult to acquire, enabling this flag might facilitate initial setup, as disabling public sign-ups requires that a user accept an email invitation.

### Enabling Public Sign-Ups

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
NAME                	REVISION	UPDATED                 	STATUS  	CHART                           	APP VERSION	NAMESPACE
calico-crab         	4       	Fri Nov 22 09:36:51 2019	DEPLOYED	astronomer-platform-0.10.3-fix.1	0.10.3     	astro

$ helm upgrade calico-crab -f config.yaml . --namespace astro
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

All three permission sets are entirely customizable on Astronomer Enterprise. For a full breakdown of the default configurations attached to the System Admin, Editor and Viewer Roles, refer to our [Houston API source code](https://github.com/astronomer/docs/blob/082e949a7b5ac83ed7a933fca5bcf185b351dc39/enterprise/v0.12/reference/default.yaml#L220).

For guidelines on assigning users any System Level role, read below.

### Assigning Users System-Level Roles

System Admins can be added to Astronomer Enterprise by issuing an API call to Houston via the [GraphQL playground](/docs/enterprise/v0.12/manage-astronomer/houston-api/).

Keep in mind that:
- Only existing System Admins can grant the SysAdmin role to another user
- The user must have a verified email address and already exist in the system

#### Query for a User's ID

The API call to add a System Admin on Astronomer requires the `uuid` of the user in question.

To pull the user's `uuid`, run the following query with their email address as the input:

```
query GetUser {
  users(email:"<name@mycompany.com>")
  {
    uuid
    roleBindings {role}
  }
}
```

In the output, you should see:

- The user's `uuid`
- A list of existing roles across the cluster (e.g. Workspace Admin)

> **Note:** You'll have to authenticate to the Houston API to be able to run the query above. For guidelines, refer to our [Houston API doc](/docs/enterprise/v0.12/manage-astronomer/houston-api/).

#### Run the Mutation

Below the query above, call `createSystemRoleBinding` with the `uuid` you pulled above.

The mutation should look like:

```
mutation AddAdmin {
  createSystemRoleBinding(
    userId: "<uuid>"
    role: SYSTEM_ADMIN
  ) {
    id
  }
}
```

If you're assigning a user a different System-Level Role, replace `SYSTEM_ADMIN` with either [`SYSTEM_VIEWER`](https://github.com/astronomer/docs/blob/082e949a7b5ac83ed7a933fca5bcf185b351dc39/enterprise/v0.12/reference/default.yaml#L225) or [`SYSTEM_EDITOR`](https://github.com/astronomer/docs/blob/082e949a7b5ac83ed7a933fca5bcf185b351dc39/enterprise/v0.12/reference/default.yaml#L233) in the mutation above.

#### Verify SysAdmin Access

To verify a user was successfully granted the SysAdmin role, ensure they can do the following:

- Navigate to `grafana.BASEDOMAIN`
- Navigate to `kibana.BASEDOMAIN`
- Access the "Admin Settings" tab from the top right menu of the Astronomer UI

## Customizing Roles and Permissions

On Astronomer Enterprise, platform administrators can customize the definitions of both Workspace and System Level roles from the same `config.yaml` file.

For guidelines on how a user might limit the permission to create a Workspace, read below. For step-by-step instructions on how to customize and apply changes to permission sets across the platform, refer to our [Configuring Permissions](/docs/enterprise/v0.12/manage-astronomer/manage-platform-users/) doc.

### Limiting Workspace Creation

For larger teams on Astronomer Enterprise, our platform supports limiting the ability for any user on the platform to create a Workspace and provision Airflow resources.

By default, all users have the ability to create a new Workspace. Unless otherwise configured, a user who creates a Workspace is automatically granted the "Workspace Admin" role and is thus able to create an unlimited number of Airflow Deployments within that Workspace.

For those who want to limit user access to the Workspace creation function, administrators can leverage and customize our platform's `USER` role.

#### Astronomer's `USER` Role

Astronomer ships with a `USER` role that is synthetically bound to _all_ users within a single cluster. By default, this [role includes the `system.workspace.create` permission](https://github.com/astronomer/docs/blob/082e949a7b5ac83ed7a933fca5bcf185b351dc39/enterprise/v0.12/reference/default.yaml#L324).

If you're an administrator on Astronomer who wants to limit its scope, you can remove the `system.workspace.create` permission from all users and instead attach it to a separate role of your choice. If you'd like to reserve the ability to create a Workspace _only_ to System Admins who otherwise manage cluster-level resources and costs, you might limit that permission to the `SYSTEM_ADMIN` role on the platform.
