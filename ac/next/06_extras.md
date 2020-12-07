---
title: "Astronomer Core Extras"
navtitle: "Extras"
description: "Extras for Astronomer Core."
---

## Astronomer Core Extras

We add some extra packages into Astronomer Core:

- Airflow Scripts
- Version Check
- Security Manager


### Airflow Scripts

#### `airflow-cleanup-pods`

```bash
$ airflow-cleanup-pods -h
usage: airflow-cleanup-pods [-h] [--namespace NAMESPACE]

Clean up k8s pods in evicted/failed/succeeded states.

optional arguments:
  -h, --help            show this help message and exit
  --namespace NAMESPACE
                        Namespace
```

#### `airflow-migration-spinner`

```
airflow-migration-spinner --timeout 5
[2019-11-18 19:25:04,083] {spinner.py:40} INFO - Namespace(timeout=5)
[2019-11-18 19:25:04,085] {migration.py:130} INFO - Context impl SQLiteImpl.
[2019-11-18 19:25:04,086] {migration.py:137} INFO - Will assume non-transactional DDL.
[2019-11-18 19:25:05,113] {spinner.py:36} INFO - Waiting for migrations... 1 second(s)
[2019-11-18 19:25:06,115] {spinner.py:36} INFO - Waiting for migrations... 2 second(s)
[2019-11-18 19:25:07,116] {spinner.py:36} INFO - Waiting for migrations... 3 second(s)
[2019-11-18 19:25:08,117] {spinner.py:36} INFO - Waiting for migrations... 4 second(s)
[2019-11-18 19:25:09,122] {spinner.py:36} INFO - Waiting for migrations... 5 second(s)
[2019-11-18 19:25:10,125] {spinner.py:36} INFO - Waiting for migrations... 6 second(s)
Traceback (most recent call last):
  File "/Users/andrii/.pyenv/versions/airflow-core/bin/airflow-migration-spinner", line 11, in <module>
    load_entry_point('airflow-migration-spinner', 'console_scripts', 'airflow-migration-spinner')()
  File "/Users/andrii/work/airflow-migration-spinner/migration_spinner/command_line.py", line 11, in main
    spinner.main(args)
  File "/Users/andrii/work/airflow-migration-spinner/migration_spinner/spinner.py", line 41, in main
    spinner(args.timeout)
  File "/Users/andrii/work/airflow-migration-spinner/migration_spinner/spinner.py", line 33, in spinner
    "seconds".format(ticker, timeout))
TimeoutError: There are still unapplied migrations after: 6 seconds
```

### Airflow Version Check

An Apache Airflow plugin that will periodically (default, once per day) check
if there is a new version of Astronomer Core and display message in the Airflow UI.

### Security Manager

A custom Flask-AppBuilder security manager for the Astronomer Platform.

This [Security Manager](https://flask-appbuilder.readthedocs.io/en/latest/security.html#your-custom-security) will validate the JWT tokens from the Astronomer
platform and automatically create or update the user record as appropriate.

It looks at the `roles` claim of the validated JWT token and ensures the user
has those roles. If the user already exists it will remove any extra roles from
the "stock" roles (currently Admin, Op, User, and Viewer) - but will leave any
custom roles alone. (There is no support for assigning users to custom Airflow
roles in the Astronomer platform at the moment, so this behaviour might change
in the future).
