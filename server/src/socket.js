import { getIO } from './index.js';
import getStore from './store/index.js';

export default class Socket {
  constructor(opts) {
    const { roomId, socket, room, roomIdOriginal } = opts;

    this._roomId = roomId;
    this.socket = socket;
    this.roomIdOriginal = roomIdOriginal;
    this.room = room;
    if (room.isLocked) {
      this.sendRoomLocked();
      return;
    }

    this.init(opts);
  }

  async init(opts) {
    const { roomId, socket, room } = opts;
    await this.joinRoom(roomId, socket);
    this.handleSocket(socket);
  }

  sendRoomLocked() {
    this.socket.emit('ROOM_LOCKED');
  }

  async saveRoom(room) {
    const json = {
      ...room,
      updatedAt: Date.now(),
    };

    return getStore().set('rooms', this._roomId, JSON.stringify(json));
  }

  async destroyRoom() {
    return getStore().del('rooms', this._roomId);
  }

  fetchRoom() {
    return new Promise(async (resolve, reject) => {
      const res = await getStore().get('rooms', this._roomId);
      resolve(JSON.parse(res || '{}'));
    });
  }

  joinRoom(roomId, socket) {
    return new Promise((resolve, reject) => {
      if (getStore().hasSocketAdapter) {
        getIO().of('/').adapter.remoteJoin(socket.id);
      } else {
        socket.join(roomId);
        resolve();
      }
    });
  }

  async handleSocket(socket) {
    socket.on('ENCRYPTED_MESSAGE', payload => {
      socket.to(this._roomId).emit('ENCRYPTED_MESSAGE', payload);
    });

    socket.on('USER_ENTER', async payload => {
      let room = await this.fetchRoom();
      if (Object.entries(room).length === 0) {
        room = {
          id: this._roomId,
          users: [],
          isLocked: false,
          createdAt: Date.now(),
        };
      }

      const newRoom = {
        ...room,
        users: [
          ...(room.users || []),
          {
            socketId: socket.id,
            publicKey: payload.publicKey,
            isOwner: (room.users || []).length === 0,
          },
        ],
      };
      await this.saveRoom(newRoom);

      getIO()
        .to(this._roomId)
        .emit('USER_ENTER', {
          ...newRoom,
          id: this.roomIdOriginal,
        });
    });

    socket.on('TOGGLE_LOCK_ROOM', async (data, callback) => {
      const room = await this.fetchRoom();
      const user = (room.users || []).find(u => u.socketId === socket.id && u.isOwner);

      if (!user) {
        callback({
          isLocked: room.isLocked,
        });
        return;
      }

      await this.saveRoom({
        ...room,
        isLocked: !room.isLocked,
      });

      socket.to(this._roomId).emit('TOGGLE_LOCK_ROOM', {
        locked: !room.isLocked,
        publicKey: user && user.publicKey,
      });

      callback({
        isLocked: !room.isLocked,
      });
    });

    socket.on('disconnect', () => this.handleDisconnect(socket));

    socket.on('USER_DISCONNECT', () => this.handleDisconnect(socket));
  }

  async handleDisconnect(socket) {
    let room = await this.fetchRoom();

    const newRoom = {
      ...room,
      users: (room.users || [])
        .filter(u => u.socketId !== socket.id)
        .map((u, index) => ({
          ...u,
          isOwner: index === 0,
        })),
    };

    await this.saveRoom(newRoom);

    getIO().to(this._roomId).emit('USER_EXIT', newRoom.users);

    if (newRoom.users && newRoom.users.length === 0) {
      await this.destroyRoom();
    }

    socket.disconnect(true);
  }
}
