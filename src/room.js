import _ from 'underscore';
import {EventEmitter} from 'events';
import util from 'util';

class Room {
  constructor(io = {}, id = {}) {
    this._id = id;
    this.numUsers = 0;
    EventEmitter.call(this);

    const thisIO = io.of(this._id);
    thisIO.on('connection', (socket) => {
      let addedUser = false;

      // when the client emits 'new message', this listens and executes
      socket.on('new message', (data) => {
        // we tell the client to execute 'new message'
        socket.broadcast.emit('new message', {
          username: socket.username,
          message: data
        });
      });

      socket.on('add user', (username) => {
        if (addedUser) return;

        // we store the username in the socket session for this client
        socket.username = username;
        ++this.numUsers;
        addedUser = true;
        socket.emit('login', {
          numUsers: this.numUsers
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
          username: socket.username,
          numUsers: this.numUsers
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

          // echo globally that this client has left
          socket.broadcast.emit('user left', {
            username: socket.username,
            numUsers: this.numUsers
          });

          // remove room from rooms array
          if (this.numUsers === 0) {
            this.emit('empty');
          }
        }
      });
    });
  }

  get roomId() {
    return this.id;
  }
}

util.inherits(Room, EventEmitter);

export default Room;
