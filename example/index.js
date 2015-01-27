/**
 * @copyright 2015, Prometheus Research, LLC
 */
'use strict';

if (Object.assign === undefined) {
  Object.assign = require('object-assign');
}

var React         = require('react/addons');
var Autocomplete  = require('../');

var Example = React.createClass({

  render() {
    return (
      <div>
        <h1>React Autocomplete</h1>
        <div>
          <h2>Basic usage</h2>
          <Autocomplete
            options={[
              {id: 1, title: 'First'},
              {id: 2, title: 'Second'},
              {id: 3, title: 'Third'},
              {id: 4, title: 'Forth'}
            ]}
            />
        </div>
      </div>
    );
  }
});

React.render(
  <Example />,
  document.getElementById('main'));
