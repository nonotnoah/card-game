// imports
import express from 'express'
import http from 'http'
import { Server, Socket } from 'socket.io'

import { Game } from './game/game'
import randomID from './utils/randomID'

import ServerSessionStore from './sessionStore'

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*'
  }
})

interface MySocket extends Socket {
  // userID: string
  // sessionID: string
  // username: string
  [key: string]: any
}

const serverStorage = new ServerSessionStore()

io.use((socket: MySocket, next) => {
  // on reconnect this will be the 'sessionID' value in sessionStorage
  // on first connect this will be undefined
  const sessionID: string = socket.handshake.auth.sessionID
  console.log('session ID:', sessionID)
  if (sessionID) {
    // find existing session
    const serverSession = serverStorage.findSession(sessionID)
    console.log('found existing sesison:', sessionID)
    if (serverSession) {
      socket.sessionID = sessionID
      socket.userID = serverSession.userID
      socket.username = serverSession.username
      socket.gameID = socket.handshake.auth.gameID
      socket.isHost = socket.handshake.auth.isHost
      return next()
    }
  }
  console.log('creating new session with auth:', socket.handshake.auth)
  const username = socket.handshake.auth.username
  const isHost = socket.handshake.auth.isHost
  const gameID = socket.handshake.auth.gameID
  socket.sessionID = randomID()
  socket.userID = randomID()
  socket.username = username
  socket.gameID = gameID
  socket.isHost = isHost
  next()
})

interface WaitingRoom {
  [gameID: string]: {
    [userID: string]: MySocket
  }
}

let waitingRoom: WaitingRoom = {}
let currentGames: { [gameID: string]: Game } = {}
io.on('connection', (socket: MySocket) => {
  console.log('socket connected:', socket.userID)

  // join socket to room
  socket.join(socket.gameID)

  // send session details to newly connected socket
  socket.emit('session', {
    sessionID: socket.sessionID,
  })
  console.log('emitting session to:', socket.userID)

  // persist session as key, value
  serverStorage.saveSession(socket.sessionID, {
    userID: socket.userID,
    username: socket.username,
    gameID: socket.gameID,
    isHost: socket.isHost,
    connected: true
  })
  console.log('server saving', socket.username + "'s session as:", socket.userID)

  // debug currently connected players
  let playerIDs = serverStorage.findAllSessions()
  console.log('sessions:\n', ...playerIDs)

  // add socket to waiting room
  waitingRoom[socket.gameID] = { ...waitingRoom[socket.gameID], [socket.userID]: socket }
  let players = waitingRoom[socket.gameID]
  let keys = Object.keys(players)
  console.log('room players', keys)

  // reconnect if applicable
  if (currentGames[socket.gameID]) {
    currentGames[socket.gameID].reconnect(socket)
  }

  socket.on('cancel', () => {
    if (socket.isHost && keys.length > 2) {
      delete waitingRoom[socket.gameID][socket.userID]
      let newHost = waitingRoom[socket.gameID][0]
      newHost.isHost = true
      socket.to(socket.gameID).emit('newHost', newHost.userID)
    }
  })

  // wait for host to start game
  socket.on('start', () => {
    if (socket.isHost && keys.length > 1) {
      currentGames[socket.gameID] = new Game(io, players)
      console.log('creating new game')
    }
  })

  socket.on('disconnect', async () => {
    const matchingSockets = await io.in(socket.gameID).fetchSockets();
    const isDisconnected = matchingSockets.length === 0;
    if (isDisconnected) {
      // notify other users
      socket.broadcast.emit("user disconnected", socket.userID);
      // update the connection status of the session
      serverStorage.saveSession(socket.sessionID, {
        userID: socket.userID,
        username: socket.username,
        gameID: socket.gameID,
        isHost: socket.isHost,
        connected: false,
      });
      console.log('Socket Closed: ', socket.userID)
      console.log(serverStorage.findAllSessions())
      // console.log(playerIDs)
      // delete currentGames[socket.gameID].players[socket.userID] // FIXME: wait a timeout
      // io.emit('disc')
    }
  })
})

server.listen(5000, () => {
  console.log('Server started on port 5000')
})