/**
 * @copyright 2015, Prometheus Research, LLC
 */

import autobind           from 'autobind-decorator';
import React, {PropTypes} from 'react';
import ReactStylesheet    from '@prometheusresearch/react-stylesheet';
import Result             from './Result';

@ReactStylesheet
export default class ResultList extends React.Component {

  static propTypes = {
    results: PropTypes.array,
    focusedValue: PropTypes.object,
    onResultFocus: PropTypes.func,
    onSelect: PropTypes.func,
  };

  static stylesheet = {
    Root: 'ul',
    Result: Result
  };

  constructor(props) {
    super(props);
    this._ignoreFocus = false;
  }

  render() {
    let {results, ...props} = this.props;
    let {Root} = this.stylesheet;
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
      <this.stylesheet.Result
        ref={focus ? 'focus' : undefined}
        key={result.id}
        result={result}
        focus={focus}
        onMouseEnter={this._onResultMouseEnter}
        onClick={this.props.onSelect}
        />
    );
  }

  componentDidUpdate() {
    this._scrollToFocused();
  }

  componentDidMount() {
    this._scrollToFocused(false);
  }

  @autobind
  _scrollToFocused(ignoreFocusOnScroll = true) {
    let focus = this.refs && this.refs.focus;
    if (focus) {
      let containerNode = React.findDOMNode(this);
      let scroll = containerNode.scrollTop;
      let height = containerNode.offsetHeight;

      let node = React.findDOMNode(focus);
      let top = node.offsetTop;
      let bottom = top + node.offsetHeight;

      // we update ignoreFocus to true if we change the scroll position so
      // the mouseover event triggered because of that won't have an
      // effect
      if (top < scroll) {
        this._ignoreFocus = ignoreFocusOnScroll;
        containerNode.scrollTop = top;
      } else if (bottom - scroll > height) {
        this._ignoreFocus = ignoreFocusOnScroll;
        containerNode.scrollTop = bottom - height;
      }
    }
  }

  @autobind
  _onResultMouseEnter(e, result) {
    // check if we need to prevent the next onFocus event because it was
    // probably caused by a mouseover due to scroll position change
    if (this._ignoreFocus) {
      this._ignoreFocus = false;
    } else {
      // we need to make sure focused node is visible
      // for some reason mouse events fire on visible nodes due to
      // box-shadow
      let containerNode = React.findDOMNode(this);
      let scroll = containerNode.scrollTop;
      let height = containerNode.offsetHeight;

      let node = e.target;
      let top = node.offsetTop;
      let bottom = top + node.offsetHeight;

      if (bottom > scroll && top < scroll + height) {
        this.props.onResultFocus(result);
      }
    }
  }
}
