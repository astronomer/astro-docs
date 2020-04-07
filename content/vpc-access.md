---
title: "VPC Access"
description: "How to grant Astronomer Cloud access to your VPC."
date: 2019-05-18T00:00:00.000Z
slug: "vpc-access"
---

## Overview

On Astronomer, all deployments that live in our Astronomer Cloud cluster route traffic through the same single NAT. In other words, we have 1 NAT gateway out of our VPC through which all internet-bound traffic goes through.

**Note**: If you need or would like Private IP access, consider [Astronomer Enterprise](https://www.astronomer.io/enterprise/) or [reach out to us](https://support.astronomer.io).

## Allowing Astronomer Cloud Access to your VPC

To give Astronomer Cloud access to any database, warehouse or service within your VPC, you'll just have to whitelist the following Static IP:

`35.245.140.149`

Read below for an example of how to do so within Amazon Redshift.

## Whitelist Astronomer on Amazon Redshift

To Whitelist Astronomer on Redshift, you'll have to do the following:

1. Make your Redshift Cluster Publicly Accessible
2. Whitelist the Cloud IP
3. Test the Connection

**Note:** This assumes you have an existing Redshift Cluster. The guidelines below apply to both an EC2 Classic subnet or VPC subnet.

### Make your Redshift Cluster Publicly Accessible

If you didn’t do this on setup, it’s easy to modify.

- Go into the Redshift section of your AWS Console
- Choose the relevant Cluster
- Click “Modify Cluster"

![Modify Cluster](https://assets2.astronomer.io/main/docs/vpc-access/whitelist-ip-modify-cluster-redshift.png)

From there,

- Toggle the “Publicly Accessible” option to “Yes”
- Click "Modify"

![Make Publicly Accessible](https://assets2.astronomer.io/main/docs/vpc-access/whitelist-ip-publicly-accessible-redshift.png)

### Whitelist the Cloud IP

Even though you’ve setup your Redshift to be publicly accessible, you’ll still want to limit where statements can be executed from.

With Astronomer, all queries will come from the same IP address: `35.245.140.149`

#### Navigate to "Security Groups"

First, go to “Security” on your Console and, depending on the specifics of your AWS account, click on “Go to the EC2 Console.”

![Add IP Redshift](https://assets2.astronomer.io/main/docs/vpc-access/whitelist-ip-add-ip-redshift.png)

#### Edit Inbound Rules

From there, click into the “Inbound” section of the relevant Security Group (which can be confirmed in the Cluster Profile page you were previously on in the “VPC security groups” section).

- Open up the Inbound rules by clicking “Edit”
- Add the Cloud IP address: `35.245.140.149`
- Click Save

![Edit Inbound Rules](https://assets2.astronomer.io/main/docs/vpc-access/whitelist-ip-inbound-rules-redshift.png)

Give your cluster a minute to update and then test access from within any Airflow deployment.

### Test the Connection

Because Redshift uses the same drivers as Postgres,you can add a connection to Airflow using the same methods as any other Postgres db. 

#### Add a Connection

From the Airflow UI, go to Admin > Connections > "Create"

![Create Connection](https://assets2.astronomer.io/main/docs/vpc-access/whitelist-ip-create-connection.png)

Pick a recognizable Conn Id (anything that will help you remember):

- Choose `Postgres` as the Conn Type
- Add in the endpoint that was generated for you when you created the cluster as the Host
- Your `Schema` is the value of `Database Name` in `Cluster Database Properties` section of your Redshift cluster configuration
- Add in the username and password for whatever user you want to execute the queries
- Set the port to 5439 (not 5432)

![Ad Hoc Query Page](https://assets2.astronomer.io/main/docs/vpc-access/whitelist-ip-edit-connection-redshift.png)

#### Run a Query

After saving your connection:

- Go to Data Profiling> Ad Hoc Query from the top menu bar in the Airflow UI
- Choose the Redshift connection you just created
- Run a simple query

![Ad Hoc Query Page](https://assets2.astronomer.io/main/docs/vpc-access/whitelist-ip-ad-hoc-query-redshift.png)

IF you're able to succesfully query, you're all done!