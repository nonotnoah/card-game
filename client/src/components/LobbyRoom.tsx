// this is a connected but unstarted game
// you will need index.ts logic for host and guest to delay starting game

import { useState } from "react";
import ClientGame from "./ClientGame";
import { Socket } from "socket.io-client";
import "../styles/LobbyRoom.css";

interface MySocket extends Socket {
  [key: string]: any;
}
interface SocketProps {
  socket: MySocket;
}

// export default function LobbyRoom({ socket }: SocketProps) {
export default function LobbyRoom() {
  const [waitingForPlayers, setWaitingForPlayers] = useState(true);

  return (
    <div className="wrapper">
      {waitingForPlayers ? (
        <div className="box">
          <div className="profile-wrapper">
            <div className="guy">
              <img src="" alt="" />
            </div>
            <input type="text" placeholder="Enter your name" id="name" />
          </div>
          <div className="settings-wrapper">
            <div className="card-size-select-wrapper">
              <button className="left"></button>
              <span className="symbol-number"></span>
              <button className="right"></button>
            </div>
            <div className="title-size">Normal</div>
            <p className="size-info">The standard experience</p>
          </div>
        </div>
      ) : (
        <h1>ClientGame</h1>
        // <ClientGame socket={socket.current} />
      )}
    </div>
  );
}
