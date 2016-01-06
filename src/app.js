// System
import express from 'express';
import mustacheExpress from 'mustache-express';
import session from 'express-session';
import Redis from 'connect-redis';
import Io from 'socket.io';
import http from 'http';
import shortid from 'shortid';
import _ from 'underscore';

const app = express();
const server = http.createServer(app);
const io = Io(server);
const RedisStore = Redis(session);
const sessionMiddleware = session({
  store: new RedisStore({
    host: 'localhost',
    port: 6379,
    db: 2
  }),
  secret: 'hay',
  resave: true,
  saveUninitialized: true
});

var rooms = [];

io.use(function(socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');
app.use(sessionMiddleware);
app.use(express.static(__dirname + '/public'));

class Room {
  constructor(id) {
    this.id = id;
    this.numUsers = 0;
    this.init();
  }
  init() {
    const thisIO = io.of(this.id);

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
            rooms = _.without(rooms, _.findWhere(rooms, {id: this.id}));
          }
        }
      });
    });
  }
}

// Routes

app.get('/', (req, res) => {
  const id = shortid.generate();
  const room = new Room(id);
  rooms.push(room);

  res.redirect(`/${id}`);
});

app.get('/*', (req, res) => {
  res.render('index', {username: shortid.generate()});
});

server.listen(3000, () => {
  console.log('fatty is on.');
});
