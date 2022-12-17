import { Server, Socket } from 'socket.io'
import { Deck } from '../utils/deck'
import { animals } from '../utils/animals'
import { v4 as uuidv4 } from 'uuid'
import ServerSessionStore from '../sessionStore'

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
    roomID
    serverStorage
    constructor(io: Server, players: Players, serverStorage: ServerSessionStore) {
        this.io = io

        this.players = players
        this.roomID = uuidv4()
        this.joinRoom(this.players, this.roomID)

        this.serverStorage = serverStorage

        // dobble numbers: 3, 7, 13, 21
        this.deck = new Deck(6, animals)
        this.playGame()
    }

    // join all players to game unique room
    joinRoom(players: Players, roomID: string) {
        Object.values(players).map(socket => {
            socket.join(roomID)
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
    emit(event: string, ...args: any[]) {
        this.io.in(this.roomID).emit(event, ...args)
    }

    // add event listener for all sockets in room
    addListener(listener: string, func: Function) {
        Object.values(this.players).map(socket => {
            socket.on(listener, (res: any) => {
                func(res, socket)
            })
        })
        console.log('Added listener', listener, 'to', this.roomID)
    }
    _addOnAnyListener(func: Function) {
        Object.values(this.players).map(socket => {
            socket.onAny((eventName) => {
                func(eventName, socket)
            })
        })
    }

    nextTurn() {
        const card1 = this.deck.drawCard()
        const card2 = this.deck.drawCard()
        let match: string
        if (Array.isArray(card1) && Array.isArray(card2)) {
            match = this.deck.compareCards(card1, card2)
            this.emit('draw', { card1, card2, match })
            // console.log('sending cards...')
        } else {
            match = ''
        }
        return { card1, card2, match }
    }

    playGame() {
        this.emit('room', this.roomID)
        let match = this.nextTurn().match

        this.addListener('correct', (guess: string, socket: Socket) => {
            if (guess === match) {
                console.log(socket.id, 'Correct guess!', guess)
                // draw next card and determine match
                match = this.nextTurn().match
                if (match === '') {
                    this.emit('game over')
                }
            }
        })
    }

    endGame() {
        // TODO: delete serverStorage sessions that were in game
    }
}

export { Game }