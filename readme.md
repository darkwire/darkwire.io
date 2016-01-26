# Darkwire.io

Simple encrypted web chat. Powered by [socket.io](http://socket.io) and the [web cryptography API](https://developer.mozilla.org/en-US/docs/Web/API/Window/crypto).

### Installation

    npm install -g gulp
    npm install
    gulp start

Darkwire is now running on `http://localhost:3000`

### Deployment

Build source

    gulp bundle

### How it works

Darkwire uses a combination of asymmetric encryption (RSA-OAEP), asymmetric signing (RSASSA-PKCS1-v1_5) and symmetric session encryption (AES-CBC) for security.

Here's an overview of a chat between Alice and Bob (also applies to group chats):

1. Bob creates a room and immediately creates both a primary public/private key pair (RSA-OAEP) and a signing public/private key pair (RSASSA-PKCS1-v1_5).
2. Alice joins the room and also creates primary and signing public/private key pairs. She is sent Bob's two public keys and she sends Bob her two public keys.
3. When Bob goes to send a message, two things are created: a session key (AES-CBC) and an initialization vector (these are generated every time a new message is sent).
4. Bob's message is encrypted with the session key and initialization vector, and a signature is created using his private signing key.
5. The session key is encrypted with each recipient's primary public key (in this case only Alice, but in a group chat multiple).
6. The encrypted message, initialization vector, signature and encrypted session key are sent to all recipients (in this case just Alice) as a package.
7. Alice receives the package and decrypts the session key using her primary private key. She decrypts the message with the decrypted session key and vector, and verifies the signature with Bob's public signing key.

Group chats work the same way because in step 5 we encrypt the session key with everyone's primary public key. When a message is sent out, it includes encrypted keys for everyone in the room, and the recipients then pick out the ones for them based on their user ID.

### [Man-in-the-middle attacks](https://en.wikipedia.org/wiki/Man-in-the-middle_attack)

Darkwire does not provide any guarantee that the person you're communicating with is who you think they are. Authentication functionality may be incorporated in future versions.

### Sockets & Server

Darkwire uses [socket.io](http://socket.io) to transmit encrypted information using secure [WebSockets](https://en.wikipedia.org/wiki/WebSocket) (WSS).

Rooms are stored in memory on the server until all participants have left, at which point the room is destroyed. Only public keys are stored in server memory for the duration of the room's life.

Chat history is stored in each participant's browser, so it is effectively erased (for that user) when their window is closed.