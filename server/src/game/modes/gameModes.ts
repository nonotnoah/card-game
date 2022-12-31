import { Socket, Server } from "socket.io"
import { Deck } from "../../utils/deck"
import { BasicGame } from "./basicGame"
import GameState from "../../interfaces/GameState"

interface MySocket extends Socket {
  [key: string]: any,
}
interface Players {
  [key: string]: MySocket
}

export class TowerGame extends BasicGame {
  constructor(io: Server, players: Players, gameID: string, Deck: Deck) {
    super(io, players, gameID, Deck)
    this.rules = this.initRules() // Override BasicGame rules
    // this.addListenersToAll(this.rules)
    this.addAnonListenerToAll('needUpdate', this.needUpdate)
    this.addAnonListenerToAll('guess', this.guess)
    // debug check if current rules work
    console.log('CURRENT RULES:', this.currentRules)

    // show currently connected players
    this.sockets.map(socket => {
      this.gameState.connectedPlayers[socket.userID].username = socket.username
    })

    //try to start game every second
    const loop = setInterval(async () => {
      // console.log('checking for ready');
      // not needed unless reconnect logic is created
      // this.emitUpdateGameState('refreshing lobby')

      const result = await this.checkReady()
      if (this.startAttempts > 600) { // game can wait for 10 min before closing
        clearInterval(loop)
        console.log('nobody was ready');
        this.closeGame()
      }
      if (result) {
        clearInterval(loop)
        this.startAttempts = 0
        this.firstTurn()
      }
    }, 1000)
  }

  // tools -----------------------------------------

  /** @description Override this function in non-generic game class
   * to return list of game event listeners!
  */
  initRules() {
    // TODO: add as anon listeners
    const functions = {
      funcs: [
        // this.needUpdate,
        // this.correct,
        this.vote
      ]
    }
    return functions
  }

  /**
   * @returns
   */
  checkFilter() {
    let filterList: boolean[] = []
    this.userIDs.map(id => {
      if (this.gameState.connectedPlayers[id].canPlay) {
        filterList.push(true)
      } else {
        filterList.push(false)
      }
    })
    const clearFilter = filterList.some(val => {
      return val == true
    })
    if (!clearFilter) {
      this.userIDs.map(id => {
        this.gameState.connectedPlayers[id].canPlay = true
      })
      setTimeout(() => {
        this.emitToRoom('reveal', this.gameState, 3)
      }, 1000) // delay because filter was rendering late
      // this.emitUpdateGameState('no one guessed right')
      console.log('no one guessed right! resetting filters')
    }
  }

  // tools -----------------------------------------

  // Rules/Listeners -------------------------------

  // draws player card
  reconnect = (socket: MySocket) => {
    if (this.gameState.connectedPlayers[socket.userID]) {
      this.emitUpdateGameState('client reconnected')
    }
    else {
      this.gameState.connectedPlayers[socket.userID] = {
        connected: true,
        isHost: false,
        username: socket.username,
        ready: true,
        score: 1,
        canPlay: true,
        guessTimes: [],
        card: {
          state: 'faceDown',
          symbols: []
        }
      }
      let card = this.deck.drawCard('faceDown')
      socket.emit('draw', card)
      this.gameState.connectedPlayers[socket.userID].card = card
    }
  }

  needUpdate = (socket: MySocket) => {
    console.log('SENT UPDATE TO: ', socket.username)
    // socket.emit('update', this.gameState)
    this.emitUpdateGameState('client needed update')
  }

  guess = (guess: any, socket: MySocket) => {

    // console.log('guessed', guess)
    const match = this.deck.checkGuess(guess, this.gameState.connectedPlayers[socket.userID].card)
    // console.log('found match with mid card', match)
    const guessPayload = { userID: socket.userID, guess }
    if (match) {
      const diff = Date.now() - this.timeStart
      this.gameState.connectedPlayers[socket.userID].guessTimes.push(diff)
      this.gameState.connectedPlayers[socket.userID].score++
      this.gameState.connectedPlayers[socket.userID].card = this.gameState.middleCard
      this.emitToRoom('goodMatch', guessPayload)
      // update client on gamestate
      if (this.nextTurn()) {
        this.emitUpdateGameState('next turn')
        setTimeout(() => {
          this.timeStart = Date.now()
        }, 1500) // this delay is how long spin animation takes
      } else {
        this.endGame()
      } // endGame()?
    } else { // player will not be able to guess until next turn/update
      this.gameState.connectedPlayers[socket.userID].canPlay = false
      socket.emit('badMatch', guessPayload)
      this.emitUpdateGameState('bad match')
    }
    // expensive way to check if everyone guessed wrong
    this.checkFilter()
  }

  vote(type: any, socket: MySocket) {
    if (type) {

    }
  }

  // Rules/Listeners -------------------------------

  // Gamestate/Emitters ----------------------------

  firstTurn() {
    this.gameState.isRunning = true
    // give every player facedown card
    this.sockets.map(socket => {
      let card = this.deck.drawCard('faceDown')
      socket.emit('draw', card)
      this.gameState.connectedPlayers[socket.userID].card = card
      this.gameState.connectedPlayers[socket.userID].ready = false
    })

    // draw middle card
    const middleCard = this.deck.drawCard('faceUp')
    this.gameState.middleCard = middleCard

    // refresh values
    this.gameState.cardsRemaining = this.deck.length()

    // update client on gamestate
    this.emitUpdateGameState('show midcard before reveal')

    this.sockets.map(socket => {
      this.gameState.connectedPlayers[socket.userID].card.state = 'faceUp'
    })
    // trigger timer to reveal personal cards
    this.emitToRoom('reveal', this.gameState, 3)
    setTimeout(() => {
      this.timeStart = Date.now()
    }, 3000)
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
      this.sockets.map(socket => {
        this.gameState.connectedPlayers[socket.userID].canPlay = true
      })
      this.gameState.middleCard = newCard
      this.gameState.cardsRemaining = this.deck.length()
      return true
    }
    console.log("can't draw new card. ending game")
    return false
  }

  endGame() {
    let podium = {
      1: {
        userID: '',
        username: '',
        score: 0,
        reactionTime: 0,
      },
      2: {
        username: '',
        score: 0,
        reactionTime: 0,
      },
      3: {
        username: '',
        score: 0,
        reactionTime: 0,
      }
    } as Podium
    this.sockets.map(socket => {
      let score = this.gameState.connectedPlayers[socket.userID].score
      let guessTimes = this.gameState.connectedPlayers[socket.userID].guessTimes
      let avgGuessTime
      if (guessTimes.length > 1) {
        avgGuessTime = guessTimes.reduce((a, b) => (a + b) / guessTimes.length)
        avgGuessTime = Math.floor(avgGuessTime) / 1000 // truc to 3 decimals
      } else {
        avgGuessTime = 100
      }
      // I hate this so much why did I do this
      if (score > podium[1].score) {
        // 2 becomes 3
        podium[3].username = podium[2].username
        podium[3].score = podium[2].score
        podium[3].reactionTime = podium[2].reactionTime

        // 1 becomes 2
        podium[2].username = podium[1].username
        podium[2].score = podium[1].score
        podium[2].reactionTime = podium[1].reactionTime

        // new becomes 1
        podium[1].userID = socket.userID
        podium[1].username = socket.username
        podium[1].score = score
        podium[1].reactionTime = avgGuessTime
      } else if (score == podium[1].score) {
        if (podium[1].reactionTime > avgGuessTime) {
          // 2 becomes 3
          podium[3].username = podium[2].username
          podium[3].score = podium[2].score
          podium[3].reactionTime = podium[2].reactionTime

          // 1 becomes 2
          podium[2].username = podium[1].username
          podium[2].score = podium[1].score
          podium[2].reactionTime = podium[1].reactionTime

          // new becomes 1
          podium[1].userID = socket.userID
          podium[1].username = socket.username
          podium[1].score = score
          podium[1].reactionTime = avgGuessTime
        }
      } else if (score < podium[1].score && score > podium[2].score) {
        // 2 becomes 3
        podium[3].username = podium[2].username
        podium[3].score = podium[2].score
        podium[3].reactionTime = podium[2].reactionTime

        // new becomes 2
        podium[2].username = socket.username
        podium[2].score = score
        podium[2].reactionTime = avgGuessTime
      } else if (score == podium[2].score) {
        if (podium[2].reactionTime > avgGuessTime) {
          // 2 becomes 3
          podium[3].username = podium[2].username
          podium[3].score = podium[2].score
          podium[3].reactionTime = podium[2].reactionTime

          // new becomes 2
          podium[2].username = socket.username
          podium[2].score = score
          podium[2].reactionTime = avgGuessTime
        }
      } else if (score < podium[2].score && score > podium[3].score) {
        // new beomes 3
        podium[3].username = socket.username
        podium[3].score = score
        podium[3].reactionTime = avgGuessTime
      } else if (score == podium[2].score) {
        if (podium[3].reactionTime > avgGuessTime) {
          // new beomes 3
          podium[3].username = socket.username
          podium[3].score = score
          podium[3].reactionTime = avgGuessTime
        }
      }

      this.gameState.connectedPlayers[socket.userID].ready = false
      this.gameState.connectedPlayers[socket.userID].score = 0
      this.gameState.connectedPlayers[socket.userID].card = { state: 'faceDown', symbols: [] }
    })
    this.gameState.winner = podium[1].userID
    console.log('WINNER:', this.gameState.winner)
    this.gameState.isRunning = false
    this.gameState.middleCard = { state: 'faceDown', symbols: [] }
    this.emitUpdateGameState('game ended')
    this.emitToRoom('podium', podium)
  }

  closeGame() { }

  // Gamestate/Emitters ----------------------------

}
interface Podium {
  1: {
    userID: string
    username: string
    score: number
    reactionTime: number
  }
  2: {
    username: string
    score: number
    reactionTime: number
  }
  3: {
    username: string
    score: number
    reactionTime: number
  }
}

export class WellGame extends BasicGame { }
export class BadAppleGame extends BasicGame { }
export class HotPotatoGame extends BasicGame { }