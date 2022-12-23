import { Server, Socket } from "socket.io";
import ServerSessionStore from "../sessionStore";
import { Deck } from "../utils/deck";
import { BasicGame } from "./modes/_Game";
import TowerGame from "./modes/towerGame";
import WellGame from "./modes/wellGame";
import HotPotatoGame from "./modes/hotPotatoGame";
import BadAppleGame from "./modes/badAppleGame";

interface MySocket extends Socket {
  [key: string]: any
}
interface Players {
  [userID: string]: MySocket
}
interface SizeProps {
  symbol: number
  name: string
  description: string
}
interface PlayerPacket {
  [userID: string]: {
    userID: string,
    username: string,
    isHost: Boolean
  }
}


export default class Lobby {
  gameID
  io
  connectedPlayers
  serverStorage
  gameStarted
  currentGame: BasicGame
  currentSize
  constructor(gameID: string, io: Server, serverStorage: ServerSessionStore) {
    this.gameID = gameID
    this.io = io
    this.connectedPlayers = {} as Players
    this.serverStorage = serverStorage
    this.gameStarted = false
    this.currentGame = {} as BasicGame // this might not work
    this.currentSize = { symbol: 8, name: 'Normal', description: 'The standard experience' }
  }

  // rules
  start(socket: MySocket, gameMode: string) {
    // wait for host to start game
    const symbol = this.currentSize.symbol
    let players = Object.keys(this.connectedPlayers)
    console.log('room players', players)
    if (socket.isHost && players.length > 1) {
      const deck = new Deck(symbol)
      const args = {
        io: this.io,
        players: this.connectedPlayers,
        gameID: this.gameID,
        Deck: deck
      }
      console.log('creating new game')
      switch (gameMode) {
        case 'basicGame':
          this.currentGame = new BasicGame(args)
          break
        case 'tower':
          this.currentGame = new TowerGame(args)
          break
        case 'well':
          // this.currentGame = new WellGame(args)
          break
        case 'hotPotato':
          // this.currentGame = new HotPotatoGame(args)
          break
        case 'badApple':
          // this.currentGame = new BadAppleGame(args)
          break
      }
      this.gameStarted = true
      socket.broadcast.to(this.gameID).emit('start') // JoinLobbyRoom picks this up
    }
    // TODO: create deck then pass deck to gamemode file
  }


  killLobby() {

  }

  // make oldest connection host
  newHost() {
    const players = Object.values(this.connectedPlayers)
    if (players.length > 1) {
      let newHost = players[1]
      newHost.isHost = true
      this.emitToRoom('newHost', newHost.userID)
    }
  }

  // removes socket from server storage and finds new host if needed
  cancel = (socket: MySocket) => {
    console.log(socket.userID, 'cancelled')
    this.serverStorage.deleteSession(socket.sessionID)
    if (socket.isHost) {
      this.newHost()
    }
    // socket disconnects on clientside, so leaveLobby and updatePlayers
    // are called in the disconnect method!
    // this.leaveLobby(socket)
    // this.emitToRoom('updatePlayers', players)
  }


  // async disconnect(socket: MySocket) {
  // for some reason this isn't triggering on tab close
  disconnect = (socket: MySocket) => {
    console.log('lobby.ts disconnect')
    // const matchingSockets = await this.io.in(socket.gameID).fetchSockets();
    // const isDisconnected = matchingSockets.length === 0;
    // if (isDisconnected) {
    // notify other users
    socket.broadcast.emit("user disconnected", socket.userID);
    // update the connection status of the session
    this.serverStorage.saveSession(socket.sessionID, {
      userID: socket.userID,
      username: socket.username,
      gameID: socket.gameID,
      isHost: socket.isHost,
      connected: false,
    });
    // if game started, find new host but keep session data in server store
    const players = Object.values(this.connectedPlayers)
    if (this.gameStarted && socket.isHost) {
      this.leaveLobby(socket)
      if (players.length > 0)
        this.newHost()
    } else if (!this.gameStarted) {
      this.cancel(socket)
      this.leaveLobby(socket)
    }
    console.log('Socket Closed: ', socket.userID)
  }
  // }

  sizeChange = (socket: MySocket, size: SizeProps) => {
    this.currentSize = size
    // console.log(this.currentSize);
    this.emitToRoom('sizeChange', size)
  }
  needSizeChange = (socket: MySocket) => {
    socket.emit('sizeChange', this.currentSize)
  }

  endGame(socket: MySocket) {
    this.gameStarted = false
  }

  needPlayers = (socket: MySocket) => {
    const players = this.getPlayers()
    console.log('sending', players, 'to', socket.username)
    socket.emit('updatePlayers', players)
  }

  // add listener to socket
  addListenerTo(socket: MySocket, listener: string, func: Function) {
    socket.on(listener, (res?: any) => {
      if (res) {
        func(socket, res)
      } else {
        func(socket)
      }
    })
  }

  // emit event to room
  emitToRoom(event: string, ...args: any[]) {
    this.io.in(this.gameID).emit(event, ...args)
  }

  joinLobby(socket: MySocket) {
    // add socket to connected player list
    this.connectedPlayers[socket.userID] = socket

    // add lobby listeners
    this.addListenerTo(socket, 'start', this.start)
    // not needed because 'disconnect' is called anyway
    // this.addListenerTo(socket, 'cancel', this.cancel) 
    this.addListenerTo(socket, 'disconnect', this.disconnect)
    this.addListenerTo(socket, 'end', this.endGame)
    this.addListenerTo(socket, 'sizeChange', this.sizeChange)
    this.addListenerTo(socket, 'needSizeChange', this.needSizeChange)
    this.addListenerTo(socket, 'needPlayers', this.needPlayers)

    // join socket to room
    socket.join(socket.gameID)

    // send session details to newly connected socket
    socket.emit('session', {
      sessionID: socket.sessionID,
      userID: socket.userID
    })
    console.log('emitting session to:', socket.userID)

    // persist session as key, value
    this.serverStorage.saveSession(socket.sessionID, {
      userID: socket.userID,
      username: socket.username,
      gameID: socket.gameID,
      isHost: socket.isHost,
      connected: true
    })
    console.log('server saving', socket.username + "'s session as:", socket.userID)
    // console.log('called servstore', this.serverStorage.findAllSessions())

    // update playerlist
    const players = this.getPlayers()
    console.log('sending', players, 'to players')
    this.emitToRoom('updatePlayers', players)
  }

  leaveLobby(socket: MySocket) {
    delete this.connectedPlayers[socket.userID]

    // update playerlist
    const players = this.getPlayers()
    console.log('sending', players, 'to players')
    this.emitToRoom('updatePlayers', players)
  }

  getPlayers() {
    let playerPacket: PlayerPacket = {}
    Object.values(this.connectedPlayers).map(socket => {
      playerPacket[socket.userID] = {
        userID: socket.userID,
        username: socket.username,
        isHost: socket.isHost
      }
    })
    return playerPacket
  }
}