/**
 * @copyright 2015, Prometheus Research, LLC
 * @flow
 */

import type {AutocompleteResult} from './index';

import React from 'react';
import ReactDOM from 'react-dom';
import scrollIntoView from 'dom-scroll-into-view';
import Result from './Result';

type Props = {
  results: Array<AutocompleteResult>,
  focusedValue: ?AutocompleteResult,
  onSelect: AutocompleteResult => void,
  Result?: ReactClass<*>,
  Root?: ReactClass<*>,
};

export default class ResultList extends React.Component {
  props: Props;

  static stylesheet = {
    Root: 'ul',
    Result: Result,
  };

  render() {
    const {results, Root = this.constructor.stylesheet.Root, ...props} = this.props;
    return (
      <Root {...props} tabIndex={-1}>
        {results.map(this.renderResult, this)}
      </Root>
    );
  }

  renderResult(result: AutocompleteResult) {
    const {focusedValue, Result = this.constructor.stylesheet.Result} = this.props;
    const focus = focusedValue && focusedValue.id === result.id;
    return (
      <Result
        ref={focus ? 'focus' : undefined}
        key={result.id}
        result={result}
        focus={!!focus}
        onClick={this.props.onSelect}
      />
    );
  }

  componentDidMount() {
    this._scrollToFocused();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.focusedValue !== this.props.focusedValue) {
      this._scrollToFocused();
    }
  }

  _scrollToFocused() {
    let focus = this.refs && this.refs.focus;
    if (focus) {
      const container = ReactDOM.findDOMNode(this);
      const node = ReactDOM.findDOMNode(focus);
      scrollIntoView(node, container, {onlyScrollIfNeeded: true});
      if (node instanceof HTMLElement) {
        node.focus();
      }
    }
  }
}
