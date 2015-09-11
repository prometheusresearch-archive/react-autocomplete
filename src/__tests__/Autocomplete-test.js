/**
 * @copyright 2015, Prometheus Research, LLC
 */

import React        from 'react';
import TestUtils    from 'react/lib/ReactTestUtils';
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

  function focus(component) {
    TestUtils.SimulateNative.focus(React.findDOMNode(component));
  }

  function blur(component) {
    TestUtils.SimulateNative.blur(React.findDOMNode(component));
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

});
