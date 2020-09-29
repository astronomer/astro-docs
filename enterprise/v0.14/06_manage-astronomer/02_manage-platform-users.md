---
title: "Manage Users on Astronomer Enterprise"
navTitle: "Platform User Management"
description: "How to add and customize user permissions on the platform, enable public sign-ups and add system administrators."
---

## Overview

In addition to Workspace-level [role-based access control (RBAC) functionality](/docs/enterprise/v0.14/manage-astronomer/workspace-permissions/) core to our platform, Astronomer Enterprise allows teams to customize *how* they want users to create accounts on Astronomer and what they're able to do on the platform - both on Astronomer and Airflow.

Read below for a high-level overview of user management and guidelines around public signups, role customization and adding System Admins.

## Add Users to Astronomer

When Astronomer Enterprise is first deployed, the first user to log in is granted "System Admin" permissions by default (more on that below). From there, a user is created on Astronomer Enterprise by:

- Invitation to a Workspace by a Workspace Admin
- Invitation to Astronomer by a System Admin
- Signing up via the Astronomer UI without an invitation (requires "Public Signups")

On Astronomer, administrators have the option to either open the platform to public signups or limit account creation to users invited by others.

### Enable Public Signups

As noted above, public signups allow any user with access to the platform URL (the Astronomer UI) to create an account. If public signups are *disabled*, users that try to access Astronomer without an invitation from another user will be met with an error.

In cases where SMTP credentials are difficult to acquire, enabling this flag might facilitate initial setup, as disabling public signups requires that a user accept an email invitation. Public signups are a configuration available in Astronomer's Houston API and can be enabled in the `config.yaml` file of your Helm chart.

To enable or disable public signups, follow the guidelines below.

#### Modify your `config.yaml`

To *enable* public signups, add the following yaml snippet to your `config.yaml` file:

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

$ helm upgrade calico-crab -f config.yaml --version=0.16.4 astronomer/astronomer -n calico-crab
```

### User Roles on Astronomer

Once on the platform, administrators can customize permissions across teams. On Astronomer, users can be assigned roles at 2 levels:

1. Workspace Level (Viewer, Editor, Admin)
2. System Level (Viewer, Editor, Admin)

Workspace roles apply to all Airflow Deployments within a single Workspace, whereas System Roles apply to *all* Workspaces across a single cluster. For a detailed breakdown of the 3 Workspace-level roles on Astronomer (Viewer, Editor and Admin), refer to our ["Manage User Permissions on an Astronomer Workspace"](/docs/enterprise/v0.14/manage-astronomer/workspace-permissions/) doc.

## Customize Permissions

Permissions are defined on Astronomer as `scope.entity.action`, where:

- `scope`: The layer of our application to which the permission applies
- `entity`: The object or role being operated on
- `action`: The verb describing the operation being performed on the `entity`

For example, the `deployment.serviceAccounts.create` permission translates to the ability for a usr to create a Deployment-level Service Account. To view all available platform permissions, view our [default Houston API configuration](https://github.com/astronomer/docs/blob/082e949a7b5ac83ed7a933fca5bcf185b351dc39/enterprise/v0.14/reference/default.yaml#L200). Each permission is applied to the role under which it is listed.

> **Note:** Higher-level roles by default encompass permissions that are found and explicitly defined in lower-level roles, both at the Workspace and System levels. For example, a `SYSTEM_ADMIN` encompasses all permission listed under its role _as well as_ all permissions listed under the `SYSTEM_EDITOR` and `SYSTEM_VIEWER` roles ([source code here](https://github.com/astronomer/docs/blob/082e949a7b5ac83ed7a933fca5bcf185b351dc39/enterprise/v0.14/reference/default.yaml#L266)).

To customize permissions, follow the steps below.

### Identify a Permission Change

First, take a look at our default roles and permissions linked above and identify two things:

1. What role do you want to configure? (e.g. [`DEPLOYMENT_EDITOR`](https://github.com/astronomer/docs/blob/082e949a7b5ac83ed7a933fca5bcf185b351dc39/enterprise/v0.14/reference/default.yaml#L356))
2. What permission(s) would you like to add to or remove from that role? (e.g. [`deployment.images.push`](https://github.com/astronomer/docs/blob/082e949a7b5ac83ed7a933fca5bcf185b351dc39/enterprise/v0.14/reference/default.yaml#L362))

For example, you might want to block a `DEPLOYMENT_EDITOR` (and therefore `WORKSPACE_EDITOR`) from deploying code to all Airflow Deployments within a Workspace and instead limit that action to users assigned the `DEPLOYMENT_ADMIN` role.

#### Limit Workspace Creation

Unless otherwise configured, a user who creates a Workspace on Astronomer is automatically granted the `WORKSPACE_ADMIN` role and is thus able to create an unlimited number of Airflow Deployments within that Workspace. For teams looking to more strictly control resources, our platform supports limiting the Workspace creation function via a `USER` role.

Astronomer ships with a `USER` role that is synthetically bound to _all_ users within a single cluster. By default, this [role includes the `system.workspace.create` permission](https://github.com/astronomer/docs/blob/082e949a7b5ac83ed7a933fca5bcf185b351dc39/enterprise/v0.14/reference/default.yaml#L377).

If you're an administrator on Astronomer who wants to limit Workspace Creation, you can:

- Remove the `system.workspace.create` permission from the `USER` role [here](https://github.com/astronomer/docs/blob/082e949a7b5ac83ed7a933fca5bcf185b351dc39/enterprise/v0.14/reference/default.yaml#L382)
- Attach it to a separate role of your choice

If you'd like to reserve the ability to create a Workspace _only_ to System Admins who otherwise manage cluster-level resources and costs, you might limit that permission to the `SYSTEM_ADMIN` role on the platform.

To configure and apply this change, follow the steps below.

### Modify your `config.yaml`

Now, apply the role and permission change to your platform's `config.yaml` file. Following the `deployment.images.push` example above, that would mean specifying this:

```yaml
astronomer:
  houston:
    config:
      roles:
        DEPLOYMENT_EDITOR:
          permissions:
            deployment.images.push: false
```

In the same way you can _remove_ permissions from a particular role by setting any permission to `:false`, you can _add_ permissions to a role at any time.

For example, if you want to allow any `DEPLOYMENT_VIEWER` (and therefore `WORKSPACE_VIEWER`) to push code directly to any Airflow Deployment within a Workspace, you'd specify the following:

```yaml
astronomer:
  houston:
    config:
      roles:
        DEPLOYMENT_VIEWER:
          permissions:
            deployment.images.push: true
```

### Apply your Changes

Once you've made changes to your `config.yaml` file, trigger a platform upgrade from the `astronomer` repo by running:

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
calico-crab         	4       	Fri Nov 22 09:36:51 2019	DEPLOYED	astronomer-platform-0.10.3-fix.1	0.16.4     	astro

$ helm upgrade calico-crab -f config.yaml --version=0.16.4 astronomer/astronomer -n calico-crab
```

## System Roles

### Overview

The System Admin role on Astronomer Enterprise brings a range of cluster-wide permissions that supercedes Workspace-level access and allows a user to monitor and take action across Workspaces, Deployments and Users within a single cluster.

On Astronomer, System Admins specifically can:

- List and search *all* users
- List and search *all* deployments
- Access the Airflow UI for *all* deployments
- Delete a user
- Delete an Airflow Deployment
- Access Grafana and Kibana for cluster-level monitoring
- Add other System Admins

By default, the first user to log into an Astronomer Enterprise installation is granted the System Admin permission set.

### System Editor, Viewer

In addition to the commonly used System Admin role, the Astronomer platform also supports both a System Editor and System Viewer permission set.

No user is assigned the System Editor or Viewer Roles by default, but they can be added by System Admins via our API. Once assigned, System Viewers, for example, can access both Grafana and Kibana but don't have permission to delete a Workspace they're not a part of.

All three permission sets are entirely customizable on Astronomer Enterprise. For a full breakdown of the default configurations attached to the System Admin, Editor and Viewer Roles, refer to our [Houston API source code](https://github.com/astronomer/docs/blob/082e949a7b5ac83ed7a933fca5bcf185b351dc39/enterprise/v0.14/reference/default.yaml#L220).

For guidelines on assigning users any System Level role, read below.

#### Assign Users System-Level Roles

System Admins can be added to Astronomer Enterprise via the 'System Admin' tab of the Astronomer UI.

Keep in mind that:
- Only existing System Admins can grant the SysAdmin role to another user
- The user must have a verified email address and already exist in the system

> **Note:** If you'd like to assign a user a different System-Level Role (either [`SYSTEM_VIEWER`](https://github.com/astronomer/docs/blob/082e949a7b5ac83ed7a933fca5bcf185b351dc39/enterprise/v0.14/reference/default.yaml#L228) or [`SYSTEM_EDITOR`](https://github.com/astronomer/docs/blob/082e949a7b5ac83ed7a933fca5bcf185b351dc39/enterprise/v0.14/reference/default.yaml#L237)), you'll have to do so via an API call from your platform's GraphQL playground. For guidelines, refer to our ["Houston API" doc](/docs/enterprise/v0.14/manage-astronomer/houston-api/).

#### Verify SysAdmin Access

To verify a user was successfully granted the SysAdmin role, ensure they can do the following:

- Navigate to `grafana.BASEDOMAIN`
- Navigate to `kibana.BASEDOMAIN`
- Access the 'System Admin' tab from the top left menu of the Astronomer UI
