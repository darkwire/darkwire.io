# Darkwire.io

[![Build Status](https://travis-ci.org/seripap/darkwire.io.svg?branch=master)](https://travis-ci.org/seripap/darkwire.io) [![GitHub release](https://img.shields.io/github/release/seripap/darkwire.io.svg)]()

Simple encrypted web chat. Powered by [socket.io](http://socket.io), the [web cryptography API](https://developer.mozilla.org/en-US/docs/Web/API/Window/crypto).

### Darkwire Server

Darkwire server is a Node.js application.

[darkwire-server](https://github.com/seripap/darkwire-server) 

### Darkwire Web Client

The Darkwire.io web client is written in JavaScript with React JS and Redux.

[darkwire-client](https://github.com/seripap/darkwire-client) 

### Running Darkwire Locally

To quickly get up and running, we recommend using Docker and Docker Compose.

```
$ docker-compose up
```

Darkwire client will be binded to port 80 while the server is on port 3000. Go to [http://localhost](http://localhost).

If running in a public environment, be sure the modify ENV_VARS via `docker-compose.yml`.

```
environment:
    - API_SERVER=dwserver
    - PROTOCOL=http
    - PORT=3000
```

For any SSL setup, set `PROTOCOL` to `https` and `PORT` to `443`.

### Contributing to Darkwire

Run `setup-dev.sh` to automatically clone server/client files and install dependencies, or clone the client and server repositories.

1. Create a Pull Request for the respective service with detailed changes
2. Wait for review and/or merges

### Security

Please report any security issues to `hello@darkwire.io`.

### How it works

Darkwire uses a combination of asymmetric encryption (RSA-OAEP), symmetric session keys (AES-CBC) and signing keys (HMAC) for security.

Here's an overview of a chat between Alice and Bob (also applies to group chats):

1. Bob creates a room and immediately creates a public/private key pair (RSA-OAEP).
2. Alice joins the room and also creates a public/private key pair. She is sent Bob's public key and she sends Bob her public key.
3. When Bob goes to send a message, three things are created: a session key (AES-CBC), a signing key (HMAC SHA-256) and an initialization vector (used in the encryption process).
4. Bob's message is encrypted with the session key and initialization vector, and a signature is created using the signing key. 
5. The session key and signing key are encrypted with each recipient's public key (in this case only Alice, but in a group chat multiple).
6. The encrypted message, initialization vector, signature, encrypted session key and encrypted signing key are sent to all recipients (in this case just Alice) as a package.
7. Alice receives the package and decrypts the session key and signing key using her private key. She decrypts the message with the decrypted session key and vector, and verifies the signature with the decrypted signing key.

Group chats work the same way because in step 5 we encrypt keys with everyone's public key. When a message is sent out, it includes encrypted keys for everyone in the room, and the recipients then pick out the ones for them based on their user ID.

### [Man-in-the-middle attacks](https://en.wikipedia.org/wiki/Man-in-the-middle_attack)

Darkwire does not provide any guarantee that the person you're communicating with is who you think they are. Authentication functionality may be incorporated in future versions.

## File Transfer

Darkwire encodes documents (up to 1MB) into base64 using [btoa](https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/btoa) and is encrypted the same way chat messages are. 

1. When a file is "uploaded", the document is encoded on the client and the server recieves the encrypted base64 string.
2. The server sends the encrypted base64 string to clients in the same chat room.
3. Clients recieving the encrypted base64 string then decrypts and decodes the base64 string using [atob](https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/atob).

## Sockets & Server

Darkwire uses [socket.io](http://socket.io) to transmit encrypted information using secure [WebSockets](https://en.wikipedia.org/wiki/WebSocket) (WSS).

Rooms are stored in memory on the server until all participants have left, at which point the room is destroyed. Only public keys are stored in server memory for the duration of the room's life.

Chat history is stored in each participant's browser, so it is effectively erased (for that user) when their window is closed.
