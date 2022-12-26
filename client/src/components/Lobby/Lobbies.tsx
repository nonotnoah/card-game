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
  const [needPlayers, setNeedPlayers] = useState(false)
  const [lobbyFound, setLobbyFound] = useState(false)
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
    socket.current.on('newHost', (userID: string) => {
      console.log('Host left lobby. New host is:', userID)
      // for some reason this only triggers when host socket forces disconnect
      // (like by closing the tab)
      if (socket.current.userID == userID) {
        setIsHost(true)
        setIsJoin(false)
        setNeedPlayers(true)
      }
    })

    // socket.current.on('start', () => {
    //   sessionStorage.setItem('gameStarted', 'true')
    // })

    socket.current.on('lobbyNotFound', () => {
      setIsHost(false)
      setIsJoin(false)
      setLobbyFound(false)
    })

    socket.current.on('lobbyFound', () => {
      setLobbyFound(true)
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

  const sessionID = sessionStorage.getItem('sessionID')
  if (sessionID) {
    logIn(gameID.current, false, sessionID)
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

  return (
    <div className="wrapper">
      {isHost ? (
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