React Autocomplete
==================

React Autocomplete is an autocomplete component for React_.

Getting started
---------------

React Autocomplete can be installed via npm::

  % npm install prometheusresearch/react-autocomplete

or bower::

  % bower install prometheusresearch/react-autocomplete

Then it can be consumed via CommonJS module system:

.. note::
  :class: inline

  Use browserify_ or webpack_ to bundle CommonJS modules for browser.

::

  var Autocomplete = require('react-autocomplete')

  React.renderComponent(
    <Autocomplete options={[{title: 'Item', id: 'item'}]} />,
    document.getElementById('autocomplete')
  )

See :doc:`examples/index` page for more information on how to use and extend React
Autocomplete component.

API
---

React Autocomplete exposes a single component ``Autocomplete`` which allows the
following props to be applied:

``options``
  Opaque object which will be served as an argument to ``search`` function, by
  default ``search`` expects an array with of objects of shape ``{title: ...,
  id: ...}``.

``search``
  Search function which takes ``options`` object and ``searchTerm``. By default
  a function which searches through array is used.

``resultRenderer``
  A component which renders a single result. By default ``Result`` component is
  used.

``value``
  Initial value.

``onChange(value)``
  Callback which fires on change.

``onError(error)``
  Callback which fires on error.

Styling
-------

The following CSS classes are available to style React Autocomplete:

``react-autocomplete-Autocomplete``
  Autocomplete component.

``react-autocomplete-Autocomplete__search``
  Search input of autocomplete component.
  
``react-autocomplete-Autocomplete__results``
  Results of autocomplete component.

``react-autocomplete-Autocomplete--resultsShown``
  Autocomplete component when results are shown.

``react-autocomplete-Results``
  Results component.

``react-autocomplete-Result``
  Result component.

``react-autocomplete-Result--active``
  Result component when it has focus.

.. toctree::
   :maxdepth: 3
   :hidden:

   self
   examples/index

.. _React: http://facebook.github.io/react
.. _browserify: http://browserify.org
.. _webpack: http://webpack.github.io
