/**
 * @copyright 2015, Prometheus Research, LLC
 */

import React, {PropTypes} from 'react';
import debounce           from 'lodash/function/debounce';
import cx                 from 'classnames';
import emptyFunction      from 'empty/function';
import Tether             from 'tether';
import Layer              from './Layer';
import ResultList         from './ResultList';

const KEYS = {
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ENTER: 'Enter'
};

const TETHER_CONFIG = {
  attachment: 'top left',
  targetAttachment: 'bottom left',
  optimizations: {
    moveElement: false
  },
  constraints: [
    {
      to: 'window',
      attachment: 'together'
    }
  ]
};

export default class Selectbox extends React.Component {

  static propTypes = {
    options: PropTypes.any,
    search: PropTypes.func,
    resultRenderer: PropTypes.element,
    value: PropTypes.object,
    onChange: PropTypes.func,
    onError: PropTypes.func,

    className: PropTypes.string,
    placeholder: PropTypes.string,

    style: PropTypes.object,
    styleOnResultsShown: PropTypes.object,
    styleInput: PropTypes.object,
    styleResultList: PropTypes.object,
    styleResult: PropTypes.object,
    styleResultOnActive: PropTypes.object
  };

  static defaultProps = {
    search: searchArray,
    onFocus: emptyFunction,
    onBlur: emptyFunction
  };

  static style = {
    base: {
      position: 'relative',
      outline: 'none',
      boxSizing: 'border-box'
    },
    input: {
      width: '100%',
      boxSizing: 'border-box'
    },
  }

  constructor(props) {
    super(props);
    this._tether = null;
    this._setOpenDebounced = debounce(this._setOpen, 0);
    this.state = {
      open: false,
      results: [],
      searchTerm: this._searchTermFromProps(this.props),
      focusedValue: null
    };
  }

  render() {
    let {
      className, placeholder, resultRenderer,
      style, styleOnResultsShown, styleInput, styleResultList,
      styleResult, styleResultOnActive,
      ...props
    } = this.props;
    let {open} = this.state;
    className = cx(
      className,
      'react-selectbox-Selectbox',
      open ?
        'react-selectbox-Selectbox--resultsShown' :
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
        className={className}
        style={{
          ...style,
          ...(open ? styleOnResultsShown : null),
          ...this.constructor.style.base
        }}>
        <input
          ref="search"
          onFocus={this._onFocus}
          onBlur={this._onBlur}
          className="react-selectbox-Selectbox__search"
          placeholder={placeholder}
          onChange={this.onQueryChange}
          onKeyDown={this.onQueryKeyDown}
          style={{...styleInput, ...this.constructor.style.input}}
          value={this.state.searchTerm}
          />
        {open &&
          <Layer
            didMount={this._layerDidMount}
            didUpdate={this._layerDidUpdate}
            willUnmount={this._layerWillUnmount}>
            <ResultList
              onFocus={this._onListFocus}
              onBlur={this._onListBlur}
              onResultFocus={this._onResultFocus}
              className="react-selectbox-Selectbox__results"
              onSelect={this.onValueChange}
              results={this.state.results}
              focusedValue={this.state.focusedValue}
              renderer={resultRenderer}
              style={styleResultList}
              styleResult={styleResult}
              styleResultOnActive={styleResultOnActive}
              />
          </Layer>}
      </div>
    );
  }

  _onResultFocus = (value) => {
    this.setState({focusedValue: value});
  }

  _onListFocus = () => {
    this._open();
  }

  _onListBlur = () => {
    this._close();
  }

  componentWillReceiveProps(nextProps) {
    if (!equalValue(nextProps.value, this.props.value)) {
      let searchTerm = this._searchTermFromProps(nextProps);
      this.setState({searchTerm});
    }
  }

  _layerDidMount = (element) => {
    let target = React.findDOMNode(this.refs.search);
    this._tether = new Tether({element, target, ...TETHER_CONFIG});
  }

  _setOpen(open) {
    this.setState({open});
  }

  _open() {
    this._setOpenDebounced(true);
  }

  _close() {
    this._setOpenDebounced(false);
  }

  _searchTermFromProps(props) {
    let {searchTerm, value} = props;
    if (!searchTerm && value) {
      searchTerm = value.title;
    }
    return searchTerm || '';
  }

  /**
    * Show results for a search term value.
    *
    * This method doesn't update search term value itself.
    *
    * @param {Search} searchTerm
    */
  showResults = (searchTerm) => {
    this.props.search(
      this.props.options,
      searchTerm.trim(),
      this.onSearchComplete
    );
  }

  showAllResults = () => {
    this.showResults('');
    this._open();
  }

  onValueChange = (value) => {
    let state = {
      value: value,
      open: false
    };

    if (value) {
      state.searchTerm = value.title;
    }

    this.setState(state);

    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  onSearchComplete = (err, results) => {
    if (err) {
      if (this.props.onError) {
        this.props.onError(err);
      } else {
        throw err;
      }
    }

    this.setState({
      open: true,
      results: results
    });
  }

  onValueFocus = (value) => {
    this.setState({focusedValue: value});
  }

  onQueryChange = (e) => {
    let searchTerm = e.target.value;
    this.setState({
      searchTerm: searchTerm,
      focusedValue: null
    });
    this.showResults(searchTerm);
  }

  _onFocus = () => {
    this.showAllResults();
  }

  _onBlur = () => {
    this._close();
  }

  onQueryKeyDown = (e) => {

    if (e.key === KEYS.ENTER) {
      e.preventDefault();
      if (this.state.focusedValue) {
        this.onValueChange(this.state.focusedValue);
      }

    } else if (e.key === KEYS.ARROW_UP && this.state.open) {
      e.preventDefault();
      let prevIdx = Math.max(
        this.focusedValueIndex() - 1,
        0
      );
      this.setState({
        focusedValue: this.state.results[prevIdx]
      });

    } else if (e.key === KEYS.ARROW_DOWN) {
      e.preventDefault();
      if (this.state.open) {
        let nextIdx = Math.min(
          this.focusedValueIndex() + (this.state.open ? 1 : 0),
          this.state.results.length - 1
        );
        this.setState({
          focusedValue: this.state.results[nextIdx]
        });
      } else {
        this.showAllResults();
      }
    }
  }

  focusedValueIndex() {
    if (!this.state.focusedValue) {
      return -1;
    }
    for (let i = 0, len = this.state.results.length; i < len; i++) {
      if (this.state.results[i].id === this.state.focusedValue.id) {
        return i;
      }
    }
    return -1;
  }
}

function equalValue(a, b) {
  return a.id == b.id && a.title === b.title; // eslint-disable-line eqeqeq
}

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

  let results = [];

  for (let i = 0, len = options.length; i < len; i++) {
    if (searchTerm.exec(options[i].title)) {
      results.push(options[i]);
    }
  }

  cb(null, results);
}
