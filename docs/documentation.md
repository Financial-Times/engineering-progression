
# Contributing: Documentation and Website

It's important that the documentation in this repo and the Engineering Progression website are clear and easy to understand. This guide is for people who'd like to help maintain the docs.

  - [Markdown Documentation](#markdown-documentation)
  - [Website](#website)
    - [Editing the Site](#editing-the-site)
    - [Building the Site Locally](#building-the-site-locally)


## Markdown Documentation

The Markdown documentation across this repo is designed to be viewed through the GitHub interface, and forms part of the contributing guide. These files follow our [tone and language guidelines](language.md). The following files and directories are important:

  - `README.md`: the purposes of this file are:
    1. Introduce new users to the repo and website
  2. Guide users to the different formats that the competencies live as (e.g. spreadsheet and YAML)
  3. Give a brief explanation of how somebody can contribute to the repo, guiding them to the other documentation pages

  - `CONTRIBUTING.md`: This file is used to point users to the more specific contributing guides that live under `docs`

  - `docs`: This directory contains all of the more specific guides on how to contribute to the engineering progression repo and website.


## Website

The website is built using [Jekyll](https://jekyllrb.com/) and hosted on [GitHub Pages](https://pages.github.com/). Due to the slight complexity of the build pipeline for this project, the structure of the site and the commands used to build it may not be familiar. Here are some differences:

  1. The site source code lives in the `site` directory on the `master` branch, rather than the root of the project or a `gh-pages` branch
  2. We generate some of the site files based on the competencies JSON, and these files are ignored by Git
  3. The generated site is output to the `dist/site` directory rather than `_site`
  4. While there _is_ a `gh-pages` branch on the repository, this should not be edited manually – these files are overwritten by CI

### Editing the Site

This short guide covers some key files and directories which you'll need to know about to edit the site. Site content follows our [tone and language guidelines](language.md).

  - All of the pages on the site live within `site/pages`. We place pages here to reduce clutter in the main `site` directory, and we specify `permalink` front-matter in each page to indicate where it should live in the URL structure.

  - Common data shared between pages is in JSON and YAML files within `site/_data`. This is standard [Jekyll data files](https://jekyllrb.com/docs/datafiles/)

  - Shared HTML includes and page layouts are within `site/_includes` and `site/_layouts`. This is mostly a standard Jekyll thing ([includes](https://jekyllrb.com/docs/includes/), [layouts](https://jekyllrb.com/docs/layouts/)) but we do have a couple of custom layouts defined:

    - `site/_layouts/default.html`: includes boilerplate HTML as well as the wrappers for [o-layout](https://registry.origami.ft.com/components/o-layout), an Origami component which does most of the heavy lifting for the site's styles. This layout is not that useful by itself.

	- `site/_layouts/o-layout-docs.html`: use this layout to render a single documentation page, with a generated sidebar nav and optimised for reading. This can accomodate any Markdown that you specify in your page. This extends `site/_layouts/default.html`.

	- `site/_layouts/o-layout-landing.html`: use this layout to render a home page layout. This is only really useful with a page that's written as HTML rather than Markdown, as it requires a certain amount of markup. See the site home page for an example. This extends `site/_layouts/default.html`.

  - The API endpoints (found under `site/api` if you're developing locally) are generated automatically. Any changes to files in here will be overwritten. If you need to make changes to the way these files are generated, see `script/build-website-api.js`.

  - The competencies and levels data is generated automatically, so that this data is always pinned at the latest released version on the website. Any changes to files in here will be overwritten. If you need to make changes to the way these files are generated, see `script/build-website-data.js`.

### Building the Site Locally

For broader changes to the site, it may be easier to clone this repository and edit files locally rather than through the GitHub interface. **Before reading further, you'll need to follow a short [Local Development guide](local-development.md) to get yourself set up**.

We've created some helper commands which build and run the site locally without you having to think too much about how this site is structured differently to a standard Jekyll site.

Build the website once, creating files in `dist/site` (mostly used by CI):

```sh
make build-website
```

Build the website when files change and serve on [localhost:4000](http://localhost:4000/):

```sh
make website
```

The local website will not have any API endpoints or competencies data unless you generate them manually. On CI and in production this is automated, but to build these parts of the site manually, run the following:

```sh
CIRCLE_TAG=v1.0.0 make build-website-api build-competencies-data
```

This will generate all of the API endpoints based on competencies data (e.g. `/api/v1/competencies/all.json`). The `v1` in the URL corresponds to the Circle tag that you specify, so if you wanted to create a `v2` endpoint you should specify `CIRCLE_TAG=v2.0.0`. This will also generate Jekyll data files for the competencies and levels, which are used by pages in the site.
