import _ from 'underscore';
import express from 'express';
import mustacheExpress from 'mustache-express';
import Io from 'socket.io';
import http from 'http';
import shortid from 'shortid';
import favicon from 'serve-favicon';
import compression from 'compression';
import fs from 'fs';

import Room from './room';

const $CONFIG = {
  port: process.env.port || process.env.PORT || 3000
};

const app = express();
const server = http.createServer(app);
const io = Io(server);

let rooms = [];

app.use(compression());
app.use(favicon(__dirname + '/public/favicon.ico'));
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

function generateNewRoom(req, res, id) {
  const room = new Room(io, id);
  rooms.push(room);
  console.log('generating new room');

  room.on('empty', function() {
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

  let roomExists = _.findWhere(rooms, {_id: roomId}) || false;

  if (roomExists) {
    return res.render('index', {
      APP: {
        version: process.env.npm_package_version,
        ip: req.headers['x-forwarded-for']
      },
      username: shortid.generate()
    });
  }

  return res.redirect('/');
});

server.listen($CONFIG.port, () => {
  console.log(`darkwire is online on port ${$CONFIG.port}.`);
});
