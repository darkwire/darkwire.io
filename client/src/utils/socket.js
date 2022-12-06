import socketIO from 'socket.io-client';
import generateUrl from '@/api/generator';

let socket;

export const connect = roomId => {
  socket = socketIO(generateUrl(), {
    query: {
      roomId,
    },
    forceNew: true,
  });
  return socket;
};

export const getSocket = () => socket;
