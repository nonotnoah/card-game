// this is a connected but unstarted game
// you will need index.ts logic for host and guest to delay starting game

import { useState, useRef } from "react";
import ClientGame from "../ClientGame";
import { Socket } from "socket.io-client";
import "../../styles/LobbyRoom.scss";
import Settings from "./Settings";
import Players from "./Players";

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

export default function HostLobbyRoom({ socket, gameID }: LobbyProps) {
  const [waitingForPlayers, setWaitingForPlayers] = useState(true);

  const handleUsernameSubmit = (username: string) => { }
  const handleCancel = () => {
    socket.emit('cancel')
    sessionStorage.removeItem('sessionID')
    socket.disconnect()
  }
  const handleStart = () => {
    socket.emit('start')
    setWaitingForPlayers(false)
  }

  const handleSizeChange = (val: SizeProps) => {
    socket.emit('sizeChange', val)
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
          <Settings
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
