/**
 * @copyright 2015, Prometheus Research, LLC
 */

import React, {PropTypes} from 'react';
import scrollIntoView     from 'dom-scroll-into-view';
import * as Stylesheet    from 'react-stylesheet';
import {style as styleHostComponent} from 'react-dom-stylesheet';
import Result             from './Result';

export default class ResultList extends React.Component {

  static propTypes = {
    results: PropTypes.array,
    focusedValue: PropTypes.object,
    onSelect: PropTypes.func,
  };

  static stylesheet = Stylesheet.create({
    Root: 'ul',
    Result: Result
  }, {styleHostComponent});

  render() {
    let {results, ...props} = this.props;
    let {Root} = this.constructor.stylesheet;
    return (
      <Root {...props} tabIndex={-1}>
        {results.map(this.renderResult, this)}
      </Root>
    );
  }

  renderResult(result) {
    let focus = (
      this.props.focusedValue &&
      this.props.focusedValue.id === result.id
    );
    return (
      <this.constructor.stylesheet.Result
        ref={focus ? 'focus' : undefined}
        key={result.id}
        result={result}
        focus={focus}
        onClick={this.props.onSelect}
        />
    );
  }

  componentDidMount() {
    this._scrollToFocused();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.focusedValue !== this.props.focusedValue) {
      this._scrollToFocused();
    }
  }

  _scrollToFocused() {
    let focus = this.refs && this.refs.focus;
    if (focus) {
      let container = React.findDOMNode(this);
      let node = React.findDOMNode(focus);
      scrollIntoView(node, container, {onlyScrollIfNeeded: true});
      node.focus();
    }
  }
}
