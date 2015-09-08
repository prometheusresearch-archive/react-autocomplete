/**
 * @copyright 2015, Prometheus Research, LLC
 */

import autobind           from 'autobind-decorator';
import React, {PropTypes} from 'react';
import ReactStylesheet    from '@prometheusresearch/react-stylesheet';

@ReactStylesheet
export default class Result extends React.Component {

  static propTypes = {
    focus: PropTypes.bool,
    result: PropTypes.object,
    onClick: PropTypes.func,
    onMouseEnter: PropTypes.func,
  };

  static stylesheet = {
    Root: 'li'
  };

  render() {
    let {focus, result, ...props} = this.props;
    let {Root} = this.stylesheet;
    return (
      <Root
        state={{focus: focus}}
        onClick={this.onClick}
        onMouseEnter={this.onMouseEnter}>
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
