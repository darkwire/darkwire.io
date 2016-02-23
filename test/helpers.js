var helpers = {
  polyfillCrypto: () => {
    window.crypto = {
      subtle: {
        generateKey: () => {
          return new Promise((resolve, reject) => {
            resolve({});
          });
        },
        exportKey: () => {
          return new Promise((resolve, reject) => {
            resolve([{}]);
          });
        },
        importKey: () => {
          return new Promise((resolve, reject) => {
            resolve([{}]);
          });
        },
        encrypt: () => {
          return {};
        },
        decrypt: (opts, key, data) => {
          if (opts.name === 'AES-CBC') {
            // This means it's decrypted a message
            return new Promise((resolve, reject) => {
              // "Hello world" as an array buffer
              resolve(new Uint8Array([72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100]));
            });
          } else {
            return new Promise((resolve, reject) => {
              resolve({});
            });
          }
        },
        sign: () => {
          return {};
        },
        verify: () => {
          return true;
        }
      },
      getRandomValues: () => {
        return [1,2,3,4];
      }
    };
  },
  zombie: {
    waitFor: (browser, str, cb) => {
      let int = setInterval(() => {
        if (browser.evaluate(str)) {
          clearInterval(int);
          cb();
        }
      }, 50);
    }
  }
};

module.exports = helpers;
