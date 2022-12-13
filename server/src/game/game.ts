import { Server, Socket } from 'socket.io'
import { Deck } from '../utils/deck'
import { animals } from '../utils/animals'
import { v4 as uuidv4 } from 'uuid'

interface Players {
    [key: string]: Socket
}

class Game {
    io
    players
    deck
    id
    constructor(io: Server, players: Players) {
        this.io = io

        this.players = players
        this.id = uuidv4()
        this.joinRoom(this.players, this.id)

        this.deck = new Deck(7, animals)
        this.playGame()
    }

    // join all players to game unique room
    joinRoom(players: Players, id: string) {
        Object.values(players).map(socket => {
            socket.join(id)
            console.log(socket.id, 'joined', id)
        })
    }

    // add event listener to all sockets in room
    addListener(listener: string, func: Function) {
        Object.values(this.players).map(socket => {
            socket.on(listener, (res: any) => {
                func(res, socket)
            })
        })
        console.log('Added listener', listener, 'to', this.id)
    }
    _addOnAnyListener(func: Function) {
        Object.values(this.players).map(socket => {
            socket.onAny((eventName) => {
                func(eventName, socket)
            })
        })
    }

    drawCards() {
        const card1 = this.deck.drawCard()
        const card2 = this.deck.drawCard()
        let match: string
        if (Array.isArray(card1) && Array.isArray(card2)) {
            match = this.deck.compareCards(card1, card2)
            this.io.in(this.id).emit('draw', { card1, card2, match }) // TODO don't send "match" in plaintext
            console.log('sending cards...')
        } else {
            match = ''
        }
        return { card1, card2, match }
    }

    playGame() {
        let match = this.drawCards().match

        this.addListener('correct', (guess: string, socket: Socket) => {
            if (guess === match) {
                console.log(socket.id, 'Correct guess!', guess)
                match = this.drawCards().match
            }
        })
    }

}

export { Game }