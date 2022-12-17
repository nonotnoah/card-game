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

interface Players {
    [key: string]: MySocket
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
            socket.roomID = socket.handshake.auth.roomID
            return next()
        }
    }
    console.log('creating new session with auth:', socket.handshake.auth)
    const username = socket.handshake.auth.username
    socket.sessionID = randomID()
    socket.userID = randomID()
    socket.username = username
    next()
})

let players: Players = {}
let gameCreated = false
io.on('connection', (socket: MySocket) => {
    console.log('socket connected:', socket.username)
    if (socket.roomID) {
        socket.join(socket.roomID)
    }

    // send session details to newly connected socket
    socket.emit('session', {
        sessionID: socket.sessionID,
        userID: socket.userID,
    })
    console.log('emitting session to:', socket.username )

    // persist session as key, value
    serverStorage.saveSession(socket.sessionID, {
        userID: socket.userID,
        username: socket.username,
        connected: true
    })
    console.log('server saving', socket.username + "'s session as:", socket.userID)

    players[socket.userID] = socket
    // let playerIDs = Object.keys(players)
    let playerIDs = serverStorage.findAllSessions()
    console.log('sessions:\n', playerIDs)
    if (playerIDs.length == 2 && !gameCreated) {
        console.log('Creating new game with:', Object.keys(players))
        const newGame = new Game(io, players, serverStorage)
        gameCreated = true
    }

    socket.on('disconnect', async () => {
        const matchingSockets = await io.in(socket.userID).fetchSockets();
        const isDisconnected = matchingSockets.length === 0;
        if (isDisconnected) {
            // notify other users
            socket.broadcast.emit("user disconnected", socket.userID);
            // update the connection status of the session
            serverStorage.saveSession(socket.sessionID, {
                userID: socket.userID,
                username: socket.username,
                connected: false,
            });
            console.log('Socket Closed: ', socket.userID)
            console.log(playerIDs)
            delete players[socket.userID] // wait a timeout
            // io.emit('disc')
        }
    })
})

server.listen(5000, () => {
    console.log('Server started on port 5000')
})