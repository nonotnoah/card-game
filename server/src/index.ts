// imports
const express = require('express')
const http = require('http')

const app = express()
const server = http.createServer(app)

const { Server } = require('socket.io')
const io = new Server(server, {
    cors: {
        origin: '*'
    }
})

// app.get('/', (req, res) => {
//     res.send('Hello from server')
// })

io.on('connection', (socket: any) => {
    console.log('New Socket: ', socket.id)
    io.emit('test')
    socket.on('disconnect', () => {
        console.log('Socket Closed: ', socket.id)
        io.emit('disc')
    })
})

server.listen(5000, () => {
    console.log('Server started on port 5000')
})