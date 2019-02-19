
# Engineering Progression

Careers and progression for engineers in the CTO organisation. This project is in Alpha – **do not use**.

  - [Overview](#overview)
  - [Contributing](#contributing)
  - [Building and Testing](#building-and-testing)
  - [Licence](#licence)


## Overview

This repository aims to be the one source of truth for Engineering careers and progression in the CTO organisation of the Financial Times. The data in this repo can have changes made to it via pull requests and GitHub issues, our intention is to have conversations around our career paths in the same place as we talk about our day-to-day work.

We also intend on these career competencies being made available in other familiar formats, for example a generated Google Sheet which managers and reports can use to track progress.


## Contributing

Anybody working for the Financial Times is welcome to suggest changes via a GitHub issue or pull request. You'll find the competencies in [`data/competencies.yml`](data/competencies.yml), and the GitHub interface is probably the easiest way to edit this.

We have a [full contributing guide here](CONTRIBUTING.md), which outlines the language we use and some of the thinking behind the competencies.


## Building and Testing

We've tried to make it as easy as possible to build and test the competencies JSON locally. This short guide is intended for when a person would like to:

  1. make broader changes to the competencies, where the GitHub interface may be unwieldy
  2. make changes to the competencies schema and build process

### Building

You may have noticed that the competencies data is stored as YAML in this repo. This is useful for editing, but JSON is far easier to process programmatically. Once you've [cloned this repository](https://help.github.com/articles/cloning-a-repository/) locally, you will be able to build the competencies JSON with this command:

```sh
make build
```

This will create a `dist` folder in the repo, which will contain a `competencies.json` file. It's important to note that this generated file cannot be used to edit competencies, and will be overridden entirely every time `make build` is run.

### Testing

We use [JSON Schema](https://json-schema.org/) to test that the competencies YAML is valid, and that no changes to the structure can be made accidentally. These tests are run automatically on CircleCI, but it may be useful for you to test changes locally before pushing. You can do this with:

```
make test
```

This will first run `make build` for you behind the scenes, and then run the tests against the built JSON. If there are any validation issues, errors are output to the command line and the command will exit with a code of `1`.

### Build and Test Tooling

If you wish to make changes to the way the engineering competencies are built/tested, you'll need to pay attention to several files:

  - [`Makefile`](Makefile): this contains the `make` tasks used to build and test the competencies
  - [`script/build-competencies-json.js`](script/build-competencies-json.js): this takes the competencies YAML and produces JSON. It is executed when `make build` is run
  - [`script/validate-competencies-json.js`](script/validate-competencies-json.js): this takes the generated competencies JSON and validates it. It is executed when `make test` is run
  - [`test/schema/schema.json`](test/schema/schema.json): this is the [JSON Schema](https://json-schema.org/) definition that is used to validate the competencies
  - [`.circleci/config.yml`](.circleci/config.yml): this is the CircleCI config, which ensures that tests are run automatically when a new commit is pushed to the repo


## Licence

This software is published by the Financial Times under the [MIT licence](http://opensource.org/licenses/MIT).
