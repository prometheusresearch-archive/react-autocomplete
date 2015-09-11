/**
 * @copyright 2015, Prometheus Research, LLC
 */

import React        from 'react';
import TestUtils    from 'react/lib/ReactTestUtils';
import forEach      from 'lodash/collection/forEach';
import Autocomplete from '../Autocomplete';

import options      from './fixture.json';

describe('Autocomplete', function() {

  let component;
  let element;
  let search;

  function mount() {
    component = TestUtils.renderIntoDocument(<Autocomplete options={options} />);
    element = React.findDOMNode(component);
  }

  function unmount() {
    if (element.parentNode) {
      React.unmountComponentAtNode(element.parentNode);
    }
  }

  function click(component) {
    TestUtils.SimulateNative.click(React.findDOMNode(component));
  }

  function focus(component) {
    TestUtils.SimulateNative.focus(React.findDOMNode(component));
  }

  function blur(component) {
    TestUtils.SimulateNative.blur(React.findDOMNode(component));
  }

  function change(component, value) {
    let node = React.findDOMNode(component);
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
    let items = React.findDOMNode(component._list).querySelectorAll('li');
    assert(items.length === options.length);
  });

  it('filters list of options on search input', function() {
    let items;
    click(component._search);
    assert(component._list !== null);

    change(component._search, 'Joseph');
    items = React.findDOMNode(component._list).querySelectorAll('li');
    assert(items.length === 2);
    forEach(items, item => assert(/Joseph/.exec(item.innerHTML)));

    change(component._search, '');
    items = React.findDOMNode(component._list).querySelectorAll('li');
    assert(items.length === options.length);
  });

});
