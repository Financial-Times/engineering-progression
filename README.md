
# Engineering Progression

Careers and progression for engineers in the CTO organisation. This project is in Alpha – **do not use**.

  - [Overview](#overview)
  - [Contributing](#contributing)
  - [Local Development](#local-development)
    - [Setup](#setup)
    - [Building Competencies JSON](#building-competencies-json)
    - [Building the Website](#building-the-website)
    - [Running Tests](#running-tests)
    - [Tooling Changes](#tooling-changes)
  - [Licence](#licence)


## Overview

This repository aims to be the one source of truth for Engineering careers and progression in the CTO organisation of the Financial Times. The data in this repo can have changes made to it via pull requests and GitHub issues, our intention is to have conversations around our career paths in the same place as we talk about our day-to-day work.

We also intend on these career competencies being made available in other familiar formats, for example a generated Google Sheet which managers and reports can use to track progress.


## Contributing

Anybody working for the Financial Times is welcome to suggest changes via a GitHub issue or pull request. You'll find the competencies in [`data/competencies.yml`](data/competencies.yml), and the GitHub interface is probably the easiest way to edit this.

We have a [full contributing guide here](CONTRIBUTING.md), which outlines the language we use and some of the thinking behind the competencies.


## Local Development

We've tried to make it as easy as possible to build and test the competencies JSON and website locally. This short guide is intended for when a person would like to:

  1. make broader changes to the competencies, where the GitHub interface may be unwieldy
  2. make changes to the competencies schema and build process

### Setup

You'll need a few things before you're ready to start running things locally. The things you need before you can do anything else are:

  - [Node.js](https://nodejs.org/en/) version 10 or higher (used to build and test competencies JSON)
  - [Ruby](https://www.ruby-lang.org/en/) version 2.4 (used to build the website)

Once you have these, you can run the following to install all dependencies:

```sh
make install
```

### Building Competencies JSON

You may have noticed that the competencies data is stored as YAML in this repo. This is useful for editing, but JSON is far easier to process programmatically. Once you've [cloned this repository](https://help.github.com/articles/cloning-a-repository/) locally, you will be able to build the competencies JSON with this command:

```sh
make build-competencies-json
```

This will create a `dist` folder in the repo, which will contain a `competencies.json` file. It's important to note that this generated file cannot be used to edit competencies, and will be overridden entirely every time `make build` is run.

### Building the Website

The website is built using [Jekyll](https://jekyllrb.com/) and hosted on [GitHub Pages](https://pages.github.com/). Due to the slight complexity of the build pipeline for this project, the structure of the site and the commands used to build it may not be familiar. Here are some differences:

  1. The site source code lives in the `site` folder on the `master` branch, rather than the root of the project or a `gh-pages` branch
  2. We generate some of the site files based on the competencies JSON, and these files are ignored by Git
  3. The generated site is output to the `dist/site` folder rather than `_site`
  4. While there _is_ a `gh-pages` branch on the repository, this should not be edited manually – these files are overwritten by CI

We've created some helper commands which build and run the site locally without you having to think too much about these differences.

Build the website once, creating files in `dist/site` (mostly used by CI):

```sh
make build-website
```

Build the website when files change and serve on [localhost:4000](http://localhost:4000/):

```sh
make website
```

The local website will not have any API endpoints unless you generate them manually. On CI and in production this can be automated. To build an API endpoints, run the following:

```sh
CIRCLE_TAG=v1.0.0 make build-website-api
```

This will generate the API endpoint `/api/v1/competencies.json`. The `v1` in the URL corresponds to the Circle tag that you specify, so if you wanted to create a `v2` endpoint you should specify `CIRCLE_TAG=v2.0.0`.

### Running Tests

We use [JSON Schema](https://json-schema.org/) to test that the competencies YAML is valid, and that no changes to the structure can be made accidentally. These tests are run automatically on CircleCI, but it may be useful for you to test changes locally before pushing. You can do this with:

```sh
make test
```

This will first run `make build` for you behind the scenes, and then run the tests against the built JSON. If there are any validation issues, errors are output to the command line and the command will exit with a code of `1`.

### Tooling Changes

If you wish to make changes to the way the engineering competencies are built/tested, you'll need to pay attention to several files:

  - [`Makefile`](Makefile): this contains the `make` tasks used to build and test the competencies
  - [`script/build-competencies-json.js`](script/build-competencies-json.js): this takes the competencies YAML and produces JSON. It is executed when `make build` is run
  - [`script/validate-competencies-json.js`](script/validate-competencies-json.js): this takes the generated competencies JSON and validates it. It is executed when `make test` is run
  - [`test/schema/schema.json`](test/schema/schema.json): this is the [JSON Schema](https://json-schema.org/) definition that is used to validate the competencies
  - [`.circleci/config.yml`](.circleci/config.yml): this is the CircleCI config, which ensures that tests are run automatically when a new commit is pushed to the repo


## Licence

This software is published by the Financial Times under the [MIT licence](http://opensource.org/licenses/MIT).
