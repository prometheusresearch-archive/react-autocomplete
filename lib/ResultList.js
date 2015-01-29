/**
 * @copyright 2015, Prometheus Research, LLC
 */
'use strict';

var React     = require('react/addons');
var PropTypes = React.PropTypes;
var cx        = React.addons.classSet;

var Result = React.createClass({

  render() {
    var {focused, style, styleOnActive, result, ...props} = this.props;
    var className = cx({
      'react-selectbox-Result': true,
      'react-selectbox-Result--active': this.props.focused
    });
    style = {
      ...style,
      ...(focused ? styleOnActive : null)
    };
    return (
      <li
        style={style}
        className={className}
        onClick={this.onClick}
        onMouseEnter={this.onMouseEnter}>
        <a>{this.props.result.title}</a>
      </li>
    );
  },

  onClick() {
    this.props.onClick(this.props.result);
  },

  onMouseEnter(e) {
    if (this.props.onMouseEnter) {
      this.props.onMouseEnter(e, this.props.result);
    }
  },

  shouldComponentUpdate(nextProps) {
    return (
      nextProps.result.id != this.props.result.id ||
      nextProps.focused !== this.props.focused
    );
  }
});


var ResultList = React.createClass({

  render() {
    var {show, results, style, styleResult, className, ...props} = this.props;
    style = {
      ...style,
      display: show ? 'block' : 'none',
      position: 'absolute',
      listStyleType: 'none',
      boxSizing: 'border-box'
    };
    className = cx('react-selectbox-ResultList', className);
    return (
      <ul {...props} style={style} className={className}>
        {results.map(this.renderResult)}
      </ul>
    );
  },

  renderResult(result) {
    var focused = (
      this.props.focusedValue &&
      this.props.focusedValue.id === result.id
    );
    return React.createElement(this.props.renderer, {
      ref: focused ? "focused" : undefined,
      key: result.id,
      style: this.props.styleResult,
      styleOnActive: this.props.styleResultOnActive,
      result: result,
      focused: focused,
      onMouseEnter: this.onMouseEnterResult,
      onClick: this.props.onSelect
    });
  },

  getDefaultProps() {
    return {renderer: Result};
  },

  componentDidUpdate() {
    this.scrollToFocused();
  },

  componentDidMount() {
    this.scrollToFocused();
  },

  componentWillMount() {
    this.ignoreFocus = false;
  },

  scrollToFocused() {
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

  onMouseEnterResult(e, result) {
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

module.exports = ResultList;
module.exports.Result = Result;
