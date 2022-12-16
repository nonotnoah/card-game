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
    [key: string]: Socket
}

const serverStorage = new ServerSessionStore()

io.use((socket: MySocket, next) => {
    const sessionID: string = socket.handshake.auth.sessionID
    console.log('session ID:', sessionID)
    if (sessionID) {
        // find existing session
        const session = serverStorage.findSession(sessionID)
        console.log('sessions:', serverStorage.findAllSessions())
        if (session) {
            socket.sessionID = sessionID
            socket.userID = session.userID
            socket.username = session.username
            return next()
        }
    }
    const username = socket.handshake.auth.username
    if (!username) {
        return next(new Error('invalid username'))
    }
    socket.sessionID = randomID()
    socket.userID = randomID()
    socket.username = username
    console.log('auth:', socket.handshake.auth)
    next()
})

let players: Players = {}
io.on('connection', (socket: MySocket) => {
    // connect error
    socket.on('connect_error', err => {
        console.log(`connect_error due to ${err.message}`)
    })

    console.log('New Socket: ', socket.userID)

    let response = false
    // send session details to newly connected socket
    socket.emit('session', {
        sessionID: socket.sessionID,
        userID: socket.userID,
    })
    console.log('saving session', socket.userID)

    // persist session
    serverStorage.saveSession(socket.sessionID, {
        userID: socket.userID,
        username: socket.username,
        connected: true
    })

    players[socket.userID] = socket
    let playerIDs = Object.keys(players)
    if (playerIDs.length == 2) {
        // console.log('Creating new game with:', Object.keys(players))
        // const newGame = new Game(io, players)
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
            delete players[socket.userID] // wait a timeout
            // io.emit('disc')
        }
    })
    console.log(playerIDs)
})

server.listen(5000, () => {
    console.log('Server started on port 5000')
})