import Crypto from './crypto';

const crypto = new Crypto();

export const process = async (payload, state) => {
  const privateKeyJson = state.user.privateKey;
  const privateKey = await crypto.importEncryptDecryptKey(privateKeyJson, 'jwk', ['decrypt', 'unwrapKey']);

  const iv = await crypto.convertStringToArrayBufferView(payload.iv);
  const signature = await crypto.convertStringToArrayBufferView(payload.signature);
  const payloadBuffer = await crypto.convertStringToArrayBufferView(payload.payload);

  // We try to decrypt all sessions and signin keys to get the one encrypted for self
  const [sessionKey, signingKey] = await new Promise(resolvePayload => {
    payload.keys.forEach(async key => {
      try {
        const sessionKey = await crypto.unwrapKey(
          'jwk',
          key.sessionKey,
          privateKey,
          {
            name: 'RSA-OAEP',
            hash: { name: 'SHA-1' },
          },
          { name: 'AES-CBC' },
          true,
          ['decrypt'],
        );

        const signingKey = await crypto.unwrapKey(
          'jwk',
          key.signingKey,
          privateKey,
          {
            name: 'RSA-OAEP',
            hash: { name: 'SHA-1' },
          },
          { name: 'HMAC', hash: { name: 'SHA-256' } },
          true,
          ['verify'],
        );
        resolvePayload([sessionKey, signingKey]);
      } catch (e) {} // eslint-disable-line
    });
  });

  const verified = await crypto.verifyPayload(signature, payloadBuffer, signingKey);

  if (!verified) {
    throw new Error("Can't verify message");
  }

  const decryptedPayload = await crypto.decryptMessage(payloadBuffer, sessionKey, iv);

  const payloadJson = JSON.parse(crypto.convertArrayBufferViewToString(new Uint8Array(decryptedPayload)));

  return payloadJson;
};

export const prepare = async (payload, state) => {
  const myUsername = state.user.username;
  const myId = state.user.id;

  const sessionKey = await crypto.createSecretKey();
  const signingKey = await crypto.createSigningKey();
  const iv = await crypto.crypto.getRandomValues(new Uint8Array(16));

  const jsonToSend = {
    ...payload,
    payload: {
      ...payload.payload,
      sender: myId,
      username: myUsername,
      text: encodeURI(payload.payload.text),
    },
  };

  const payloadBuffer = crypto.convertStringToArrayBufferView(JSON.stringify(jsonToSend));

  const encryptedPayload = await crypto.encryptMessage(payloadBuffer, sessionKey, iv);
  const payloadString = await crypto.convertArrayBufferViewToString(new Uint8Array(encryptedPayload));

  const signature = await crypto.signMessage(encryptedPayload, signingKey);

  const encryptedKeys = await Promise.all(
    state.room.members.map(async member => {
      const key = await crypto.importEncryptDecryptKey(member.publicKey);
      const enc = await Promise.all([crypto.wrapKey(sessionKey, key), crypto.wrapKey(signingKey, key)]);
      return {
        sessionKey: enc[0],
        signingKey: enc[1],
      };
    }),
  );

  const ivString = await crypto.convertArrayBufferViewToString(new Uint8Array(iv));
  const signatureString = await crypto.convertArrayBufferViewToString(new Uint8Array(signature));

  return {
    toSend: {
      payload: payloadString,
      signature: signatureString,
      iv: ivString,
      keys: encryptedKeys,
    },
    original: jsonToSend,
  };
};
