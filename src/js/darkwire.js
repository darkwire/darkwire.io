import _ from 'underscore';
import AudioHandler from './audio';
import CryptoUtil from './crypto';

export default class Darkwire {
  constructor() {
    this._audio = new AudioHandler();
    this._cryptoUtil = new CryptoUtil();
    this._myUserId = false;
    this._connected = false;
    this._users = [];
    this._keys = {};
  }

  get keys() {
    return this._keys;
  }

  set keys(keys) {
    this._keys = keys;
    return this._keys;
  }

  get connected() {
    return this._connected;
  }

  set connected(state) {
    this._connected = state;
    return this._connected;
  }

  get users() {
    return this._users;
  }

  get audio() {
    return this._audio;
  }

  addUser(data) {
    let importKeysPromises = [];
    // Import all user keys if not already there
    _.each(data.users, (user) => {
      if (!_.findWhere(this._users, {id: user.id})) {
        let promise = new Promise((resolve, reject) => {
          let currentUser = user;
          Promise.all([
            this._cryptoUtil.importPrimaryKey(currentUser.publicKey, "spki")
          ])
          .then((keys) => {
            this._users.push({
              id: currentUser.id,
              username: currentUser.username,
              publicKey: keys[0]
            });
            resolve();
          });
        });

        importKeysPromises.push(promise);
      }
    });

    if (!this._myUserId) {
      // Set my id if not already set
      let me = _.findWhere(data.users, {username: username});
      this._myUserId = me.id;
    }

    return importKeysPromises;
  }

  removeUser(data) {
    this._users = _.without(this._users, _.findWhere(this._users, {id: data.id}));
    return this._users;
  }

  encodeMessage(message, messageType) {
    // Don't send unless other users exist
    return new Promise( (resolve, reject) => {
      // if (this._users.length <= 1) {
      //   console.log('rejected:' + this._users);
      //   reject();
      //   return;
      // };
      
      // if there is a non-empty message and a socket connection
      if (message && this._connected) {
        let vector = this._cryptoUtil.crypto.getRandomValues(new Uint8Array(16));

        let secretKey = null;
        let secretKeys = null;
        let messageData = null;
        let signature = null;
        let signingKey = null;
        let encryptedMessageData = null;

        // Generate new secret key and vector for each message
        this._cryptoUtil.createSecretKey()
          .then((key) => {
            secretKey = key;
            return this._cryptoUtil.createSigningKey();
          })
          .then((key) => {
            signingKey = key;
            // Generate secretKey and encrypt with each user's public key
            let promises = [];
            _.each(this._users, (user) => {
              // If not me
              if (user.username !== window.username) {
                let promise = new Promise((res, rej) => {
                  let thisUser = user;

                  let secretKeyStr;

                  // Export secret key
                  this._cryptoUtil.exportKey(secretKey, "raw")
                    .then((data) => {
                      return this._cryptoUtil.encryptSecretKey(data, thisUser.publicKey);
                    })
                    .then((encryptedSecretKey) => {
                      let encData = new Uint8Array(encryptedSecretKey);
                      secretKeyStr = this._cryptoUtil.convertArrayBufferViewToString(encData);
                      // Export HMAC signing key
                      return this._cryptoUtil.exportKey(signingKey, "raw");
                    })
                    .then((data) => {
                      // Encrypt signing key with user's public key
                      return this._cryptoUtil.encryptSigningKey(data, thisUser.publicKey);
                    })
                    .then((encryptedSigningKey) => {
                      let encData = new Uint8Array(encryptedSigningKey);
                      var str = this._cryptoUtil.convertArrayBufferViewToString(encData);
                      res({
                        id: thisUser.id,
                        secretKey: secretKeyStr,
                        encryptedSigningKey: str
                      });
                    });
                });
                promises.push(promise);
              }
            });
            return Promise.all(promises);
          })
          .then((data) => {
            secretKeys = data;
            messageData = this._cryptoUtil.convertStringToArrayBufferView(message);
            return this._cryptoUtil.signKey(messageData, signingKey);
          })
          .then((data) => {
            signature = data;
            return this._cryptoUtil.encryptMessage(messageData, secretKey, vector);
          })
          .then((data) => {
            encryptedMessageData = data;
            let vct = this._cryptoUtil.convertArrayBufferViewToString(new Uint8Array(vector));
            let sig = this._cryptoUtil.convertArrayBufferViewToString(new Uint8Array(signature));
            let msg = this._cryptoUtil.convertArrayBufferViewToString(new Uint8Array(encryptedMessageData));

            resolve({
              message: msg,
              vector: vct,
              messageType: messageType,
              secretKeys: secretKeys,
              signature: sig
            });
          });
      }

    });
  }

  decodeMessage(data) {
    return new Promise( (resolve, reject) => {
      let message = data.message;
      let messageData = this._cryptoUtil.convertStringToArrayBufferView(message);
      let username = data.username; 
      let senderId = data.id
      let vector = data.vector;
      let vectorData = this._cryptoUtil.convertStringToArrayBufferView(vector);
      let secretKeys = data.secretKeys;
      let decryptedMessageData;
      let decryptedMessage;   

      let mySecretKey = _.find(secretKeys, (key) => {
        return key.id === this._myUserId;
      });
      let signature = data.signature;
      let signatureData = this._cryptoUtil.convertStringToArrayBufferView(signature);
      let secretKeyArrayBuffer = this._cryptoUtil.convertStringToArrayBufferView(mySecretKey.secretKey);
      let signingKeyArrayBuffer = this._cryptoUtil.convertStringToArrayBufferView(mySecretKey.encryptedSigningKey);

      this._cryptoUtil.decryptSecretKey(secretKeyArrayBuffer, this._keys.private)
      .then((data) => {
        return this._cryptoUtil.importSecretKey(new Uint8Array(data), "raw");
      })
      .then((data) => {
        let secretKey = data;
        return this._cryptoUtil.decryptMessage(messageData, secretKey, vectorData);
      })
      .then((data) => {
        decryptedMessageData = data;
        decryptedMessage = this._cryptoUtil.convertArrayBufferViewToString(new Uint8Array(data))
        return this._cryptoUtil.decryptSigningKey(signingKeyArrayBuffer, this._keys.private)
      })
      .then((data) => {
        return this._cryptoUtil.importSigningKey(new Uint8Array(data), "raw");
      })
      .then((data) => {
        let signingKey = data;
        return this._cryptoUtil.verifyKey(signatureData, decryptedMessageData, signingKey);
      })
      .then((bool) => {
        if (bool) {
          resolve({
            username: username,
            message: decryptedMessage
          });    
        }
      });
    });
  }
}
