import { useEffect, useState } from "react"
import { Socket } from "socket.io-client"
interface MySocket extends Socket {
  [key: string]: any
}
interface SocketProps {
  socket: MySocket
}
export default function Lobby({ socket }: SocketProps) {
  const [connectedPlayers, setConnectedPlayers] = useState([socket] as MySocket[])

  useEffect(() => {
    // update connectedPlayers list
    socket.on('updatePlayers', (players) => {
      setConnectedPlayers(players)
    })

    return (): void => {
      socket.removeListener('updatePlayers')
    }
  }, [socket])

  return (
    <ul className="player-list">
      {connectedPlayers.map((player: MySocket) => {
        return (
          <li className={player.isHost ? 'host' : 'guest'}>
            {player.username}
          </li>
        )
      })}
    </ul>
  )
}