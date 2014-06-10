XHR-backed Autocomplete
=======================
asda

This example showcases ``AutocompleteRemote`` which is made on top of
``Autocomplete`` and fetches its options from a remote source.

Require needed components and functions first:

.. jsx::

  var $ = require('jquery')
  var React = require('react')
  var Autocomplete = require('react-autocomplete')

.. jsx::

  var AutocompleteRemote = React.createClass({

    render: function() {
      return this.transferPropsTo(
        <Autocomplete
          options={{url: this.props.url}}
          search={this._searchRemote}
          />
      )
    },

    _searchRemote: function(options, searchTerm, cb) {
      $.ajax({
        url: options.url,
        dataType: 'json',
        success: this._onXHRSuccess.bind(null, cb, searchTerm),
        error: this._onXHRError.bind(null, cb)
      })
    },

    _onXHRSuccess: function(cb, searchTerm, data, status, xhr) {
      cb(null, this._filterData(data, searchTerm))
    },

    _onXHRError: function(cb, xhr, status, err) {
      cb(err)
    },

    _filterData: function(data, searchTerm) {
      var regexp = new RegExp(searchTerm, 'i')
      var results = []
      for (var i = 0, len = data.length; i < len; i++) {
        if (regexp.exec(data[i].title)) {
          results.push(data[i])
        }
      }
      return results.slice(0, 100)
    }
  })

And finally:

.. jsx::

  React.renderComponent(
    <AutocompleteRemote url="../_static/data.js" />,
    document.getElementById('example')
  );


.. raw:: html

  <div id="example"><div>

.. note::
  :class: inline

  In this example search is implemented in browser but in real-world app, you
  would want to return items only relevant to a current autocomplete search query.
