Basic usage
===========

Basic usage of the React Autocomplete component looks like:

.. jsx::
  var React = require('react')
  var ReactAutocomplete = require('react-autocomplete')

  var options = [
    {id: 'banana', title: 'Banana'},
    {id: 'apple', title: 'Apple'},
    {id: 'pineapple', title: 'Pineapple'},
    {id: 'strawberry', title: 'Strawberry'},
  ]

  React.renderComponent(
    <ReactAutocomplete options={options} />,
    document.getElementById('example')
  )

Which will result in:

.. raw:: html

  <div id="example"></div>
