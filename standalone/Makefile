.DELETE_ON_ERROR:
.INTERMEDIATE: react-autocomplete.prod.js

TARGETS = react-autocomplete.js react-autocomplete.min.js

PATH := ../node_modules/.bin:$(PATH)

build: $(TARGETS)

react-autocomplete.js:
	$(call browserify,development)

react-autocomplete.prod.js:
	$(call browserify,production)

react-autocomplete.min.js: react-autocomplete.prod.js
	@cat $< | uglifyjs -cm > $@

clean:
	@rm -f $(TARGETS)

define browserify
	@NODE_ENV=$(1) browserify -t [ reactify --es6] . \
		| sed -E 's/function\(require/function(__browserify__/g' \
		| sed -E 's/require\(/__browserify__(/g' \
		>> $@
endef
