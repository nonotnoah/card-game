import { Socket, Server } from "socket.io"
import { Deck } from "../../utils/deck"
import { BasicGame } from "./basicGame"

interface MySocket extends Socket {
  [key: string]: any,
}
interface Players {
  [key: string]: MySocket
}
interface GameState {
  cards: string[][]
  cardsRemaining: number
  connectedPlayers: {
    [userID: string]: {
      score: number
      card: {
        state: string
        symbols: string[]
      }
    }
  }
}

export class TowerGame extends BasicGame {
  constructor(io: Server, players: Players, gameID: string, Deck: Deck) {
    super(io, players, gameID, Deck)
    this.rules = this.initRules() // Override BasicGame rules
    this.addListenersToAll(this.rules)
    // debug check if current rules work
    console.log(this.currentRules)
    this.firstTurn()
  }

  // tools -----------------------------------------

  /** @description Override this function in non-generic game class
   * to return list of game event listeners!
  */
  initRules() {
    const functions = {
      funcs: [
        this.correct,
        this.vote
      ]
    }
    return functions
    // return Array<(res: any, socket: MySocket) => void>
  }

  /**
   * @returns
   */
  // method() { }

  // tools -----------------------------------------

  // Rules/Listeners -------------------------------

  correct(guess: any, socket: MySocket) {
    const match = this.deck.checkGuess(guess, this.gameState.middleCard)
    if (match) {
      const correctPayload = { userID: socket.userID, guess }
      this.emitToRoom('goodMatch', correctPayload)
      this.gameState.connectedPlayers[socket.userID].score++
      this.gameState.connectedPlayers[socket.userID].card = this.gameState.middleCard
      // update client on gamestate
      if (this.nextTurn()) {
        this.emitToRoom('update', this.gameState)
      } else { } // endGame()?
    }
    // player will not be able to guess until next turn/update
    this.emitToRoom('badMatch', socket.userID)
  }

  vote(type: any, socket: MySocket) {
    if (type) {

    }
  }

  // Rules/Listeners -------------------------------

  // Gamestate/Emitters ----------------------------

  firstTurn() {
    // give every player facedown card
    this.sockets.map(socket => {
      let card = this.deck.drawCard('faceDown')
      socket.emit('draw', card)
      this.gameState.connectedPlayers[socket.userID].card = card
    })

    // draw middle card
    const middleCard = this.deck.drawCard('faceUp')
    this.gameState.middleCard = middleCard

    // refresh values
    this.gameState.cardsRemaining = this.deck.length()

    // update client on gamestate
    this.emitToRoom('update', this.gameState)
    // trigger timer to reveal personal cards
    this.emitToRoom('reveal', 0)
  }

  /**
   * 
   * @description updates middle card if possible
   * @returns true if cards remaining, false if not
   * @emits 'update' this.gameState
   */
  nextTurn() {
    const newCard = this.deck.drawCard('faceUp')
    if (newCard.symbols) {
      this.gameState.middleCard = newCard
      this.gameState.cardsRemaining = this.deck.length()
      return true
    }
    return false
  }

  endGame() { }

  // Gamestate/Emitters ----------------------------

}

export class WellGame extends BasicGame { }
export class BadAppleGame extends BasicGame { }
export class HotPotatoGame extends BasicGame { }