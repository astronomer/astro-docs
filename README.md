# Astronomer Documentation

This repository contains all public [Astronomer Documentation](https://www.astronomer.io/docs/) files. Docs are stored in product-specific directories and are versioned in a way that aligns with our internal dev streams.

## Overview

- [Astronomer Cloud](https://www.astronomer.io/docs/cloud/): The default when a user visits our documentation site, these docs are continuously delivered along with Cloud features.
- [Astronomer Enterprise](https://www.astronomer.io/docs/enterprise/): These docs are fully versioned to align with the way our Enterprise users engage with and upgrade our product.
- [Astronomer Core](https://www.astronomer.io/docs/core/): These docs are fully versioned and aligned with open-source Apache Airflow releases that we decide to provide long-term support for.

## Cloud Docs

All Cloud documentation exists in the top-level `cloud` directory. Since we are moving Cloud closer to continuous delivery, all documentation for Cloud is maintained in the `stable` subdirectory and cloud docs are always built off of that directory; they are not versioned on our website.

### Contributing to Cloud Docs

Since Cloud docs are built directly off of the `staging` subdirectory, updates to cloud documentation must be done via a PR process. If you need to make a change to Cloud docs, the process by which you update this repository is dependent on the circumstance:

#### New Features

New features will need to be documented as they are rolled out to Cloud users.

1. Create a branch off of `main` of the format `feature/your-feature-branch`.
2. Document your needed changes in appropriate file of the `cloud/stable` directory
3. Open a PR for review and merge whenever the feature becomes generally available in Cloud.

#### Quick Fixes

Quick fixes can generally be reviewed and merged much more quickly than feature docs.

1. To fix a bug, branch off of main with a `hotfix/your-hotfix-branch` naming schema.
2. Add your desired fixes to the appropriate documents.
3. PR branch for review- these should be merged quickly.

### Releasing Cloud Docs

Every update to the `main` branch of this repository will trigger a rebuild of our production website at https://www.astronomer.io. When Cloud docs are merged into main, they will be available on the prod site soon thereafter.

We will likely introduce a `staging` branch or something similar at some point so that you can preview your docs at https://www.preview.astronomer.io before merging to main.

## Enterprise & AC Docs

All Enterprise documentation lives in the top-level `enterprise` directory. Enterprise docs will be versioned; only subdirectories of the format `vX.X` will be included in the website builds; the `next` directory is reserved for active development work.

### Contributing & Releasing Enterprise Docs

All active development on enterprise docs will be done in the `enterprise/next` directory.When we're ready to release a new version of Enterprise to our customers, we will branch off of main, run a `mkdir vX.X && cp next/* vX.X` to copy the latest version of all files down into a versioned subdirectory, and merge those changes back into `main`.

#### Upcoming Features

If you would like to document a feature that will be available in an upcoming Enterprise release:

1. Create a branch off of `main` of the format `feature/your-feature-branch`.
2. Document your needed changes in appropriate file of the `enterprise/next` directory
3. Open a PR for review- these will be merged quickly, but the actual document will not be accessible on our website until we cut a new version from the `next` folder as part of the release process.

#### Quick Fixes

Quick fixes will need to be made in the appropriate version folder; if the issue exists across all version folders, you will need to make the same change across multiple files. Sorry.

1. To fix a bug, branch off of main with a `hotfix/your-hotfix-branch` naming schema.
2. Add your desired fixes to the appropriate documents in the appropriate version folders.
3. PR branch for review- these should be merged quickly.

### Releasing AC Docs

All active development on enterprise docs will be done in the `ac/next` directory (up for rename). When we're ready to release a new version of AC to our customers, we will branch off of main, run a `mkdir vX.X.X && cp next/* vX.X.X` to copy the latest version of all files down into a versioned subdirectory, and merge those changes back into `main`.
