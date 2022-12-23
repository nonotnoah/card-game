import { Server, Socket } from 'socket.io'
import { Deck } from '../../utils/deck'
import { animals } from '../../utils/animals'
import { v4 as uuidv4 } from 'uuid'
import ServerSessionStore from '../../sessionStore'
import { connect } from 'http2'
import Lobby from '../lobby'

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
interface GameArgs {
  io: Server
  players: Players
  gameID: string
  Deck: Deck
}

class BasicGame {
  io
  players
  deck
  gameID
  // serverStorage
  cards
  constructor({ io, players, gameID, Deck }: GameArgs) {
    this.io = io

    this.players = players
    this.gameID = gameID

    // this.symbols = symbols

    // this.deck = new Deck(symbols, animals)
    this.deck = Deck
    this.cards = {} as DrawPayload
    this.playGame()
  }

  emitToRoom(event: string, ...args: any[]) {
    this.io.in(this.gameID).emit(event, ...args)
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
  removeListenersFromAll(listener: Function) {
    Object.values(this.players).map(socket => {
      socket.removeListener('correct', () => listener())
    })
    console.log('Removed all listeners from room:', this.gameID)
  }

  // this is called in index.ts
  reconnect(socket: MySocket) {
    socket.emit('reconnect', this.cards)
    this.players[socket.userID] = socket // update with fresh socket
    this.removeListenersFromAll(this.correct) // refresh listeners
    this.addListenerToAll('correct', (guess: string, socket: MySocket) =>
      this.correct(guess, socket)
    )
  }

  // ---
  // rules
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
  // ---

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
    this.emitToRoom('start')
    this.nextTurn()

    this.addListenerToAll('correct', (guess: string, socket: MySocket) => {
      this.correct(guess, socket)
    })
  }

  endGame() {
    // TODO: delete serverStorage sessions that were in game
  }
}

export { BasicGame }