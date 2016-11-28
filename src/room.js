import _ from 'underscore';
import {EventEmitter} from 'events';
import util from 'util';
import uuid from 'uuid';

class Room {
  constructor(io = {}, id = {}) {
    this._id = id;
    this.numUsers = 0;
    this.users = [];

    EventEmitter.call(this);

    const thisIO = io.of(this._id);

    thisIO.on('connection', (socket) => {
      let addedUser = false;

      // when the client emits 'new message', this listens and executes
      socket.on('new message', (data) => {
        // we tell the client to execute 'new message'
        socket.broadcast.emit('new message', {
          username: socket.username,
          id: socket.user.id,
          message: data.message,
          messageType: data.messageType,
          data: data.data,
          vector: data.vector,
          secretKeys: data.secretKeys,
          signature: data.signature,
        });
      });

      socket.on('add user', (data) => {
        if (addedUser) { return; }

        data.id = uuid.v4();

        this.users.push(data);

        const username = this.sanitizeUsername(data.username);

        // we store the username in the socket session for this client
        socket.username = username;
        socket.user = data;
        ++this.numUsers;
        addedUser = true;

        // Broadcast to ALL sockets, including this one
        thisIO.emit('user joined', {
          username: socket.username,
          numUsers: this.numUsers,
          users: this.users,
        });
      });

      // when the client emits 'typing', we broadcast it to others
      socket.on('typing', () => {
        socket.broadcast.emit('typing', {
          username: socket.username
        });
      });

      // when the client emits 'stop typing', we broadcast it to others
      socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing', {
          username: socket.username
        });
      });

      // when the user disconnects.. perform this
      socket.on('disconnect', () => {
        if (addedUser) {
          --this.numUsers;
          this.users = _.without(this.users, socket.user);

          // echo globally that this client has left
          socket.broadcast.emit('user left', {
            username: socket.username,
            numUsers: this.numUsers,
            users: this.users,
            id: socket.user.id,
          });

          // remove room from rooms array
          if (this.numUsers === 0) {
            this.emit('empty');
          }
        }
      });

      // Update user
      socket.on('update user', (data) => {
        const newUsername = this.sanitizeUsername(data.newUsername);

        if (newUsername.length > 16) {
          return false;
        }

        const user = _.find(this.users, (users) => {
          return users === socket.user;
        });

        if (user) {
          socket.username = user.username = newUsername;
          socket.user = user;

          thisIO.emit('user update', {
            username: socket.username,
            id: socket.user.id,
          });
        }

      });

    });
  }

  sanitizeUsername(str) {
    return str.replace(/[^A-Za-z0-9]/g, '-');
  }

  roomId() {
    return this.id;
  }
}

util.inherits(Room, EventEmitter);

export default Room;
