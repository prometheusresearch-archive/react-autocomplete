/**
 * @copyright 2015, Prometheus Research, LLC
 */

import autobind           from 'autobind-decorator';
import React, {PropTypes} from 'react';
import cx                 from 'classnames';
import ReactStylesheet    from '@prometheusresearch/react-stylesheet';

@ReactStylesheet
export default class Result extends React.Component {

  static propTypes = {
    focused: PropTypes.bool,
    style: PropTypes.object,
    styleOnActive: PropTypes.object,
    result: PropTypes.object,
    onClick: PropTypes.func,
    onMouseEnter: PropTypes.func,
  };

  static stylesheet = {
    Root: 'li'
  };

  render() {
    let {focused, style, styleOnActive, result, ...props} = this.props;
    let {Root} = this.stylesheet;
    let className = cx({
      'react-selectbox-Result': true,
      'react-selectbox-Result--active': this.props.focused
    });
    style = {
      ...style,
      ...(focused ? styleOnActive : null)
    };
    return (
      <Root
        state={{focus: focused}}
        className={className}
        onClick={this.onClick}
        onMouseEnter={this.onMouseEnter}>
        {this.props.result.title}
      </Root>
    );
  }

  shouldComponentUpdate(nextProps) {
    return (
      nextProps.result.id != this.props.result.id || // eslint-disable-line eqeqeq
      nextProps.focused !== this.props.focused
    );
  }

  @autobind
  onClick() {
    this.props.onClick(this.props.result);
  }

  @autobind
  onMouseEnter(e) {
    if (this.props.onMouseEnter) {
      this.props.onMouseEnter(e, this.props.result);
    }
  }

}
