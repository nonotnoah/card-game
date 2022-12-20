// imports
import express from 'express'
import http from 'http'
import { Server, Socket } from 'socket.io'

import { Game } from './game/game'
import Lobby from './game/lobby'
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

const serverStorage = new ServerSessionStore() // I wish this was an api

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

interface Lobbies {
  [gameID: string]: Lobby
}

let currentLobbies: Lobbies = {}

io.on('connection', (socket: MySocket) => {
  console.log('socket connected:', socket.userID)
  console.log(socket.sessionID, socket.userID, socket.gameID, socket.isHost)

  // create new lobby if host, then join
  if (!currentLobbies[socket.gameID]) {
    if (socket.isHost) {
      currentLobbies[socket.gameID] = new Lobby(socket.gameID, io, serverStorage)
    } else {
      socket.emit('lobbyNotFound')
      console.log('tried to join nonexistent lobby')
    }
    currentLobbies[socket.gameID].joinLobby(socket)
  }

  // reconnect if applicable
  if (currentLobbies[socket.gameID].gameStarted) {
    currentLobbies[socket.gameID].Game.reconnect(socket)
  }

  // delete lobby if everyone disconnects
  socket.on('disconnect', () => {
    const numConnectedPlayers = Object.keys(currentLobbies[socket.gameID].connectedPlayers).length
    if (numConnectedPlayers == 0) {
      delete currentLobbies[socket.gameID]
      console.log('deleting empty lobby')
    }
  })
  // debug currently connected players
  // let playerIDs = serverStorage.findAllSessions()
  // console.log('sessions:\n', ...playerIDs)
})

server.listen(5000, () => {
  console.log('Server started on port 5000')
})