import { Server } from "socket.io"
import { Deck } from "../../utils/deck"
import { BasicGame } from "./basicGame"
interface MySocket extends Socket {
  [key: string]: any
}
interface Players {
  [key: string]: MySocket
}
interface GameArgs {
  io: Server
  players: Players
  gameID: string
  Deck: Deck
}
export default class TowerGame extends BasicGame {
  constructor({ io, players, gameID, Deck }: GameArgs) {
    super({ io, players, gameID, Deck })
  }
}


class test {
  constructor(arg: any) {

  }
}

class newtest extends test {
  constructor(arg: any, arg2: any) {
    super(arg) 
  }
}