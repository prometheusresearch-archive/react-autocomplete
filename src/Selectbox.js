/**
 * @copyright 2015, Prometheus Research, LLC
 */

import autobind           from 'autobind-decorator';
import React, {PropTypes} from 'react';
import debounce           from 'lodash/function/debounce';
import ReactStylesheet    from '@prometheusresearch/react-stylesheet';
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

@ReactStylesheet
export default class Selectbox extends React.Component {

  static propTypes = {

    /**
     * Option object is opaque to <Selectbox /> component.
     *
     * It is passed to `search` function (also passed as props) along with
     * the current `searchTerm` to return a list of results.
     *
     * The default `search` function expectds `options` to be an array of
     * objects with `title` attribute on which search is performed.
     */
    options: PropTypes.any,

    /**
     * Search function.
     *
     * It accepts three arguments: `options`, `searchTerm` and `cb`:
     *
     * * `options` is the `options` prop passed to <Selectbox />.
     * * `searchTerm` is the current value of input
     * * `cb` is a Node-style callback which should be used to return results
     *   back to <Selectbox />
     */
    search: PropTypes.func,

    /**
     * React component which is used to render a single result in result list.
     */
    resultRenderer: PropTypes.element,

    /**
     * Value.
     *
     * Should be an object with `title` attribute.
     */
    value: PropTypes.object,

    /**
     * Callback which is called when a result is being choosen.
     */
    onChange: PropTypes.func,

    /**
     * Callback which is called when the `search` function returns an error.
     */
    onError: PropTypes.func,

    /**
     * Input placeholder.
     */
    placeholder: PropTypes.string
  };

  static defaultProps = {
    search: searchArray,
    onFocus: emptyFunction,
    onBlur: emptyFunction
  };

  static stylesheet = {
    Root: {
      position: 'relative',
      outline: 'none',
    },
    Input: {
      Component: 'input',
      width: '100%',
    },
    ResultList: ResultList,
  };

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
    let {placeholder, resultRenderer, ...props} = this.props;
    let {open} = this.state;
    let {Root, Input, ResultList} = this.stylesheet;
    return (
      <Root
        {...props}
        value={undefined}
        search={undefined}
        onChange={undefined}
        onError={undefined}
        options={undefined}>
        <Input
          ref="search"
          style={{width: '100%'}}
          onFocus={this._onFocus}
          onBlur={this._onBlur}
          placeholder={placeholder}
          onChange={this._onQueryChange}
          onKeyDown={this._onQueryKeyDown}
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
              onSelect={this._onValueChange}
              results={this.state.results}
              focusedValue={this.state.focusedValue}
              />
          </Layer>}
      </Root>
    );
  }

  componentWillReceiveProps(nextProps) {
    if (!equalValue(nextProps.value, this.props.value)) {
      let searchTerm = this._searchTermFromProps(nextProps);
      this.setState({searchTerm});
    }
  }

  @autobind
  showResults(searchTerm) {
    this.props.search(
      this.props.options,
      searchTerm.trim(),
      this._onSearchComplete
    );
  }

  @autobind
  showAllResults() {
    this.showResults('');
    this._open();
  }

  @autobind
  _onResultFocus(value) {
    this.setState({focusedValue: value});
  }

  @autobind
  _onListFocus() {
    this._open();
  }

  @autobind
  _onListBlur() {
    this._close();
  }

  @autobind
  _layerDidMount(element) {
    let target = React.findDOMNode(this.refs.search);
    let size = target.getBoundingClientRect();
    element.style.width = `${size.width}px`;
    this._tether = new Tether({element, target, ...TETHER_CONFIG});
  }

  @autobind
  _setOpen(open) {
    this.setState({open});
  }

  @autobind
  _open() {
    this._setOpenDebounced(true);
  }

  @autobind
  _close() {
    this._setOpenDebounced(false);
  }

  @autobind
  _searchTermFromProps(props) {
    let {searchTerm, value} = props;
    if (!searchTerm && value) {
      searchTerm = value.title;
    }
    return searchTerm || '';
  }

  @autobind
  _onValueChange(value) {
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

  @autobind
  _onSearchComplete(err, results) {
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

  @autobind
  _onQueryChange(e) {
    let searchTerm = e.target.value;
    this.setState({
      searchTerm: searchTerm,
      focusedValue: null
    });
    this.showResults(searchTerm);
  }

  @autobind
  _onFocus(e) {
    this.showAllResults();
    this.props.onFocus(e); // eslint-disable-line react/prop-types
  }

  @autobind
  _onBlur(e) {
    this._close();
    this.props.onBlur(e); // eslint-disable-line react/prop-types
  }

  @autobind
  _onQueryKeyDown(e) {
    let {open, focusedValue, results} = this.state;
    switch (e.key) {
    case KEYS.ENTER:
      e.preventDefault();
      if (focusedValue) {
        this._onValueChange(focusedValue);
      }
      break;
    case KEYS.ARROW_UP:
      if (!open) {
        break;
      }
      e.preventDefault();
      let prevIdx = Math.max(
        this._indexOfFocusedValue - 1,
        0
      );
      this.setState({
        focusedValue: results[prevIdx]
      });
      break;
    case KEYS.ARROW_DOWN:
      e.preventDefault();
      if (open) {
        let nextIdx = Math.min(
          this._indexOfFocusedValue + (open ? 1 : 0),
          results.length - 1
        );
        this.setState({
          focusedValue: results[nextIdx]
        });
      } else {
        this.showAllResults();
      }
      break;
    default:
      break;
    }
  }

  get _indexOfFocusedValue() {
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
