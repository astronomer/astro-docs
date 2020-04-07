---
title: "SSH Guide"
description: "How to use a bastion host with SSH Operator."
date: 2019-05-24T00:00:00.000Z
slug: "ssh-with-astronomer"
---

## How to Use a Bastion host with Airflow's SSH Operator

The SSHHook supports the use of a ProxyCommand to allow you to connect to a host in a private subnet via a bastion host that is public facing. The SSHook looks in `~/.ssh/config` to determine how to make that connection. This file doesn’t exist by default in the docker image, so it must be added to the Dockerfile. This article assumes you can access your bastion host from your airflow cluster via port 22. If you want to whitelist Astronomer's IP, please contact support and they can provide it. 

### SSH config file

Create a file in the `include` folder named `config`. Make it look like the example below with your bastion host DNS on the 2nd line.

```
Host bastion   
	Hostname ec2-52-6-13-5.compute-1.amazonaws.com
	User ec2-user   
	StrictHostKeyChecking=no #otherwise fails due to no known hosts
	IdentityFile  /usr/local/airflow/include/PrivateKeyFile.pem

Host 10.0.*.*
	IdentityFile  /usr/local/airflow/include/PrivateKeyFile.pem   
	User ec2-user   
	ProxyCommand ssh -W %h:%p  ec2-user@bastion
  ```

The first entry defines how to connect to the bastion host and requires the DNS name (or IP) and the location of the private key file that you need to put in the include directory of your project. `StrictHostKeyChecking=no` is set to no since no `known_hosts` file exists in the docker image.

The second entry is for anything trying to connect to an IP starting with `10.0.` This should cover the range of private IPs for the hosts in your private subnet. The ProxyCommand tells it that anything trying to connect to `10.0.*.*` should go through the bastion host.

### Dockerfile
You will need to have the above config file placed in the `.ssh` folder of the airflow user’s home directory. This can be done by changing your Dockerfile to create that directory and move the config file from `./include` to `/home/astro/.ssh/config`. Add the 2nd line in this example to your Dockerfile.

```
FROM astronomerinc/ap-airflow:0.8.2-1.10.2-onbuild

RUN mkdir /home/astro/.ssh && cp ./include/config /home/astro/.ssh/config
```

### Airflow Connection
Either use the ssh_default connection or create a new one.

`Conn Type` - SSH

`Host` - Private IP of host you want to connect to in private subnet (not bastion)

`Username` - username for (ec2-user is default for Amazon Linux)

`Extra` - `{"key_file":"./include/PrivateKeyFile.pem", "allow_host_key_change": true, "no_host_key_check":true}`



You should be all set. You can create a connection for each of your private hosts, or you can create one connection and override the host IP with the `remote_host` parameter in the SSHOperator.

```
op = SSHOperator(
	dag=dag,
	task_id='my_task',
	ssh_conn_id='ssh_default',
	command='echo $HOSTNAME'
)
```

This should print the host name of the private host in your logs.