---
title: "Manage User Permissions on an Astronomer Workspace"
navTitle: "Workspace User Permissions"
description: "Manage user roles and permissions within a single Astronomer Workspace."
---

Astronomer v0.9 and beyond supports role based access control (RBAC), allowing you to configure varying levels of access across all Users within your Workspace.

The Astronomer image comes bundled with an [astronomer-fab-security manager package](https://github.com/astronomer/astronomer-fab-securitymanager/blob/3067c0470dbb1a528d1e251fb45312d01989e6a4/README.md) that connects permissions between
Houston (the Astronomer API) and Airflow's built-in RBAC.

For details on how those levels of permission are defined and how to leverage them on both Astronomer and Airflow, read the guidelines below.

## Overview

Astronomer supports three levels of Workspace roles:

   - Admin
   - Editor
   - Viewer

Each of these roles maps to a combination of permissions to both Astronomer and Airflow itself.

### View Roles

To view roles within a Workspace, navigate to the `Users` tab.

![Users](https://assets2.astronomer.io/main/docs/astronomer-ui/users_permissions.png)

### Edit Roles

If you're a Workspace Admin, you can edit permissions by clicking into a user.

![Configure Access](https://assets2.astronomer.io/main/docs/astronomer-ui/configure_access.png)

## Astronomer Access

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

## Airflow Access

Astronomer RBAC not only applies to functions on Astronomer itself, but it also maps to Airflow native roles and permissions. User roles apply to all Airflow deployments within a single Workspace.

For a detailed mapping of Airflow-native roles, refer to our source code [here](https://github.com/astronomer/docs/blob/082e949a7b5ac83ed7a933fca5bcf185b351dc39/enterprise/v0.16/reference/default.yaml#L236) and [here](https://github.com/astronomer/docs/blob/9cd8da9a4382bc89d7b8c07f5585ad1daa64a250/enterprise/v0.16/reference/authorization-handler.js#L87-L111).

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

## Coming soon

In coming releases, we'll be rolling out Deployment level permissions to use in tandem with Workspace level permissions.
