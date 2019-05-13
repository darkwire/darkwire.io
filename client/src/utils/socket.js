import socketIO from 'socket.io-client'
import apiConfig from '../api/config'
import generateUrl from '../api/generator';

let socket

export const connect = (roomId) => {
  socket = socketIO(generateUrl(), {
    query: {
      roomId,
    },
    forceNew: true,
  })
  return socket
}

export const getIO = () => socket
