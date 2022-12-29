# Darkwire.io

[![CircleCI](https://circleci.com/gh/darkwire/darkwire.io.svg?style=svg)](https://circleci.com/gh/darkwire/darkwire.io)

Simple encrypted web chat. Powered by [socket.io](http://socket.io), the [web cryptography API](https://developer.mozilla.org/en-US/docs/Web/API/Window/crypto). This project is an example of how client side encryption works and how you can integrate it as a chat service.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

### Darkwire Server

[Darkwire server](/server) is a Node.js application.

### Darkwire Web Client

The Darkwire.io [web client](/client) is written in JavaScript with React JS and Redux.

### Development

#### Prerequisites

Copy `.env.dist` files in `server/` and `client/` directories without the `.dist`
extensions and adapt them to your needs.

You must have a https connection for Darkwire to work because it's using crypto browser
API which is accessible only on localhost and behind a https connection.


#### Manual setup

You can use nvm to install the right version of node using this command:

```
nvm install # If the right node version is not already installed
nvm use
npm install yarn -g # To install yarn
```

Install dependencies

```
$ yarn
```

Start server and client

```
$ yarn setup
$ yarn dev
```

#### Using docker-compose

Just run the following:

```
$ docker-compose up
```

This will automatically create the default `.env` files for you.

### Production

Create server and client production builds

```
$ yarn build
```

Start server

```
$ yarn start
```

#### Using Docker

Build it.

```
$ docker build --tag darkwire.io:latest .
```

Then run it. Example:

```
$ docker run --init --name darkwire.io --rm -p 3001:3001 darkwire.io
```

You are able to use any of the enviroment variables available in `server/.env.dist` and `client/.env.dist`. The defaults are available in [Dockerfile](Dockerfile)

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

Darkwire encodes documents into base64 using [btoa](https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/btoa) and is encrypted the same way chat messages are.

1. When a file is "uploaded", the document is encoded on the client and the server recieves the encrypted base64 string.
2. The server sends the encrypted base64 string to clients in the same chat room.
3. Clients recieving the encrypted base64 string then decrypts and decodes the base64 string using [atob](https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/atob).

The default transferable file size limit is 4MB, but can be changed in `.env` file with the `REACT_APP_MAX_FILE_SIZE` variable.

## Sockets & Server

Darkwire uses [socket.io](http://socket.io) to transmit encrypted information using secure [WebSockets](https://en.wikipedia.org/wiki/WebSocket) (WSS).

Rooms are stored in memory on the server until all participants have left, at which point the room is destroyed. Only public keys are stored in server memory for the duration of the room's life.

Chat history is stored in each participant's browser, so it is effectively erased (for that user) when their window is closed.
