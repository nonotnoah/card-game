// this is a connected but unstarted game
// you will need index.ts logic for host and guest to delay starting game

import { useState, useRef } from "react";
import ClientGame from "../ClientGame";
import { Socket } from "socket.io-client";
import "../../styles/LobbyRoom.scss";
import Players from "./Players";
import Settings from "./Settings";

interface MySocket extends Socket {
  [key: string]: any
}
interface LobbyProps {
  socket: MySocket
  gameID: string
}
interface sizeProps {
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
  }

  const handleSizeChange = (val: sizeProps) => {
    socket.emit('sizeChange', val)
  }

  return (
    <div className="wrapper">
      {waitingForPlayers ? (
        <div className="box">
          <div className="profile-wrapper">
            <div className="title">Players</div>
            <div className="guy-wrapper">
              <Players socket={socket}/>
              <img src="" alt="" />
            </div>
            <div className="username-wrapper">
              <input
                onSubmit={() => handleUsernameSubmit('')}
                className="username"
                type="text"
                placeholder="Enter your name" id="name"
              />
              <button className="submit-button">{'>'}</button>
            </div>
            <div className="menu-button">
              <button onClick={() => handleCancel()} className="cancel">Home</button>
            </div>
          </div>
          <Settings
            onSizeChange={(val: sizeProps) => handleSizeChange(val)}
            onStart={() => handleStart()}
          />
        </div>
      ) : (
        <h1>ClientGame</h1>
        // <ClientGame socket={socket.current} />
      )}
    </div>
  );
}
