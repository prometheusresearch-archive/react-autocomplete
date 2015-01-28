/**
 * @copyright 2015, Prometheus Research, LLC
 */
'use strict';

var React            = require('react');
var SelectboxBase = require('../');

var styleInput = {
  display: 'block',
  height: '34px',
  padding: '6px 12px',
  fontSize: '14px',
  lineHeight: '1.42857143',
  color: '#555',
  backgroundColor: '#fff',
  backgroundImage: 'none',
  border: '1px solid #ccc',
  borderRadius: '4px',
  boxShadow: 'inset 0 1px 1px rgba(0,0,0,.075)',
  transition: 'border-color ease-in-out .15s,box-shadow ease-in-out .15s'
}

var styleResultList = {
  position: 'absolute',
  top: '100%',
  width: '100%',
  left: '0',
  zIndex: '1000',
  float: 'left',
  minWidth: '160px',
  padding: '5px 0',
  margin: '2px 0 0',
  fontSize: '14px',
  textAlign: 'left',
  listStyle: 'none',
  backgroundColor: '#fff',
  backgroundClip: 'padding-box',
  border: '1px solid rgba(0,0,0,.15)',
  borderRadius: '4px',
  boxShadow: '0 6px 12px rgba(0,0,0,.175)'
};

var styleResult = {
  display: 'block',
  padding: '3px 20px',
  clear: 'both',
  fontWeight: '400',
  lineHeight: '1.42857143',
  color: '#333',
  whiteSpace: 'nowrap'
};

var styleResultOnActive = {
  color: '#262626',
  textDecoration: 'none',
  backgroundColor: '#f5f5f5'
};

var Selectbox = React.createClass({

  render() {
    return (
      <SelectboxBase 
        {...this.props}
        styleInput={styleInput}
        styleResultList={styleResultList}
        styleResult={styleResult}
        styleResultOnActive={styleResultOnActive}
        />
    );
  }
});

module.exports = Selectbox;
