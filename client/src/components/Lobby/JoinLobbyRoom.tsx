import { useEffect, useState, useRef, MutableRefObject } from 'react'
import '../../styles/LobbyRoom.scss'
import '../../styles/JoinLobbyRoom.scss'
import { io, Socket } from 'socket.io-client'
import ClientGame from '../ClientGame'
import SettingsDisplay from './SettingsDisplay'
import Lobby from './Lobby'
import PlayersColumn from './PlayersColumn'
import TowerGame from '../Game/TowerGame'

interface MySocket extends Socket {
  [key: string]: any
}
interface LobbyProps {
  children: never[] // ???????
  socket: MySocket
  // gameID: string
  onCancel: () => void
}
interface SizeProps {
  symbol: number
  name: string
  description: string
}

const URL: string = 'http://localhost:5000'

// export default function JoinLobbyRoom({ socket, gameID, onCancel }: LobbyProps) {
export default function JoinLobbyRoom({ socket, onCancel }: LobbyProps) {
  const [waitingForPlayers, setWaitingForPlayers] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [size, setSize] = useState<SizeProps>({
    symbol: 8,
    name: 'Normal',
    description: 'The standard experience'
  })

  useEffect(() => {
    socket.on('gameStarted', () => {
      setWaitingForPlayers(false)
      setGameStarted(true)
    })
    socket.on('start', () => {
      setWaitingForPlayers(false)
    })
    socket.on('sizeChange', (res: SizeProps) => {
      setSize(res)
    })
    // socket.on('reconnect', () => {
    //   console.log('reconnecting')
    //   setWaitingForPlayers(false)
    // })
    return (): void => {
      socket.removeAllListeners();
    };
  }, [socket]);

  // on component render
  useEffect(() => {
    socket.emit('isGameStarted')
    socket.emit('needSizeChange')
  }, [])

  const handleUsernameSubmit = (username: string) => { }
  // disconnect socket and call prop onCancel to get back to Lobbies.tsx
  const handleCancel = () => {
    socket.emit('cancel')
    sessionStorage.removeItem('sessionID')
    sessionStorage.removeItem('gameID')
    socket.disconnect()
    onCancel()
  }

  return (
    <div className="wrapper">
      {waitingForPlayers ? (
        <div className="box">
          <PlayersColumn
            socket={socket}
            onUsernameSubmit={(username) => handleUsernameSubmit(username)}
            onCancel={() => handleCancel()}
          />
          <SettingsDisplay
            size={size}
          />
        </div >
      ) : gameStarted ? (
        <TowerGame initEvent='reconnect' socket={socket} />
      ) : (
        <TowerGame socket={socket} />
      )}
    </div >
  )
}