.DELETE_ON_ERROR:

BABEL_OPTIONS =
BIN           = ./node_modules/.bin
TESTS         = $(shell find src -path '*/__tests__/*.js')
SRC           = $(filter-out $(TESTS), $(shell find src -name '*.js'))
LIB           = $(SRC:src/%=lib/%)
NODE          = $(BIN)/babel-node $(BABEL_OPTIONS)
MOCHA_OPTIONS = --compilers js:babel-core/register --require ./src/__tests__/setup.js
MOCHA					= NODE_ENV=test node $(BIN)/mocha $(MOCHA_OPTIONS)

build:
	@$(MAKE) -j 8 $(LIB)

example::
	@$(BIN)/heatpack ./example/index.js

lint:
	@$(BIN)/eslint src

test:
	@$(MOCHA) -- $(TESTS)

ci:
	@$(MOCHA) --watch -- $(TESTS)

version-major version-minor version-patch: lint
	@npm version $(@:version-%=%)

publish: build
	@git push --tags origin HEAD:master
	@npm publish --access public

clean:
	@rm -rf ./lib

lib/%: src/%
	@echo "Building $<"
	@mkdir -p $(@D)
	@NODE_ENV=production $(BIN)/babel $(BABEL_OPTIONS) -o $@ $<
