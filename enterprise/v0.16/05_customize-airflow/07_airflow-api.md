---
title: "Make a Request to the Apache Airflow API"
navTitle: "Airflow API"
description: "How to call the Apache Airflow REST API on Astronomer."
---

## Overview

Apache Airflow is an extensible orchestration tool that offers multiple ways to define and orchestrate data workflows. For users looking to automate actions around those workflows, Airflow exposes an ["experimental" REST API](https://airflow.apache.org/docs/stable/rest-api-ref.html) that you're free to leverage on Astronomer.

If you're looking to externally trigger DAG runs without needing to access your Airflow Deployment directly, for example, you can make an HTTP request (in Python, cURL etc.) to the corresponding endpoint in Airflow's API that calls for that exact action.

To get started, you'll need a Service Account on Astronomer to authenticate. Read below for guidelines.

## Create a Service Account on Astronomer

The first step to calling the Airflow API on Astronomer is to create a Deployment-level Service Account, which will assume a user role and set of permissions and output an API Key that you can use to authenticate with your request.

You can create a Service Account either via the Astronomer CLI or the Astronomer UI.

> **Note:** If you just need to call the Airflow API once, you could create a temporary Authentication Token (_expires in 24 hours_) on Astronomer in place of a long-lasting Service Account. To do so, navigate to: https://app.BASEDOMAIN/token.

### Create a Service Account via the Astronomer CLI

To create a Deployment-level Service account via the CLI, first run:

```
$ astro deployment list
```

This will output the list of Airflow Deployments you have access to and their corresponding Deployment ID.

With that Deployment ID, run:

```
$ astro deployment service-account create -d <deployment-id> --label <service-account-label> --role <deployment-role>
```

### Create a Service Account via the Astronomer UI

If you prefer to provision a Service Account through the Astronomer UI, start by logging into Astronomer.

#### Navigate to your Deployment's "Configure" Page

From the Astronomer UI, navigate to: **Deployment** > **Service Accounts**.

![New Service Account](https://assets2.astronomer.io/main/docs/ci-cd/ci-cd-new-service-account.png)

#### Configure your Service Account

As you're creating a Service Account, you'll be asked to specify its:

- Name
- User Role
- Category (_optional_)

![Name Service Account](https://assets2.astronomer.io/main/docs/ci-cd/ci-cd-name-service-account.png)

> **Note:** In order for a Service Account to have permission to push code to your Airflow Deployment, it must have either the "Editor" or "Admin" role. For more information on Workspace roles, refer to our ["Roles and Permissions"](/docs/enterprise/v0.16/manage-astronomer/workspace-permissions/) doc.

#### Copy the API Key

Once you've created your new Service Account, grab the API Key that was immediately generated. Depending on your use case, you might want to store this key in an Environment Variable or secret management tool of choice.

![Service Account](https://assets2.astronomer.io/main/docs/ci-cd/ci-cd-api-key.png)


## Test an Airflow API Request

Now that you've created a Service Account, you're free to generate both GET or POST requests to any supported endpoints in Airflow's ["Rest API Reference"](https://airflow.apache.org/docs/stable/rest-api-ref.html) via this URL:

```
https://deployments.<BASEDOMAIN>/<deployment-release-name>
```

Make sure to replace the end of the URL above with your platform's basedomain and your Deployment's release name (e.g. `galactic-stars-1234`).

You can make requests via the method of your choosing. Below, we'll walk through an example request via cURL to Airflow's "Trigger DAG" endpoint and an example request via Python to the "Get all Pools" endpoint.

### Trigger DAG

If you'd like to externally trigger a DAG run, you can start with a generic cURL command to Airflow's POST endpoint: 

```
POST /airflow/api/experimental/dags/<DAG_ID>/dag_runs
```

This command would look like this:

```
curl -v -X POST
https://AIRFLOW_DOMAIN/airflow/api/experimental/dags/<DAG_ID>/dag_runs
-H 'Authorization: <API_Key> ’
-H ‘Cache-Control: no-cache’
-H ‘content-type: application/json’ -d ‘{}’
```

To run this, replace:

- **AIRFLOW_DOMAIN**: `https://deployments.BASEDOMAIN/<deployment-release-name>`
- **DAG_ID**: Name of your DAG (_case-sensitive_)
- **API_Key**: API Key from your Service Account

This will successfully kick off a DAG run for your DAG with an `execution_date` value of `NOW()`, which is equivalent to clicking the “Play” button in the main "DAGs" view of the Airflow UI (Webserver).

> **Note:** Your request will have the same permissions as the role of the Service Account you created on Astronomer.

#### Specify Execution Date

If you'd like to choose a specific `execution_date` (i.e. start timestamp) to kick off your DAG on, you can pass that in with the data parameter's JSON value `("-d'{}')`.

The string needs to be in the following format (in UTC):

```
“YYYY-mm-DDTHH:MM:SS”
```

For example:

```
“2016-11-16T11:34:15”
```

Here, your request becomes:

```
curl -v -X POST
https://AIRFLOW_DOMAIN/api/experimental/dags/customer_health_score/dag_runs
-H ‘Authorization: XXXX’
-H ‘Cache-Control: no-cache’
-H ‘content-type: application/json’ -d ‘{“execution_date”:“2019-03-05T08:30:00”}’
```

### Get all Pools

If you'd like to get all existing Pools from your Airflow Deployment, you can start with a generic Python command to Airflow's GET endpoint: 

```
GET /api/experimental/pools
```

Here, your request would look like this:

```python
python
import requests
token="<API_KEY>"
base_url="<BASE_DOMAIN>"
resp = requests.get(
   url=base_url + "<deployment_release_name>/airflow/api/experimental/pools",
   headers={"Authorization": token},
   data={}
)
print(resp.json())
>>>>  [{'description': 'Default pool', 'id': 1, 'pool': 'default_pool', 'slots': 128}]
```

To run this, replace:

- **BASE_DOMAIN**: Your platform's base domain (e.g. `mycompany.astronomer.com`)
- **API_KEY**: API Key from your Service Account
- **deployment_release_name**: Your Airflow Deployment Release Name

## New REST API Coming soon

An official REST API for Airflow is coming in the Airflow 2.0 release scheduled for Winter 2020. For more information, check out [AIP-32](https://cwiki.apache.org/confluence/display/AIRFLOW/AIP-32%3A+Airflow+REST+API) or [reach out to us](https://support.astronomer.io).