---
title: "Astronomer Certified Security"
navtitle: "Security"
description: "Common Vulnerabilities and Exposures identified within our Astronomer Certified Images."
---

## Overview

This page is the source of truth for any CVE (Common Vulnerabilities and Exposures) identified within any of our Astronomer Certified Images running Apache Airflow.

Currently, our officially supported Astronomer Certified images are listed in two places:

- [Astronomer Downloads](/downloads/)
- [Astronomer's DockerHub](https://quay.io/astronomer/ap-airflow)

If you run on Astronomer Cloud or Enterprise, you can refer to our [Airflow Versioning Doc](/docs/enterprise/stable/customize-airflow/manage-airflow-versions/) for detailed guidelines on how to upgrade between Airflow versions on the platform.

## Reporting Vulnerabilities and Security Concerns

Vulnerability reports for Astronomer Certified should be sent to [security@astronomer.io](mailto:security@astronomer.io). All security concerns, questions and requests should be directed here.

When we receive a request, our dedicated security team will evaluate and validate it. If we confirm a vulnerability, we’ll allocate internal resources towards identifying and publishing a resolution in an updated image. The timeline within which vulnerabilities are addressed will depend on the severity level of the vulnerability and its impact.

Once a resolution has been confirmed, we'll release it in the next major or minor Astronomer Certified image and publish details to this page in the section below.

> **Note:** All other Airflow and product support requests should be directed to [Astronomer's Support Portal](support.astronomer.io), where our team's Airflow Engineers are ready to help.

## Previously Announced Vulnerabilities

### Apache Airflow Core

| CVE | Date | Versions Affected | Description | Remediation |
|---|---|---|---|---|
| CVE-2020-13944 | 2020-09-16 | Apache Airflow versions < 1.10.12 | In Apache Airflow < 1.10.12, the "origin" parameter passed to some of the endpoints like '/trigger' was vulnerable to XSS exploit. ([Details](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-13944)) | Use Docker image with one of the following AC Versions: <ul><li>1.10.10-5</li><li>1.10.7-15</li></ul> |

### Astronomer Certified Docker Images

This section lists security related updates/mitigations in the Astronomer Certified docker images.

| CVE            | Date       | Component | Versions Affected                                                                                                                          | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Remediation                                                                                                          |
|----------------|------------|-----------|--------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| CVE-2020-1967  | 2019-12-03 | OpenSSL   | <ul><li>1.10.7-1 to 1.10.7-8</li><li>1.10.5-1 to 1.10.5-6</li></ul>                                           | Server or client applications that call the SSL_check_chain() function during or after a TLS 1.3 handshake may crash due to a NULL pointer dereference as a result of incorrect handling of the "signature_algorithms_cert" TLS extension. <br><br>The crash occurs if an invalid or unrecognized signature algorithm is received from the peer. This could be exploited by a malicious peer in a Denial of Service attack. OpenSSL version 1.1.1d, 1.1.1e, and 1.1.1f are affected by this issue. This issue did not affect OpenSSL versions prior to 1.1.1d. Fixed in OpenSSL 1.1.1g (Affected 1.1.1d-1.1.1f). ([Details](https://cve.mitre.org/cgi-bin/cvename.cgi?name=2020-1967)) | Use Docker image with one of the following AC Versions: <ul><li>1.10.7-10</li><li>1.10.5-7</li></ul> |
| CVE-2019-16168 | 2019-09-09 | SQLite    | Alpine Images with following AC Versions: <ul><li>1.10.7-1 to 1.10.7-8</li><li>1.10.5-1 to 1.10.5-6</li></ul> | In SQLite through 3.29.0, whereLoopAddBtreeIndex in sqlite3.c can crash a browser or other application because of missing validation of a sqlite_stat1 sz field, aka a "severe division by zero in the query planner." ([Details](https://cve.mitre.org/cgi-bin/cvename.cgi?name=2019-16168))| Use Docker image with one of the following AC Versions: <ul><li>1.10.7-10</li><li>1.10.5-7</li></ul> |
