// this is a connected but unstarted game
// you will need index.ts logic for host and guest to delay starting game

import { useState, useRef, useEffect } from "react";
import ClientGame from "../ClientGame";
import { Socket } from "socket.io-client";
import "../../styles/LobbyRoom.scss";
import Settings from "./Settings";
import Players from "./Players";

interface MySocket extends Socket {
  [key: string]: any
}
interface LobbyProps {
  children: never[] // ???????
  socket: MySocket
  onCancel: () => void
}
interface SizeProps {
  symbol: number
  name: string
  description: string
}

export default function HostLobbyRoom({ socket, onCancel }: LobbyProps) {
  const [waitingForPlayers, setWaitingForPlayers] = useState(true);
  const [size, setSize] = useState<SizeProps>({
    symbol: 8,
    name: 'Normal',
    description: 'The standard experience'
  })

  const handleUsernameSubmit = (username: string) => { }
  // disconnect socket and call prop onCancel to get back to Lobbies.tsx
  const handleCancel = () => {
    socket.emit('cancel')
    sessionStorage.removeItem('sessionID')
    sessionStorage.removeItem("gameID");
    socket.disconnect()
    onCancel()
  }
  const handleStart = () => {
    socket.emit('start')
    setWaitingForPlayers(false)
  }

  const handleSizeChange = (val: SizeProps) => {
    socket.emit('sizeChange', val)
  }

  useEffect(() => {
    socket.on('sizeChange', (res: SizeProps) => {
      setSize(res)
    })
    return (): void => {
      socket.removeAllListeners();
    };
  }, [socket]);


  useEffect(() => {
    socket.emit('needSizeChange')
  }, [])

  return (
    <div className="wrapper">
      {waitingForPlayers ? (
        <div className="box">
          <Players
            socket={socket}
            onUsernameSubmit={(username) => handleUsernameSubmit(username)}
            onCancel={() => handleCancel()}
          />
          <Settings
            size={size}
            onSizeChange={(val) => handleSizeChange(val)}
            onStart={() => handleStart()}
          />
        </div>
      ) : (
        <ClientGame socket={socket} />
      )}
    </div>
  );
}
