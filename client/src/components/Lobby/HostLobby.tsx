import { useEffect, useState, useRef, MutableRefObject } from "react"
import "../styles/App.css"
import { io, Socket } from "socket.io-client"
import ClientGame from "../ClientGame"
import HostLobbyRoom from "./HostLobbyRoom"

interface LobbyProps {
  gameID: string
}

const URL: string = "http://localhost:5000"

function HostLobby({ gameID }: LobbyProps) {
  const [loggedIn, setLoggedIn] = useState(false)
  const socket = useRef(io(URL, { autoConnect: false }))

  const handleClick = (player: number = 1 | 2) => {
    let username = "meat"
    if (player == 1) {
      username = "one"
    }
    if (player == 2) {
      username = "two"
    }
    socket.current.auth = { username, gameID }
    socket.current.connect()
    if (!loggedIn) {
      setLoggedIn(true)
    }
  }

  return (
    <div className="wrapper">
      {loggedIn ? (
        <div className="wrapper">
          <h3>Game ID: {gameID}</h3>
          <HostLobbyRoom socket={socket.current} />
        </div>
      ) : (
        <div className="wrapper">
          <button onClick={() => handleClick(1)} className="player1">
            Player 1
          </button>
          <button onClick={() => handleClick(2)} className="player2">
            Player 2
          </button>
        </div>
      )}
    </div>
  )
}

export default HostLobby
