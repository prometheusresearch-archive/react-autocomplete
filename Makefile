.DELETE_ON_ERROR:

BABEL_OPTIONS = --stage 0
BIN           = ./node_modules/.bin
TESTS         = $(shell find src -path '*/__tests__/*-test.js')
SRC           = $(filter-out $(TESTS), $(shell find src -name '*.js'))
LIB           = $(SRC:src/%=lib/%)
NODE          = $(BIN)/babel-node $(BABEL_OPTIONS)

build:
	@$(MAKE) -j 8 $(LIB)

example::
	@$(BIN)/heatpack ./example/index.js

lint:
	@$(BIN)/eslint src

test:
	@NODE_ENV=test $(NODE) $(BIN)/_mocha -- $(TESTS)

ci:
	@NODE_ENV=test $(NODE) $(BIN)/_mocha --watch -- $(TESTS) 

test-coverage:
	@NODE_ENV=test $(NODE) $(BIN)/isparta cover $(BIN)/_mocha -- $(TESTS)

version-major version-minor version-patch: lint test
	@npm version $(@:version-%=%)

publish: build
	@git push --tags origin HEAD:master
	@npm publish

clean:
	@rm -f $(LIB)

lib/%: src/%
	@echo "Building $<"
	@mkdir -p $(@D)
	@$(BIN)/babel $(BABEL_OPTIONS) -o $@ $<
