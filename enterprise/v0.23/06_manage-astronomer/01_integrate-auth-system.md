---
title: "Integrate an Auth System on Astronomer Enterprise"
navTitle: "Integrate an Auth System"
description: "Integrate your internal authentication server with Astronomer Enterprise."
---

## Overview

Astronomer Enterprise by default allows users to create an account with and authenticate using one of the 3 methods below:

- Google OAuth
- GitHub OAuth
- Local username/password

Authentication methods are entirely customizable. In addition to the 3 defaults above, we provide the option to integrate any provider that follows the [Open Id Connect (OIDC)](https://openid.net/connect/) protocol via [Implicit Flow](https://auth0.com/docs/authorization/mitigate-replay-attacks-when-using-the-implicit-flow). This includes (but is not limited to):

- [Microsoft Azure Active Directory (AD)](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-protocols-oidc)
- [Okta](https://www.okta.com)
- [Auth0](https://auth0.com/)

The doc below will walk through how to both enable local authentication and configure any OIDC provider, including step-by-step instructions for the 3 providers listed above.

## Local Auth

To let users authenticate to Astronomer with a local username and password", follow the steps below."

1. Enable Local Auth in your `config.yaml` file:
```yaml
astronomer:
  houston:
    config:
      auth:
        local:
          enabled: true
```

2. Push the configuration change to your platform as described in [Apply a Platform Configuration Change on Astronomer](https://www.astronomer.io/docs/enterprise/v0.23/manage-astronomer/apply-platform-config).

## General OIDC Configuration

If you'd like to integrate an OIDC provider with Astronomer Enterprise, you can enable that configuration in the `config.yaml` file of your `astronomer` directory.

Example:

```yaml
astronomer:
  houston:
    config:
      auth:
        openidConnect:
          clockTolerance: 0 # A field that can optionally be set to adjust for clock skew on the server.
          <provider-name>:
            enabled: true
            discoveryUrl: <provider-discovery-url> # Note this must be a URL that with an https:// prefix
            clientId: <provider-client-id>
            authUrlParams: # Additional required params set on case-by-case basis
```

Replace the values above with those of the provider of your choice. If you want to configure Azure AD, Okta or Auth0 read below for specific guidelines.

## Azure AD

### Register the Application via `App Registrations` on Azure

To start, register the application. As you do so, make sure to specify the Redirect URI as `https://houston.BASEDOMAIN/v1/oauth/redirect/`.

Replace `BASEDOMAIN` with your own. For example, if your basedomain were `astronomer-development.com`, your registration would look like the following:

![application](https://assets2.astronomer.io/main/docs/auth/application.png)

### Enable Access and ID Tokens

From there, head over to 'Authentication' to:

- Make sure that Access Tokens and ID tokens are enabled
- Verify the Redirect URI

Example:

![authentication.png](https://assets2.astronomer.io/main/docs/auth/authentication.png)

### Enable Azure AD in your config.yaml file

Make sure the `config.yaml` file in your `astronomer` directory is updated with the proper values:

```yaml
astronomer:
  houston:
    config:
      auth:
        openidConnect:
          google:
            enabled: false
          microsoft:
            enabled: true
            clientId: <client_id>
            discoveryUrl: https://login.microsoftonline.com/<tenant-id>/v2.0/
        github:
          enabled: false
```
Then, push the configuration change to your platform as described in [Apply a Platform Configuration Change on Astronomer](https://www.astronomer.io/docs/enterprise/v0.23/manage-astronomer/apply-platform-config).

## Okta

To integrate Okta with Astronomer, you'll need to make configuration changes both within Okta and on Astronomer.

Follow the steps below.

### Okta Configuration

1. Create an [Okta account](https://www.okta.com/) if you don't already have one you plan on using

2. Create a new web app in your Okta account for Astronomer

3. Set your `login redirect URI` to be `https://houston.BASEDOMAIN/v1/oauth/redirect/`, where the `BASEDOMAIN` is the domain at which you're hosting your Astronomer installation

4. Enable `Implicit (Hybrid)` Flow on the Okta application

4. Save the `Client ID` generated for this Okta app for use in the next steps

### Enable Okta in your config.yaml file

Add the following to your `config.yaml` file in your `astronomer` directory:

```yaml
astronomer:
  houston:
    config:
      auth:
        openidConnect:
          okta:
            enabled: true
            clientId: "<okta-client-id>"
            discoveryUrl: "https://<okta-base-domain>/.well-known/openid-configuration"
```

Then, push the configuration change to your platform as described in [Apply a Platform Configuration Change on Astronomer](https://www.astronomer.io/docs/enterprise/v0.23/manage-astronomer/apply-platform-config).

>> **Note:** `okta-base-domain` will be different from the basedomain of your Astronomer installation. You can read [Okta's docs on finding your domain](https://developer.okta.com/docs/api/getting_started/finding_your_domain/) if you are unsure what this value should be.

## Auth0

### Auth0 Configuration

#### Create an Auth0 Account

You'll need an Auth0 account in order to set up connections with the identity management provider of your choice. [Sign up for an Auth0 account](https://auth0.com/signup) if you need to.

#### Create Auth0 Tenant Domain

When you log into Auht0 you'll be prompted to create a tenant domain. You can use the default or your own unique `tenant-name`. Your full tenant domain will look something like `astronomer.auth0.com`.

> **Note:** Your full tenant domain may differ if you've created it outside of the United States.

#### Create a Connection between Auth0 and your Identity Management Provider

Depending on the Identity Management Provider you'd like to use, the steps required to establish a connection will vary.

For instructions, navigate to Auth0's [connection guides](https://auth0.com/docs/identityproviders) and select the identity provider of your choice. Once your connection is established, read below.

#### Configure Auth0 Application Settings

**Enable / disable desired connections:**

* Navigate to `https://manage.auth0.com/dashboard/us/<tenant-name>/applications`.
* Under `Applications`, select `Default App`.
* Click the `Connections` tab. You should see your connection created in Step 3 listed here. Enable your new connection, and disable any connections that you won't be using.

**Edit the Default App settings:**

* Navigate to `https://manage.auth0.com/dashboard/us/<tenant-name>/applications`.
* Under `Applications`, select `Default App`.
* Click the `Settings` tab.
* Under `Allowed Callback URLs`, add `https://houston.<your-astronomer-base-domain>/v1/oauth/redirect/`.
* Under `Allowed Logout URLs`, add `https://app.<your-astronomer-base-domain>/logout`.
* Under `Allowed Origins (CORS)`, add `https://*.<your-astronomer-base-domain>`.

**Create Auth0 API:**

* Navigate to `https://manage.auth0.com/dashboard/us/<tenant-name>/apis`.
* Click `+ Create API`.
* Under `Name`, enter `astronomer-ee`.
* Under `Identifier`, enter `astronomer-ee`.
* Leave the value under `Signing Algorithm` as `RS256`.

### Enable Auth0 in your config.yaml file

Add the following to your `config.yaml` file in your `astronomer` directory:

```yaml
astronomer:
  houston:
    config:
      auth:
        openidConnect:
          auth0:
            enabled: true
            clientId: "<default-app-client-id>"
            discoveryUrl: https://<tenant-name>.auth0.com
```
Then, push the configuration change to your platform as described in [Apply a Platform Configuration Change on Astronomer](https://www.astronomer.io/docs/enterprise/v0.23/manage-astronomer/apply-platform-config).

> **Note:** You can find your `clientID` value at `https://manage.auth0.com/dashboard/us/<tenant-name>/applications` listed next to 'Default App'.

## Running behind an HTTPS Proxy

### Overview

Integrating an external identity provider with Astronomer requires that the platform's Houston API component is able to make outbound HTTPS requests to those identity providers in order to fetch discovery documents, sign keys, and ask for user profile information upon login/signup.

If your install is configured _without_ a direct connection to the internet you will need to configure an HTTPS proxy server for Houston.

### Configure an HTTPS Proxy Server for Houston

To configure the proxy server used we need to set the `GLOBAL_AGENT_HTTPS_PROXY` Environment Variable for the Houston deployment.

To do so, add the following to the Houston section of the `config.yaml` file in your `astronomer` directory:

```yaml
astronomer:
  houston:
    config:
      auth:
        openidConnect:
          <provider>:
            enabled: true
            clientId: ...
            discoveryUrl: ...
    env:
      - name: GLOBAL_AGENT_HTTPS_PROXY
        value: http://my-proxy:3129
```

Then, push the configuration change to your platform as described in [Apply a Platform Configuration Change on Astronomer](https://www.astronomer.io/docs/enterprise/v0.23/manage-astronomer/apply-platform-config).
