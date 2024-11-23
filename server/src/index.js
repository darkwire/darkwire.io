import dotenv from 'dotenv';
import http from 'http';
import https from 'https';
import Koa from 'koa';
import { Server } from 'socket.io';
import KoaBody from 'koa-body';
import cors from 'kcors';
import Router from 'koa-router';
import crypto from 'crypto';
import koaStatic from 'koa-static';
import koaSend from 'koa-send';

import Socket from './socket.js';
import mailer from './utils/mailer.js';
import { pollForInactiveRooms } from './inactive_rooms.js';
import getStore from './store/index.js';

dotenv.config();

const env = process.env.NODE_ENV || 'development';

const app = new Koa();
const PORT = process.env.PORT || 3001;

const router = new Router();
const koaBody = new KoaBody();

const appName = process.env.HEROKU_APP_NAME;
const isReviewApp = /-pr-/.test(appName);
const siteURL = process.env.SITE_URL;

const store = getStore();

if ((siteURL || env === 'development') && !isReviewApp) {
  app.use(
    cors({
      origin: env === 'development' ? '*' : siteURL,
      allowMethods: ['GET', 'HEAD', 'POST'],
      credentials: true,
    }),
  );
}

router.post('/abuse/:roomId', koaBody, async ctx => {
  let { roomId } = ctx.params;

  roomId = roomId.trim();

  if (process.env.ABUSE_FROM_EMAIL_ADDRESS && process.env.ABUSE_TO_EMAIL_ADDRESS) {
    const abuseForRoomExists = await store.get('abuse', roomId);
    if (!abuseForRoomExists) {
      mailer.send({
        from: process.env.ABUSE_FROM_EMAIL_ADDRESS,
        to: process.env.ABUSE_TO_EMAIL_ADDRESS,
        subject: 'Darkwire Abuse Notification',
        text: `Room ID: ${roomId}`,
      });
    }
  }

  await store.inc('abuse', roomId);

  ctx.status = 200;
});

app.use(router.routes());

const apiHost = process.env.API_HOST;
const cspDefaultSrc = `'self'${apiHost ? ` https://${apiHost} wss://${apiHost}` : ''}`;

function setStaticFileHeaders(ctx) {
  ctx.set({
    'strict-transport-security': 'max-age=31536000',
    'Content-Security-Policy': `default-src ${cspDefaultSrc} 'unsafe-inline'; img-src 'self' data:;`,
    'X-Frame-Options': 'deny',
    'X-XSS-Protection': '1; mode=block',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Feature-Policy': "geolocation 'none'; vr 'none'; payment 'none'; microphone 'none'",
  });
}

const clientDistDirectory = process.env.CLIENT_DIST_DIRECTORY;
if (clientDistDirectory) {
  app.use(async (ctx, next) => {
    setStaticFileHeaders(ctx);
    await koaStatic(clientDistDirectory, {
      maxage: ctx.req.url === '/' ? 60 * 1000 : 365 * 24 * 60 * 60 * 1000, // one minute in ms for html doc, one year for css, js, etc
    })(ctx, next);
  });

  app.use(async ctx => {
    setStaticFileHeaders(ctx);
    await koaSend(ctx, 'index.html', { root: clientDistDirectory });
  });
} else {
  app.use(async ctx => {
    ctx.body = { ready: true };
  });
}

const protocol = (process.env.PROTOCOL || 'http') === 'http' ? http : https;

const httpServer = protocol.createServer(app.callback());

const io = new Server(httpServer, {
  pingInterval: 20000,
  pingTimeout: 60000,
  maxHttpBufferSize: 5 * 1e8,
  cors: {
    origin: true,
    credentials: true,
  },
});

// Only use socket adapter if store has one
if (store.hasSocketAdapter) {
  io.adapter(store.getSocketAdapter());
}


const roomHashSecret = process.env.ROOM_HASH_SECRET || crypto.randomBytes(256).toString('hex');


const getRoomIdHash = id => {
  if (env === 'development') {
    return id;
  }

  if (roomHashSecret) {
    return crypto.createHmac('sha256', roomHashSecret).update(id).digest('hex');
  }

  return crypto.createHash('sha256').update(id).digest('hex');
};

io.on('connection', async socket => {
  const roomId = socket.handshake.query.roomId;

  const roomIdHash = getRoomIdHash(roomId);

  let room = await store.get('rooms', roomIdHash);
  room = JSON.parse(room || '{}');

  new Socket({
    roomIdOriginal: roomId,
    roomId: roomIdHash,
    socket,
    room,
  });
});

export const getIO = () => io;

const init = async () => {
  httpServer.listen(PORT, () => {
    console.log(`Darkwire is online at port ${PORT}`);
  });

  pollForInactiveRooms();
};

init();
