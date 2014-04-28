/**
 * @jsx React.DOM
 */
(function() {
'use strict';

var options = [
  {id: 'banana', title: 'Banana'},
  {id: 'apple', title: 'Apple'},
  {id: 'pineapple', title: 'Pineapple'},
  {id: 'strawberry', title: 'Strawberry'},
];

React.renderComponent(
  <ReactAutocomplete options={options} />,
  document.getElementById('example')
);

})();

