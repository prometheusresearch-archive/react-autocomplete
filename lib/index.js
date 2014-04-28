/**
 * @jsx React.DOM
 */
'use strict';

var React   = require('react');
var cx      = require('react/lib/cx');

var Autocomplete = React.createClass({

  propTypes: {
    options: React.PropTypes.any,
    search: React.PropTypes.func,
    resultRenderer: React.PropTypes.oneOfType([
      React.PropTypes.component,
      React.PropTypes.func
    ]),
    value: React.PropTypes.object,
    onChange: React.PropTypes.func,
    onError: React.PropTypes.func
  },

  getDefaultProps: function() {
    return {search: searchArray};
  },

  getInitialState: function() {
    var searchTerm = this.props.searchTerm ?
      this.props.searchTerm :
      this.props.value ?
      this.props.value.title :
      '';
    return {
      results: [],
      showResults: false,
      showResultsInProgress: false,
      searchTerm: searchTerm,
      focusedValue: null
    };
  },

  render: function() {
    var className = cx(
      this.props.className,
      'react-autocomplete',
      this.state.showResults ?
        'react-autocomplete-results-shown' :
        undefined
    );
    var style = {
      position: 'relative',
      outline: 'none'
    };
    return (
      <div
        tabIndex="1"
        className={className}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        style={style}>
        <input
          ref="search"
          className="react-autocomplete-search"
          onClick={this.showAllResults}
          onChange={this.onQueryChange}
          onFocus={this.showAllResults}
          onBlur={this.onQueryBlur}
          onKeyDown={this.onQueryKeyDown}
          value={this.state.searchTerm}
          />
        <Results
          onSelect={this.onValueChange}
          onFocus={this.onValueFocus}
          results={this.state.results}
          focusedValue={this.state.focusedValue}
          show={this.state.showResults}
          renderer={this.props.resultRenderer}
          />
      </div>
    );
  },

  componentWillReceiveProps: function(nextProps) {
    var searchTerm = nextProps.searchTerm ?
      nextProps.searchTerm :
      nextProps.value ?
      nextProps.value.title :
      '';
    this.setState({searchTerm: searchTerm});
  },

  componentWillMount: function() {
    this.blurTimer = null;
  },

  /**
    * Show results for a search term value.
    *
    * This method doesn't update search term value itself.
    *
    * @param {Search} searchTerm
    */
  showResults: function(searchTerm) {
    this.setState({showResultsInProgress: true});
    this.props.search(
      this.props.options,
      searchTerm.trim(),
      this.onSearchComplete
    );
  },

  showAllResults: function() {
    if (!this.state.showResultsInProgress && !this.state.showResults) {
      this.showResults('');
    }
  },

  onValueChange: function(value) {
    var state = {
      value: value,
      showResults: false
    };

    if (value) {
      state.searchTerm = value.title;
    }

    this.setState(state);

    if (this.props.onChange) {
      this.props.onChange(value);
    }
  },

  onSearchComplete: function(err, results) {
    if (err) {
      if (this.props.onError) {
        this.props.onError(err);
      } else {
        throw err;
      }
    }

    this.setState({
      showResultsInProgress: false,
      showResults: true,
      results: results
    });
  },

  onValueFocus: function(value) {
    this.setState({focusedValue: value});
  },

  onQueryChange: function(e) {
    var searchTerm = e.target.value;
    this.setState({
      searchTerm: searchTerm,
      focusedValue: null
    });
    this.showResults(searchTerm);
  },

  onFocus: function() {
    if (this.blurTimer) {
      clearTimeout(this.blurTimer);
      this.blurTimer = null;
    }
    this.refs.search.getDOMNode().focus();
  },

  onBlur: function() {
    // wrap in setTimeout so we can catch a click on results
    this.blurTimer = setTimeout(() => {
      if (this.isMounted()) {
        this.setState({showResults: false});
      }
    }, 100);
  },

  onQueryKeyDown: function(e) {

    if (e.key === 'Enter') {
      e.preventDefault();
      if (this.state.focusedValue) {
        this.onValueChange(this.state.focusedValue);
      }

    } else if (e.key === 'ArrowUp' && this.state.showResults) {
      e.preventDefault();
      var prevIdx = Math.max(
        this.focusedValueIndex() - 1,
        0
      );
      this.setState({
        focusedValue: this.state.results[prevIdx]
      });

    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.state.showResults) {
        var nextIdx = Math.min(
          this.focusedValueIndex() + (this.state.showResults ? 1 : 0),
          this.state.results.length - 1
        );
        this.setState({
          showResults: true,
          focusedValue: this.state.results[nextIdx]
        });
      } else {
        this.showAllResults();
      }
    }
  },

  focusedValueIndex: function() {
    if (!this.state.focusedValue) {
      return -1;
    }
    for (var i = 0, len = this.state.results.length; i < len; i++) {
      if (this.state.results[i].id === this.state.focusedValue.id) {
        return i;
      }
    }
    return -1;
  }
});

var Results = React.createClass({

  render: function() {
    var style = {
      display: this.props.show ? 'block' : 'none',
      position: 'absolute'
    };

    return this.transferPropsTo(
      <ul style={style} className="react-autocomplete-results">
        {this.props.results.map(this.renderResult)}
      </ul>
    );
  },

  renderResult: function(result) {
    var focused = this.props.focusedValue &&
                  this.props.focusedValue.id === result.id;
    return this.props.renderer({
      ref: focused ? "focused" : undefined,
      key: result.id,
      result: result,
      focused: focused,
      onMouseEnter: this.onMouseEnterResult,
      onClick: this.props.onSelect
    });
  },

  getDefaultProps: function() {
    return {renderer: Result};
  },

  componentDidUpdate: function() {
    this.scrollToFocused();
  },

  componentDidMount: function() {
    this.scrollToFocused();
  },

  componentWillMount: function() {
    this.ignoreFocus = false;
  },

  scrollToFocused: function() {
    var focused = this.refs && this.refs.focused;
    if (focused) {
      var containerNode = this.getDOMNode();
      var scroll = containerNode.scrollTop;
      var height = containerNode.offsetHeight;

      var node = focused.getDOMNode();
      var top = node.offsetTop;
      var bottom = top + node.offsetHeight;

      // we update ignoreFocus to true if we change the scroll position so
      // the mouseover event triggered because of that won't have an
      // effect
      if (top < scroll) {
        this.ignoreFocus = true;
        containerNode.scrollTop = top;
      } else if (bottom - scroll > height) {
        this.ignoreFocus = true;
        containerNode.scrollTop = bottom - height;
      }
    }
  },

  onMouseEnterResult: function(e, result) {
    // check if we need to prevent the next onFocus event because it was
    // probably caused by a mouseover due to scroll position change
    if (this.ignoreFocus) {
      this.ignoreFocus = false;
    } else {
      // we need to make sure focused node is visible
      // for some reason mouse events fire on visible nodes due to
      // box-shadow
      var containerNode = this.getDOMNode();
      var scroll = containerNode.scrollTop;
      var height = containerNode.offsetHeight;

      var node = e.target;
      var top = node.offsetTop;
      var bottom = top + node.offsetHeight;

      if (bottom > scroll && top < scroll + height) {
        this.props.onFocus(result);
      }
    }
  }
});

var Result = React.createClass({

  render: function() {
    var className = "react-autocomplete-result";

    if (this.props.focused) {
      className += " react-autocomplete-result-active";
    }

    return (
      <li
        className={className}
        onClick={this.onClick}
        onMouseEnter={this.onMouseEnter}>
        <a>{this.props.result.title}</a>
      </li>
    );
  },

  onClick: function() {
    this.props.onClick(this.props.result);
  },

  onMouseEnter: function(e) {
    if (this.props.onMouseEnter) {
      this.props.onMouseEnter(e, this.props.result);
    }
  },

  shouldComponentUpdate: function(nextProps) {
    return (nextProps.result.id !== this.props.result.id ||
            nextProps.focused !== this.props.focused);
  }
});

/**
* Search options using specified search term treating options as an array
* of candidates.
*
* @param {Array.<Object>} options
* @param {String} searchTerm
* @param {Callback} cb
*/
function searchArray(options, searchTerm, cb) {
  if (!options) {
    return cb(null, []);
  }

  searchTerm = new RegExp(searchTerm, 'i');

  var results = [];

  for (var i = 0, len = options.length; i < len; i++) {
    if (searchTerm.exec(options[i].title)) {
      results.push(options[i]);
    }
  }

  cb(null, results);
}

module.exports = Autocomplete;
