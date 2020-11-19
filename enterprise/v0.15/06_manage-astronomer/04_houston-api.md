---
title: "The Houston API"
navTitle: "Houston API"
description: "How to use the GraphQL Playground to interact with Astronomer's API."
---

## Overview

Astronomer's Houston API is the source of truth across the entire Astronomer platform.

For Astronomer Enterprise users, our API is an easy way to do any of the following:

1. Query the platform's database for information about a user, Workspace, or Deployment
2. Make changes to the platform's database (with the right permissions)
3. Perform CRUD operations on entities scoped to the Astronomer platform, including Airflow deployments, workspaces, and users.

For example, you can:
- Delete a deployment
- Look up a deployment's resource config
- Add a user to a Workspace
- Make a user a System Administrator

Anything you can do via the Astronomer UI, you can do programmatically via Astronomer's Houston API. Read below for guidelines.

## Getting Started

Astronomer's Houston API is made available via a [GraphQL Playground](https://www.apollographql.com/docs/apollo-server/testing/graphql-playground/), "a graphical, interative, in-browser GraphQL IDE, created by [Prisma](https://www.prisma.io/) and based on GraphiQL." [GraphQL](https://graphql.org/) itself is an open-source query language for APIs that makes for an easy and simple way to manage data.

In short, the Playground is a portal that allows you to write GraphQL queries directly against the API within your browser.

> **Note:** For more information on Playground features applicable to the wider GraphQL community, check out [GraphQL Playground's Github](https://github.com/prisma/GraphQL-playground).

### Navigate to the GraphQL Playground

The URL at which you can reach Houston's GraphQL playground depends on the platform you're running. For your installation of Astronomer, it will be `https://houston.BASEDOMAIN/v1/`.

E.g. If you're an Enterprise customer and your basedomain were `Astronomer`, you would navigate to https://houston.astronomer/v1/.

### Authenticate

To query our API, you must first authenticate as an Astronomer user.

To authenticate,

1. Grab an authentication token from the Astronomer UI (via https://app.BASEDOMAIN/token)
2. Generate a Service Account Key from the Astronomer UI
3. Expand the `HTTP Headers` section on the bottom left of the page
4. Paste the token in the following format: `{"authorization": "TOKEN"}`

![Headers](https://assets2.astronomer.io/main/docs/ee/headers.png)

> **Note:** As you work with our API, you'll be restricted to actions allowed by both your existing role within the platform (e.g. SysAdmin or not) and your permissions within any particular Workspace (e.g. Viewer, Editor, Admin).


### Query Types

On Astronomer, you can ask for GraphQL:

- [Queries](https://GraphQL.org/learn/queries/#fields) - Queries to return information
- [Mutations](https://GraphQL.org/learn/queries/#mutations) - Queries to modify data
- [Subscriptions](https://GraphQL.org/blog/subscriptions-in-GraphQL-and-relay/) - Describes all of the events that can be subscribed to

This guide will stay away from Subscriptions.

### Houston API Schema

Once authenticated, you should be able to query all endpoints your user has access to. The [`Schema`](https://GraphQL.org/learn/schema/) tab fixed on the right-hand side of the page is a great reference for queries and mutations we support and how each of them is structured.

![Schema](https://assets2.astronomer.io/main/docs/ee/graphql_schema.png)

## Sample Queries

Read below for commonly used queries. For those not in this doc, reference the "Schema" on the right-hand side as referenced above.

### Query an Airflow Deployment

The `workspaceDeployments` query requires the following inputs:

- `workspaceUuid`
- `releaseName`

and can return any of the fields under `Type Details`:

- `config`
- `uuid`
- `status`
- `createdAt`
- `updatedAt`
- `roleBindings`
- etc.

For instance, you can run the following:

```
query workspaceDeployments {
  workspaceDeployments(
    releaseName: "mathematical-probe-2087"
    workspaceUuid: "ck35y9uf44y8l0a19cmwd1x8x"
  )
  {
    config
    uuid
    status
    createdAt
    updatedAt
    workspace {users {emails {address, createdAt} }}
  }
}
```

To view results, press the "Play" button in middle of the page and see them render on the right side of the page.

![Query](https://assets2.astronomer.io/main/docs/ee/deployment_query.gif)

### Query a User

To query for information about a user on the platform (e.g. "When was this user created?" "Does this user exist?" "What roles do they have on any Workspace?"), run a variation of the following:

```graphql
query User {
  users(user: { email: "<name@mycompany.com>"} )
  {
    id
    roleBindings {role}
    status
    createdAt
  }
}
```

In the output, you should see:

- The user's `id`
- A list of existing roles across the cluster (e.g. Workspace Admin)
- The status of the user (`active`, `pending`)
- A timestamp that reflects when the user was created

## Sample Mutations

Mutations make a change to your platform's underlying database. For some common examples, read below.

### Delete a Deployment

To delete a Deployment, you'll need:

1. Permission (SysAdmin or Workspace Admin)
2. `deploymentUuid`

> **Note:** For more information about the SysAdmin role, reference our ["User Management" doc](/docs/enterprise/v0.15/manage-astronomer/manage-platform-users/).

#### Query for `deploymentUuid`

If you don't already have a `deploymentUuid`, first run the query in the "Query an Airflow Deployment" section above (which requires the `releaseName` or `WorkspaceUuid`).

With the `deploymentUuid`, run the following:

```
mutation DeleteDeployment {
  deleteDeployment (
    deploymentUuid: "<DEPLOYMENTUUID>"
  ) {
    uuid
  }
}
```

### Delete a User

To delete a User, you'll need:

1. SysAdmin Permissions
2. `userUuid`

With a `userUuid`, run the following:

```
mutation removeUser {
	removeUser (
    userUuid: "<USERUUID>"
  ) {
    uuid
    emails {address}
    status
  }
}
```

### Verify Email

If a user on the platform has trouble verifying their email address upon signup, you can leverage the Playground to manually verify it.

To run this mutation, you'll need:

1. SysAdmin Permissions
2. User's email address

With the email address in question, run the following:

```
mutation verifyEmail {
	verifyEmail (
    email: "<USERUUID>"
  )
{
```

> **Note:** To run this mutation, ensure that the user in question has already begun creating an account on the platform (i.e. the user has signed up and the platform has generated an "invite token" for that user).

### Add a SysAdmin (_Enterprise Only_)

System Admins can be added either via the Astronomer UI ('System Admin' > 'User' > 'User Details') or via an API call to Houston. To run the mutation in the GraphQL Playground, you'll need:

- `userUuid`
- `role` (SYSTEM_ADMIN)

> **Note:** Keep in mind that only existing System Admins can grant the SysAdmin role to another user and that the user in question must already have a verified email address and already exist in the system.

With the `uuid` you pulled above, call the `createSystemRoleBinding` mutation by running:

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

If you're assigning a user a different System-Level Role, replace `SYSTEM_ADMIN` with either [`SYSTEM_VIEWER`](https://github.com/astronomer/docs/blob/082e949a7b5ac83ed7a933fca5bcf185b351dc39/enterprise/v0.15/reference/default.yaml#L228) or [`SYSTEM_EDITOR`](https://github.com/astronomer/docs/blob/082e949a7b5ac83ed7a933fca5bcf185b351dc39/enterprise/v0.15/reference/default.yaml#L237) in the mutation above.

## Custom Types

Any object in the `Schema` that maps to a custom GraphQL Type often requires additional subfields to be added to the query or mutation return object.

Below, we describe this concept in the context of a sample mutation.

### Add a User to a Workspace

For example, take the "Add a User to a Workspace" mutation.

As input, you need:

1. A `workspaceUuid`
2. Email address of the user
3. Role you'd like to designate that user (e.g. Workspace "Admin", "Editor" or "Viewer")

With that information, run the following:

```
mutation WorkspaceAddUser {
	workspaceAddUser (
    workspaceUuid: "<WORKSPACEUUID>"
    email: "<email@mycompany.com>"
    role: WORKSPACE_ADMIN
  ) {
    users {emails {address} }
    label
    createdAt
  }
}
```

In the above example, you should see the following return:

1. The email addresses of _all_ users in the Workspace
2. The Workspace `label`
3. The date on which the Workspace was created


Unlike the `label` and `createdAt` fields, notice that the `users` type field requires you to specify additional subfields, i.e. `emails` and then `addresses`.

To know which fields you can or must specify, reference the "Schema" on the righthand side of the page. As is the case here, custom types are often composed of other custom types.

![Custom Type](https://assets2.astronomer.io/main/docs/ee/deployments_custom_typeschema.png)
