import { Server, Socket } from 'socket.io'
import { Deck } from '../../utils/deck'
import GameState from '../../interfaces/GameState'

interface MySocket extends Socket {
  [key: string]: any
}
interface Players {
  [userID: string]: MySocket
}
interface FunctionList {
  // funcs: Array<(res: any, socket: MySocket) => void>
  funcs: ((res: any, socket: MySocket) => void)[]
}
function instanceOfFunctionList(object: any): object is FunctionList {
  return 'member' in object
}

class BasicGame {
  io
  players
  deck
  gameID
  sockets: MySocket[]
  gameState: GameState
  currentRules: string[]
  rules: FunctionList
  readyList: string[]
  userIDs: string[]
  startAttempts
  constructor(io: Server, players: Players, gameID: string, Deck: Deck) {
    this.io = io
    this.players = players
    this.gameID = gameID
    this.deck = Deck

    this.sockets = Object.values(this.players)
    this.userIDs = Object.keys(this.players)
    this.rules = this.initRules()
    this.currentRules = []
    this.readyList = []
    this.startAttempts = 0
    this.gameState = { // init with default values
      isRunning: false,
      cardsRemaining: this.deck.length(),
      middleCard: { state: 'faceUp', symbols: [] },
      connectedPlayers: {}
    }

    // map player info to gamestate
    for (const [userID, MySocket] of Object.entries(this.players)) {
      this.gameState.connectedPlayers[userID] = {
        connected: true,
        isHost: MySocket.isHost,
        username: MySocket.username,
        ready: false,
        score: 1,
        card: { state: 'faceDown', symbols: [] }
      }
    }

    // add default listeners to all
    // this.addListenersToAll(this.rules)
    this.addAnonListenerToAll('ready', this.ready)
    // this.addAnonListenerToAll('needUpdate', this.needUpdate)
  }

  // tools -----------------------------------------

  /** @description Override this function in non-generic game class
   * to return list of game event listeners!
  */
  initRules() {
    const functions: FunctionList = {
      funcs: [
        this.ready
      ]
    }
    return functions
    // return Array<(res: any, socket: MySocket) => void> 
  }

  /** 
   * @emits emits to current {this.gameID} room
  */
  emitToRoom(event: string, ...args: any[]) {
    this.io.in(this.gameID).emit(event, ...args)
  }

  emitUpdateGameState(reason: string) {
    this.io.in(this.gameID).emit('update', reason, this.gameState)
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
  addListenersToAll({ funcs }: FunctionList) {
    funcs.map((func: Function) => {
      Object.values(this.players).map(socket => {
        socket.on(func.name, (res: any) => {
          func(res, socket)
        })
      })
      this.currentRules.push(func.name)
    })
    console.log('Added listeners:', funcs, 'to', this.gameID)
  }

  addAnonListenerToAll(listener: string, func: Function) {
    Object.values(this.players).map(socket => {
      socket.on(listener, (res?: any) => {
        if (res) {
          func(res, socket)
        } else {
          func(socket)
        }
      })
    })
    this.currentRules.push(listener)
    console.log('Added listener:', listener, 'to', this.gameID)
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
  removeListenerFromAll({ funcs }: FunctionList) {
    funcs.map((func: Function) => {
      Object.values(this.players).map(socket => {
        socket.removeListener(func.name, () => func())
      })
      const idx = this.currentRules.indexOf(func.name)
      delete this.currentRules[idx]
    })
    console.log('Removed', funcs, 'from room:', this.gameID)
  }

  /** 
  * @description *Reconnects with local game's custom event listeners.*
  * @emits 'reconnect'
  * 
  * update {this.players} with current socket
  * 
  * removes rule listeners from the current room
  * 
  * re-adds listeners to the current room
  */
  reconnect = (socket: MySocket) => { // IMPORTANT: called from index.ts
    console.log('RECONNECTING', socket.username)
    socket.emit('reconnect', this.gameState)
    this.players[socket.userID] = socket // update with fresh socket
    this.gameState.connectedPlayers[socket.userID].connected = true
    this.removeListenerFromAll(this.rules) // remove listeners
    this.addListenersToAll(this.rules) // add listeners
    this.addAnonListenerToAll('ready', this.ready)
    // this.addAnonListenerToAll('needUpdate', this.needUpdate)
  }

  /** 
  * @description *Disconnects socket and triggers continue vote*
  * @emitsToRoom 'playerLeave'
  * 
  * removes socket from {this.players} 
  */
  disconnect(socket: MySocket) { // IMPORTANT: called from lobby.ts
    // TODO: have this trigger a "vote to continue without player" modal
    this.gameState.connectedPlayers[socket.userID].connected = false
    delete this.players[socket.userID]
    this.emitUpdateGameState('player leave')
  }

  /** @returns true if expected players have joined
   * 
   */
  async playersReady(startAttempts: number) {
    // if (startAttempts > 9) { // if after 10 attempts all players haven't connected
    //   const notConnected = this.userIDs.filter(val => !this.readyList.includes(val));
    //   notConnected.map(userID => { // delete unconnected players
    //     delete this.players[userID]
    //   })
    //   this.emitToRoom('playerLeave', this.gameState)
    // }
    if (this.readyList.length == this.userIDs.length) {
      const diffList = this.readyList.filter(val => !this.userIDs.includes(val));
      if (diffList.length == 0) { // if readyList and userIDs are the same
        return true
      } else { // if foreign userIDs are detected?
        diffList.map(userID => {
          delete this.players[userID]
        })
        this.emitToRoom('update', 'playerleave', this.gameState)
      }
    }
    return false
  }

  async checkReady() {
    this.startAttempts++
    return await this.playersReady(this.startAttempts)
  }

  // tools -----------------------------------------

  // TEMPLATE

  // Rules/Listeners -------------------------------

  // this is for init value of this.currentRules
  ready = (userID: string, socket: MySocket) => {
    console.log(socket.username, 'is ready')
    this.gameState.connectedPlayers[userID].ready = true
    this.emitToRoom('update', 'player ready', this.gameState)
    this.readyList.push(userID)
  }

  // needUpdate = (socket: MySocket) => {
  //   socket.emit('update', this.gameState)
  // }

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

  // Rules/Listeners -------------------------------

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