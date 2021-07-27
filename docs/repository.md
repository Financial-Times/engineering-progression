
# Contributing: The Repository

This repository is the one source of truth for engineering careers and progression, and as such it's important that the code is maintained. It's also important that issues and pull requests are responded to quickly. This guide is for people who want to help with these tasks.

  - [Local Development Environment](#local-development-environment)
  - [Issues and Pull Requests](#issues-and-pull-requests)
  - [Releases and Versioning](#releases-and-versioning)
    - [Major Versions](#major-versions)
	- [Minor Versions](#minor-versions)
	- [Patch Versions](#patch-versions)
  - [Tooling](#tooling)


## Local Development Environment

To be able to help maintain the repository, it's useful to have it cloned locally and to be able to quickly and easily run any of the associated scripts. We maintain a  [Local Development guide](local-development.md) to get you set up.


## Issues and Pull Requests

You can help contribute to the maintenance of the repository by responding to issues and pull requests opened by other people within the FT. Responding can be as little as adding a relevant label, or as large as a full code review.

When responding to issues and pull requests, keep the [tone and language guidelines](language.md) in mind.


## Releases and Versioning

We use [Semantic Versioning (SemVer)](https://semver.org/) to version the engineering competencies. The way SemVer is interpreted is slightly different than is outlined on the website above. Releases should only happen if a change has been made to competency data; a change to the documentation or website does not require a release.

We create releases through the GitHub interface, they follow these rules:

  - The tagname must be a valid Semantic Version
  - The title must be the same Semantic Version repeated
  - The description must contain a list of all the commits that have made it onto the `main` branch since the last release
  - If the tagname includes a prerelease, then the release must have the prerelease checkbox checked

There are some things that need to happen immediately after a release, which unfortunately cannot be automated. The release process is as follows:

  1. **Create release:**<br/>Create a release on the GitHub repo, following the rules outlined above
  2. **Wait for CI:**<br/>Wait for the CircleCI build to pass, and for all the integrations to deploy. If you have the [Google spreadsheet](https://docs.google.com/spreadsheets/d/1V0LIbCQtJsi2iowfJnRTDr4Na4LhNAlJ_UHl9dDQs00/edit) open while deploying, the tabs will seem to have switched order. Refreshing the page will fix this.
  3. **Update chart colours:**<br/>Update the chart colours in the newly-deployed [Google spreadsheet](https://docs.google.com/spreadsheets/d/1V0LIbCQtJsi2iowfJnRTDr4Na4LhNAlJ_UHl9dDQs00/edit). There are four bar charts, one for each level, each on a separate sheet. The bar chart colours cannot be updated through the API and so this must be done manually after the deploy. The series "Bar 1" must be set to the colour `#3d9199`. The series "Bar 2" must have no colour (select "None").


### Major Versions

A major version bump must happen when a change to the engineering competencies requires something **new** of an engineer to meet the level above their current one.

For example: if we decide that we now expect Mid-level Engineers to be able to fold a perfect Origami crane, then this is a major version bump to the competencies.

It's important that an intention to increment the major version is communicated to everybody it affects, including engineers, line managers and people who may consider the competencies when making promotion decisions. A major version change should also be coordinated around the timing of promotion rounds.

### Minor Versions

A minor version bump must happen when something is added to help clarify existing competencies, e.g. adding a new example to clarify intent. A minor version bump must also happen if a competency is deleted.

A competency being deleted does **not** count as a major version change because it does not _increase_ the expectations of an engineer at any level.

### Patch Versions

A patch version bump must happen when typos are fixed, or obvious language errors are changed to increase clarity.


## Tooling

If you wish to make changes to the way the engineering competencies are built/tested, the website is generated, or the way the tooling works together, you'll need to pay attention to several files:

  - [`Makefile`](../Makefile): this contains the `make` tasks used to build and test the competencies
  - [`script`](../script): this folder contains scripts that are run from tasks in `Makefile`, for when it would be unmaintainable to store them as inline bash
  - [`.circleci/config.yml`](../.circleci/config.yml): this is the CircleCI config, which ensures that tests are run automatically when a new commit is pushed to the repo
  - `package.json`, `package-lock.json`, `Gemfile`, `Gemfile.lock`: these files outline the libraries and tools that this repository relies on
