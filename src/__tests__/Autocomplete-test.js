/**
 * @copyright 2015, Prometheus Research, LLC
 */

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react/lib/ReactTestUtils';
import forEach from 'lodash/collection/forEach';
import Autocomplete from '../Autocomplete';

import options from './fixture.json';

describe('Autocomplete', function() {
  let component;
  let element;
  let search;

  function mount() {
    component = TestUtils.renderIntoDocument(<Autocomplete options={options} />);
    element = ReactDOM.findDOMNode(component);
  }

  function unmount() {
    if (element.parentNode) {
      ReactDOM.unmountComponentAtNode(element.parentNode);
    }
  }

  function click(component) {
    TestUtils.SimulateNative.click(ReactDOM.findDOMNode(component));
  }

  function focus(component) {
    TestUtils.SimulateNative.focus(ReactDOM.findDOMNode(component));
  }

  function blur(component) {
    TestUtils.SimulateNative.blur(ReactDOM.findDOMNode(component));
  }

  function change(component, value) {
    let node = ReactDOM.findDOMNode(component);
    node.value = value;
    TestUtils.Simulate.change(node);
  }

  beforeEach(mount);
  afterEach(unmount);

  it('opens on focus', function(done) {
    assert(component._list === null);
    focus(component._search);
    setTimeout(function() {
      assert(component._list !== null);
      done();
    });
  });

  it('closes on blur', function(done) {
    focus(component._search);
    blur(component._search);
    setTimeout(function() {
      assert(component._list === null);
      done();
    }, 0);
  });

  it('does not close on focus then blur in the same tick', function(done) {
    focus(component._search);
    assert(component._list !== null);
    focus(component._list);
    setTimeout(function() {
      assert(component._list !== null);
      done();
    }, 0);
  });

  it('opens on click', function() {
    click(component._search);
    assert(component._list !== null);
  });

  it('shows an entire list of options when openned', function() {
    click(component._search);
    assert(component._list !== null);
    let items = ReactDOM.findDOMNode(component._list).querySelectorAll('li');
    assert(items.length === options.length);
  });

  it('filters list of options on search input', function() {
    let items;
    click(component._search);
    assert(component._list !== null);

    change(component._search, 'Joseph');
    items = ReactDOM.findDOMNode(component._list).querySelectorAll('li');
    assert(items.length === 2);
    forEach(items, item => assert(/Joseph/.exec(item.innerHTML)));

    change(component._search, '');
    items = ReactDOM.findDOMNode(component._list).querySelectorAll('li');
    assert(items.length === options.length);
  });

  it('renders a filtered list on initial render with searchTerm', function() {
    unmount();
    component = TestUtils.renderIntoDocument(
      <Autocomplete searchTerm="Joseph" options={options} />,
    );
    element = ReactDOM.findDOMNode(component);
    click(component._search);
    let items = ReactDOM.findDOMNode(component._list).querySelectorAll('li');
    assert.equal(items.length, 2);
  });
});
