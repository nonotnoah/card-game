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

export class TowerGame extends BasicGame {
  constructor(io: Server, players: Players, gameID: string, Deck: Deck) {
    super(io, players, gameID, Deck)
    this.rules = this.initRules() // Override BasicGame rules
    // debug check if current rules work
    console.log(this.currentRules)
  }

  // tools -----------------------------------------

  /** @description Override this function in non-generic game class
   * to return list of game event listeners!
  */
  initRules() { return Array<(res: any, socket: MySocket) => void> }

  // tools -----------------------------------------

  // Rules/Listeners -------------------------------

  // Rules/Listeners -------------------------------

  // Gamestate/Emitters ----------------------------

  firstTurn() {
    this.sockets.map(socket => {
      socket.emit('draw', this.deck.drawCard('faceDown'))
    })
    this.gameState = { // refresh values
      cards: this.deck.cardsCopy, 
      cardsRemaining: this.deck.length(),
      connectedPlayers: Object.keys(this.players),
      scores: { ['userID']: 0 }
    }
  }
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

  // Gamestate/Emitters ----------------------------

}

export class WellGame extends BasicGame { }
export class BadAppleGame extends BasicGame { }
export class HotPotatoGame extends BasicGame { }