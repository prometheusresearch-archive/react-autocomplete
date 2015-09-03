/**
 * @copyright 2015, Prometheus Research, LLC
 */


import React        from 'react/addons';
import Autocomplete from '../src/themes/Bootstrap';

export default class Demo extends React.Component {

  render() {
    return (
      <div>
        <h1>React Autocomplete</h1>
        <div>
          <h2>Basic usage</h2>
          <Autocomplete
            options={[
              {id: 1, title: 'First'},
              {id: 2, title: 'Second'},
              {id: 3, title: 'Third'},
              {id: 4, title: 'Forth'}
            ]}
            />
        </div>
      </div>
    );
  }
}
