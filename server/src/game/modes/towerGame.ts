import { Socket, Server } from "socket.io"
import { Deck } from "../../utils/deck"
import { BasicGame } from "./basicGame"

interface MySocket extends Socket {
  [key: string]: any
}
interface Players {
  [key: string]: MySocket
}
interface GameState {
  cards: string[][]
  cardsRemaining: number
  connectedPlayers: string[]
  scores: {
    [userID: string]: number
  }
}

export default class TowerGame extends BasicGame {
  constructor(io: Server, players: Players, gameID: string, Deck: Deck) {
    super(io, players, gameID, Deck)
  }

  // Gamestate -------------------------------------

  // nextTurn() {
    // this.gameState.cards.card1 = this.deck.drawCard()
    //   this.cards.card2 = this.deck.drawCard()
    //   if (Array.isArray(this.cards.card1) && Array.isArray(this.cards.card2)) {
    //     this.cards.match = this.deck.compareCards(this.cards.card1, this.cards.card2)
    //     this.emitToRoom('draw', { ...this.cards })
    //     // console.log('sending cards...')
    //   } else {
    //     this.cards.match = ''
    //   }
    // }

    // playGame() {
    //   this.emitToRoom('start')
    //   this.nextTurn()
    // }

    // endGame() {
    // }

    // Gamestate -------------------------------------

  }