import { useEffect, useState, useRef, MutableRefObject } from 'react'
import '../../styles/LobbyRoom.scss'
import '../../styles/JoinLobbyRoom.scss'
import { io, Socket } from 'socket.io-client'
import ClientGame from '../ClientGame'
import SettingsDisplay from './SettingsDisplay'
import Lobby from './Lobby'
import PlayersColumn from './PlayersColumn'
import TowerGame from '../Game/TowerGame'
import Podium from './Podium'
import TimeSyncClient from '../../utils/timesync'

interface MySocket extends Socket {
  [key: string]: any
}
interface LobbyProps {
  children: never[] // ???????
  timesync: TimeSyncClient | undefined
  socket: MySocket
  gameID: string
  onCancel: () => void
}
interface SizeProps {
  symbol: number
  name: string
  description: string
}

interface Podium {
  1: {
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

const URL: string = 'http://localhost:5000'

// export default function JoinLobbyRoom({ socket, gameID, onCancel }: LobbyProps) {
export default function JoinLobbyRoom({ timesync, socket, gameID, onCancel }: LobbyProps) {
  const [showPodium, setShowPodium] = useState(false)
  const [podium, setPodium] = useState({} as Podium)
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
    socket.on('podium', (podium: Podium) => {
      setPodium(podium)
      setShowPodium(true)
      setWaitingForPlayers(true)
    })
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

  const handleClose = () => {
    setShowPodium(false)
  }

  const [code, setCode] = useState('Room Code')
  const handleOffHover = () => {
    setCode('Room Code')
  }
  const handleOnHover = () => {
    setCode('Click To Copy')
  }
  const handleCopy = () => {
    navigator.clipboard.writeText(gameID)
    setCode('Copied!')
  }

  return (
    <div className="wrapper">
      {showPodium ? (
        <Podium
          onClose={() => handleClose()}
          podium={podium}
        />
      ) : waitingForPlayers ? (
        <div className="box-wrapper">
          <div className="box">
            <div className="room-code-wrapper">
              <div className="room-title">{code}</div>
              <div
                onMouseEnter={() => handleOnHover()}
                onMouseLeave={() => handleOffHover()}
                onClick={() => handleCopy()}
                className="room-code">
                {gameID}
              </div>
            </div>
            <PlayersColumn
              socket={socket}
              onUsernameSubmit={(username) => handleUsernameSubmit(username)}
              onCancel={() => handleCancel()}
            />
            <SettingsDisplay
              size={size}
            />
          </div >
        </div>
      // ) : gameStarted ? (
      //   <TowerGame numSymbols={size.symbol} initEvent='reconnect' socket={socket} />
      ) : (timesync) && (
        <TowerGame timesync={timesync} numSymbols={size.symbol} socket={socket} />
      )}
    </div >
  )
}