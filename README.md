# Astronomer Documentation

This repository contains all public [Astronomer Documentation](https://astronoemr.io/docs) files. Docs are stored in product-specific directories and are versioned in a way that aligns with our internal dev streams.

## Overview
- [Cloud](https://astronomer.io/docs/cloud/stable): The default when a user visits our documentation site, these docs are continuously delivered along with Cloud features.
- [Enterprise](https://astronomer.io/docs/enterprise/stable): These docs are fully versioned to align with the way our Enterprise users engage with and upgrade our product.
- [AC](https://astronoemr.io/docs/certified/stable): These docs are hidden from the top-level nav for now, but are available to be shared on a case-by-case basis.

## Cloud Docs

All Cloud documentation exists in the top-level `cloud` directory. Since we are moving Cloud closer to continuous delivery, all documentation for Cloud is maintained in the `stable` subdirectory and cloud docs are always built off of that directory; they are not versioned on our website.

### Contributing to Cloud Docs

Since Cloud docs are built directly off of the `staging` subdirectory, updates to cloud documentation must be done via a PR process. If you need to make a change to Cloud docs, the process by which you update this repository is dependent on the circumstance:

- **New Features**: For new features, create a branch off of `main` of the format `feature/your-feature-branch`. Document your needed changes in the `cloud/stable` directory and then open a PR for review and merge whenever the feature becomes generally available in Cloud.
- **Quick Fixes**: Quick fixes can generally be reviewed and merged much more quickly than feature docs. To fix a bug, branch off of main with a `hotfix/your-hotfix-branch` naming schema. You can then PR and get merged as soon as possible.

### Releasing Cloud Docs

Every update to the `main` branch of this repository will trigger a rebuild of our production website at https://www.astronomer.io. When Cloud docs are merged into main, they will be available on the prod site soon thereafter.

We will likely introduce a `staging` branch or something similar at some point so that you can preview your docs at https://www.preview.astronomer.io before merging to main.

## Enterprise Docs

All Enterprise documentation lives in the top-level `enterprise` directory. Enterprise docs will be versioned; only subdirectories of the format `vX.X` will be included in the website builds; the `next` directory is reserved for active development work. Yes, I know it's a bit confusing; we will likely soon rename the `next` subdirectory in enterprise and ac docs to be more intuitive.

### Contributing to Enterprise Docs

All active development on enterprise docs will be done in the `enterprise/next` directory (up for rename). When we're ready to release a new version of Enterprise to our customers, we will branch off of main, run a `mkdir vX.X && cp next/* vX.X` to copy the latest version of all files down into a versioned subdirectory, and merge those changes back into `main`.

### Contributing to AC Docs

All active development on enterprise docs will be done in the `ac/next` directory (up for rename). When we're ready to release a new version of AC to our customers, we will branch off of main, run a `mkdir vX.X.X && cp next/* vX.X.X` to copy the latest version of all files down into a versioned subdirectory, and merge those changes back into `main`.
