---
title: "Manage User Permissions on Astronomer Cloud"
navTitle: "User Permissions"
description: "Manage user roles and permissions across any Astronomer Workspace and all Airflow Deployments within it."
---

## Overview

Astronomer supports a role-based access control (RBAC) and permissions framework that allows users to configure varying levels of access both at the Workspace and Deployment levels. Individual users on Astronomer can be configured to have some level of Workspace-specific permissions while holding a different set of permissions for any individual Airflow Deployment.

Workspace and Deployment-level access can be configured with 3 user roles (Admin, Editor, Viewer), all of which can be set and changed via the Astronomer UI and CLI. Each role maps to a combination of permissions to both Astronomer and Airflow itself.

The guidelines below will cover:

1. How to invite users to a Workspace and Deployment
2. How to view, set and change user roles
3. Deployment and Workspace Permissions Reference
4. Airflow Access Reference

## Invite Users

Workspace and Deployment _Admins_ can invite and otherwise manage users both via the Astronomer UI and CLI. All users who have access to a Workspace must be assigned 1 of 3 Workspace roles, though Deployment-level roles are not required.

Read below for guidelines. 

### Invite to Workspace

The ability to invite users to an Astronomer Workspace is limited to Workspace _Admins_, who can also grant the _Admin_ role to other users. Workspace _Editors_ and _Viewers_ cannot invite or otherwise manage Workspace users, though they may do so at the Deployment-level depending on their Deployment-level role.

A user who creates a Workspace is automatically granted the "Admin" role for the Workspace and thus also has the ability to create an Airflow Deployment within it.

#### via Astronomer UI

To invite a user to a Workspace via [the Astronomer UI](https://app.gcp0001.us-east4.astronomer.io/), navigate to **Workspace** > **Users** > **Invite User**.

When a Workspace _Admin_ invites a user to a Workspace in which one or more Airflow Deployments exist, they'll have the opportunity to set that user's Deployment-level roles as well, though it is not required.

[ADD INVITE USER GIF]

If a Workspace Admin invites a user to a Workspace that does _not_ have any Airflow Deployments within it, the "Deployment Roles" modal above will not appear.

#### via Astronomer CLI

To invite a user to a Workspace as a Workspace _Admin_ via the Astronomer CLI, run:

```
$ astro workspace user add <email-address> --<workspace-id> --<role>
```

To find **Workspace ID**, you can:

- Run `$ astro workspace list`
- Find it in the Workspace URL from your browser after the `/w/` (e.g. `https://app.gcp0001.us-east4.astronomer.io/w/<workspace-id>`)

To set a **Role**, add a flag in the following format:

- `--WORKSPACE_EDITOR`
- `--WORKSPACE_VIEWER`
- `--WORKSPACE_ADMIN`

If you do _not_ specify a role in this command, `WORKSPACE_VIEWER` will be set by default and no deployment-level role will be assumed.

### Invite to Deployment

The ability to invite users to an Airflow Deployment is limited to Deployment _Admins_, who can also grant the _Admin_ role to other users. Deployment _Editors_ and _Viewers_ cannot invite or otherwise manage users. A user who creates a Deployment is automatically granted the _Admin_ role within it.

> **Note:** In order for a user to be granted access to an Airflow Deployment, they must _first_ be invited to and assigned a role within the Workspace. On the other hand, a user could be a part of a Workspace but have no access or role to any Airflow Deployments within it.

#### via Astronomer UI

To invite a Workspace user to an Airflow Deployment via the Astronomer UI, navigate to: **Workspace** > **Deployment** > **Access**.

From there:

1. Type the Workspace user's name in the search bar on top
2. Select a role from the drop-down menu on the right
3. Click the `+`

[INSERT DEPLOYMENT USER INVITE GIF]

#### via Astronomer CLI

To invite a user to a Deployment as a Deployment _Admin_ via the Astronomer CLI, run:

```
$ astro deployment user add <email-address> --deployment-id=<deployment-id> --role=<role>
```

To find **Deployment ID**, you can:

- Run `$ astro deployment list`

To set a **Role**, add a flag in the following format:

- `--DEPLOYMENT_EDITOR`
- `--DEPLOYMENT_VIEWER`
- `--DEPLOYMENT_ADMIN`

If you do _not_ specify a role in this command, `DEPLOYMENT_VIEWER` will be set by default.

## View and Edit User Roles

### Workspace

#### View Workspace Roles

To view roles within a Workspace via the Astronomer UI, navigate to **Workspace** > **Users**. All Workspace users have access to this view and can see the roles of all other users.

![Users](https://assets2.astronomer.io/main/docs/astronomer-ui/users_permissions.png)

#### Edit Workspace Roles

If you're a Workspace Admin, you can edit both Workspace and Deployment-level permissions by clicking into an individual user.

![Configure Access](https://assets2.astronomer.io/main/docs/astronomer-ui/configure_access-0.22.png)

### Deployment

#### View Deployment Roles

To view roles within a Deployment, navigate to **Workspace** > **Deployment** > **Access**.

![Deployment Users](https://assets2.astronomer.io/main/docs/astronomer-ui/deployment_users_0.22.png)

To list users via the Astronomer CLI, run:

```
$ astro deployment user list <deployment-id>
```

### Edit Deployment Roles

Deployment _Admins_ can edit permissions using the dropdown menu in the **Access** tab in the Astronomer UI.

![Configure Deployment Access](https://assets2.astronomer.io/main/docs/astronomer-ui/deployment_users_edit_0.22.png)

To edit a user's role via the Astro CLI as a Deployment _Admin_, run:

```
$ astro deployment user update <email> --deployment-id=ID --role=ROLE
```

### Remove User from Deployment

To delete a user from an Airflow Deployment via the Astronomer UI, click on the red "wastebasket" icon within the **Access** tab shown in the screenshot above.

To delete a user from an Airflow Deployment via the Astro CLI, run:

```
$ astro deployment user delete <email> --deployment-id=<deployment-id>
```

## Workspace Permissions Reference

### Admin

Workspace Admins are the highest-tiered role. Admins can:

- Perform CRUD (create, read, update, delete) operations on the Workspace
- Perform CRUD operations on any Airflow deployment within that workspace
- Manage users and their permissions in a Workspace

### Editor

Behind admins, the Editor can:

- Perform CRUD operations on any deployment in the Workspace
- Perform CRUD operations on any service account in the Workspace

Editors _cannot_ manage other users in the Workspace.

### Viewer

Viewers are limited to read-only mode. They can:

- Can view users in a Workspace
- Can view deployments in a Workspace

Viewers _cannot_ push code to a deployment.

**Note:** By default, newly invited users are `Viewers` in a Workspace.

## Astronomer Deployment Access

### Admin

Deployment Admins are the highest-tiered role. Admins can:

- Perform CRUD (create, read, update, delete) operations on the Deployment
- Perform CRUD Airflow operations
- Manage users and their permissions in a Deployment

### Editor

Behind admins, the Editor can:

- Perform CRUD operations on the Deployment
- Perform CRUD operations on any service account in the Deployment

Editors _cannot_ manage other users in the Deployment.

### Viewer

Viewers are limited to read-only mode. They can:

- Can view users in a Deployment
- Can view deployments in a Deployment

Viewers _cannot_ push code to a deployment.

**Note:** By default, newly invited users are `Viewers` in a Deployment

## Airflow Access

Astronomer RBAC not only applies to functions on Astronomer itself, but it also maps to Airflow native roles and permissions. User roles apply to all Airflow deployments within a single Workspace.

For a detailed mapping of Airflow-native roles, refer to our source code [here](https://github.com/astronomer/docs/blob/2725107126909019c6db02c7d40dcccfe20e9312/cloud/stable/reference/default.yaml#L261) and [here](https://github.com/astronomer/docs/blob/2725107126909019c6db02c7d40dcccfe20e9312/cloud/stable/reference/authorization-handler.js#L89-L113).

Read below for a breakdown of how Astronomer roles translate to Airflow access and functionality.

### Admins

- Full deploy functionality to all deployments within the Workspace
- Full access to the `Admin` panel in Airflow
- Full access to modify and interact with DAGs in the UI

### Editors

- Full access to modify and interact with DAGs in the Airflow UI
- Do *not* have access to the `Admin` menu in Airflow, which includes:
    - Pools
    - Configuration
    - Users
    - Connections
    - Variables
    - XComs

![No Admin Tab](https://assets2.astronomer.io/main/docs/astronomer-ui/editor_view.png)

### Viewers

- Read-only access to the Airflow UI
- Cannot deploy to, modify, or delete anything within an Airflow deployment
- Any attempts to view logs, trigger DAGs, or anything else of the sort will result in a `403` and an `Access is Denied` message.

![Access Denied](https://assets2.astronomer.io/main/docs/astronomer-ui/access_denied.png)
