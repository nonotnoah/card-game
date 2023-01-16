// imports
import fs from 'fs'
import express from 'express'
import http from 'http'
import { Server, Socket } from 'socket.io'
// const timesyncServer: any = require('../timesync/timesync.min.js')

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

  // // on reconnect this will be the 'sessionID' value in sessionStorage
  // // on first connect this will be undefined
  // const sessionID: string = socket.handshake.auth.sessionID
  // console.log('session ID:', sessionID)
  // if (sessionID) {
  //   // find existing session
  //   const serverSession = serverStorage.findSession(sessionID)
  //   console.log('found existing sesison:', sessionID)
  //   if (serverSession) {
  //     socket.sessionID = sessionID
  //     socket.userID = serverSession.userID
  //     socket.username = serverSession.username
  //     socket.gameID = socket.handshake.auth.gameID
  //     socket.isHost = socket.handshake.auth.isHost
  //     socket.wins = 0
  //     return next()
  //   }
  // }
  const username = socket.handshake.auth.username
  const isHost = socket.handshake.auth.isHost
  const gameID = socket.handshake.auth.gameID
  socket.sessionID = randomID()
  socket.userID = randomID()
  socket.username = username
  socket.gameID = gameID
  socket.isHost = isHost
  socket.wins = 0
  next()
})

interface Lobbies {
  [gameID: string]: Lobby
}

let currentLobbies: Lobbies = {}

io.on('connection', (socket: MySocket) => {
  console.log('socket connected:', socket.sessionID, socket.userID, socket.gameID, socket.isHost)
  socket.on("ping", (callback) => {
    const ping = Date.now() - callback
    console.log(ping)
  });

  // create new lobby if host, then join
  if (!currentLobbies[socket.gameID]) { // lobby doesn't exist
    if (socket.isHost) { // is host
      currentLobbies[socket.gameID] = new Lobby(socket.gameID, io, serverStorage)
      currentLobbies[socket.gameID].joinLobby(socket)
    } else { // isn't host, lobby doesn't exist
      socket.emit('lobbyNotFound')
      socket.emit('alert', 'Lobby not found')
      socket.disconnect()
      console.log('tried to join nonexistent lobby')
    }
  } else { // not host, lobby exists
    if (currentLobbies[socket.gameID].gameStarted) {
      socket.emit('alert', 'Cannot join game in progress')
      socket.disconnect()
    } else {
      socket.emit('lobbyFound')
      currentLobbies[socket.gameID].joinLobby(socket)
    }
    // FIXME: create live game reconnect logic
    // // reconnect if applicable
    // if (currentLobbies[socket.gameID].currentGame && currentLobbies[socket.gameID].gameStarted) {
    //   //@ts-expect-error
    //   currentLobbies[socket.gameID].currentGame.reconnect(socket)
    //   console.log('GAME STARTED:', currentLobbies[socket.gameID].gameStarted)
    // }
  }

  // delete lobby if lobby exists and everyone disconnects
  socket.on('disconnect', () => {
    if (currentLobbies[socket.gameID]) {
      const numConnectedPlayers = Object.keys(currentLobbies[socket.gameID].connectedPlayers).length
      if (numConnectedPlayers == 0) {
        delete currentLobbies[socket.gameID]
        console.log('deleting empty lobby')
      }
    }
  })
  // debug currently connected players
  // let playerIDs = serverStorage.findAllSessions()
  // console.log('sessions:\n', ...playerIDs)
  socket.on('timesync', function (data) {
    console.log('message', data);
    socket.emit('timesync', {
      id: data && 'id' in data ? data.id : null,
      result: Date.now()
    });
  });
})

server.listen(5000, () => {
  console.log('Server started on port 5000')
})
// function handler (req: any, res: any) {
//   console.log('request', req.url);

//   if (req.url === '/timesync/timesync.js') {
//     res.setHeader('Content-Type', 'application/javascript');
//     // return sendFile(path.join(__dirname, '../../../dist/timesync.js'), res);
//     return sendFile('../timesync/timesync.min.js', res);
//   }

//   if (req.url === '/' || req.url === 'index.html') {
//     return sendFile(__dirname + '/index.html', res);
//   }

//   res.writeHead(404);
//   res.end('Not found');
// }


function sendFile(filename: string, res: any) {
  fs.readFile(filename,
    function (err, data) {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading ' + filename.split('/').pop());
      }

      res.writeHead(200);
      res.end(data);
    });
}
