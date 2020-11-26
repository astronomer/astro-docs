---
title: "VPC Access"
navTitle: "VPC Access"
description: "How to grant Astronomer Cloud access to your VPC."
---

## Overview

All Airflow Deployments on Astronomer Cloud route traffic through a single NAT (Network Address Translation). In other words, we have 1 NAT gateway out of our VPC through which all internet-bound traffic goes through.

> **Note**: If you need or would like Private IP access, consider [Astronomer Enterprise](/enterprise/) or [reach out to us](https://support.astronomer.io).

## Allow Astronomer Cloud Access to your VPC

To give Astronomer Cloud access to any database, warehouse or service within your VPC, you'll have to allowlist the following Static IP Addresses:

- `35.245.140.149`
- `35.245.44.221`
- `34.86.203.139`
- `35.199.31.94`

Read below for an example of how to do so within Amazon Redshift.

> **Note:** The first IP address on the list above used to be the only one we needed and supported. Given the level of growth that Astronomer Cloud has seen over the past few months, we plan on expanding our NAT gateway to support 4 IPs instead of 1 in January of 2021.
>
> Allowlist all 4 IP addressess above to make sure your tasks are not impacted when we make the change in January.

## Allowlist Astronomer on Amazon Redshift

To Allowlist Astronomer on Redshift, you'll have to do the following:

1. Make your Redshift Cluster Publicly Accessible
2. Allowlist the Cloud IPs
3. Test the Connection

> **Note:** This assumes you have an existing Redshift Cluster. The guidelines below apply to both an EC2 Classic subnet or VPC subnet.

### Make your Redshift Cluster Publicly Accessible

If you didn’t do this on setup, it’s easy to modify.

- Go into the Redshift section of your AWS Console
- Choose the relevant Cluster
- Click **Modify Cluster**

![Modify Cluster](https://assets2.astronomer.io/main/docs/vpc-access/allowlist-ip-modify-cluster-redshift.png)

From there,

- Toggle the **Publicly Accessible** option to **Yes**
- Click **Modify**

![Make Publicly Accessible](https://assets2.astronomer.io/main/docs/vpc-access/allowlist-ip-publicly-accessible-redshift.png)

### Allowlist all 4 Cloud IP Addresses

Even though you’ve setup your Redshift to be publicly accessible, you’ll still want to limit where statements can be executed from.

With Astronomer, all queries will come from 1 of the 4 IP addresses listed above:

- `35.245.140.149`
- `35.245.44.221`
- `34.86.203.139`
- `35.199.31.94`

#### Navigate to "Security Groups"

First, go to **Security** on your Console and, depending on the specifics of your AWS account, click on **Go to the EC2 Console**.

![Add IP Redshift](https://assets2.astronomer.io/main/docs/vpc-access/allowlist-ip-add-ip-redshift.png)

#### Edit Inbound Rules

From there, click into the **Inbound** section of the relevant Security Group. To confirm this, go to the **Cluster Profile** page you were previously on and look to the **VPC Security Groups** section.

- Open up the Inbound rules by clicking **Edit**
- Add the Cloud IPs address above: `35.245.140.149`, `35.245.44.221`,`34.86.203.139`, `35.199.31.94`
- Click **Save**

![Edit Inbound Rules](https://assets2.astronomer.io/main/docs/vpc-access/allowlist-ip-inbound-rules-redshift.png)

Give your cluster a minute to update and then test access from within any Airflow Deployment.

### Test the Connection

Because Redshift uses the same drivers as Postgres, you can add a connection to Airflow using the same methods as any other Postgres Database.

#### Create an Airflow Connection

From the Airflow UI, go to **Admin** > **Connections** > **Create**

![Create Connection](https://assets2.astronomer.io/main/docs/vpc-access/allowlist-ip-create-connection.png)

Pick a recognizable Conn Id (anything that will help you remember):

- **Conn Type**:`Postgres`
- **Host:** The endpoint that was generated for you when you created the cluster
- **Schema:** The value of `Database Name` in `Cluster Database Properties` section of your Redshift cluster configuration
- **Login:** Redshift Username for the user you want to execute the queries
- **Password:** Redshift user password
- **Port:** `5439` (not 5432)

![Edit Airflow Connection](https://assets2.astronomer.io/main/docs/vpc-access/allowlist-ip-edit-connection-redshift.png)

> **Note:** On Astronomer, you'll have to be a Deployment _Admin_ or _Editor_ to access the **Admin** menu and create a connection. For more information on user roles, refer to our ["User Permissions"](https://www.astronomer.io/docs/cloud/stable/manage-astronomer/workspace-permissions/) doc.

#### Call your Redshift Connection in an Airflow DAG

After saving your connection, write a DAG that calls your Airflow Postgres Connection and queries from your Amazon Redshift Cluster.

If you're able to succesfully query and run that DAG successfully, you're all set.

> **Note:** Airflow's "Ad-Hoc Query" feature used to be a common way to test DB connections via the Airflow UI but was deprecated in 1.10 for security reasons.

If you run into trouble, don't hesitate to reach out to [Astronomer Support](https://support.astronomer.io). We're always here to help.
