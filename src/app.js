// System
import express from 'express';
import mustacheExpress from 'mustache-express';
import session from 'express-session';
import Redis from 'connect-redis';
import Io from 'socket.io';
import http from 'http';
import shortid from 'shortid';
import _ from 'underscore';
import Room from './room';

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

// Routes

function generateNewRoom(req, res, id) {
  const room = new Room(io, id);
  rooms.push(room);
  console.log('generating new room');

  room.on('empty', function() {
    console.log('room empty', room._id);
    rooms = _.without(rooms, _.findWhere(rooms, {_id: room._id}));

  });

  return res.redirect(`/${id}`);
}

app.get('/', (req, res) => {
  const id = shortid.generate();
  generateNewRoom(req, res, id);
});

app.get('/:roomId', (req, res) => {
  const roomId = req.params.roomId || false;

  let roomExists = _.findWhere(rooms, {_id: roomId}) ? true : false;

  if (roomExists) {
    return res.render('index', {username: shortid.generate()});
  }

  return res.render('noop', {});

});

// Events

server.listen(3000, () => {
  console.log('fatty is on.');
});
