# Makefile

define HELP_MESSAGE
linguaphoto

# Installing

1. Create a new Conda environment: `conda create --name linguaphoto python=3.11`
2. Activate the environment: `conda activate linguaphoto`
3. Install the package: `make install-dev`

# Running Tests

1. Run autoformatting: `make format`
2. Run static checks: `make static-checks`
3. Run unit tests: `make test`

endef
export HELP_MESSAGE

all:
	@echo "$$HELP_MESSAGE"
.PHONY: all

# ------------------------ #
#          Serve           #
# ------------------------ #

start-backend:
	@uvicorn linguaphoto.main:app --reload --port 8080 --host localhost

start-frontend:
	@cd frontend && npm start

start-db:
	@docker kill linguaphoto-db || true
	@docker rm linguaphoto-db || true
	@docker run --name linguaphoto-db -d -p 8000:8000 amazon/dynamodb-local

# ------------------------ #
#      Code Formatting     #
# ------------------------ #

format-backend:
	@black linguaphoto
	@ruff format linguaphoto
.PHONY: format

format-frontend:
	@cd frontend && npm run format
.PHONY: format

format: format-backend format-frontend
.PHONY: format

# ------------------------ #
#       Static Checks      #
# ------------------------ #

static-checks-backend:
	@black --diff --check linguaphoto
	@ruff check linguaphoto
	@mypy --install-types --non-interactive linguaphoto
.PHONY: lint

static-checks-frontend:
	@cd frontend && npm run lint
.PHONY: lint

static-checks: static-checks-backend static-checks-frontend
.PHONY: lint

# ------------------------ #
#        Unit tests        #
# ------------------------ #

test-backend:
	@python -m pytest

test-frontend:
	@cd frontend && npm run test -- --watchAll=false

# test: test-backend test-frontend
test: test-backend

.PHONY: test
