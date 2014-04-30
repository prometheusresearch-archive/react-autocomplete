/**
 * @jsx React.DOM
 */

var React   = require('react');
var Page    = require('./page');
var Section = require('./Section');
var Column  = require('./Column');
var Code    = require('./Code');

var reactVersion = require('react/package.json').version;

var StandaloneUsage = React.createClass({

  render: function() {
    return (
      <div className="Usage container">
        <Section>
          <h3>Getting started</h3>
          <p>
            We provide a standalone build of React Autocomplete which can be included in your application using <code>{`<script>`}</code> element or loaded using an AMD loader similar to <a href="http://requirejs.org">RequireJS</a>. Alternatively you might want to use React Autocomplete within a CommonJS module system, see instructions below on that.
          </p>
        </Section>
        <Section>
          <Column className="Text">
            <h4>1. Include scripts</h4>
            <p>
              You need to include <code>react-with-addons.js</code> build of React as well as <code>react-autocomplete.js</code> itself.
            </p>
          </Column>
          <Column className="Example">
            <Code>{`
              <script src="JSXTransformer.js"></script>

              <script src="react-with-addons.js"></script>
              <script src="react-autocomplete.js"></script>
              `}
            </Code>
          </Column>
        </Section>
        <Section>
          <Column className="Text">
            <h4>2. Create autocomplete</h4>
            <p>
              Create and render autocomplete into DOM.
            </p>
          </Column>
          <Column className="Example">
            <Code>{`
              <script type="text/jsx">
                var options = [
                  {id: 'banana', title: 'Banana'},
                  {id: 'apple', title: 'Apple'},
                  {id: 'pineapple', title: 'Pineapple'},
                  {id: 'strawberry', title: 'Strawberry'},
                  ...
                ]

                React.renderComponent(
                  <ReactAutocomplete options={options} />,
                  document.getElementBy('autocomplete'))
              </script>`}
            </Code>
          </Column>
        </Section>
      </div>
    );
  }
});

var CommonJSUsage = React.createClass({

  render: function() {
    return (
      <div className="Usage container">
        <Section>
          <h3>Getting started with CommonJS</h3>
          <p>
            For those who prefer working with CommonJS we provide <code>react-autocomplete</code> npm package which exports React Autocomplete functionality as a set of CommonJS modules.
          </p>
        </Section>
        <Section>
          <Column className="Text">
            <h4>1. Install via npm</h4>
            <p>
              You need both <code>react</code> and <code>react-autocomplete</code> packages installed via npm. Also <code>browserify</code> and <code>reactify</code> help your code to be compiled for browser.
            </p>
          </Column>
          <Column className="Example">
            <Code>{`
              % npm install react react-autocomplete
              % npm install browserify reactify
              `}
            </Code>
          </Column>
        </Section>
        <Section>
          <Column className="Text">
            <h4>2. Require React and React Autocomplete</h4>
            <p>
              Both React and React Autocomplete now can be brought into scope using CommonJS <code>require()</code> function.
            </p>
          </Column>
          <Column className="Example">
            <Code>{`
              var React = require('react')
              var ReactAutocomplete = require('react-autocomplete')
              `}
            </Code>
          </Column>
        </Section>
        <Section>
          <Column className="Text">
            <h4>3. Create autocomplete</h4>
            <p>
              Create and render autocomplete into DOM.
            </p>
          </Column>
          <Column className="Example">
            <Code>{`
              var options = [
                {id: 'banana', title: 'Banana'},
                {id: 'apple', title: 'Apple'},
                {id: 'pineapple', title: 'Pineapple'},
                {id: 'strawberry', title: 'Strawberry'},
                ...
              ]

              React.renderComponent(
                <ReactAutocomplete options={options} />,
                document.getElementBy('autocomplete'))
              `}
            </Code>
          </Column>
        </Section>
        <Section>
          <Column className="Text">
            <h4>4. Bundle your application</h4>
            <p>
              To serve your application to browser you must bundle all modules together first.
            </p>
          </Column>
          <Column className="Example">
            <Code>{`
              % browserify -t reactify ./main.js > bundle.js
              `}
            </Code>
          </Column>
        </Section>
      </div>
    );
  }
});

var Index = React.createClass({

  render: function() {
    return this.transferPropsTo(
      <Page className="Index">
        <div className="HeaderWrapper">
          <div className="Header container">
            <h1>{this.props.title}</h1>
            <p>
              Autocomplete component for <a href="http://facebook.github.io/react">React</a>.
            </p>
          </div>
        </div>
        <StandaloneUsage />
        <CommonJSUsage />
        <div className="Development container">
          <Section>
            <h3>Development</h3>
            <p>
              Development of React Autocomplete library takes place at <a href="https://github.com/prometheusresearch/react-autocomplete">prometheusresearch/react-autocomplete</a> repository. If you found a bug, please submit an <a href="https://github.com/prometheusresearch/react-autocomplete/issues">issue</a> or better open a pull request.
            </p>
          </Section>
        </div>
        <div className="Footer container">
          <Section>
            <p>
              React Autocomplete is free software created by <a href="http://prometheusresearch.com">Prometheus Research</a> and is released under the MIT license.
            </p>
          </Section>
        </div>
      </Page>
    );
  }
});

module.exports = Index;
