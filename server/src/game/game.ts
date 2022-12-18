import { Server, Socket } from 'socket.io'
import { Deck } from '../utils/deck'
import { animals } from '../utils/animals'
import { v4 as uuidv4 } from 'uuid'
import ServerSessionStore from '../sessionStore'
import { connect } from 'http2'

interface MySocket extends Socket {
    [key: string]: any
}
interface Players {
    [key: string]: MySocket
}

class Game {
    io
    players
    deck
    gameID
    serverStorage
    match
    constructor(io: Server, gameID: string, players: Players, serverStorage?: ServerSessionStore) {
        this.io = io

        this.players = players
        this.gameID = gameID
        this.joinRoom(this.players, this.gameID)

        this.serverStorage = serverStorage

        // dobble numbers: 3, 7, 13, 21
        this.deck = new Deck(6, animals)
        this.match = 'init'
        this.playGame()
    }

    // rules
    correct(guess: string, socket: MySocket) {
        if (guess === this.match) {
            console.log(socket.id, 'Correct guess!', guess)
            // draw next card and determine match
            this.match = this.nextTurn().match
            if (this.match === '') {
                this.emitToRoom('game over')
            }
        }
    }

    reconnect(socket?: MySocket) {
        this.removeAllListeners()
        this.resumeGame()
        // this.io.of(this.gameID).adapter.on('join-room', )
    }

    // join all players to game unique room
    joinRoom(players: Players, gameID: string) {
        Object.values(players).map(socket => {
            socket.join(gameID)
            // this.serverStorage.saveSession(socket.sessionID, {
            //     roomID: socket.roomID,
            //     // these don't need to be here but I'm too tired to 
            //     // fight with types right now
            //     userID: socket.userID,
            //     username: socket.username,
            //     connected: true
            // })
            // console.log(socket.id, 'joined', roomId)
        })
    }
    emitToRoom(event: string, ...args: any[]) {
        this.io.in(this.gameID).emit(event, ...args)
    }

    _addOnAnyListener(func: Function) {
        Object.values(this.players).map(socket => {
            socket.onAny((eventName) => {
                func(eventName, socket)
            })
        })
    }
    // add event listener for all sockets in room
    addListenerToAll(listener: string, func: Function) {
        Object.values(this.players).map(socket => {
            socket.on(listener, (res: any) => {
                func(res, socket)
            })
        })
        console.log('Added listeners:', listener, 'to', this.gameID)
    }
    // clear all listeners to prevent duplication on reconnection
    // there's probably a better way to do this
    removeAllListeners() {
        Object.values(this.players).map(socket => {
            socket.removeAllListeners()
        })
        console.log('Removed all listeners from room:', this.gameID)
    }

    nextTurn() {
        const card1 = this.deck.drawCard()
        const card2 = this.deck.drawCard()
        let match: string
        if (Array.isArray(card1) && Array.isArray(card2)) {
            match = this.deck.compareCards(card1, card2)
            this.emitToRoom('draw', { card1, card2, match })
            // console.log('sending cards...')
        } else {
            match = ''
        }
        return { card1, card2, match }
    }

    playGame() {
        this.emitToRoom('gameID', this.gameID)
        this.match = this.nextTurn().match

        this.addListenerToAll('correct', (guess: string, socket: MySocket) => {
            this.correct(guess, socket)
        })

        // this.addListenerToAll('correct', (guess: string, socket: MySocket) => {
        //     if (guess === this.match) {
        //         console.log(socket.id, 'Correct guess!', guess)
        //         // draw next card and determine match
        //         this.match = this.nextTurn().match
        //         if (this.match === '') {
        //             this.emitToRoom('game over')
        //         }
        //     }
        // })
    }

    resumeGame() {
        this.addListenerToAll('correct', (guess: string, socket: MySocket) =>
            this.correct(guess, socket)
        )
        // this.addListenerToAll('correct', (message: string, socket: MySocket) =>
        //     this.message(message, socket)
        // )
    }

    endGame() {
        // TODO: delete serverStorage sessions that were in game
    }
}

export { Game }