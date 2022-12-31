// this is a connected but unstarted game
// you will need index.ts logic for host and guest to delay starting game

import { useState, useRef, useEffect } from "react";
import ClientGame from "../ClientGame";
import { Socket } from "socket.io-client";
import "../../styles/LobbyRoom.scss";
import SettingsColumn from "./SettingsColumn";
import PlayersColumn from "./PlayersColumn";
import TowerGame from "../Game/TowerGame";
import Podium from "./Podium"

interface MySocket extends Socket {
  [key: string]: any
}
interface LobbyProps {
  children: never[] // ???????
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


export default function HostLobbyRoom({ socket, gameID, onCancel }: LobbyProps) {
  const [showPodium, setShowPodium] = useState(false)
  const [podium, setPodium] = useState({} as Podium)
  const [waitingForPlayers, setWaitingForPlayers] = useState(true);
  const [size, setSize] = useState<SizeProps>({
    symbol: 8,
    name: 'Normal',
    description: 'The standard experience'
  })

  const handleUsernameSubmit = (username: string) => { }
  // disconnect socket and call prop onCancel to get back to Lobbies.tsx
  // console.log(socket._callbacks)
  const handleCancel = () => {
    socket.emit('cancel')
    sessionStorage.removeItem('sessionID')
    sessionStorage.removeItem("gameID");
    socket.disconnect()
    onCancel()
  }
  const handleStart = () => {
    socket.emit('start', 'tower')
    setWaitingForPlayers(false)
  }

  const handleSizeChange = (val: SizeProps) => {
    console.log('changed size', val)
    socket.emit('sizeChange', val)
  }

  useEffect(() => {
    socket.on('sizeChange', (res: SizeProps) => {
      console.log('heard sizechange', res)
      setSize(res)
    })

    socket.on('podium', (podium: Podium) => {
      setPodium(podium)
      setShowPodium(true)
      setWaitingForPlayers(true)
      socket.emit('closeGame')
    })

    return (): void => {
      socket.removeAllListeners();
      console.log('removed all listeners')
    };
  }, [socket]);


  useEffect(() => {
    socket.emit('needSizeChange')
  }, [])

  const handleClose = () => {
    setShowPodium(false)
    setWaitingForPlayers(true)
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
            <SettingsColumn
              size={size}
              onSizeChange={(val) => handleSizeChange(val)}
              onStart={() => handleStart()}
            />
          </div>
        </div>
      ) : (
        <TowerGame socket={socket} />
      )}
    </div>
  );
}
