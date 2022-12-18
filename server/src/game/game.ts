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
interface DrawPayload {
  card1: (string[] | null | undefined),
  card2: (string[] | null | undefined),
  match: string
}

class Game {
  io
  players
  deck
  gameID
  serverStorage
  cards
  constructor(io: Server, gameID: string, players: Players, serverStorage?: ServerSessionStore) {
    this.io = io

    this.players = players
    this.gameID = gameID
    this.joinRoom(this.players, this.gameID)

    this.serverStorage = serverStorage

    // dobble numbers: 3, 7, 13, 21
    this.deck = new Deck(6, animals)
    this.cards = {} as DrawPayload
    this.playGame()
  }

  // rules
  correct(guess: string, socket: MySocket) {
    if (guess === this.cards.match) {
      console.log(socket.id, 'Correct guess!', guess)
      // draw next card and determine match
      this.nextTurn()
      if (this.cards.match === '') {
        this.emitToRoom('game over')
      }
    }
  }

  reconnect(socket: MySocket) {
    socket.emit('reconnect', this.cards)
    this.players[socket.userID] = socket // update with fresh socket
    this.removeAllListeners()
    this.resumeGame()
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
    let names: string[] = []
    Object.values(this.players).map(socket => {
      socket.on(listener, (res: any) => {
        func(res, socket)
      })
      names.push(socket.username)
    })
    console.log('Added listeners:', listener, 'to', this.gameID + ':\n', names)
  }
  // clear all listeners to prevent duplication on reconnection
  // there's probably a better way to do this
  removeAllListeners() {
    Object.values(this.players).map(socket => {
      socket.removeListener('correct', this.correct)
    })
    console.log('Removed all listeners from room:', this.gameID)
  }

  nextTurn() {
    this.cards.card1 = this.deck.drawCard()
    this.cards.card2 = this.deck.drawCard()
    if (Array.isArray(this.cards.card1) && Array.isArray(this.cards.card2)) {
      this.cards.match = this.deck.compareCards(this.cards.card1, this.cards.card2)
      this.emitToRoom('draw', { ...this.cards })
      // console.log('sending cards...')
    } else {
      this.cards.match = ''
    }
  }

  playGame() {
    this.emitToRoom('gameID', this.gameID)
    this.nextTurn()

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
    this.emitToRoom('gameID', this.gameID)
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