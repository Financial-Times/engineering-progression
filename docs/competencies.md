
# Contributing: Engineering Competencies

The Engineering competencies are used to inform conversations about career progression between an engineer and their line manager. Every engineer in the CTO organisation of the Financial Times can help shape these competencies. While they are in alpha and beta we are especially interested in contributions.

  - [Language Guidelines](#language-guidelines)
  - [Editing on GitHub](#editing-on-github)
  - [Editing Locally](#editing-locally)
    - [Running Tests](#running-tests)


## Language Guidelines

The competencies all follow [tone and language guidelines](language.md), any edits or additions should keep to these guidelines.


## Editing on GitHub

Using the GitHub interface is the quickest way to get started with making suggestions to the engineering competencies. There are two files in the repository that you'll need to care about:

  - [`data/competencies.yml`](../data/competencies.yml): this is the file which contains all of the competencies data for the different levels. [Suggest edits to this file here](https://github.com/Financial-Times/engineering-progression/edit/master/data/competencies.yml)

  - [`data/levels.yml`](../data/levels.yml): this is the file which contains meta information about the competency levels. [Suggest edits to this file here](https://github.com/Financial-Times/engineering-progression/edit/master/data/levels.yml)

  - [`data/domains.yml`](../data/domains.yml): this is the file which contains meta information about the competency domains. [Suggest edits to this file here](https://github.com/Financial-Times/engineering-progression/edit/master/data/domains.yml)

Once you've committed your changes and opened a pull request, your changes will be automatically tested to make sure that the files are in the correct format. Pay attention to the status of your pull request and use the CircleCI interface to review any errors.


## Editing Locally

GitHub is useful for smaller changes, but you may prefer to edit competencies in an editor on your local machine. **Before reading further, you'll need to follow a short [Local Development guide](local-development.md) to get yourself set up**.

Once you have everything set up locally, you can start to edit the following files. It's best to do this on a branch so that you can open a pull request later on GitHub.

  - [`data/competencies.yml`](../data/competencies.yml): this is the file which contains all of the competencies data for the different levels. This adheres to a [strict schema](../test/schema/competencies.js), see [Running Tests](#running-tests) below

  - [`data/levels.yml`](../data/levels.yml): this is the file which contains meta information about the competency levels. This adheres to a [strict schema](../test/schema/levels.js), see [Running Tests](#running-tests) below

  - [`data/domains.yml`](../data/domains.yml): this is the file which contains meta information about the competency domains. This adheres to a [strict schema](../test/schema/domains.js), see [Running Tests](#running-tests) below


### Running Tests

We use [JSON Schema](https://json-schema.org/) to test that the competencies YAML is valid, and that no changes to the structure can be made accidentally. These tests are run automatically on CircleCI, but it may be useful for you to test changes locally before pushing. You can do this with:

```sh
make validate-competencies-json
```

This will first run `make build` for you behind the scenes, and then run the tests against the built JSON. If there are any validation issues, errors are output to the command line and the command will exit with a code of `1`.
