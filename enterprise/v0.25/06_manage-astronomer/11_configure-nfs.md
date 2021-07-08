---
title: "Configure NFS Volume-based DAG Deploys on Astronomer"
navTitle: "Configure NFS Volumes"
description: "Set up NFS volume-based DAG deploys for Apache Airflow on Astronomer Enterprise."
---

## Overview

Starting in Astronomer Enterprise v0.25, you can use an external [Network File System (NFS) Volume](https://kubernetes.io/docs/concepts/storage/volumes/#nfs) to deploy DAGs to an Airflow Deployment on Astronomer.

Unlike [deploying DAGs via the Astronomer CLI](/docs/enterprise/v0.25/deploy/deploy-cli), deploying DAGs to an NFS volume, such as Azure File Storage or Google Cloud Filestore, does not require rebuilding a Docker image and restarting your underlying Airflow service. When a DAG is added to an NFS volume, it automatically appears in the Airflow UI without requiring additional action or causing downtime. This type of deployment is useful for larger organizations who want a clear separation between Airflow environment code and DAG code.

This guide provides the necessary setup for connecting an NFS volume to Astronomer as a DAG deploy option. Some considerations before completing this setup:

- NFS volumes are used only for DAG deploys. To add dependencies or other requirements to your Deployment, you still need to set them in your `requirements.txt` and `packages.txt` files and rebuild your image via the CLI as described in [Customize Images](/docs/enterprise/v0.25/develop/customize-image).
- DAGs must be deployed directly to NFS volumes. They cannot be deployed via the Astronomer CLI or an Astronomer service account. For an example of how to configure DAG deploys, see Step 6 of [Provision an NFS Volume (Amazon EFS)](/docs/enterprise/v0.25/manage-astronomer/configure-nfs).

## Provision an NFS Volume

While you can use any NFS volume for this step, we recommend using your cloud provider's primary NFS volume solution:

* GCP: [Filestore](https://cloud.google.com/filestore/docs/creating-instances)
* Azure: [File Storage](https://docs.microsoft.com/en-us/azure/storage/files/storage-files-how-to-create-nfs-shares?tabs=azure-portal)
* AWS: [EFS](https://docs.aws.amazon.com/efs/latest/ug/getting-started.html)

For each NFS volume you provision for DAG deploys, you need to configure:

* A directory for DAGs.
* Read access for a user with GID `50000` and UID `50000`. For an example setup of this, read [Configuring Ip-based access control](https://cloud.google.com/filestore/docs/creating-instances#configuring_ip-based_access_control) in Google Cloud's documentation.

See the following section for a complete setup for NFS Volume-based DAG deploys using Amazon EFS.

## Provision an NFS Volume (Amazon EFS)

Use this topic to configure and automate the process for moving DAGs from multiple repos into a single Amazon EFS storage system.

In this example setup, you use `kubectl cp` to copy DAGs from a git repository into an intermediary Kubernetes pod that shares the same NFS volume mount as an Airflow Deployment on Astronomer.

### Prerequisites

To complete this setup, you need:

- [eksctl](https://docs.aws.amazon.com/eks/latest/userguide/eksctl.html)
- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)
- [helm](https://helm.sh/docs/intro/install/)
- Astronomer version 0.25.x or higher

### Step 1: Create OIDC provider and link to your EKS instance

Instead of adding extra permissions to the IAM role for the EKS worker nodes, best practice is to leverage IAM Roles for Service Accounts (IRSA) so that services can communicate with AWS APIs directly.

1. Export environment variables specific to your installation:

    ```bash
    export AWS_DEFAULT_REGION=<your-eks-region>
    export CLUSTER_NAME=<your-cluster-name>
    ```

2. Check if you have already have a linked OIDC Provider by running the following commands:

    ```bash
    aws eks describe-cluster --name ${CLUSTER_NAME} --query "cluster.identity.oidc.issuer" --output text

    # copy last part of url from output
    # for example,
    # in the output: https://oidc.eks.us-west-2.amazonaws.com/id/EXAMPLED539D4633E53DE1B716D3041E
    # copy "EXAMPLED539D4633E53DE1B716D3041E"

    export ISSUER_ID=EXAMPLED539D4633E53DE1B716D3041E

    aws iam list-open-id-connect-providers | grep ${ISSUER_ID}
    ```

    If there is no output after the last command, create an OIDC provider:

    ```bash
    eksctl utils associate-iam-oidc-provider --cluster ${CLUSTER_NAME} --approve
    ```

### Step 2: Install an EFS CSI driver and EFS file system

The EFS file system stores your Airflow code, while the EFS CSI driver manages communication between the EFS file system and your EKS cluster. To set up these components, follow the [Amazon documentation](https://docs.aws.amazon.com/eks/latest/userguide/efs-csi.html).

### Step 3: Enable NFS Volume Storage

NFS volume deploys must be explicitly enabled on Astronomer by a System Admin. To enable it, update your `config.yaml` file with the following values:

```yaml
houston:
  config:
      deployments:
        configureDagDeployment: true
        nfsMountDagDeployment: true
```

Once you have saved the file, push the configuration change to your platform as described in [Apply a Platform Configuration Change on Astronomer](https://www.astronomer.io/docs/enterprise/v0.25/manage-astronomer/apply-platform-config). This process needs to be completed only once per Astronomer installation.

### Step 4: Configure Astronomer Deployments

For each Deployment you want to connect to your EFS file storage:

1. In the Astronomer UI, create a new Airflow Deployment or open an existing one.
2. Go to the **DAG Deployment** section of the Deployment's Settings page.
3. For your **Mechanism**, select **NFS Volume Mount**:

    ![Custom Release Name Field](https://assets2.astronomer.io/main/docs/astronomer-ui/nfs.png)

4. In the **NFS Location** field that appears, enter the location of your volume-based DAG directory as `<IP>:/<path>` (for example: `192.168.0.1:/path/to/your/dags`).
5. Save your changes.
6. Save the following as `efs-nfs.yaml`. Replace `<your-file-system-id>` with the EFS file-system-id and `< airflow-deployment-namespace>` with the namespace of your Airflow Deployment (typically `astronomer-<Astronomer-release-name>`).

    ```yaml
    apiVersion: v1
    kind: PersistentVolume
    metadata:
      name: nfs-sync
    spec:
      capacity:
        storage: 5Gi
      volumeMode: Filesystem
      accessModes:
        - ReadWriteMany
      persistentVolumeReclaimPolicy: Retain
      storageClassName: efs-sc
      csi:
        driver: efs.csi.aws.com
        volumeHandle: {{ your file-system-id }}
    ---
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: nfs-sync
      namespace: {{ airflow-deployment-namespace }}
    spec:
      accessModes:
        - ReadWriteMany
      storageClassName: efs-sc
      resources:
        requests:
          storage: 5Gi
    ---
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: nfs-sync
      namespace: {{ airflow-deployment-namespace }}
    spec:
      replicas: 1
      selector:
         matchLabels:
           role: nfs-sync
      template:
        metadata:
          labels:
            role: nfs-sync
        spec:
          containers:
          - name: nfs-sync
            image: centos
            command: ["/bin/sh"]
            args: ["-c", "while true; do echo $(date -u) && sleep 30; done"]
            resources:
              limits:
                cpu: 500m
                memory: 1024Mi
              requests:
                cpu: 100m
                memory: 150Mi
            volumeMounts:
            - name: nfs-sync
              mountPath: "/dags"
          volumes:
          - name: nfs-sync
            persistentVolumeClaim:
              claimName: nfs-sync
    ```

6. Apply the manifest by running the following command:

    ```sh
    kubectl apply -f efs-nfs.yaml
    ```

### Step 5: Test a DAG deploy

You can use any example DAG to test your NFS Volume-based Deployment. For a quick example, run the Astronomer CLI command `astro dev init` in an empty directory and use the `example-dag.py` file that's created by the command.

With your example DAG, run the following commands:

```sh
export NAMESPACE=<your-deployment-namespace>

POD=$(kubectl -n $NAMESPACE get pod -l role=nfs-sync -o jsonpath="{.items[0].metadata.name}")

kubectl -n $NAMESPACE cp example-dag.py $POD:/dags/example-dag.py
```

Open the Airflow UI from your Astronomer Deployment and verify that your DAG is there. Note that it can take up to 30 seconds for the DAG to appear.

To delete the DAG, run the following command:

```sh
kubectl -n $NAMESPACE exec $POD -- rm -rf /dags/example-dag.py
```

### Step 6: Set up CI/CD

The following setup is Astronomer's recommended minimum setup for deploying DAGs to an NFS Volume via CI/CD. You'll be configuring:

- An IAM user with the minimum required access for deploying DAGs.
- A Kubernetes role for the IAM user.
- An example CI/CD job.

Note that you will want to adjust the configurations that are specified here based on the specifics of your installation.

1. Copy the following Kubernetes role for your IAM user and save it as `efs-server-role.yaml`:

    ```yaml
    apiVersion: rbac.authorization.k8s.io/v1
    kind: Role
    metadata:
      name: efs-nfs-role
      namespace: <namespace-to-grant-access-to> # Should be namespace you are granting access to
    rules:
    - apiGroups: ["*"]
      resources: ["*"]
      verbs: ["*"]
    ---
    apiVersion: rbac.authorization.k8s.io/v1
    kind: RoleBinding
    metadata:
      name: efs-nfs-rolebinding
      namespace: <namespace-to-grant-access-to> # Should be namespace you are granting access to
    roleRef:
      apiGroup: rbac.authorization.k8s.io
      kind: Role
      name: efs-nfs-role # Should match name of Role
    subjects:
    - namespace: <namespace-to-grant-access-to> # Should be namespace you are granting access to
      kind: User
      name: efs-nfs-sa
    ```

2. Save the following as `eks-cicd-policy.json`:

    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "VisualEditor0",
                "Effect": "Allow",
                "Action": [
                    "eks:ListFargateProfiles",
                    "eks:DescribeNodegroup",
                    "eks:ListNodegroups",
                    "eks:ListUpdates",
                    "eks:AccessKubernetesApi",
                    "eks:DescribeCluster",
                    "eks:ListClusters"
                ],
                "Resource": "*"
            }
        ]
    }
    ```

3. Create the IAM policy using the following command:

    ```sh
    aws iam create-policy --policy-name eks-cicd-policy --policy-document file://eks-cicd-policy.json
    ```

4. Create an IAM user using the following command:

    ```sh
    aws iam create-user --user-name efs-nfs-sa
    ```

5. Attach your IAM policy to the user with the following command:

    ```sh
    aws iam attach-user-policy --policy-arn arn:aws:iam::${AWS_ACCOUNT_ID}:policy/eks-cicd-policy --user-name efs-nfs-sa
    ```

6. Create the mapping required for you IAM user to use the Kubernetes role:

    ```sh
    eksctl create iamidentitymapping --cluster ${CLUSTER_NAME} --arn arn:aws:iam::${AWS_ACCOUNT_ID}:user/efs-nfs-sa --username efs-nfs-sa
    ```

7. Configure a job in the CI/CD tool of your choice. We recommend using the job to package the code for your DAGs into .zip files and deploy the .zip files to your EFS file system. At a minimum, your job would be running the following commands:

    ```sh
    POD=$(kubectl -n $NAMESPACE get pod -l role=nfs-sync -o jsonpath="{.items[0].metadata.name}")

    # zip contents for cases where DAG uses additional files
    # https://airflow.apache.org/docs/apache-airflow/stable/concepts/dags.html#packaging-dags
    zip -r example_dag.zip .

    # copy zip to DAG directory in NFS pod
    kubectl -n $NAMESPACE cp example_dag.zip $POD:/dags/example_dag.zip
    ```

    The following is an example of how you would configure this job on GitHub Actions:

    ```yaml
    name: Deploy DAG Package to Airflow
    on:
      - push
    jobs:
      deploy-dag-package:
        name: Deploy DAG to Airflow
        runs-on: ubuntu-latest
        steps:
          - name: Checkout
            uses: actions/checkout@v2
          - name: Configure AWS credentials for CICD User
            uses: aws-actions/configure-aws-credentials@v1
            with:
              aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
              aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
              aws-region: us-east-1
          - name: Setup Kubectl
            uses: zachguo/setup-eks-kubectl@v1
            with:
              cluster: polaris
              region: us-east-1
              namespace: astronomer-energetic-booster-1267
          - name: Zip dag, and copy to pod
            env:
              ZIP_NAME: ${{ github.event.repository.name }}.zip
            run: |
              export POD=$(kubectl get pod -l role=nfs-sync -o jsonpath="{.items[0].metadata.name}")
              zip -r $ZIP_NAME . -x "./.git/*" -x "./.github/*"
              kubectl cp $ZIP_NAME $POD:/dags/$ZIP_NAME
    ```

    We also recommend creating a job that, when manually triggered, deletes the .zip file containing your DAGs from Airflow:

    ```yaml
    name: Delete DAG Package from Airflow
    on:
      - workflow_dispatch
    jobs:
        delete-dag-package:
          runs-on: ubuntu-latest
          steps:
            - name: Configure AWS credentials for CICD User
              uses: aws-actions/configure-aws-credentials@v1
              with:
                aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
                aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
                aws-region: us-east-1
            - name: Setup Kubectl
              uses: zachguo/setup-eks-kubectl@v1
              with:
                cluster: polaris
                region: us-east-1
                namespace: astronomer-energetic-booster-1267
            - name: Delete DAG Package
              env:
                ZIP_NAME: ${{ github.event.repository.name }}.zip
              run: |
                export POD=$(kubectl get pod -l role=nfs-sync -o jsonpath="{.items[0].metadata.name}")
                kubectl exec -i $POD -- rm -rf /dags/$ZIP_NAME
    ```
