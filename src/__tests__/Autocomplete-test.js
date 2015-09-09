/**
 * @copyright 2015, Prometheus Research, LLC
 */

import React        from 'react';
import assert       from 'power-assert';
import Autocomplete from '../Autocomplete';

import options      from './fixture.json';

describe('Autocomplete', function() {

  it('renders to string', function() {

    let markup = React.renderToString(<Autocomplete options={options} />);
    assert(true);
  });
});
