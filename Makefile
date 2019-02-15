
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


# Output helpers
# --------------

TASK_DONE = echo "✓ $@ done"


# Group tasks
# -----------

all: build
build: build-competencies-json
test: build validate-competencies-json


# Build tasks
# -----------

# Build the competencies JSON
build-competencies-json:
	@./script/build-competencies-json.js
	@$(TASK_DONE)


# Test tasks
# ----------

# Validate the competencies JSON
validate-competencies-json:
	@./script/validate-competencies-json.js
	@$(TASK_DONE)


# Housekeeping tasks
# ------------------

# Clean the Git repository
clean:
	@git clean -fxd
	@$(TASK_DONE)
