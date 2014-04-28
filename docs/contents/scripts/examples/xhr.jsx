/**
 * @jsx React.DOM
 */
(function() {
'use strict';

var AutocompleteRemote = React.createClass({

  _searchRemote: function(options, searchTerm, cb) {
    $.ajax({
      url: options.url,
      dataType: 'json',
      success: this._onXHRSuccess.bind(null, cb, searchTerm),
      error: this._onXHRError.bind(null, cb)
    });
  },

  _onXHRSuccess: function(cb, searchTerm, data, status, xhr) {
    cb(null, this._filterData(data, searchTerm));
  },

  _onXHRError: function(cb, xhr, status, err) {
    cb(err);
  },

  _filterData: function(data, searchTerm) {
    var regexp = new RegExp(searchTerm, 'i');
    var results = [];
    for (var i = 0, len = data.length; i < len; i++) {
      if (regexp.exec(data[i].title)) {
        results.push(data[i]);
      }
    }
    return results.slice(0, 100);
  },

  render: function() {
    return this.transferPropsTo(
      <ReactAutocomplete
        options={{url: this.props.url}}
        search={this._searchRemote}
        />
    );
  }
});

React.renderComponent(
  <AutocompleteRemote url="/react-autocomplete/scripts/data.js" />,
  document.getElementById('example')
);

})();
