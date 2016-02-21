export default class CryptoUtil {
  constructor() {
    this._crypto = window.crypto || false;

    if (!this._crypto || (!this._crypto.subtle && !this._crypto.webkitSubtle)) {
      $('#no-crypto').modal({
        backdrop: 'static',
        show: false,
        keyboard: false
      });

      $('#no-crypto').modal('show');
      return;
    }

  }

  get crypto() {
    return this._crypto;
  }

  convertStringToArrayBufferView(str) {
    let bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i);
    }

    return bytes;
  }

  convertArrayBufferViewToString(buffer) {
    let str = '';
    for (let i = 0; i < buffer.byteLength; i++) {
      str += String.fromCharCode(buffer[i]);
    }

    return str;
  }

  createSigningKey() {
    return this._crypto.subtle.generateKey(
      {
        name: 'HMAC',
        hash: {name: 'SHA-256'}, //can be 'SHA-1', 'SHA-256', 'SHA-384', or 'SHA-512'
        //length: 256, //optional, if you want your key length to differ from the hash function's block length
      },
      true, //whether the key is extractable (i.e. can be used in exportKey)
      ['sign', 'verify'] //can be any combination of 'sign' and 'verify'
    );
  }

  createPrimaryKeys() {
    return this._crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048, //can be 1024, 2048, or 4096
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: {name: 'SHA-256'}, //can be 'SHA-1', 'SHA-256', 'SHA-384', or 'SHA-512'
      },
      true, //whether the key is extractable (i.e. can be used in exportKey)
      ['encrypt', 'decrypt'] //must be ['encrypt', 'decrypt'] or ['wrapKey', 'unwrapKey']
    );
  }

  createSecretKey() {
    return this._crypto.subtle.generateKey(
      {
        name: 'AES-CBC',
        length: 256, //can be  128, 192, or 256
      },
      true, //whether the key is extractable (i.e. can be used in exportKey)
      ['encrypt', 'decrypt'] //can be 'encrypt', 'decrypt', 'wrapKey', or 'unwrapKey'
    );
  }

  encryptSecretKey(data, secretKey) {
    // Secret key will be recipient's public key
    return this._crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: {name: 'SHA-256'}
      },
      secretKey,
      data //ArrayBuffer of data you want to encrypt
    );
  }

  decryptSecretKey(data, key) {
    // key will be my private key
    return this._crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: {name: 'SHA-256'}
        //label: Uint8Array([...]) //optional
      },
      key,
      data //ArrayBuffer of the data
    );
  }

  encryptSigningKey(data, signingKey) {
    // Secret key will be recipient's public key
    return this._crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: {name: 'SHA-256'}
      },
      signingKey,
      data //ArrayBuffer of data you want to encrypt
    );
  }

  decryptSigningKey(data, key) {
    // key will be my private key
    return this._crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: {name: 'SHA-256'}
        //label: Uint8Array([...]) //optional
      },
      key,
      data //ArrayBuffer of the data
    );
  }

  encryptMessage(data, secretKey, iv) {
    return this._crypto.subtle.encrypt(
      {
        name: 'AES-CBC',
        //Don't re-use initialization vectors!
        //Always generate a new iv every time your encrypt!
        iv: iv,
      },
      secretKey, //from generateKey or importKey above
      data //ArrayBuffer of data you want to encrypt
    );
  }

 decryptMessage(data, secretKey, iv) {
    return this._crypto.subtle.decrypt(
      {
        name: 'AES-CBC',
        iv: iv, //The initialization vector you used to encrypt
      },
      secretKey, //from generateKey or importKey above
      data //ArrayBuffer of the data
    );
  }

  importSecretKey(jwkData, format) {
    return this._crypto.subtle.importKey(
      format || 'jwk', //can be 'jwk' or 'raw'
      //this is an example jwk key, 'raw' would be an ArrayBuffer
      jwkData,
      {   //this is the algorithm options
        name: 'AES-CBC',
      },
      true, //whether the key is extractable (i.e. can be used in exportKey)
      ['encrypt', 'decrypt'] //can be 'encrypt', 'decrypt', 'wrapKey', or 'unwrapKey'
    );
  }

 importPrimaryKey(jwkData, format) {
    // Will be someone's public key
    let hashObj = {
      name: 'RSA-OAEP'
    };
    if (!this._crypto.webkitSubtle) {
      hashObj.hash = {name: 'SHA-256'};
    }
    return this._crypto.subtle.importKey(
      format || 'jwk', //can be 'jwk' (public or private), 'spki' (public only), or 'pkcs8' (private only)
      jwkData,
      hashObj,
      true, //whether the key is extractable (i.e. can be used in exportKey)
      ['encrypt'] //'encrypt' or 'wrapKey' for public key import or
                  //'decrypt' or 'unwrapKey' for private key imports
    );
  }

  exportKey(key, format) {
    // Will be public primary key or public signing key
    return this._crypto.subtle.exportKey(
      format || 'jwk', //can be 'jwk' (public or private), 'spki' (public only), or 'pkcs8' (private only)
      key //can be a publicKey or privateKey, as long as extractable was true
    );
  }

  importSigningKey(jwkData) {
    return this._crypto.subtle.importKey(
      'raw', //can be 'jwk' (public or private), 'spki' (public only), or 'pkcs8' (private only)
      //this is an example jwk key, other key types are Uint8Array objects
      jwkData,
      {   //these are the algorithm options
        name: 'HMAC',
        hash: {name: 'SHA-256'}, //can be 'SHA-1', 'SHA-256', 'SHA-384', or 'SHA-512'
        //length: 256, //optional, if you want your key length to differ from the hash function's block length
      },
      true, //whether the key is extractable (i.e. can be used in exportKey)
      ['verify'] //'verify' for public key import, 'sign' for private key imports
    );
  }

  signKey(data, keyToSignWith) {
    // Will use my private key
    return this._crypto.subtle.sign(
      {
        name: 'HMAC',
        hash: {name: 'SHA-256'}
      },
      keyToSignWith, //from generateKey or importKey above
      data //ArrayBuffer of data you want to sign
    );
  }

  verifyKey(signature, data, keyToVerifyWith) {
    // Will verify with sender's public key
    return this._crypto.subtle.verify(
      {
        name: 'HMAC',
        hash: {name: 'SHA-256'}
      },
      keyToVerifyWith, //from generateKey or importKey above
      signature, //ArrayBuffer of the signature
      data //ArrayBuffer of the data
    );
  }

}
