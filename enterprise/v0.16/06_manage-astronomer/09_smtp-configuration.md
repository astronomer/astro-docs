---
title: "Enterprise platform SMTP configuration"
navTitle: "SMTP configuration"
description: "Add or Customize your Platform SMTP configuration by adding your service provider details"
---
​
## Overview

SMTP details in config.yaml (configuring your helm chart) are required and will allow users to send and accept email invites to Astronomer. The SMTP URI will take the following form: 
​
```
smtpUrl: smtps://USERNAME:PW@HOST/?pool=true
```
There are Several SMTP providers to choose from to send and receive messages, once you have the provider you just need following information to move ahead with setup:

**Credentials:** username and password required to aunthenticate to SMTP server

**SMTP host:**   Host name of SMTP provider to send and receive messages

**Port:**        Secure or Open port, where 465 and 587 are secure and 25 being insecure or open port.

We use Nodemailer based SMTP transporter to read this SMTP configuration and send emails. you can go through below nodemailer specific SMTP url to get more details.

​
https://nodemailer.com/smtp/


We are listing down some examples of commonly used SMTP providers integrated with Astronomer for reference:


Note: By default From address will be noreply@astronomer.io, but can be modified by using `reply` instead of `From`


#### AWS SES:
​
```
email:
  enabled: true
  reply: "xyz@example.com"
  smtpUrl: smtp://AWS_SMTP_Username:AWS_SMTP_Password@email-smtp.us-east-1.amazonaws.com/?requireTLS=true
```
​
#### SendGrid:
​
```
email:
	enabled: true
	reply: “signedemail@mydomain.com”
	smtpUrl: “smtps://apikey:SG.sometoken@smtp.sendgrid.net:465/?pool=true”
```
​
#### Mailgun:
​
```
email:
        enabled: true
        smtpUrl:smtps://xyz%40example.com:password@smtp.mailgun.org/?pool=true
```
​
#### Office365:
​
```
email:
        reply: "xyz@example.com"
        enabled: true
        smtpUrl: smtp://xyz%40example.com:password@smtp.office365.com:587/?requireTLS=true
 ```       
        
#### Custom SMTP-relay:
​
```
email:
	enabled: true
	reply: "xyz@example.com"
	smtpUrl: smtp://smtp-relay.example.com:25/?ignoreTLS=true
```
