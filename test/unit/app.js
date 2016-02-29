import assert from 'assert';
import sinon from 'sinon';
import io from 'socket.io-client/socket.io.js';
import $ from '../../src/public/vendor/jquery-1.10.2.min.js';
import Favico from '../../src/public/favicon';
import Autolinker from '../../src/public/vendor/autolinker.min.js';

window.io = io;
window.$ = window.jQuery = $;
window.Favico = Favico;
window.Autolinker = Autolinker;
window.$.fn.bootstrapSwitch = () => {
  return {
    on: () => {
      return;
    }
  };
};
window.FastClick = {
  attach: () => {
    return true;
  }
};

var proxyquire = require('proxyquireify')(require);

var stubs = {};

var App = proxyquire('../../src/js/app.js', stubs).default;

describe('App', () => {

  describe('cleanInput', () => {

    let app;

    before(() => {
      app = new App();
    });

    it('should create HTML links from URLs', () => {
      let input = app.cleanInput('cnn.com');
      assert.equal(input, '<a href="http://cnn.com" target="_blank">cnn.com</a>');
    });
  });

});
