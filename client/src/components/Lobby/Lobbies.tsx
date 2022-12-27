import { useState, useRef, useEffect } from "react"
import { io, Socket } from "socket.io-client"
import createRoomID from "../../utils/createRoomID"
import getRandomUsername from "../../utils/getRandomUsername"
import TowerGame from "../Game/TowerGame"
import HostLobbyRoom from "./HostLobbyRoom"
import JoinLobbyRoom from "./JoinLobbyRoom"

const URL: string = "http://localhost:5000"
interface MySocket extends Socket {
  [key: string]: any;
}

export default function Lobbies() {
  const [alert, setAlert] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [isHost, setIsHost] = useState(false)
  const [isGuest, setIsJoin] = useState(false)
  const [needPlayers, setNeedPlayers] = useState(false)
  const [lobbyFound, setLobbyFound] = useState(false)
  const [gameRunning, setGameRunning] = useState(false)
  const gameID = useRef('')

  const socket = useRef<MySocket>(io(URL, { autoConnect: false }))
  if (!isHost && !isGuest) { // refresh socket on rerender
    socket.current = io(URL, { autoConnect: false })
  }

  useEffect(() => {
    // connect error
    socket.current.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });

    socket.current.on('alert', (message: string) => {
      setAlert(message)
      setShowAlert(true)
    })

    // save session
    socket.current.on("session", ({ username, sessionID, userID }) => {
      socket.current.username = username
      console.log('setting userID:', userID)
      socket.current.auth = { sessionID };
      socket.current.userID = userID
      // store in sessionStorage. this should implement localStorage in live build
      sessionStorage.setItem("sessionID", sessionID);
      sessionStorage.setItem('gameID', gameID.current)
      console.log("set sessionID:", sessionID);
    });

    // open host options if socket becomes host
    socket.current.on('newHost', (userID: string, isRunning: (boolean | undefined)) => {
      console.log('Host left lobby. New host is:', userID)
      console.log(isRunning)
      // for some reason this only triggers when host socket forces disconnect
      // (like by closing the tab)
      if (socket.current.userID == userID) {
        setIsHost(true)
        setIsJoin(false)
        setNeedPlayers(true)
      }
      if (isRunning) {
        setGameRunning(true)
      }
    })

    socket.current.on('lobbyNotFound', () => {
      setIsHost(false)
      setIsJoin(false)
      setLobbyFound(false)
    })

    socket.current.on('lobbyFound', () => {
      setLobbyFound(true)
    })

    socket.current.on('reconnect', () => {
      const sessionID = sessionStorage.getItem('sessionID')
      // TODO: this will take input value for gameID from login input
      if (sessionID) {
        setLobbyFound(true)
        setIsHost(false)
        setIsJoin(true)
        logIn(gameID.current, false, sessionID)
      } else {
        setLobbyFound(true)
        setIsHost(false)
        setIsJoin(true)
        logIn(gameID.current, false)
      }
    })

    return (): void => {
      socket.current.removeAllListeners();
    };
  }, [socket.current]);

  useEffect(() => {
    socket.current.emit('needPlayers') // delay this until next render
  }, [needPlayers])

  const logIn = (gameID: string, isHost: boolean, sessionID?: string) => {
    const username = getRandomUsername()
    socket.current.auth = { sessionID, username, gameID, isHost }
    socket.current.connect()
  }

  const createRoom = () => {
    // gameID.current = createRoomID()
    gameID.current = '12345'
    setIsHost(true)
    setIsJoin(false)
    logIn(gameID.current, true)
  }

  const joinRoom = (id: string) => {
    gameID.current = id
    setIsHost(false)
    setIsJoin(true)
    logIn(gameID.current, false)
  }

  const handleCancel = () => {
    setIsHost(false)
    setIsJoin(false)
  }

  const closeAlert = () => {
    setShowAlert(false)
  }

  return (
    <div className="wrapper">
      {showAlert && (
        <div className="alert">
          <button onClick={() => closeAlert()}>X</button>
          <div className="message">{alert}</div>
        </div>
      )}
      {gameRunning ? (
        <TowerGame socket={socket.current}></TowerGame>
      ) : isHost ? (
        <HostLobbyRoom
          socket={socket.current}
          onCancel={() => handleCancel()}>
        </HostLobbyRoom>
      ) : isGuest && lobbyFound ? (
        <JoinLobbyRoom
          socket={socket.current}
          onCancel={() => handleCancel()}>
        </JoinLobbyRoom>
      ) : (
        <div className="wrapper">
          <button
            onClick={() => createRoom()}
            className="host">Create Room
          </button>
          <button // TODO: this will be an input
            onClick={() => joinRoom('12345')}
            className="join">Join Room
          </button>
        </div>
      )}
    </div>
  )
}