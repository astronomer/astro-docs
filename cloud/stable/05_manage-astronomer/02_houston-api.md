---
title: "The Astronomer Houston API"
navTitle: "Houston API"
description: "How to automate actions on Astronomer via the Houston API."
---

## Overview

Astronomer's Houston API is the source of truth across the entire Astronomer platform.

For users on Astronomer Cloud, our API is an easy way to do any of the following:

1. Query the platform's database for information about a user, Workspace, or Deployment
2. Make changes to the platform's database (with the right permissions)

For example, you can:
- Delete a deployment
- Look up a deployment's resource config
- Add a user to a Workspace

Anything you can do via the Astronomer UI, you can do programmatically via Astronomer's Houston API. Read below for guidelines.

## Getting Started

Astronomer's Houston API is made available via a [GraphQL Playground](https://www.apollographql.com/docs/apollo-server/testing/graphql-playground/), "a graphical, interative, in-browser GraphQL IDE, created by [Prisma](https://www.prisma.io/) and based on GraphiQL." [GraphQL](https://graphql.org/) itself is an open source query language for APIs that makes for an easy and simple way to manage data.

In short, the Playground is a portal that allows you to write GraphQL queries directly against the API within your browser.

> **Note:** For more information on Playground features applicable to the wider GraphQL community, check out [GraphQL Playground's Github](https://github.com/prisma/GraphQL-playground).

### Navigate to the GraphQL Playground

On Astronomer Cloud, the URL at which you can reach Houston's GraphQL playground is: https://houston.gcp0001.us-east4.astronomer.io/v1

### Authenticate

To query our API, you must first authenticate as an Astronomer user.

To authenticate,

1. Go to https://app.gcp0001.us-east4.astronomer.io/token and copy the API token on the page. Alternatively, note the **API Key** of a [service account](https://www.astronomer.io/docs/enterprise/v0.23/deploy/ci-cd#step-1-create-a-service-account).
2. Open Astronomer's [Houston API GraphQL Playground](https://houston.gcp0001.us-east4.astronomer.io/v1).
3. Expand the `HTTP Headers` section on the bottom left of the page.
4. Paste the API token you acquired from Step 1 in the following format: `{"authorization": "<api-token>"}`

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

```graphql
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

### Create a Deployment

To create a Deployment, you'll need:

1. Permission (Workspace Admin)
2. A Workspace ID

If you don't already have a Workspace ID, run `astro workspace list` via the Astronomer CLI.

Then, in your GraphQL Playground, run the following:

```graphql
mutation CreateDeployment {
  createDeployment(
    workspaceUuid: "<workspace-id>",
    type: "airflow",
    label: "<deployment-label>",
    config: {executor:"<airflow-executor>"},


    )
    {
      id
      config
      releaseName
      workspace{label}
      roleBindings{id}
    }
}
```

Here, `<airflow-executor>` can be `LocalExecutor`, `CeleryExecutor`, or `KubernetesExecutor`.

### Delete a Deployment

To delete a Deployment, you'll need:

1. Workspace Admin privileges
2. A Deployment ID

If you don't already have a Deployment ID, run `astro deployment list` via the Astronomer CLI or follow the steps in the "Query an Airflow Deployment" section above.

Then, in your GraphQL Playground, run the following:

```graphql
mutation DeleteDeployment {
  deleteDeployment (
    deploymentUuid: "<your-deployment-id>"
  ) {
    uuid
  }
}
```

### Create a Deployment user

To create a Deployment user, you'll need:

1. Workspace Admin privileges
2. A Deployment ID

If you don't already have a Deployment ID, run `astro deployment list` via the Astronomer CLI or follow the steps in the "Query an Airflow Deployment" section above.

First, add the following to your GraphQL playground:

```graphql
mutation AddDeploymentUser(
		$userId: Id
		$email: String!
		$deploymentId: Id!
		$role: Role!
	) {
		deploymentAddUserRole(
			userId: $userId
			email: $email
			deploymentId: $deploymentId
			role: $role
		) {
			id
			user {
				username
			}
			role
			deployment {
				id
				releaseName
			}
		}
	}
```

Then, in the **Query Variables** tab, add the following:

```graphql
{
  "role": "<user-role>",
  "deploymentId": "<deploymentId>",
  "email": "<email-address>"
}
```

Here, `<user-role>` can be `DEPLOYMENT_ADMIN`, `DEPLOYMENT_EDITOR`, or `DEPLOYMENT_VIEWER`.

After you specify these variables, run the mutation.

### Delete a User

To delete a User, you'll need:

1. SysAdmin Permissions
2. `userUuid`

With a `userUuid`, run the following:

```graphql
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

1. System Admin permissions
2. User's email address

With the email address in question, run the following:

```graphql
mutation verifyEmail {
	verifyEmail (
    email: "<USERUUID>"
  )
}
```

> **Note:** To run this mutation, ensure that the user in question has already begun creating an account on the platform (i.e. the user has signed up and the platform has generated an "invite token" for that user).

### Bypass User Invite Emails

If you want to invite users to a Workspace without them needing to first verify the invite via email, you can configure a bypass. This can be useful if you're programmatically inviting many users at once to your platform.

```graphql
mutation workspaceAddUser(
    $workspaceUuid: Uuid = "ckoipskl310476tbb4jvsznu4"
    $email: String! = "aliotta343@gmail.com"
    $role: Role! = WORKSPACE_EDITOR
    $deploymentRoles: [DeploymentRoles!]
    $bypassInvite: Boolean! = true
  ) {
    workspaceAddUser(
      workspaceUuid: $workspaceUuid
      email: $email
      role: $role
      deploymentRoles: $deploymentRoles
      bypassInvite: $bypassInvite
    ) {
      id
    }
  }
```

### Update environment variables

To programmatically update environment variables, you'll need:

1. A Deployment ID
2. A Deployment release name

If you don't already have a Deployment ID, run `astro deployment list` via the Astronomer CLI or follow the steps in the "Query an Airflow Deployment" section above.

Then, in your GraphQL Playground, run the following:

```graphql
mutation UpdateDeploymentVariables {
  updateDeploymentVariables(
    deploymentUuid: "<deployment-id>",
  	releaseName: "<deployment-release-name>",
    environmentVariables: [
      {key: "<environment-variable-1>",
      value: "<environment-variable-value-1>",
      isSecret: <true-or-false>},
      {key: "<environment-variable-2>",
      value: "<environment-variable-value-2>",
      isSecret: <true-or-false>}
    ]
  ) {
    key
    value
    isSecret
  }
}
```

If the environment variable hasn't been specified before, this mutation adds it to the Deployment. If the environment variable has already been specified, this mutation updates the existing value to be the value that you specified.

## Custom Types

Any object in the `Schema` that maps to a custom GraphQL Type often requires additional subfields to be added to the query or mutation return object.

Below, we describe this concept in the context of a sample mutation.

### Add a User to a Workspace

For example, take the "Add a User to a Workspace" mutation.

As input, you need:

1. A Workspace ID
2. Email address of the user
3. Role you'd like to designate that user (e.g. Workspace "Admin", "Editor" or "Viewer")

If you don't already have a Workspace ID, run `astro workspace list` via the Astronomer CLI.

With that information, run the following:

```graphql
mutation WorkspaceAddUser {
	workspaceAddUser (
    workspaceUuid: "<workspace-id>"
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
