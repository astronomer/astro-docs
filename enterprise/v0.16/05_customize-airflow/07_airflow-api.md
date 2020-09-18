---
title: "Calling the Airflow API Programmatically"
navTitle: "Airflow API"
description: "How to add Airflow API calls to your scripts"
---

## Overview

Airflow is a very flexible solution, with multiple ways of defining and orchestrating your workflows. One such tool at your disposal is the Airflow API, which you can call to programmatically kick off DAGs. 


## The Airflow API on Astronomer
Each call to the Airflow API on Astronomer will need to contain an authentication token. For Astronomer Enterprise users, the token generated upon login at https://app.BASEDOMAIN/token can be used, but it is recommended that any workflows hitting the API use a long lived service account token.

![Service Account](https://assets2.astronomer.io/main/docs/airflow_api/service_account_api.png)
These service accounts tokens can also be created from the Astronomer CLI:

```bash
$ astro deployment service-account
Service-accounts represent a revokable token with access to the Astronomer platform
Usage:
  astro deployment service-account [command]
Aliases:
  service-account, sa
Available Commands:
  create      Create a service-account in the astronomer platform
  delete      Delete a service-account in the astronomer platform
  get         Get a service-account by entity type and entity id
Flags:
  -h, --help   help for service-account
Global Flags:
      --workspace-id string   workspace assigned to deployment
Use "astro deployment service-account [command] --help" for more information about a command.
```

## Test a Request
Now that a service account has been created, requests can be made at https://deployments.BASEDOMAIN/<deployment_name>, subbing in the appropriate deployment name in the url. 

An example API call could look like:
```python
python
import requests
token="<token_id>"
base_url="https://deployments.<BASE_DOMAIN>/"
resp = requests.get(
   url=base_url + "<deployment_id>/airflow/api/experimental/pools",
   headers={"Authorization": token},
   data={}
)
print(resp.json())
>>>>  [{'description': 'Default pool', 'id': 1, 'pool': 'default_pool', 'slots': 128}]
```
Note that your request will have the same permissions as the role of the service account created.

## Additional Endpoints
Major improvements are planned to the Airflow API in the near future. More information can be found [on the official Airflow API AIP](https://cwiki.apache.org/confluence/display/AIRFLOW/AIP-32%3A+Airflow+REST+API).
