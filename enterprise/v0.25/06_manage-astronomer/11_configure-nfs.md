---
title: "Enable NFS Volume DAG Deployments"
navTitle: "Configure NFS Volumes"
description: "How to set up an NFS volume for DAG deployment"
---

## Overview

Starting in Astronomer Enterprise v0.25, you can use an external [Network File System (NFS) Volume](https://kubernetes.io/docs/concepts/storage/volumes/#nfs) to deploy DAGs to an Airflow Deployment on Astronomer.

Unlike [deploying DAGs via the Astronomer CLI](/docs/enterprise/v0.25/deploy/deploy-cli), deploying DAGs to an NFS volume, such as Azure File Storage or Google Cloud Filestore, does not require rebuilding a Docker image and restarting your underlying Airflow service. When a DAG is added to an NFS volume, it automatically appears in the Airflow UI without requiring additional action or causing downtime.

This guide provides the necessary setup for connecting an NFS volume to Astronomer as a DAG deploy option. Some considerations before completing this setup:

- NFS volumes are used only for DAG deploys. To add dependencies or other requirements to your Deployment, you still need to set them in your `requirements.txt` and `packages.txt` files and rebuild your image via the CLI as described in [Customize Images](/docs/enterprise/v0.25/develop/customize-image).
- DAGs must be deployed directly to NFS volumes. They cannot be deployed via the Astronomer CLI or an Astronomer service account.

## Step 1: Provision an NFS Volume

While you can use any NFS volume for this step, we recommend using your cloud provider's primary NFS volume solution:

* GCP: [Filestore](https://cloud.google.com/filestore/docs/creating-instances)
* Azure: [File Storage](https://docs.microsoft.com/en-us/azure/storage/files/storage-files-how-to-create-nfs-shares?tabs=azure-portal)
* AWS: [EFS](https://docs.aws.amazon.com/efs/latest/ug/getting-started.html)

For each NFS volume you provision for DAG deploys, you need to configure:

* A directory for DAGs.
* Read access for a user with GID `50000` and UID `50000`. For an example setup of this, read [Configuring Ip-based access control](https://cloud.google.com/filestore/docs/creating-instances#configuring_ip-based_access_control) in Google Cloud's documentation.

The following sections contain recommended setup for the cloud solutions listed above.

### EFS File System

1. Using the AWS CLI, [create a security group](https://docs.aws.amazon.com/efs/latest/ug/accessing-fs-create-security-groups.html) using the following template. Replace `$vpc_id` with the VPC that your Astronomer cluster is in.

    ```bash
    # to get vpc_id
    vpc_id=$(aws eks describe-cluster --name $CLUSTER_NAME --query "cluster.resourcesVpcConfig.vpcId" --output text)

    # to get CIDR for vpc
    cidr_range=$(aws ec2 describe-vpcs \
        --vpc-ids $vpc_id \
        --query "Vpcs[].CidrBlock" \
        --output text)

    # create security group for efs
    security_group_id=$(aws ec2 create-security-group \
        --group-name MyEfsSecurityGroup \
        --description "My EFS security group" \
        --vpc-id $vpc_id \
        --output text)

    # create inbound rule to allow nfs traffic from the CIDR of the cluster's VPC
    # To further restrict access to your file system, you can use the CIDR for your subnet instead of the VPC.
    aws ec2 authorize-security-group-ingress \
        --group-id $security_group_id \
        --protocol tcp \
        --port 2049 \
        --cidr $cidr_range
    ```

2. In the EFS Management Console, start by [creating an EFS file system](https://docs.aws.amazon.com/efs/latest/ug/gs-step-two-create-efs-resources.html) in the same VPC as your that your Astronomer cluster is in. Before creating the file system, open the [**Customize**](https://docs.aws.amazon.com/efs/latest/ug/creating-using-create-fs.html#creating-using-fs-part1-console) menu.

4. In the **Network Access** menu, ensure you have a mount target for every availability zone that you plan to access the file system from. For each mount target, replace the default security group with the security group you created.

5. Finish creating the file system. Note the file system ID for later.

6. In your terminal, export user-specific configs:

    ```bash
    export CLUSTER_NAME=<your-cluster-name>
    export AWS_ACCOUNT_ID=<your-account-id>
    export AWS_DEFAULT_REGION=us-east-1
    export EFS_IAM_POLICY_NAME=AmazonEKS_EFS_CSI_Driver_Policy # this name is arbitrary
    # Get the URL for your AWS region from this list:
    # https://docs.aws.amazon.com/eks/latest/userguide/add-ons-images.html
    export AWS_CONTAINER_REPO_URL=602401143452.dkr.ecr.us-east-1.amazonaws.com
    ```

7. Determine if you have an existing OIDC provider for your cluster:

    ```bash
    aws eks describe-cluster --name $CLUSTER_NAME --query "cluster.identity.oidc.issuer" --output text

    # copy last part of url from output
    # for example:
    # output: https://oidc.eks.us-west-2.amazonaws.com/id/EXAMPLED539D4633E53DE1B716D3041E
    # copy EXAMPLED539D4633E53DE1B716D3041E

    export ISSUER_ID=EXAMPLED539D4633E53DE1B716D3041E

    aws iam list-open-id-connect-providers | grep $ISSUER_ID
    ```

    If there is no output, create the provider.

    ```bash
    eksctl utils associate-iam-oidc-provider --cluster $CLUSTER_NAME --approve
    ```

Create IAM Policy

```bash
curl -o iam-policy-example.json https://raw.githubusercontent.com/kubernetes-sigs/aws-efs-csi-driver/v1.3.0/docs/iam-policy-example.json

aws iam create-policy \
	--policy-name $EFS_IAM_POLICY \
	--policy-document file://iam-policy-example.json
```

Create IAM role, attach the IAM policy, and annotate the Kubernetes service account

```bash
eksctl create iamserviceaccount \
    --name efs-csi-controller-sa \
    --namespace kube-system \
    --cluster $CLUSTER_NAME \
    --attach-policy-arn arn:aws:iam::$AWS_ACCOUNT_ID:policy/$EFS_IAM_POLICY_NAME \
    --approve \
    --override-existing-serviceaccounts
```

Install the driver

```bash
helm repo add aws-efs-csi-driver https://kubernetes-sigs.github.io/aws-efs-csi-driver/
helm repo update

helm upgrade -i aws-efs-csi-driver aws-efs-csi-driver/aws-efs-csi-driver \
    --namespace kube-system \
    --set image.repository=$AWS_CONTAINER_REPO_URL/eks/aws-efs-csi-driver \
    --set controller.serviceAccount.create=false \
    --set controller.serviceAccount.name=efs-csi-controller-sa
```

Copy storage class and save as `efs-sc.yaml`. Apply manifest.

`kubectl apply -f efs-sc.yaml`

```bash
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: efs-sc
provisioner: efs.csi.aws.com
```
