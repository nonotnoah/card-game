import { useState, useRef, useEffect } from "react"
import { io, Socket } from "socket.io-client"
import createRoomID from "../../utils/createRoomID"
import getRandomUsername from "../../utils/getRandomUsername"
import HostLobbyRoom from "./HostLobbyRoom"
import JoinLobbyRoom from "./JoinLobbyRoom"

const URL: string = "http://localhost:5000"
interface MySocket extends Socket {
  [key: string]: any;
}

export default function Lobbies() {
  const [isHost, setIsHost] = useState(false)
  const [isGuest, setIsJoin] = useState(false)
  const gameID = useRef('')

  const socket = useRef<MySocket>(io(URL, { autoConnect: false }))

  useEffect(() => {
    // connect error
    socket.current.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });

    // save session
    socket.current.on("session", ({ sessionID, userID }) => {
      socket.current.auth = { sessionID };
      socket.current.userID = userID
      // store in sessionStorage. this should implement localStorage in live build
      sessionStorage.setItem("sessionID", sessionID);
      sessionStorage.setItem('gameID', gameID.current)
      console.log("set sessionID:", sessionID);
    });

    // open host options if socket becomes host
    socket.current.on('newHost', (userID: string) => {
      if (socket.current.userID == userID) {
        setIsHost(true)
        setIsJoin(false)
      }
    })

    socket.current.on('lobbyNotFound', () => {
      // TODO: implement
    })

    return (): void => {
      socket.current.removeAllListeners();
    };
  }, [socket.current]);

  const logIn = (gameID: string, isHost: boolean) => {
    const username = getRandomUsername()
    socket.current.auth = { username, gameID, isHost }
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

  return (
    <div className="wrapper">
      {isHost ? (
        <HostLobbyRoom socket={socket.current} gameID={gameID.current}></HostLobbyRoom>
      ) : isGuest ? (
        <JoinLobbyRoom socket={socket.current} gameID={gameID.current}></JoinLobbyRoom>
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