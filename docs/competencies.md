
# Contributing: Engineering Competencies

The Engineering competencies are used to inform conversations about career progression between an engineer and their line manager. Every engineer in the CTO organisation of the Financial Times can help shape these competencies.

  - [Language Guidelines](#language-guidelines)
  - [Editing on GitHub](#editing-on-github)
  - [Editing Locally](#editing-locally)
    - [Running Tests](#running-tests)


## Language Guidelines

The competencies all follow [tone and language guidelines](language.md), any edits or additions should keep to these guidelines.


## Editing on GitHub

Using the GitHub interface is the quickest way to get started with making suggestions to the engineering competencies. There are a few files in the repository that you'll need to care about:

  - [`data/job-families`](../data/job-families): this is the folder which contains all of the competencies data for the different job families.

Once you've committed your changes and opened a pull request, your changes will be automatically tested to make sure that the files are in the correct format. Pay attention to the status of your pull request and use the GitHub Actions interface to review any errors.


## Editing Locally

GitHub is useful for smaller changes, but you may prefer to edit competencies in an editor on your local machine. **Before reading further, you'll need to follow a short [Local Development guide](local-development.md) to get yourself set up**.

Once you have everything set up locally, you can start to edit the following files. It's best to do this on a branch so that you can open a pull request later on GitHub.

  - [`data/job-families`](../data/job-families): this is the folder which contains all of the competencies data for the different job families. This adheres to a [strict schema](../test/schema/job-family.json), see [Running Tests](#running-tests) below


### Running Tests

We use [JSON Schema](https://json-schema.org/) to test that the competencies YAML is valid, and that no changes to the structure can be made accidentally. These tests are run automatically on GitHub Actions, but it may be useful for you to test changes locally before pushing. You can do this with:

```sh
npm test
```

If there are any validation issues, errors are output to the command line and the command will exit with a code of `1`.
