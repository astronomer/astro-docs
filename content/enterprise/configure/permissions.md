---
title: "Configuring Permissions"
description: "Applying custom permission mappings to roles in Astronomer Enterprise."
date: 2019-11-16T00:00:00.000Z
slug: "ee-configuring-permissions"
---

The Astronomer platform ships with a collection of roles that can be applied to each user. Each role is given a list of permissions that allow access to certain GraphQL mutations, allowing each user to perform certain actions and blocking them from performing others. In this doc, we'll go over how to find those permissions, what permissions are applied to each role by default, and how to change those permissions via Helm so that you can fully customize user access in your Astronomer Enterprise installation.


## Permissions Reference

Permissions are defined in our default Helm charts as `scope.entity.action`, where the `scope` is the layer of our application to which the permission applies, the `entity` is the object being operated on, and the `action` is the verb describing the operation being performed on the `entity`. To view all available platform permissions, view our [default Houston API configuration](https://github.com/astronomer/houston-api/blob/master/config/default.yaml#L200). Each permission is applied to the role under which it is listed and permissions from lower-level roles cascade up to higher-level roles. For example, a `SYSTEM_ADMIN` can do the things listed under its role _and_ all things listed under the `SYSTEM_EDITOR` and `SYSTEM_VIEWER` roles because of the [cascade applied in the permission list](https://github.com/astronomer/houston-api/blob/master/config/default.yaml#L229).

## Roles and Permissions

Roles can be bound to individual users via the Houston API or Orbit UI.

Because our roles are constantly being expanded upon as we add more features to the platform, we will refrain from covering which permissions apply to which roles in this doc. Rather, you can check out our [User Roles and Permissions doc](https://www.astronomer.io/docs/rbac/) for a high-level overview on the capabilities allowed for each role. If you'd like a deeper dive, you can [view our API configuration directly](https://github.com/astronomer/houston-api/blob/master/config/default.yaml#L200)or the latest on these roles and how they map to our individual permissions.

> **Note:** In the current state of our platform, all `DEPLOYMENT` roles are synthetically mapped to `WORKSPACE` roles, meaning a `WORKSPACE_EDITOR` can *also* do what a `DEPLOYMENT_EDITOR` can. This is to set the stage for deployment-level permissions, which we will expose via our API and UI in an upcoming platform release.

## Customizing Permissions

Because our API configuration is completely customizable for Enterprise installs, you can control which permissions are applied to each role within your implementation of Astronomer. This can be accomplished via the following steps:

**1.**  Examine our default roles and permissions and identify which ones you would like to change. This will involved either removing specific permissions that exist on roles or adding them to roles where they do not exist.

**2.** Apply those configuration updates via the following changes to your `config.yaml` Helm file. Note that you can apply this concept to any role/permission, but for the purposes of this doc we'll use `DEPLOYMENT_EDITOR` and `deployment.images.push` as an example. In this case, the user is disallowing `DEPLOYMENT_EDITORS` (and therefore `WORKSPACE_EDITORS`) from deploying code directly to an Airflow instance. This might be done to enforce CI/CD over direct deploys from our CLI for all editors.

```yaml
astronomer:
  houston:
    config:
      roles:
        DEPLOYMENT_EDITOR:
          permissions:
            deployment.images.push: false
```

You can also add permissions to roles via the following syntax. In this case, we're adding the ability to push code to deployments to the `DEPLOYMENT_VIEWER` (and therefore `WORKSPACE_VIEWER`) role:

```yaml
astronomer:
  houston:
    config:
      roles:
        DEPLOYMENT_VIEWER:
          permissions:
            deployment.images.push: true
```


**3.** Once you have your `config.yaml` updated, you can propagate these changes to your cluster by running the following command:

```bash
helm upgrade <platform-name> -f config.yaml . --namespace <namespace>
```

