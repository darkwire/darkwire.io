export default class Crypto {
  constructor() {
    this._crypto = window.crypto || false;

    if (!this._crypto || (!this._crypto.subtle && !this._crypto.webkitSubtle)) {
      return false
    }
  }

  get crypto() {
    return this._crypto;
  }

  convertStringToArrayBufferView(str) {
    const bytes = new Uint8Array(str.length);
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

  createEncryptDecryptKeys() {
    return this.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048, // can be 1024, 2048, or 4096
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: { name: 'SHA-1' },
      },
      true, // whether the key is extractable (i.e. can be used in exportKey)
      ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey'], // must be ['encrypt', 'decrypt'] or ['wrapKey', 'unwrapKey']
    );
  }

  createSecretKey() {
    return this.crypto.subtle.generateKey(
      {
        name: 'AES-CBC',
        length: 256, // can be  128, 192, or 256
      },
      true, // whether the key is extractable (i.e. can be used in exportKey)
      ['encrypt', 'decrypt'], // can be 'encrypt', 'decrypt', 'wrapKey', or 'unwrapKey'
    );
  }

  createSigningKey() {
    return this.crypto.subtle.generateKey(
      {
        name: 'HMAC',
        hash: { name: 'SHA-256' },
      },
      true, // whether the key is extractable (i.e. can be used in exportKey)
      ['sign', 'verify'], // can be 'encrypt', 'decrypt', 'wrapKey', or 'unwrapKey'
    );
  }

  encryptMessage(data, secretKey, iv) {
    return this.crypto.subtle.encrypt(
      {
        name: 'AES-CBC',
        // Don't re-use initialization vectors!
        // Always generate a new iv every time your encrypt!
        iv,
      },
      secretKey, // from generateKey or importKey above
      data, // ArrayBuffer of data you want to encrypt
    );
  }

  decryptMessage(data, secretKey, iv) {
    return this.crypto.subtle.decrypt(
      {
        name: 'AES-CBC',
        iv, // The initialization vector you used to encrypt
      },
      secretKey, // from generateKey or importKey above
      data, // ArrayBuffer of the data
    );
  }

  importEncryptDecryptKey(jwkData, format = 'jwk', ops) {
    const hashObj = {
      name: 'RSA-OAEP',
      hash: { name: 'SHA-1' },
    };

    return this.crypto.subtle.importKey(
      format, // can be 'jwk' (public or private), 'spki' (public only), or 'pkcs8' (private only)
      jwkData,
      hashObj,
      true, // whether the key is extractable (i.e. can be used in exportKey)
      ops || ['encrypt', 'wrapKey'], // 'encrypt' or 'wrapKey' for public key import or
      // 'decrypt' or 'unwrapKey' for private key imports
    );
  }

  exportKey(key, format) {
    return this.crypto.subtle.exportKey(
      format || 'jwk', // can be 'jwk' (public or private), 'spki' (public only), or 'pkcs8' (private only)
      key, // can be a publicKey or privateKey, as long as extractable was true
    );
  }

  signMessage(data, keyToSignWith) {
    return this.crypto.subtle.sign(
      {
        name: 'HMAC',
        hash: { name: 'SHA-256' },
      },
      keyToSignWith, // from generateKey or importKey above
      data, // ArrayBuffer of data you want to sign
    );
  }

  verifyPayload(signature, data, keyToVerifyWith) {
    // Will verify with sender's public key
    return this.crypto.subtle.verify(
      {
        name: 'HMAC',
        hash: { name: 'SHA-256' },
      },
      keyToVerifyWith, // from generateKey or importKey above
      signature, // ArrayBuffer of the signature
      data, // ArrayBuffer of the data
    );
  }

  wrapKey(keyToWrap, keyToWrapWith, format = 'jwk') {
    return this.crypto.subtle.wrapKey(format, keyToWrap, keyToWrapWith, {
      name: 'RSA-OAEP',
      hash: { name: 'SHA-1' },
    });
  }

  unwrapKey(
    format = 'jwk',
    wrappedKey,
    unwrappingKey,
    unwrapAlgo,
    unwrappedKeyAlgo, // AES-CBC for session, HMAC for signing
    extractable = true,
    keyUsages, // verify for signing // decrypt for session
  ) {
    return this.crypto.subtle.unwrapKey(
      format,
      wrappedKey,
      unwrappingKey,
      unwrapAlgo,
      unwrappedKeyAlgo,
      extractable,
      keyUsages,
    );
  }
}
