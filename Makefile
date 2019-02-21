
# Meta tasks
# ----------

.PHONY: test


# Configuration
# -------------

# Import environment variables if an .env file is present
ifneq ("$(wildcard .env)","")
sinclude .env
export $(shell [ -f .env ] && sed 's/=.*//' .env)
$(info Note: importing environment variables from .env file)
endif

# Set up the npm binary path
NPM_BIN = ./node_modules/.bin
export PATH := $(PATH):$(NPM_BIN)

# Set some shared Jekyll options
JEKYLL_OPTIONS = --source ./site --destination ./dist/site


# Output helpers
# --------------

TASK_DONE = echo "✓ $@ done"


# Group tasks
# -----------

all: install build test
install: install-ruby-gems install-node-modules
build: build-competencies-json build-website
test: validate-competencies-json


# Installation tasks
# ------------------

# Install bundler
install-bundler:
ifeq ("$(shell which bundler)","")
	@gem install bundler
endif
	@$(TASK_DONE)

# Install ruby gems
install-ruby-gems: install-bundler
ifdef CI
	@bundle check --path=vendor/bundle || bundle install --path=vendor/bundle
	@bundle package
else
	@bundle check || bundle install
endif
	@$(TASK_DONE)

# Install node modules
install-node-modules:
	@npm install
	@$(TASK_DONE)


# Build tasks
# -----------

# Build the competencies JSON
build-competencies-json:
	@./script/build-competencies-json.js
	@$(TASK_DONE)

# Build the competencies website API. This copies
# built competency data from the main repo
build-website-api: build-competencies-json
ifdef CIRCLE_TAG
	@./script/build-website-api.js
endif
	@$(TASK_DONE)

# Build the competencies website
build-website: build-website-api
	@bundle exec jekyll build $(JEKYLL_OPTIONS)
	@$(TASK_DONE)

# Build and serve the website for local development.
# Simpler naming is for ease of local development,
# this is not used in the build pipeline
website:
	@bundle exec jekyll serve --watch --livereload $(JEKYLL_OPTIONS)


# Test tasks
# ----------

# Validate the competencies JSON
validate-competencies-json: build-competencies-json
	@./script/validate-competencies-json.js
	@$(TASK_DONE)


# Publish tasks
# -------------

# Publish the competencies website
#
# No comments allowed alongside commands, so I'll list here line by line:
#   1. Checkout the gh-pages branch
#   2. Make sure that the gh-pages branch is up-to-date (mostly for if this needs testing locally)
#   3. Remove everything in the repo that is tracked by Git (if we didn't do this then it would be impossible to delete files from the site)
#   4. Perform a git reset on files that MUST NOT be overwritten:
#      a. Circle config, which must not be deleted or builds will fail
#      b. Gitignore, which must be different to the main repo
#      c. The "api" folder, which must retain previous versions of the data
#      d. CNAME, which must not be deleted or our domain will stop resolving
#   5. Copy all files from the newly generated site (created by `make build-website`)
#   6. if CIRCLE_TAG environment variable is defined AND there are changes to be committed:
#        a. Stage all of the changes
#        b. Commit all of the changes using a standard versioned commit message
#        c. Push changes to the GitHub repo
#      if CIRCLE_TAG environment variable is NOT defined AND there are changes to be committed:
#        a. Stage all of the changes
#        b. Commit all of the changes using a standard versioned commit message
#        c. Push changes to the GitHub repo
#   7. Checkout the original branch
publish-website: build-website
	@git checkout gh-pages
	@git pull origin gh-pages
	@git rm -r .
	@git reset HEAD .circleci .gitignore ./api CNAME
	@git checkout .circleci .gitignore ./api CNAME
	@cp -r dist/site/* .
ifdef CIRCLE_TAG
	@if [ "$$(git status --porcelain)" != "" ]; then \
		git add .; \
		git commit -m "Apply updates from $(CIRCLE_TAG)"; \
		git push origin gh-pages; \
	fi
else
	@if [ "$$(git status --porcelain)" != "" ]; then \
		git add .; \
		git commit -m "Apply updates from master branch"; \
		git push origin gh-pages; \
	fi
endif
	@git checkout -
	@$(TASK_DONE)


# Housekeeping tasks
# ------------------

# Clean the Git repository
clean:
	@git clean -fxd
	@$(TASK_DONE)
