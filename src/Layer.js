/**
 * @copyright 2015 Prometheus Research, LLC
 */

import emptyFunction      from 'empty/function';
import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';

export default class Layer extends React.Component {

  static propTypes = {
    didMount: PropTypes.func,
    didUpdate: PropTypes.func,
    willUnmount: PropTypes.func,
    children: PropTypes.node,
  };

  static defaultProps = {
    didMount: emptyFunction,
    didUpdate: emptyFunction,
    willUnmount: emptyFunction,
  };

  constructor(props) {
    super(props);
    this._element = null;
    this._component = null;
  }

  render() {
    return null;
  }

  componentDidMount() {
    this._element = this._createElement();
    this._component = ReactDOM.render(
      React.Children.only(this.props.children),
      this._element,
      this._didMount);
  }

  componentDidUpdate() {
    this._component = ReactDOM.render(
      React.Children.only(this.props.children),
      this._element,
      this._didUpdate);
  }

  componentWillUnmount() {
    this.props.willUnmount(this._element);
    ReactDOM.unmountComponentAtNode(this._element);
    document.body.removeChild(this._element);
    this._element = null;
    this._component = null;
  }

  _didMount = () => {
    this.props.didMount(this._element);
  }

  _didUpdate = () => {
    this.props.didUpdate(this._element);
  }

  _createElement() {
    let element = document.createElement('div');
    element.style.zIndex = '15000';
    document.body.appendChild(element);
    return element;
  }
}
