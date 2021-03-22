---
title: "Frequently Asked Questions"
navtitle: "Astronomer Core FAQ"
description: "Commonly asked questions pertaining to Astronomer Core."
---

## What is Astronomer Core?

Astronomer Core is an open source distribution of Apache Airflow built for teams ready to run Airflow both locally and at production scale.

## What's the difference between Astronomer Core and Apache Airflow?

Astronomer Core includes every feature in Apache Airflow, plus additional security features, bug fixes, and learning resources.

## How does Astronomer Core's image differ from the community-built Airflow image?

While the community-developed image for Airflow is a good starting point for using Airflow, it doesn't have everything that's needed to run Airflow at production scale.

Instead of adding more complexity and dependencies to the community-developed image, we wanted to provide another option for users who are ready to take the next step and scale up their Airflow environment.

## How do I start using Astronomer Core?

Astronomer Core is distributed as both a Python wheel and a Docker image. Both of these distributions are open source and free to use. To get started, read our installation guides:

- [Install via Python Wheel]
- [Install via Docker image]

## Why should I use Astronomer Core's Docker image vs. Apache Airflow's Docker image?

Astronomer Core extends the vanilla Airflow image to make it more scalable and reliable. In addition, the Astronomer Core image is consistently updated and supported by the Astronomer team. You'll be able to rely on regularly scheduled releases, patches, and deprecations as you build data pipelines in Airflow.

## Can I modify the Astronomer Core image?

Because the Astronomer Core image is open source, you can customize and extend the image as needed. For more information on extending the AC image, read [Build Dependencies].
