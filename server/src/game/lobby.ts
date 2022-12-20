import { Server, Socket } from "socket.io";
import ServerSessionStore from "../sessionStore";
import { Game } from "./game";

interface MySocket extends Socket {
  [key: string]: any
}
interface Players {
  [userID: string]: MySocket
}
interface SizeProps {
  numberOfSymbols: number
  sizeName: string
  sizeDescription: string
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
  Game: Game
  constructor(gameID: string, io: Server, serverStorage: ServerSessionStore) {
    this.gameID = gameID
    this.io = io
    this.connectedPlayers = {} as Players
    this.serverStorage = serverStorage
    this.gameStarted = false
    this.Game = {} as Game // this might not work
  }

  // rules
  start(socket: MySocket) {
    // wait for host to start game
    let keys = Object.keys(this.connectedPlayers)
    console.log('room players', keys)
    if (socket.isHost && keys.length > 1) {
      socket.broadcast.to(this.gameID).emit('start') // JoinLobbyRoom picks this up
      this.Game = new Game(
        this.io,
        this.connectedPlayers,
        this.gameID
      )
      console.log('creating new game')
    }
    this.gameStarted = true
  }

  cancel(socket: MySocket) {
    this.serverStorage.deleteSession(socket.sessionID)
    const players = Object.values(this.connectedPlayers)
    if (socket.isHost && players.length > 0) {
      let newHost = this.connectedPlayers[0]
      newHost.isHost = true
      this.emitToRoom('newHost', newHost.userID)
    }
    // socket disconnects on clientside, so leaveLobby and updatePlayers
    // are called in the disconnect method!
    // this.leaveLobby(socket)
    // this.emitToRoom('updatePlayers', players)
  }

  async disconnect(socket: MySocket) {
    const matchingSockets = await this.io.in(socket.gameID).fetchSockets();
    const isDisconnected = matchingSockets.length === 0;
    if (isDisconnected) {
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
      this.leaveLobby(socket)
      console.log('Socket Closed: ', socket.userID)
      console.log(this.serverStorage.findAllSessions())
    }
  }

  sizeChange(socket: MySocket, res: SizeProps) {
    socket.broadcast.to(this.gameID).emit('sizeChange', res)
  }

  endGame(socket: MySocket) {
    this.gameStarted = false
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
    this.addListenerTo(socket, 'cancel', this.cancel)
    this.addListenerTo(socket, 'disconnect', this.disconnect)
    this.addListenerTo(socket, 'end', this.endGame)

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