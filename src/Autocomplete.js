/**
 * @copyright 2015, Prometheus Research, LLC
 */

import autobind           from 'autobind-decorator';
import React, {PropTypes} from 'react';
import debounce           from 'lodash/function/debounce';
import * as Stylesheet     from '@prometheusresearch/react-stylesheet';
import emptyFunction      from 'empty/function';
import Tether             from 'tether';
import Layer              from './Layer';
import ResultList         from './ResultList';

const KEYS = {
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ENTER: 'Enter',
  ESCAPE: 'Escape',
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


@Stylesheet.styleable
export default class Autocomplete extends React.Component {

  static propTypes = {

    /**
     * Option object is opaque to <Autocomplete /> component.
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
     * * `options` is the `options` prop passed to <Autocomplete />.
     * * `searchTerm` is the current value of input
     * * `cb` is a Node-style callback which should be used to return results
     *   back to <Autocomplete />
     */
    search: PropTypes.func,

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
    placeholder: PropTypes.string,
  };

  static defaultProps = {
    search: searchArray,
    onChange: emptyFunction,
    onClick: emptyFunction,
    onFocus: emptyFunction,
    onBlur: emptyFunction
  };

  static stylesheet = Stylesheet.createStylesheet({
    Root: {
      position: 'relative',
      outline: 'none',
    },
    Input: {
      Component: 'input',
      width: '100%',
    },
    ResultList: ResultList,
  });

  constructor(props) {
    super(props);

    this._list = null;
    this._search = null;

    this._ignoreFocus = false;
    this._tether = null;
    this._setOpenDebounced = debounce(this._setOpen, 0);
    this.state = {
      open: false,
      results: [],
      searchTerm: this._searchTermFromProps(this.props),
      value: this.props.value,
      focusedValue: null
    };
  }

  render() {
    let {placeholder, ...props} = this.props;
    let {Root, Input, ResultList} = this.stylesheet;
    let {open} = this.state;
    return (
      <Root
        {...props}
        value={undefined}
        search={undefined}
        onChange={undefined}
        onError={undefined}
        options={undefined}>
        <Input
          ref={this._onSearchRef}
          style={{width: '100%'}}
          onKeyDown={this._onQueryKeyDown}
          onClick={this._onClick}
          onFocus={this._onFocus}
          onBlur={this._onBlur}
          placeholder={placeholder}
          onChange={this._onQueryChange}
          value={this.state.searchTerm}
          />
        {open && this.state.results.length > 0 &&
          <Layer
            didMount={this._layerDidMount}
            didUpdate={this._layerDidUpdate}
            willUnmount={this._layerWillUnmount}>
            <ResultList
              ref={this._onListRef}
              onKeyDown={this._onQueryKeyDown}
              onFocus={this._onListFocus}
              onBlur={this._onListBlur}
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
      this.setState({
        searchTerm,
        value: nextProps.value
      });
    }
  }

  @autobind
  showResults(searchTerm) {
    this.setState({results: []});
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
  _onListRef(ref) {
    this._list = ref;
  }

  @autobind
  _onSearchRef(ref) {
    this._search = ref;
  }

  @autobind
  _onFocus(e) {
    if (!this._ignoreFocus && !this.state.open) {
      this.showAllResults();
    }
    this.props.onFocus(e); // eslint-disable-line react/prop-types
  }

  @autobind
  _onBlur(e) {
    if (!this._ignoreFocus) {
      this._close();
    }
    this.props.onBlur(e); // eslint-disable-line react/prop-types
  }

  @autobind
  _onListFocus() {
    if (!this._ignoreFocus) {
      this._open();
    }
  }

  @autobind
  _onListBlur() {
    if (!this._ignoreFocus) {
      this._close();
    }
  }

  @autobind
  _layerDidMount(element) {
    let target = React.findDOMNode(this._search);
    let size = target.getBoundingClientRect();
    element.style.width = `${size.width}px`;
    this._tether = new Tether({element, target, ...TETHER_CONFIG});
  }

  @autobind
  _layerDidUpdate() {
    this._tether.position();
  }

  @autobind
  _layerWillUnmount() {
    this._tether.disable();
    this._tether = null;
  }

  @autobind
  _setOpen(open) {
    this.setState(state => {
      state = {...state, open};
      if (!open) {
        if (state.value) {
          state = {...state, searchTerm: state.value.title};
        } else {
          state = {...state, searchTerm: ''};
        }
      }
      return state;
    });
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
  _focus() {
    this._ignoreFocus = true;
    React.findDOMNode(this._search).focus();
    this.setState({focusedValue: null});
    this._ignoreFocus = false;
  }

  @autobind
  _focusAndClose() {
    this._focus();
    this._close();
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
    this.setState({
      value: value,
      focusedValue: value,
      searchTerm: value ? value.title : this.state.searchTerm,
    }, this._focusAndClose);
    this.props.onChange(value);
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
    let nextState = {
      searchTerm: searchTerm,
      focusedValue: null
    };
    if (searchTerm === '') {
      nextState.value = null;
      this.props.onChange(null);
    }
    this.setState(nextState);
    this.showResults(searchTerm);
  }

  @autobind
  _onClick(e) {
    if (!this.state.open) {
      this.showAllResults();
    }
    this.props.onClick(e); // eslint-disable-line react/prop-types
  }

  @autobind
  _onQueryKeyDown(e) {
    let {open, focusedValue, results} = this.state;
    switch (e.key) {
    case KEYS.ENTER:
      e.preventDefault();
      this._onValueChange(focusedValue);
      break;
    case KEYS.ESCAPE:
      this._focusAndClose();
      break;
    case KEYS.ARROW_UP:
      if (!open) {
        break;
      }
      e.preventDefault();
      let prevIdx = Math.max(
        this._indexOfFocusedValue - 1,
        -1
      );
      if (prevIdx === -1) {
        this._focus();
      } else {
        this.setState({
          searchTerm: results[prevIdx].title,
          focusedValue: results[prevIdx],
        });
      }
      break;
    case KEYS.ARROW_DOWN:
      e.preventDefault();
      if (open) {
        let nextIdx = Math.min(
          this._indexOfFocusedValue + (open ? 1 : 0),
          results.length
        );
        if (nextIdx === results.length) {
          this._focus();
        } else {
          this.setState({
            searchTerm: results[nextIdx].title,
            focusedValue: results[nextIdx]
          });
        }
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
  return (
    (!a && !b) ||
    (a && b && a.id == b.id && a.title === b.title) // eslint-disable-line eqeqeq
  );
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
