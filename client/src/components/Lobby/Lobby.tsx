import { useEffect, useState } from "react"
import { Socket } from "socket.io-client"
import '../../styles/Lobby.scss'
interface MySocket extends Socket {
  [key: string]: any
}
interface SocketProps {
  socket: MySocket
}
interface Players {
  [userID: string]: MySocket
}
interface PlayerPacket {
  [userID: string]: {
    userID: string,
    username: string,
    isHost: Boolean
  }
}
export default function Lobby({ socket }: SocketProps) {
  const [connectedPlayers, setConnectedPlayers] = useState({} as PlayerPacket)
  console.log(connectedPlayers)

  useEffect(() => {
    // update connectedPlayers list
    socket.on('updatePlayers', (players) => {
      // console.log(Object.values(players))
      setConnectedPlayers(players)
    })

    return (): void => {
      socket.removeListener('updatePlayers')
    }
  }, [socket])
  console.log(socket)

  return (
    <ul className="player-list">
      {Object.values(connectedPlayers).map((player) => {
        return (
          <li
            className={`
            ${player.isHost ? 'host' : 'guest'}
            ${player.userID == socket.userID ? 'you' : ''} 
            `}>
            {player.username}
          </li>
        )
      })}
    </ul>
  )
}