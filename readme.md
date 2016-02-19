# Darkwire.io

Simple encrypted web chat. Powered by [socket.io](http://socket.io) and the [web cryptography API](https://developer.mozilla.org/en-US/docs/Web/API/Window/crypto).

### Installation

    npm install
    
    # Bundle JS files
    npm run bundle

    # Start a local instance of darkwire
    npm start

Create a **.secret** file in **/src** folder with a your session secret. It doesn't matter what it is- just keep it private.

Darkwire is now running on `http://localhost:3000`

### Deployment

Build source

    gulp bundle

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

### Sockets & Server

Darkwire uses [socket.io](http://socket.io) to transmit encrypted information using secure [WebSockets](https://en.wikipedia.org/wiki/WebSocket) (WSS).

Rooms are stored in memory on the server until all participants have left, at which point the room is destroyed. Only public keys are stored in server memory for the duration of the room's life.

Chat history is stored in each participant's browser, so it is effectively erased (for that user) when their window is closed.
