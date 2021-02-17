---
title: "Frequently Asked Questions"
navtitle: "Astronomer Core FAQ"
description: "Answers to some of the common questions people have about Astronomer Core."
---

## What is Astronomer Core?

Astronomer Core is an industry-scale extension of Apache Airflow's production Docker image. It combines Airflow’s extensibility and community-driven development with industry standards for security, reliability, and scale.

For each new release of the open source Airflow image, we rigorously test and build in new dependencies and features for the Astronomer Core equivalent. The result is an even more secure and scalable Airflow image.

## What's the difference between Astronomer Core and Apache Airflow?

Astronomer Core's Airflow image includes all of the features of Airflow's image, plus additional dependencies which ensure reliability and scalability. For a full list of differences, refer to the Astronomer product chart [link].

| Features                                               | AC  | Open Source Airflow | Gen 2 Cloud | Enterprise |
| ----------------------------------------------------- | --- | ------------------- | ----------- | ---------- |
| Data Pipelines written in 100% Python                 | X   | X                   | X           | X          |
| Web UI for managing pipelines                         | X   | X                   | X           | X          |
| Underlying PostreSQL database for metadata            | X   | X                   | X           | X          |
| Built-in connectors to popular platforms and services | X   | X                   | X           | X          |
| Performance and stability enhancements                | X   |                     | X           | X          |
| Upgrade testing for certified environments            | X   |                     | X           | X          |
| Built-in directory of example pipelines               | X   |                     | X           | X          |
| Built-in Airflow provider packages                    | X   |                     | X           | X          |
| Automated deployment to Kubernetes via CLI | X | | X | X |
| Community Forum | X | X | X | X |
| Built in metrics dashboard |  | | X | X |
| Astronomer Release Support | X | | X | X |
| Dedicated Customer Support |  |  | X | X|  


## Why should I use Astronomer Core's image vs. Apache Airflow's image?

Astronomer Core extends Apache Airflow's image to make it more scalable and reliable to deploy data pipelines to the cloud, all while maintaining the open source functionality that makes the original great. The Astronomer Core image is consistently updated and supported by the Astronomer team; you'll be able to rely on regularly scheduled releases, patches, and deprecations.

## Can I run Astronomer Core using an open source Helm chart and Kubernetes?

Astronomer's open source Helm chart can be used to configure Astronomer Core's Airflow image. You can use this Helm chart to configure settings for Airflow, such as your Airflow version and CPU limits.

## How is Astronomer Core supported?

TBD

## How do I migrate from Apache Airflow to Astronomer Core?

TBD

## Can I build on top of Astronomer Core?

Astronomer Core has an open source license, meaning you can customize and extend the image for nonprofit purposes. For more information on extending the AC image, read TBD.
