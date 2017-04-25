/**
 * @copyright 2015 Prometheus Research, LLC
 * @flow
 */

import invariant from 'invariant';
import React from 'react';
import ReactDOM from 'react-dom';

type Props = {
  didMount?: HTMLElement => void,
  didUpdate?: HTMLElement => void,
  willUnmount?: HTMLElement => void,
  children?: React.Element<*>,
};

export default class Layer extends React.Component {
  props: Props;

  _element: ?HTMLElement = null;
  _component: ?React.Component<any, any, any> = null;

  render() {
    return null;
  }

  componentDidMount() {
    this._element = this._createElement();
    this._component = ReactDOM.render(
      React.Children.only(this.props.children),
      this._element,
      this._didMount,
    );
  }

  componentDidUpdate() {
    this._component = ReactDOM.render(
      React.Children.only(this.props.children),
      this._element,
      this._didUpdate,
    );
  }

  componentWillUnmount() {
    const element = this._element;
    invariant(element != null, 'Invalid DOM state');
    if (this.props.willUnmount) {
      this.props.willUnmount(element);
    }
    ReactDOM.unmountComponentAtNode(element);
    if (document.body != null) {
      document.body.removeChild(element);
    }
    this._element = null;
    this._component = null;
  }

  _didMount = () => {
    if (this.props.didMount) {
      invariant(this._element != null, 'Invalid DOM state');
      this.props.didMount(this._element);
    }
  };

  _didUpdate = () => {
    if (this.props.didUpdate) {
      invariant(this._element != null, 'Invalid DOM state');
      this.props.didUpdate(this._element);
    }
  };

  _createElement() {
    const element = document.createElement('div');
    element.style.zIndex = '15000';
    if (document.body != null) {
      document.body.appendChild(element);
    }
    return element;
  }
}
