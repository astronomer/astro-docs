To install and run the Astronomer Certified distribution, ensure that Docker is running on your machine and follow the steps below:

1. Create new project directory for your Airflow project and `cd` into it.

        mkdir astronomer-certified && cd astronomer-certified

2. Run the following command to initialize all of the necessary files you'll need to run the AC image:

        touch .env packages.txt requirements.txt docker-compose.yml Dockerfile

3. Add the the following to the `Dockerfile` to grab the latest Astronomer Certified image on build:

    ```
    # For a Debian-based image
    FROM quay.io/astronomer/docker-airflow:latest
    ```

    To pull from a specific version, replace `latest` in the image tag with your desired version. For a list of all image tags, refer to the [quay.io repository](https://quay.io/repository/astronomer/ap-airflow?tab=tags).  


4. Add the following to the `docker-compose.yml` file:

    ```yaml
    version: "3"
     volumes:
       postgres_data:
         driver: local
       airflow_logs:
         driver: local
     services:
       postgres:
         container_name: postgres
         image: postgres:10.1-alpine
         restart: unless-stopped
         volumes:
           - postgres_data:/var/lib/postgresql/data
       scheduler:
         container_name: scheduler
         image: "local-airflow-dev"
         build: .
         command: >
           bash -c "airflow upgradedb && airflow scheduler"
         restart: unless-stopped
         depends_on:
           - postgres
         environment:
           AIRFLOW__CORE__EXECUTOR: LocalExecutor
           AIRFLOW__CORE__SQL_ALCHEMY_CONN: postgresql://postgres:@postgres:5432
           AIRFLOW__CORE__LOAD_EXAMPLES: "False"
           # Do not reuse this key in production or anywhere outside your local laptop!
           AIRFLOW__CORE__FERNET_KEY: "d6Vefz3G9U_ynXB3cr7y_Ak35tAHkEGAVxuz_B-jzWw="
         volumes:
           - ./dags:/usr/local/airflow/dags:ro
           - ./plugins:/usr/local/airflow/plugins
           - ./include:/usr/local/airflow/include
           - airflow_logs:/usr/local/airflow/logs
         env_file: .env
       webserver:
         container_name: webserver

         image: "local-airflow-dev"
         command: >
           bash -c "airflow create_user -r Admin -u admin -e admin@example.com -f admin -l user -p admin && airflow webserver"
         restart: unless-stopped
         depends_on:
           - scheduler
           - postgres
         environment:
           AIRFLOW__CORE__EXECUTOR: LocalExecutor
           AIRFLOW__CORE__SQL_ALCHEMY_CONN: postgresql://postgres:@postgres:5432
           AIRFLOW__CORE__LOAD_EXAMPLES: "False"
           AIRFLOW__CORE__FERNET_KEY: "d6Vefz3G9U_ynXB3cr7y_Ak35tAHkEGAVxuz_B-jzWw="
           AIRFLOW__WEBSERVER__RBAC: "True"
         ports:
           - 8080:8080
         volumes:
           - ./dags:/usr/local/airflow/dags:ro
           - ./plugins:/usr/local/airflow/plugins
           - ./include:/usr/local/airflow/include
           - airflow_logs:/usr/local/airflow/logs
         env_file: .env
    ```

5. Run `docker-compose up` to spin up the local Airflow Scheduler, Webserver, and Postgres containers. The default user that gets created for Airflow will have `admin/admin` as a username and password.

By default, the above will run Airflow on your machine using the Local Executor.  Containers for your Airflow Metadata Database, Airflow Webserver and Airflow Scheduler are spun up programmatically (this is the equivalent of running the `airflow initdb`, `airflow webserver` and `airflow scheduler` commands detailed in the next section).
