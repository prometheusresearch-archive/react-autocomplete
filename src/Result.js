/**
 * @copyright 2015, Prometheus Research, LLC
 * @flow
 */

import type {AutocompleteResult} from './index';

import React from 'react';

type Props = {
  focus: boolean,
  result: AutocompleteResult,
  onClick: AutocompleteResult => void,
  Root?: ReactClass<*>,
};

export default class Result extends React.Component {
  props: Props;

  static stylesheet = {
    Root: 'li',
  };

  render() {
    const {focus, result, Root = this.constructor.stylesheet.Root} = this.props;
    return (
      <Root
        style={{cursor: 'pointer'}}
        tabIndex={-1}
        state={{focus: focus}}
        onClick={this._onClick}>
        {result.title}
      </Root>
    );
  }

  shouldComponentUpdate(nextProps: Props) {
    const {result, focus, Root} = this.props;
    return (
      nextProps.result.id != result.id || // eslint-disable-line eqeqeq
      nextProps.result.title !== result.title ||
      nextProps.focus !== focus ||
      nextProps.Root !== Root
    );
  }

  _onClick = () => {
    this.props.onClick(this.props.result);
  };
}
