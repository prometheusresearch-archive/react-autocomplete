/**
 * @copyright 2015, Prometheus Research, LLC
 */
'use strict';

var React         = require('react/addons');
var PropTypes     = React.PropTypes;
var cx            = React.addons.classSet;
var ResultList    = require('./ResultList');
var emptyFunction = require('./emptyFunction');

var Autocomplete = React.createClass({

  propTypes: {
    options: PropTypes.any,
    search: PropTypes.func,
    resultRenderer: PropTypes.oneOfType([
      PropTypes.component,
      PropTypes.func
    ]),
    value: PropTypes.object,
    onChange: PropTypes.func,
    onError: PropTypes.func,

    style: PropTypes.object,
    styleOnResultsShown: PropTypes.object,
    styleInput: PropTypes.object,
    styleResultList: PropTypes.object,
    styleResult: PropTypes.object
  },

  render() {
    var {
      className, placeholder, resultRenderer,
      style, styleOnResultsShown, styleInput, styleResultList,
      styleResult, styleResultOnActive,
      ...props
    } = this.props;
    var {showResults} = this.state;
    style = {
      ...style,
      ...(showResults ? styleOnResultsShown : null),
      position: 'relative',
      outline: 'none'
    };
    styleInput = {
      ...styleInput,
      width: '100%'
    };
    className = cx(
      className,
      'react-autocomplete-Autocomplete',
      showResults ?
        'react-autocomplete-Autocomplete--resultsShown' :
        null
    );
    return (
      <div
        {...props}
        value={undefined}
        search={undefined}
        onChange={undefined}
        onError={undefined}
        options={undefined}
        tabIndex="1"
        className={className}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        style={style}>
        <input
          ref="search"
          className="react-autocomplete-Autocomplete__search"
          placeholder={placeholder}
          onClick={this.showAllResults}
          onChange={this.onQueryChange}
          onFocus={this.showAllResults}
          onBlur={this.onQueryBlur}
          onKeyDown={this.onQueryKeyDown}
          style={styleInput}
          value={this.state.searchTerm}
          />
        <ResultList
          className="react-autocomplete-Autocomplete__results"
          onSelect={this.onValueChange}
          onFocus={this.onValueFocus}
          results={this.state.results}
          focusedValue={this.state.focusedValue}
          show={this.state.showResults}
          renderer={resultRenderer}
          style={styleResultList}
          styleResult={styleResult}
          styleResultOnActive={styleResultOnActive}
          />
      </div>
    );
  },

  getDefaultProps() {
    return {
      search: searchArray,
      onFocus: emptyFunction,
      onBlur: emptyFunction
    };
  },

  getInitialState() {
    return {
      results: [],
      showResults: false,
      showResultsInProgress: false,
      searchTerm: this.getSearchTerm(this.props),
      focusedValue: null
    };
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.value.id != this.props.value.id) {
      var searchTerm = this.getSearchTerm(nextProps);
      this.setState({searchTerm});
    }
  },

  componentWillMount() {
    this.blurTimer = null;
  },

  getSearchTerm(props) {
    var searchTerm;
    if (props.searchTerm) {
      searchTerm = props.searchTerm;
    } else if (props.value) {
      var {id, title} = props.value;
      if (title) {
        searchTerm = title;
      } else if (id) {
        props.options.forEach((opt) => {
          if (opt.id == id) {
            searchTerm = opt.title;
          }
        });
      }
    }
    return searchTerm || '';
  },

  /**
    * Show results for a search term value.
    *
    * This method doesn't update search term value itself.
    *
    * @param {Search} searchTerm
    */
  showResults(searchTerm) {
    this.setState({showResultsInProgress: true});
    this.props.search(
      this.props.options,
      searchTerm.trim(),
      this.onSearchComplete
    );
  },

  showAllResults() {
    if (!this.state.showResultsInProgress && !this.state.showResults) {
      this.showResults('');
    }
  },

  onValueChange(value) {
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

  onSearchComplete(err, results) {
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

  onValueFocus(value) {
    this.setState({focusedValue: value});
  },

  onQueryChange(e) {
    var searchTerm = e.target.value;
    this.setState({
      searchTerm: searchTerm,
      focusedValue: null
    });
    this.showResults(searchTerm);
  },

  onFocus() {
    if (this.blurTimer) {
      clearTimeout(this.blurTimer);
      this.blurTimer = null;
    }
    this.refs.search.getDOMNode().focus();
    this.props.onFocus();
  },

  onBlur() {
    // wrap in setTimeout so we can catch a click on results
    this.blurTimer = setTimeout(() => {
      if (this.isMounted()) {
        this.setState({showResults: false});
      }
    }, 100);
    this.props.onBlur();
  },

  onQueryKeyDown(e) {

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

  focusedValueIndex() {
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
