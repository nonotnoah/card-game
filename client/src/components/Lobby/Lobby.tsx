// TODO: make connectedPlayers a callable API that returns promises
import { useEffect, useRef, useState } from "react"
import { Socket } from "socket.io-client"
import { animalEmojis, getEmoji } from "../../utils/animalEmojis"

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
  const playerList = useRef(Object.values(connectedPlayers))
  // console.log(playerList)
  // console.log(connectedPlayers)
  useEffect(() => {
    // update connectedPlayers list
    socket.on('updatePlayers', (players) => {
      // console.log(Object.values(players))
      setConnectedPlayers(players)
      playerList.current = Object.values(players)
    })

    return (): void => {
      socket.removeListener('updatePlayers')
    }
  }, [socket])
  if (playerList.current.length == 0) {
    socket.emit('needPlayers')
  }

  // return random emoji and set socket.username to it

  return (
    <ul className="player-list">
      {playerList.current.length > 0 &&
        playerList.current.map((player) => {
          // console.log(player.userID, socket.userID)
          return (
            <li key={player.userID} id={player.userID}
              className={`
            ${player.isHost ? 'host' : 'guest'}
            ${player.userID == socket.userID ? 'you' : ''} 
            `}>
              {`${getEmoji(player.username)} ${player.username} ${player.userID == socket.userID ? '(you)' : ''} ${player.isHost ? '(👑)' : ''}`}
            </li>
          )
        })}
    </ul>
  )
}