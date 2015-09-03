/**
 * @copyright 2015, Prometheus Research, LLC
 */

import autobind           from 'autobind-decorator';
import React, {PropTypes} from 'react';
import cx                 from 'classnames';
import Result             from './Result';

export default class ResultList extends React.Component {

  static propTypes = {
    results: PropTypes.array,
    style: PropTypes.object,
    styleResult: PropTypes.object,
    styleResultOnActive: PropTypes.object,
    className: PropTypes.string,
    focusedValue: PropTypes.object,
    onResultFocus: PropTypes.func,
    onSelect: PropTypes.func,
    renderer: PropTypes.func,
  };

  static defaultProps = {
    renderer: Result
  };

  render() {
    let {results, style, styleResult, className, ...props} = this.props;
    style = {
      ...style,
      display: 'block',
      position: 'absolute',
      listStyleType: 'none',
      boxSizing: 'border-box'
    };
    className = cx('react-selectbox-ResultList', className);
    return (
      <ul {...props} tabIndex={-1} style={style} className={className}>
        {results.map(this.renderResult, this)}
      </ul>
    );
  }

  renderResult(result) {
    let focused = (
      this.props.focusedValue &&
      this.props.focusedValue.id === result.id
    );
    return React.createElement(this.props.renderer, {
      ref: focused ? 'focused' : undefined,
      key: result.id,
      style: this.props.styleResult,
      styleOnActive: this.props.styleResultOnActive,
      result: result,
      focused: focused,
      onMouseEnter: this._onResultMouseEnter,
      onClick: this.props.onSelect
    });
  }

  componentDidUpdate() {
    this._scrollToFocused();
  }

  componentDidMount() {
    this._scrollToFocused();
  }

  componentWillMount() {
    this._ignoreFocus = false;
  }

  @autobind
  _scrollToFocused() {
    let focused = this.refs && this.refs.focused;
    if (focused) {
      let containerNode = React.findDOMNode(this);
      let scroll = containerNode.scrollTop;
      let height = containerNode.offsetHeight;

      let node = React.findDOMNode(focused);
      let top = node.offsetTop;
      let bottom = top + node.offsetHeight;

      // we update ignoreFocus to true if we change the scroll position so
      // the mouseover event triggered because of that won't have an
      // effect
      if (top < scroll) {
        this._ignoreFocus = true;
        containerNode.scrollTop = top;
      } else if (bottom - scroll > height) {
        this._ignoreFocus = true;
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
