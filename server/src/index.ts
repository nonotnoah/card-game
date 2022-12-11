// imports
import express from 'express'
import http from 'http'
import { Server, Socket } from 'socket.io'

import { Game } from './game/game'

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: '*'
    }
})

// app.get('/', (req, res) => {
//     res.send('Hello from server')
// })

interface Players {
    [key: string]: Socket
}
let players: Players = {}
io.on('connection', (socket: Socket) => {
    console.log('New Socket: ', socket.id)
    players[socket.id] = socket

    if (Object.keys(players).length > 1) {
        const newGame = new Game(io, players)
    }
    // io.emit('test')
    socket.on('disconnect', () => {
        console.log('Socket Closed: ', socket.id)
        delete players[socket.id]
        // io.emit('disc')
    })
})

server.listen(5000, () => {
    console.log('Server started on port 5000')
})