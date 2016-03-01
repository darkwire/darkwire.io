import assert from 'assert';
import sinon from 'sinon';

var proxyquire = require('proxyquireify')(require);

let importPrimaryKeyStub = sinon.stub();

var stubs = {
  './crypto': {
    default: function() {
      return {
        importPrimaryKey: importPrimaryKeyStub
      };
    }
  }
};

var Darkwire = proxyquire('../../src/js/darkwire.js', stubs).default;

describe('Darkwire', () => {

  describe('adding users', () => {

    before(() => {
      document.body.innerHTML = window.__html__['fixtures/app.html'];
      window.username = 'alan';
      let darkwire = new Darkwire();
      darkwire._myUserId = 3;
      darkwire.addUser(
        {
          users: [
            {
              id: 1,
              username: 'user 1',
              publicKey: {}
            },
            {
              id: 2,
              username: 'user 2',
              publicKey: {}
            }
          ]
        }
      );
    });

    after(() => {
      importPrimaryKeyStub.reset();
    });

    it('should import each users key', () => {
      assert.equal(importPrimaryKeyStub.callCount, 2);
    });
  });

});
