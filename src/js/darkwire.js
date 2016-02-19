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

  sendMessage(message, messageType) {
    // Don't send unless other users exist
    console.log(this._users);
    if (this._users.length <= 1) return;

    // if there is a non-empty message and a socket connection
    if (message && this._connected) {
      $inputMessage.val('');
      $('#send-message-btn').removeClass('active');
      addChatMessage({
        username: username,
        message: message
      });
      let vector = this._cryptoUtil.crypto.getRandomValues(new Uint8Array(16));

      let secretKey;
      let secretKeys;
      let messageData;
      let signature;
      let signingKey;
      let encryptedMessageData;

      // Generate new secret key and vector for each message
      this._cryptoUtil.createSecretKey()
        .then(function(key) {
          secretKey = key;
          return this._cryptoUtil.createSigningKey();
        })
        .then(function(key) {
          signingKey = key;
          // Generate secretKey and encrypt with each user's public key
          let promises = [];
          _.each(this._users, function(user) {
            // If not me
            if (user.username !== window.username) {
              let promise = new Promise(function(resolve, reject) {
                let thisUser = user;

                let secretKeyStr;

                // Export secret key
                this._cryptoUtil.exportKey(secretKey, "raw")
                  .then(function(data) {
                    return this._cryptoUtil.encryptSecretKey(data, thisUser.publicKey);
                  })
                  .then(function(encryptedSecretKey) {
                    let encData = new Uint8Array(encryptedSecretKey);
                    secretKeyStr = this._cryptoUtil.convertArrayBufferViewToString(encData);
                    // Export HMAC signing key
                    return this._cryptoUtil.exportKey(signingKey, "raw");
                  })
                  .then(function(data) {
                    // Encrypt signing key with user's public key
                    return this._cryptoUtil.encryptSigningKey(data, thisUser.publicKey);
                  })
                  .then(function(encryptedSigningKey) {
                    let encData = new Uint8Array(encryptedSigningKey);
                    var str = this._cryptoUtil.convertArrayBufferViewToString(encData);
                    resolve({
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
        .then(function(data) {
          secretKeys = data;
          messageData = this._cryptoUtil.convertStringToArrayBufferView(message);
          return this._cryptoUtil.signKey(messageData, signingKey);
        })
        .then(function(data) {
          signature = data;
          return this._cryptoUtil.encryptMessage(messageData, secretKey, vector);
        })
        .then(function(data) {
          encryptedMessageData = data;
          let msg = this._cryptoUtil.convertArrayBufferViewToString(new Uint8Array(encryptedMessageData));
          let vct = this._cryptoUtil.convertArrayBufferViewToString(new Uint8Array(vector));
          let sig = this._cryptoUtil.convertArrayBufferViewToString(new Uint8Array(signature));
          socket.emit('new message', {
            message: msg,
            vector: vct,
            messageType: type,
            secretKeys: secretKeys,
            signature: sig
          });
        });
    }
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

      this._cryptoUtil.decryptSecretKey(secretKeyArrayBuffer, keys.private)
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
        return this._cryptoUtil.decryptSigningKey(signingKeyArrayBuffer, keys.private)
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
