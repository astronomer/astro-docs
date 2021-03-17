---
title: "Frequently Asked Questions"
navtitle: "Astronomer Core FAQ"
description: "Answers to some of the common questions people have about Astronomer Core."
---

## What is Astronomer Core?

Astronomer Core (AC) is an open source distribution of Apache Airflow built for teams ready to run Airflow both locally and at production scale.

## What's the difference between AC and Apache Airflow?

AC is a distribution of Apache Airflow. It includes all of the features of Apache Airflow plus additional security features, bug fixes, and learning resources.

## Why does Astronomer maintain AC instead of committing to the Apache Airflow image?

While Apache Airflow and the community-developed image for it are useful resources for beginning to use Airflow, they don't have everything that's needed to run Airflow at production scale.

Instead of adding more complexity and dependencies to the community-developed image, we wanted to provide another option for users who are ready to take the next step and scale up their Airflow environment.

In addition, certain components of AC, such as the Astronomer CLI, represent Astronomer's own best practices for using Airflow. While we hope the Airflow community appreciates and uses the tools which represent our best practices, we don't want to impose those by building them directly into vanilla Airflow.

## How do I get started using AC?

AC is distributed as both a Python wheel and a Docker image. Both of these distributions are open source and free to use. To get started, read our installation guides:

- [Install via Python Wheel]
- [Install via Docker image]

## Why should I use Astronomer Core's Docker image vs. Apache Airflow's Docker image?

Astronomer Core extends the vanilla Airflow image to make it more scalable and reliable. In addition, the Astronomer Core image is consistently updated and supported by the Astronomer team; you'll be able to rely on regularly scheduled releases, patches, and deprecations as you build your data pipelines in Airflow.

## Can I run Astronomer Core on a Kubernetes Cluster?

Astronomer's open source Helm chart can be used to configure Astronomer Core's Airflow image. You can use this Helm chart to configure settings for Airflow, such as your Airflow version and CPU limits.

## Can I build on top of Astronomer Core?

Astronomer Core has an open source license, meaning you can customize and extend the image for nonprofit purposes. For more information on extending the AC image, read [Build Dependencies].
