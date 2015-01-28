BIN   = ./node_modules/.bin
TESTS = $(shell find ./lib -path '**/__tests__/*.js')

clean:
	@rm -rf ./node_modules/

test: test-phantomjs

ci: ci-phantomjs

ci-phantomjs:
	@$(BIN)/mochify --watch -R dot $(TESTS)

test-phantomjs:
	@$(BIN)/mochify -R spec $(TESTS)
