---
title: "Kubernetes Secrets"
description: "Setting Kubernetes Secrets for Astronomer"
date: 2018-07-17T00:00:00.000Z
slug: "ee-installation-k8s-secrets"
---

## 1. Postgres Secret

Depending on where your Postgres cluster is running, you may need to adjust the connection string in the next step to match your environment. If you installed via the helm chart, you can run the command that was output by helm to set the `${PGPASSWORD}` environment variable, which can be used in the next step. Once that variable is set, you can run this command directly to create the bootstrap secret.

```
helm list
```

find your postgres pod, and note the name...

```
PGPASSWORD=$(kubectl get secret --namespace astronomer pod-name-postgresql -o jsonpath="{.data.postgres-password}" | base64 --decode; echo)

echo $PGPASSWORD
```

**Note:** If the first command does not work for you, try running:

```
PGPASSWORD=$(kubectl get secret --namespace astronomer pod-name-postgresql -o jsonpath="{.data.postgresql-password}" | base64 --decode; echo)
```

**Note:** If your postgres password contains special characters, these may cause issues when the full postgres connection is parsed. To avoid these issues, you may update the password to include only alpha-numeric characters, or escape your special characters. More about URL escape characters can be found [here](https://www.werockyourweb.com/url-escape-characters/).

To set the secret, run:

```shell
$ kubectl create secret generic astronomer-bootstrap \
  --from-literal connection="postgres://postgres:${PGPASSWORD}@astro-db-postgresql.astronomer.svc.cluster.local:5432" \
  --namespace astronomer
```

Be sure to include the namespace in the host above (e.g. astro-db-postgresql.`astronomer`.svc.cluster) above.

> Note: Change user from `postgres` if you're creating a user instead of using the default, it needs permission to create databases, schemas, and users.

## 2. TLS Secret

```shell
$ kubectl create secret tls astronomer-tls \
  --key /etc/letsencrypt/live/astro.mycompany.com/privkey.pem \
  --cert /etc/letsencrypt/live/astro.mycompany.com/fullchain.pem \
  --namespace astronomer
```

Be sure to include your domain here, as it is looking for the file path that you generated your certificates with the docker command from before with.
