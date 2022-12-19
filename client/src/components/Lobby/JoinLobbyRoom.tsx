import { useEffect, useState, useRef, MutableRefObject } from 'react'
import '../styles/App.css'
import { io, Socket } from 'socket.io-client'
import ClientGame from '../ClientGame'

interface MySocket extends Socket {
  [key: string]: any
}
interface LobbyProps {
  socket: MySocket
  gameID: string
}

const URL: string = 'http://localhost:5000'

export default function JoinLobbyRoom({ socket, gameID }: LobbyProps) {
  return (
    <div className="box">
      <div className="profile-wrapper">
        <div className="title">Players</div>
        <div className="guy-wrapper">
          <img src="" alt="" />
        </div>
        <div className="username-wrapper">
          <input
            className="username"
            type="text"
            placeholder="Enter your name" id="name"
          />
          <button className="submit-button">{'>'}</button>
        </div>
        <div className="menu-button">
          <button className="cancel">Home</button>
        </div>
      </div>
    </div >
  )
}