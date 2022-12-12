import { Server, Socket } from 'socket.io'
import { Deck } from '../utils/deck'
import { animals } from '../utils/animals'

interface Players {
    [key: string]: Socket
}

class Game {
    io
    players
    deck
    constructor(io: Server, players: Players) {
        this.io = io
        this.players = players
        this.deck = new Deck(7, animals)
        this.playGame(this.deck)
    }

    playGame(deck: Deck) {
        const card1 = deck.drawCard()
        const card2 = deck.drawCard()
        let match: string
        if (Array.isArray(card1) && Array.isArray(card2)) {
            match = this.deck.compareCards(card1, card2)
            this.io.emit('draw', { card1, card2, match }) // TODO don't send "match" in plaintext
        }

        this.io.on('correct', (guess) => {
            if (guess == match) {
                console.log(guess)
            }
        })
    }

}

export { Game }