---
title: "Deploy DAGs in a Production Environment"
navTitle: "Deploy DAGs"
description: "Use open source automation tools to ensure that DAGs are accurately updated across all of your machines. ."
---


Every machine running Airflow needs a copy of the DAG files, with all DAG files appearing in the same DAG folder (`/usr/local/airflow/` if you followed the naming convention in step 2A). There are many ways in which you can make this happen, but some popular options include:

- Using automation tools such as Ansible.
- Baking DAGs into the docker image alongside Airflow.
- Using a job that refreshes the DAGs folder on a schedule ([this is how the folks at WePay do it](https://wecode.wepay.com/posts/airflow-wepay)).
- Making the DAGs live on a shared filesystem such as NFS (but be aware of read performance penalties - Airflow can be quite heavy on read-ops).

## Automate DAG Deployment with Ansible

We recommend using an automation tool to continuously pull new or updated DAGs to your Airflow machines. We configure an open source Ansible role ([source](https://github.com/idealista/airflow-role)) in this setup, though other automation tools such as Puppet or Chef also work here.

1. Install Ansible according to the [Ansible documentation](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html) on one of your machines.

2. Edit your `/etc/ansible/hosts` file to include the IP addresses of all machines running Airflow.

3. Create a file named `requirements.yml`and add the following to it:

   ```yaml
   - src: http://github.com/idealista/airflow-role.git
     scm: git
     version: 1.7.3
     name: airflow
   ```

4. Install the Ansible role using the following command:

    ```sh
    $ ansible-galaxy install -p roles -r requirements.yml -f
    ```

5. Open the `defaults/main.yml` file for the role. In the `# Files & Paths` section, specify the `airflow_dags_folder` variable as the folder for your DAGs.

6. Create a new `playbook.yml` file and add the following to it:

    ```yaml
    ---
    - hosts: someserver
      roles:
        - { role: airflow }
    ```

7. Review the rest of the default values in `playbook.yml` and update any according to your use case.

8. Run the playbook using the following command:

    ```sh
    $ ansible-playbook playbook.yml -f 10
    ```

## Kubernetes via Helm Chart

DAGs are baked inside Dockerfile

git sync https://github.com/apache/airflow/tree/master/chart#updating-dags
