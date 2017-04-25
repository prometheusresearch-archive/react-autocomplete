/**
 * @copyright 2015, Prometheus Research, LLC
 * @flow
 */

import type {AutocompleteResult} from './index';

import invariant from 'invariant';
import React from 'react';
import ReactDOM from 'react-dom';
import debounce from 'lodash/function/debounce';
import Tether from 'tether';
import Layer from './Layer';
import ResultList from './ResultList';

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
    moveElement: false,
  },
  constraints: [
    {
      to: 'window',
      attachment: 'together',
    },
  ],
};

type Props = {
  /**
   * Option object is opaque to <Autocomplete /> component.
   *
   * It is passed to `search` function (also passed as props) along with
   * the current `searchTerm` to return a list of results.
   *
   * The default `search` function expectds `options` to be an array of
   * objects with `title` attribute on which search is performed.
   */
  options: any,

  searchTerm?: string,

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
  search: (
    options: any,
    searchTerm: string,
    cb: (err: ?Error, results: Array<AutocompleteResult>) => void,
  ) => void,

  /**
   * Value.
   *
   * Should be an object with `title` attribute.
   */
  value?: AutocompleteResult,

  /**
   * Callback which is called when a result is being choosen.
   */
  onChange?: ?AutocompleteResult => void,

  /**
   * Callback which is called when the `search` function returns an error.
   */
  onError?: Error => void,

  /**
   * Standard focus event.
   */
  onFocus?: UIEvent => void,

  /**
   * Standard blur event.
   */
  onBlur?: UIEvent => void,

  /**
   * Standard click event.
   */
  onClick?: MouseEvent => void,

  /**
   * Input placeholder.
   */
  placeholder: string,

  Root: ReactClass<*>,
  Input: ReactClass<*>,
  ResultList: ReactClass<*>,
};

export default class Autocomplete extends React.Component {
  props: Props;

  static defaultProps = {
    search: searchArray,
  };

  static stylesheet = {
    Root: 'div',
    Input: 'input',
    ResultList: ResultList,
  };

  state: {
    open: boolean,
    results: Array<AutocompleteResult>,
    searchTerm: string,
    value: ?AutocompleteResult,
    focusedValue: ?AutocompleteResult,
  };

  _isMounted: boolean = false;
  _list: ?HTMLElement = null;
  _search: ?HTMLElement = null;
  _ignoreFocus: boolean = false;
  _tether: any = null;
  _setOpenDebounced: boolean => void;

  constructor(props: Props) {
    super(props);

    this._setOpenDebounced = debounce(this._setOpen, 0);
    this.state = {
      open: false,
      results: [],
      searchTerm: this._searchTermFromProps(this.props),
      value: this.props.value,
      focusedValue: null,
    };
  }

  render() {
    const {stylesheet} = this.constructor;
    const {
      placeholder,
      Root = stylesheet.Root,
      Input = stylesheet.Input,
      ResultList = stylesheet.ResultList,
      ...props
    } = this.props;
    const {open, searchTerm} = this.state;
    return (
      <Root
        style={{position: 'relative', outline: 'none'}}
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
          value={searchTerm}
        />
        {open &&
          this.state.results.length > 0 &&
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

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentWillReceiveProps(nextProps: Props) {
    if (!equalValue(nextProps.value, this.props.value)) {
      let searchTerm = this._searchTermFromProps(nextProps);
      this.setState({
        searchTerm,
        value: nextProps.value,
      });
    }
  }

  showResults = (searchTerm: string) => {
    this.setState({results: []});
    this.props.search(this.props.options, searchTerm.trim(), this._onSearchComplete);
  };

  showResultsAndOpen = () => {
    this.showResults(this.state.searchTerm);
    this._open();
  };

  _onListRef = (ref: any) => {
    this._list = ref;
  };

  _onSearchRef = (ref: any) => {
    this._search = ref;
  };

  _onFocus = (e: UIEvent) => {
    if (!this._ignoreFocus && !this.state.open) {
      this.showResultsAndOpen();
    }
    if (this.props.onFocus) {
      this.props.onFocus(e);
    }
  };

  _onBlur = (e: UIEvent) => {
    if (!this._ignoreFocus) {
      this._close();
    }
    if (this.props.onBlur) {
      this.props.onBlur(e);
    }
  };

  _onListFocus = () => {
    if (!this._ignoreFocus) {
      this._open();
    }
  };

  _onListBlur = () => {
    if (!this._ignoreFocus) {
      this._close();
    }
  };

  _layerDidMount = (element: HTMLElement) => {
    const target = ReactDOM.findDOMNode(this._search);
    invariant(target instanceof HTMLElement, 'Invalid DOM state');
    const size = target.getBoundingClientRect();
    element.style.width = `${size.width}px`;
    this._tether = new Tether({element, target, ...TETHER_CONFIG});
  };

  _layerDidUpdate = () => {
    this._tether.position();
  };

  _layerWillUnmount = () => {
    this._tether.disable();
    this._tether = null;
  };

  _setOpen = (open: boolean) => {
    if (!this._isMounted) {
      return;
    }
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
  };

  focus() {
    if (this._search != null) {
      this._search.focus();
    }
  }

  _open = () => {
    this._setOpenDebounced(true);
  };

  _close = () => {
    this._setOpenDebounced(false);
  };

  _focus = () => {
    this._ignoreFocus = true;
    const searchElement = ReactDOM.findDOMNode(this._search);
    invariant(searchElement instanceof HTMLElement, 'Invalid DOM state');
    searchElement.focus();
    this.setState({focusedValue: null});
    this._ignoreFocus = false;
  };

  _focusAndClose = () => {
    this._focus();
    this._close();
  };

  _searchTermFromProps = (props: Props) => {
    let {searchTerm, value} = props;
    if (!searchTerm && value) {
      searchTerm = value.title;
    }
    return searchTerm || '';
  };

  _onValueChange = (value: ?AutocompleteResult) => {
    this.setState(
      {
        value: value,
        focusedValue: value,
        searchTerm: value ? value.title : this.state.searchTerm,
      },
      this._focusAndClose,
    );
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  };

  _onSearchComplete = (err: ?Error, results: Array<AutocompleteResult>) => {
    if (err) {
      if (this.props.onError) {
        this.props.onError(err);
      } else {
        throw err;
      }
    }

    this.setState({
      open: true,
      results: results,
    });
  };

  _onQueryChange = (e: UIEvent & {target: HTMLInputElement}) => {
    const searchTerm = e.target.value;
    if (searchTerm === '') {
      this.setState({
        searchTerm: searchTerm,
        focusedValue: null,
        value: null,
      });
      if (this.props.onChange) {
        this.props.onChange(null);
      }
    } else {
      this.setState({
        searchTerm: searchTerm,
        focusedValue: null,
      });
    }
    this.showResults(searchTerm);
  };

  _onClick = (e: MouseEvent) => {
    if (!this.state.open) {
      this.showResultsAndOpen();
    }
    if (this.props.onClick) {
      this.props.onClick(e);
    }
  };

  _onQueryKeyDown = (e: KeyboardEvent) => {
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
        let prevIdx = Math.max(this._indexOfFocusedValue - 1, -1);
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
            results.length,
          );
          if (nextIdx === results.length) {
            this._focus();
          } else {
            this.setState({
              searchTerm: results[nextIdx].title,
              focusedValue: results[nextIdx],
            });
          }
        } else {
          this.showResultsAndOpen();
        }
        break;
      default:
        break;
    }
  };

  get _indexOfFocusedValue(): number {
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
    (!a && !b) || (a && b && a.id == b.id && a.title === b.title) // eslint-disable-line eqeqeq
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
