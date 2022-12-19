import { useState, useRef, useEffect } from "react"
import { io, Socket } from "socket.io-client"
import createRoomID from "../../utils/createRoomID"
import HostLobbyRoom from "./HostLobbyRoom"
import JoinLobbyRoom from "./JoinLobbyRoom"

const URL: string = "http://localhost:5000"
interface MySocket extends Socket {
  [key: string]: any;
}

export default function Lobbies() {
  const [isHost, setHost] = useState(false)
  const [join, setJoin] = useState(false)
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
      console.log("set sessionID:", sessionID);
    });
    
    return (): void => {
      socket.current.removeAllListeners();
    };
  }, [socket.current]);

  function getRandomUsername() { return 'meat'} //TODO: make this animal names
  const logIn = () => {
    const username = getRandomUsername()
    socket.current.auth = { username, gameID, isHost }
    socket.current.connect()
  }

  const createRoom = () => {
    // gameID.current = createRoomID()
    gameID.current = '12345'
    setHost(true)
    setJoin(false)
    logIn()
  }

  const joinRoom = (id: string) => {
    gameID.current = id
    setHost(false)
    setJoin(true)
    logIn()
  }

  return (
    <div className="wrapper">
      {isHost ? (
        <HostLobbyRoom socket={socket.current} gameID={gameID.current}></HostLobbyRoom>
      ) : join ? (
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