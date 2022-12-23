import { Server, Socket } from 'socket.io'
import { Deck } from '../../utils/deck'

interface MySocket extends Socket {
  [key: string]: any
}
interface Players {
  [key: string]: MySocket
}
interface FunctionList {
  funcs: Array<(res: any, socket: MySocket) => void>
}
function instanceOfFunctionList(object: any): object is FunctionList {
  return 'member' in object
}
interface GameState {
  cards: string[][]
  cardsRemaining: number
  connectedPlayers: string[]
  scores: {
    [userID: string]: number
  }
}

class BasicGame {
  io
  players
  deck
  gameID
  gameState: GameState
  rules
  constructor(io: Server, players: Players, gameID: string, Deck: Deck) {
    this.io = io
    this.players = players
    this.gameID = gameID
    this.deck = Deck

    this.rules = this.initRules()
    this.gameState = { // init with default values
      cards: [['']],
      cardsRemaining: this.deck.length,
      connectedPlayers: Object.keys(this.players),
      scores: { ['userID']: 0 }
    }
    
    // add default listeners to all
    this.addListenersToAll(this.rules)
  }

  // tools -----------------------------------------

  /** @description Override this function in non-generic game class
   * to return list of game event listeners!
  */
  initRules() { return Array<(res: any, socket: MySocket) => void> }

  /** 
   * @emits emits to current {this.gameID} room
  */
  emitToRoom(event: string, ...args: any[]) {
    this.io.in(this.gameID).emit(event, ...args)
  }

  /** 
  * @description Add event listener for all sockets in room
  * 
  * *Listener name needs to be the same as function rule!*
  * @example 
  * 
  * // example rule
  correct(guess: string, socket: MySocket) {
    if (guess === this.cards.match) {
      console.log(socket.id, 'Correct guess!', guess)
      // draw next card and determine match
      this.nextTurn()
      if (this.cards.match === '') {
        this.emitToRoom('gameOver')
      }
    }
  }
  // add listener 'correct'
  // manually:
  addListenerToAll([this.correct]) 
  // automatic:
  addListenerToAll(this.rules) 
  */
  addListenersToAll(listeners: (Function | FunctionList)) {
    if (instanceOfFunctionList(listeners)) {
      listeners.funcs.map((func: Function) => {
        Object.values(this.players).map(socket => {
          socket.on(func.name, (res: any) => {
            func(res, socket)
          })
        })
      })
    } else {
      Object.values(this.players).map(socket => {
        socket.on(listeners.name, (res: any) => {
          listeners(res, socket)
        })
      })
    }
    console.log('Added listeners:', listeners, 'to', this.gameID)
  }

  /** 
  * @description Clear all listeners to prevent duplication on reconnection.
  * 
  * *Listener name needs to be the same as function rule!*
  * @example 
  * 
  * // example rule
  correct(guess: string, socket: MySocket) {
    if (guess === this.cards.match) {
      console.log(socket.id, 'Correct guess!', guess)
      // draw next card and determine match
      this.nextTurn()
      if (this.cards.match === '') {
        this.emitToRoom('gameOver')
      }
    }
  }
  // remove listener 'correct'
  // manually:
  removeListenerFromAll([this.correct]) 
  // automatic:
  removeListenerFromAll(this.rules) 
  */
  removeListenerFromAll(listeners: (Function | FunctionList)) {
    if (instanceOfFunctionList(listeners)) {
      listeners.funcs.map((func: Function) => {
        Object.values(this.players).map(socket => {
          socket.removeListener(func.name, () => func())
        })
      })
    } else {
      Object.values(this.players).map(socket => {
        socket.removeListener(listeners.name, () => listeners())
      })
    }
    console.log('Removed', listeners, 'from room:', this.gameID)
  }

  /** 
  * @description *Reconnects with local game's custom event listeners.*
  * @emits 
  * emit reconnect
  * 
  * update {this.players} with current socket
  * 
  * removes rule listeners from the current room
  * 
  * re-adds listeners to the current room
  */
  reconnect(socket: MySocket) {
    socket.emit('reconnect', this.gameState)
    this.players[socket.userID] = socket // update with fresh socket
    this.removeListenerFromAll(this.rules) // remove listeners
    this.addListenersToAll(this.rules) // add listeners
  }

  // tools -----------------------------------------

  // TEMPLATE

  // Rules/Listeners -------------------------------

  // correct(guess: string, socket: MySocket) {
  //   if (guess === this.cards.match) {
  //     console.log(socket.id, 'Correct guess!', guess)
  //     // draw next card and determine match
  //     this.nextTurn()
  //     if (this.cards.match === '') {
  //       this.emitToRoom('gameOver')
  //     }
  //   }
  // }

  // Gamestate -------------------------------------

  // nextTurn() {
  //   this.cards.card1 = this.deck.drawCard()
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

  //   this.addListenerToAll('correct', (guess: string, socket: MySocket) => {
  //     this.correct(guess, socket)
  //   })
  // }

  // endGame() {
  // }

  // Gamestate -------------------------------------

  // TEMPLATE

}

export { BasicGame }