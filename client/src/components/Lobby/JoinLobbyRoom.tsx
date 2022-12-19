import { useEffect, useState, useRef, MutableRefObject } from 'react'
import '../../styles/LobbyRoom.scss'
import '../../styles/JoinLobbyRoom.scss'
import { io, Socket } from 'socket.io-client'
import ClientGame from '../ClientGame'
import SettingsDisplay from './SettingsDisplay'
import Lobby from './Lobby'
import Players from './Players'

interface MySocket extends Socket {
  [key: string]: any
}
interface LobbyProps {
  socket: MySocket
  gameID: string
}
interface SizeProps {
  numberOfSymbols: number
  sizeName: string
  sizeDescription: string
}

const URL: string = 'http://localhost:5000'

export default function JoinLobbyRoom({ socket, gameID }: LobbyProps) {
  const [waitingForPlayers, setWaitingForPlayers] = useState(true)
  const [size, setSize] = useState<SizeProps>({
    numberOfSymbols: 8,
    sizeName: 'Normal',
    sizeDescription: 'The standard experience'
  })

  useEffect(() => {
    socket.on('start', () => {
      setWaitingForPlayers(false)
    })
    socket.on('sizeChange', (res: SizeProps) => {
      setSize(res)
    })
    return (): void => {
      socket.removeAllListeners();
    };
  }, [socket]);

  const handleUsernameSubmit = (username: string) => { }
  const handleCancel = () => {
    socket.emit('cancel')
    sessionStorage.removeItem('sessionID')
    socket.disconnect()
  }

  return (
    <div className="wrapper">
      {waitingForPlayers ? (
        <div className="box">
          <Players
            socket={socket}
            onUsernameSubmit={(username) => handleUsernameSubmit(username)}
            onCancel={() => handleCancel()}
          />
          <SettingsDisplay
            size={size}
          />
        </div >
      ) : (
        <ClientGame socket={socket} />
      )}
    </div >
  )
}