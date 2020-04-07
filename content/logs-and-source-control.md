---
title: "Logs and Source Control"
description: "Getting Logs and checking into source control"
date: 2018-10-12T00:00:00.000Z
slug: "logs-and-source-control"
---

### Logs

You can view the logs from the various Airflow components through the astro CLI.

```
virajparekh@orbiter:~/cli_tutorial$ astro dev logs -h
Output logs for a development airflow cluster

Usage:
  astro dev logs [flags]

Flags:
  -f, --follow      Follow log output
  -h, --help        help for logs
  -s, --scheduler   Output scheduler logs
  -w, --webserver   Output webserver logs


virajparekh@orbiter:~/cli_tutorial$ astro dev logs -s -f
Waiting for host: postgres 5432
Initializing airflow database...
[2019-04-11 21:54:13,150] {settings.py:174} INFO - settings.configure_orm(): Using pool settings. pool_size=5, pool_recycle=1800, pid=16
[2019-04-11 21:54:13,545] {__init__.py:51} INFO - Using executor LocalExecutor
DB: postgresql://postgres:***@postgres:5432
[2019-04-11 21:54:13,814] {db.py:338} INFO - Creating tables
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
Done.
[2019-04-11 21:54:14,566] {settings.py:174} INFO - settings.configure_orm(): Using pool settings. pool_size=5, pool_recycle=1800, pid=6
[2019-04-11 21:54:14,979] {__init__.py:51} INFO - Using executor LocalExecutor
  ____________       _____________
 ____    |__( )_________  __/__  /________      __
____  /| |_  /__  ___/_  /_ __  /_  __ \_ | /| / /
___  ___ |  / _  /   _  __/ _  / / /_/ /_ |/ |/ /
 _/_/  |_/_/  /_/    /_/    /_/  \____/____/|__/

```
Note that these logs are the same as getting logs out of a running container:

```
virajparekh@orbiter:~/Code/Astronomer/Other/cli_tutorial$ docker logs clitutorial38eb9b_scheduler_1 -f
Waiting for host: postgres 5432
Initializing airflow database...
[2019-04-11 21:54:13,150] {settings.py:174} INFO - settings.configure_orm(): Using pool settings. pool_size=5, pool_recycle=1800, pid=16
[2019-04-11 21:54:13,545] {__init__.py:51} INFO - Using executor LocalExecutor
DB: postgresql://postgres:***@postgres:5432
[2019-04-11 21:54:13,814] {db.py:338} INFO - Creating tables
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
Done.
[2019-04-11 21:54:14,566] {settings.py:174} INFO - settings.configure_orm(): Using pool settings. pool_size=5, pool_recycle=1800, pid=6
[2019-04-11 21:54:14,979] {__init__.py:51} INFO - Using executor LocalExecutor
  ____________       _____________
 ____    |__( )_________  __/__  /________      __
____  /| |_  /__  ___/_  /_ __  /_  __ \_ | /| / /
___  ___ |  / _  /   _  __/ _  / / /_/ /_ |/ |/ /
 _/_/  |_/_/  /_/    /_/    /_/  \____/____/|__/
```


### Source Control

In general, all the dependencies needed for your DAG should be checked into your version control. We would recommend that the `.git` file lives on the same level as the `.astro` file in your project directory.
