---
title: "Manage User Permissions on Astronomer Cloud"
navTitle: "User Permissions"
description: "Manage user roles and permissions across any Astronomer Workspace and all Airflow Deployments within it."
---

## Overview

Astronomer supports a permissions and role-based access control (RBAC) framework that allows users to configure varying levels of access both at the Workspace and Deployment levels.

Workspace and Deployment-level access can be configured with 3 user roles (_Admin_, _Editor_, _Viewer_), all of which can be set and changed via the Astronomer UI and CLI. Each role maps to a combination of permissions to both Astronomer and Airflow itself.

The guidelines below will cover:

1. How to invite users to a Workspace and Deployment
2. How to view, set and change user roles
3. Deployment and Workspace Permissions Reference

## Invite Users

Workspace and Deployment _Admins_ can invite and otherwise manage users both via the Astronomer UI and CLI. All users who have access to a Workspace must be assigned 1 of 3 Workspace roles, though deployment-level roles are not required.

Read below for guidelines. 

### Invite to Workspace

The ability to invite users to an Astronomer Workspace is limited to Workspace _Admins_, who can also grant the _Admin_ role to other users. Workspace _Editors_ and _Viewers_ cannot invite or otherwise manage Workspace users, though they may do so at the deployment level depending on their deployment-level role.

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

If you do _not_ specify a role in this command, `WORKSPACE_VIEWER` will be set by default. In all cases where a user is invited to a Workspace and deployment-level role is not specified, no deployment-level role will be assumed.

### Invite to Deployment

The ability to invite users to an Airflow Deployment within a Workspace is limited to Deployment _Admins_, who can also grant the _Admin_ role to other users. Deployment _Editors_ and _Viewers_ cannot invite or otherwise manage users. A user who creates a Deployment is automatically granted the _Admin_ role within it.

> **Note:** In order for a user to be granted access to an Airflow Deployment, they must _first_ be invited to and assigned a role within the Workspace. On the other hand, a user could be a part of a Workspace but have no access or role to any Airflow Deployments within it.

#### via Astronomer UI

To invite a Workspace user to an Airflow Deployment via the Astronomer UI, navigate to: **Workspace** > **Deployment** > **Access**.

From there:

1. Type the Workspace user's name in the search bar on top (or click **Show All** to view all users)
2. Select a Deployment role from the drop-down menu to the right of the selected user
3. Click the `+`

[INSERT DEPLOYMENT USER INVITE GIF]

#### via Astronomer CLI

To invite a Workspace user to a Deployment as a Deployment _Admin_ via the Astronomer CLI, run:

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

#### View Workspace Users

To view roles within a Workspace via the Astronomer UI, navigate to **Workspace** > **Users**. All Workspace users have access to this view and can see the roles of all other users.

![Users](https://assets2.astronomer.io/main/docs/astronomer-ui/users_permissions.png)

To list Workspace users via the Astronomer CLI, run:

```bash
$ astro workspace user list
```

This command will output the email addresses of all users in the Workspace alongside their userID and Workspace Role.

#### Edit Workspace User Role

If you're a Workspace Admin, you can edit both Workspace and Deployment-level permissions by clicking into an individual user.

![Configure Access](https://assets2.astronomer.io/main/docs/astronomer-ui/configure_access-0.22.png)

To edit a user's role via the Astro CLI, run:

```bash
$ astro workspace user update <email> --workspace-id=<workspace-id> --role=<workspace-role>
```

#### Delete Workspace User

Workspace _Admins_ can remove users from a Workspace by navigating to: **Workspace** > **Users** > **Individual User** > **Remove User**.

[INSERT GIF OF REMOVE WORKSPACE USER]

To remove a user from a Workspace via the Astronomer CLI as a Workspace _Admin_, make sure you're first operating in that Workspace. Then, run:

```bash
$ astro workspace user remove <email>
```

### Deployment

#### View Deployment Users

To view roles within a Deployment, navigate to **Workspace** > **Deployment** > **Access**.

![Deployment Users](https://assets2.astronomer.io/main/docs/astronomer-ui/deployment_users_0.22.png)

To list Deployment users via the Astronomer CLI, run:

```bash
$ astro deployment user list <deployment-id>
```

#### Edit Deployment User Role

Deployment _Admins_ can edit permissions using the dropdown menu in the **Access** tab in the Astronomer UI.

![Configure Deployment Access](https://assets2.astronomer.io/main/docs/astronomer-ui/deployment_users_edit_0.22.png)

To edit a user's role via the Astro CLI as a Deployment _Admin_, run:

```bash
$ astro deployment user update <email> --deployment-id=<deployment-id> --role=<deployment-role>
```

#### Delete Deployment User

To delete a user from an Airflow Deployment via the Astronomer UI, Deployment _Admins_ can click on the red "wastebasket" icon within the **Access** tab shown in the screenshot above.

To delete a user from an Airflow Deployment via the Astro CLI, run:

```bash
$ astro deployment user delete <email> --deployment-id=<deployment-id>
```

## User Permissions Reference

### Workspace

#### Workspace Admin

Workspace Admins are the highest-tiered role. Admins can:

- Manage users and their permissions in a Workspace
- Perform CRUD (create, read, update, delete) operations on the Workspace
- Perform CRUD operations on any Airflow Deployment within that Workspace

#### Workspace Editor

Behind Workspace _Admins_, an _Editor_:

- Can access and make changes to the Workspace in the **Settings** tab
- Can perform CRUD operations on any Service Account in the Workspace
- Can create Airflow Deployments in the Workspace

Editors _cannot_ manage other users in the Workspace and _cannot_ add, edit or remove Billing information.

#### Workpace Viewer

Deployment _Viewers_ are limited to read-only mode. _Viewers_: 

- Can list users in a Workspace
- Can view all Airflow Deployments in the Workspace
- Can view all Service Accounts in the Workspace
- Cannot delete or modify the Workspace or its users

> **Note:** If a role is not set, newly invited users are Workspace _Viewers_ by default.

### Deployment Permissions Reference

#### Deployment Admin

Deployment _Admins_ are the highest-tiered role. Admins:

- Can perform CRUD (create, read, update, delete) Astronomer operations on the Deployment (e.g. modify resources, add Environment Variables)
- Can manage users and their permissions in the Deployment
- Can perform CRUD operations on any Service Account in the Workspace
- Can perform CRUD Airflow operations (push code, add Connections, clear tasks, delete DAGs etc.)
- Have full access to the `Admin` panel in the Airflow UI
- Have full access to modify and interact with DAGs in the Airflow UI

#### Deployment Editor

Behind _Admins_, a Deployment _Editor_:

- Can access and make changes to the Deployment (e.g. modify resources, change name, push code)
- Cannot delete the Deployment
- Can perform CRUD operations on any Service Account in the Deployment
- Has full access to modify and interact with DAGs in the Airflow UI
- Does NOT have access to the `Admin` menu in Airflow, which includes:
    - Pools
    - Configuration
    - Users
    - Connections
    - Variables
    - XComs

![No Admin Tab](https://assets2.astronomer.io/main/docs/astronomer-ui/editor_view.png)

A Deployment _Editor_ can push code but _cannot_ manage other users in the Deployment.

#### Deployment Viewer

Deployment _Viewers_ are limited to read-only mode. They:

- Can view Deployment users
- Can view the **Metrics** and **Logs** tab of the Astro UI
- Can access the Airflow UI
- Cannot deploy to, modify, or delete anything within an Airflow Deployment
- Cannot view Airflow task logs

Viewers _cannot_ push code to an Airflow Deployment or create Service Accounts to do so. Attempts to view logs, trigger DAGs, etc. will result in a `403` and an `Access is Denied` message.

![Access Denied](https://assets2.astronomer.io/main/docs/astronomer-ui/access_denied.png)