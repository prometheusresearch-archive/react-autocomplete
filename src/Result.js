/**
 * @copyright 2015, Prometheus Research, LLC
 */

import autobind           from 'autobind-decorator';
import React, {PropTypes} from 'react';
import {attachStylesheet} from '@prometheusresearch/react-stylesheet';

let Stylesheet = {
  Root: 'li'
};

@attachStylesheet(Stylesheet)
export default class Result extends React.Component {

  static propTypes = {
    focus: PropTypes.bool,
    result: PropTypes.object,
    onClick: PropTypes.func,
    onMouseEnter: PropTypes.func,
  };

  render() {
    let {focus, result, stylesheet, ...props} = this.props;
    let {Root} = stylesheet;
    return (
      <Root
        tabIndex={-1}
        state={{focus: focus}}
        onClick={this._onClick}>
        {this.props.result.title}
      </Root>
    );
  }

  shouldComponentUpdate(nextProps) {
    return (
      nextProps.result.id != this.props.result.id || // eslint-disable-line eqeqeq
      nextProps.focus !== this.props.focus
    );
  }

  @autobind
  _onClick() {
    this.props.onClick(this.props.result);
  }

}
