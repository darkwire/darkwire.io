import helpers from './helpers';
import app from '../index';
import mochaJSCS from 'mocha-jscs';
import mochaJSHint from 'mocha-jshint';

const Browser = require('zombie');
Browser.localhost('localhost', 3000);

mochaJSCS();
mochaJSHint();

describe('Visiting /', () => {

  const browser = new Browser();

  before((done) => {
    browser.on('active', () => {
      // browser.evaluate needs a string, so this regex just extracts the body of the function as a string
      browser.evaluate(helpers.polyfillCrypto.toString().match(/function[^{]+\{([\s\S]*)\}$/)[1]);
    });

    browser.visit('/', done);
  });

  it('should be successful', () => {
    browser.assert.success();
  });

  it('should show welcome modal', () => {
    browser.assert.evaluate('$("#first-modal:visible").length', 1);
    browser.assert.text('#first-modal h4.modal-title', 'Welcome to darkwire.io');
  });

  describe('closing the initial modal', () => {

    before((done) => {
      browser.pressButton('#first-modal .modal-footer button', done);
    });

    it('should close the modal and show the main chat page', () => {
      browser.assert.evaluate('$("#first-modal:hidden").length', 1);
    });

    describe('opening another tab', () => {

      before((done) => {
        let roomIdSplit = browser.url.split('/');
        let roomId = roomIdSplit[roomIdSplit.length - 1];
        browser.open();
        browser.tabs.current = 1;
        browser.visit(`/${roomId}`, done);
      });

      it('should be successful', () => {
        browser.assert.success();
      });

      it('should not show welcome modal', () => {
        browser.assert.evaluate('$("#first-modal.fade.in").length', 0);
      });

      describe('sending message', () => {

        before((done) => {
          browser.fill('.inputMessage', 'Hello world');
          browser.click('span#send-message-btn', done);
        });

        it('should send message', () => {
          browser.tabs.current = 0;
          browser.assert.text('body', /Hello world/);
        });

      });

    });

  });

});
