---
title: "Airflow Configuration"
description: "Programmatically generate Airflow Connections, Variables, and Pools when developing locally."
date: 2019-11-07 T00:00:00.000Z
slug: "cli-airflow-configuration"
---

The Astro CLI allows you to programmatically generate Airflow Connections, Variables and Pools when developing locally. When running `astro dev start`, you can now easily start and stop your environment with necessary configurations.

> Note: Connections, Variables, and Pools defined through this process will only be available locally. To ensure they are available in your deployments on Astronomer Cloud or Enterprise, please add them via the Airflow UI.

## Configure "airflow_settings.yaml"

When you first initialize a new Airflow project (by running `astro dev init`), a file titled `airflow_settings.yaml` will be automatically generated. To this file, you can add Airflow Connections, Pools, and Variables.

By default, the file will be structured as following:

```yaml
airflow:
  connections:
    - conn_id: my_new_connection
      conn_type: postgres
      conn_host: 123.0.0.4
      conn_schema: airflow
      conn_login: user
      conn_password: pw
      conn_port: 5432
      conn_extra:
  pools:
    - pool_name: my_new_pool
      pool_slot: 5
      pool_description:
  variables:
    - variable_name: my_variable
      variable_value: my_value
```

### Additional Entries

If you want to add a second Connection/Pool/Variable, copy the existing fields and make a new entry like so:

```yaml
variables:
  - variable_name: my_first_variable
    variable_value: value123
  - variable_name: my_second_variable
    variable_value: value987
```

## Build your Image

Once you've configured `airflow_settings.yaml`, that file will be bundled with your local image upon running `astro dev start`.

>Note: If you have any existing Connections, Pools, or Variables with the same name as those defined in `airflow_settings.yaml`, those will be overwritten.

The output you can expect upon running `astro dev start`:

```
$ astro dev start
Sending build context to Docker daemon  24.58kB
Step 1/1 : FROM astronomerinc/ap-airflow:0.10.3-1.10.5-onbuild
# Executing 5 build triggers
 ---> Using cache
 ---> Using cache
 ---> Using cache
 ---> Using cache
a ---> 08133ce1aed2
Successfully built 08133ce1aed2
Successfully tagged another-test/airflow:latest
INFO[0000] [0/3] [postgres]: Starting                   
INFO[0001] [1/3] [postgres]: Started                    
INFO[0001] [1/3] [scheduler]: Starting                  
INFO[0002] [2/3] [scheduler]: Started                   
INFO[0002] [2/3] [webserver]: Starting                  
INFO[0003] [3/3] [webserver]: Started                   
Added Connection: my_new_connection
Added Pool: my_new_pool
Added Variable: my_variable
Airflow Webserver: http://localhost:8080/admin/
Postgres Database: localhost:5432/postgres
```

## Skipped Configurations

For Connections, if `conn_type` or `conn_uri` is not specified, that connection will be skipped.

```
Skipping my_new_connection: ConnType or ConnUri must be specified.
```

For Pools, if a `pool_slot` has not been set, that pool will be skipped.

```
Skipping my_new_pool: Pool Slot must be set.
```

For Variables, you may set a variable with a name and no value but if there is a value with no variable name, it will be skipped.

```
Skipping Variable Creation: No Variable Name Specified.
```

**Note:** If putting in a dict for any value, this will need to be wrapped in *single quotes* for the yaml to be successfully parsed.
