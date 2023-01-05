import { useState, useRef, useEffect } from "react"
import { io, Socket } from "socket.io-client"
import createRoomID from "../../utils/createRoomID"
import getRandomUsername from "../../utils/getRandomUsername"
import TowerGame from "../Game/TowerGame"
import HostLobbyRoom from "./HostLobbyRoom"
import JoinLobbyRoom from "./JoinLobbyRoom"
import '../../styles/Lobbies.scss'

let URL: string
if (import.meta.env.DEV) {
  URL = "http://localhost:5000"
  console.log('dev environment')
} else {
  URL = "https://noahs.website:5000"
  console.log('prod environment')
}
// const URL: string = "http://localhost:5000"
// const URL: string = "https://noahs.website:5000"

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
  useEffect(() => {
    // connect error
    socket.current.on('alert', (message: string) => {
      console.log('alert', message)
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
      // sessionStorage.setItem("sessionID", sessionID);
      // sessionStorage.setItem('gameID', gameID.current)
      // console.log("set sessionID:", sessionID);
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
      setJoinText('Join')
      socket.current = io(URL, { autoConnect: false })
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

  const logIn = async (gameID: string, isHost: boolean, sessionID?: string) => {
    const username = getRandomUsername()
    socket.current.auth = { sessionID, username, gameID, isHost }
    socket.current.connect()

    let connected: boolean = false
    socket.current.on('connect', () => {
      connected = true
    })
    socket.current.on("connect_error", (err) => {
      connected = false
      // console.log(`connect_error due to ${err.message}`);
    });
    return new Promise<boolean>((resolve) => {
      let attempts = 0
      const loop = setInterval(() => {
        console.log('looping')
        if (connected) {
          resolve(true)
          clearInterval(loop)
        } else {
          attempts++
          if (attempts == 10) {
            resolve(false)
            clearInterval(loop)
          }
        }
      }, 1000);
    })
  }
  const clickable = useRef(true) // prevent double clicks from creating >1 lobby
  const [hostText, setHostText] = useState('Host')
  const [joinText, setJoinText] = useState('Join')

  const createRoom = async () => {
    if (clickable.current) {
      clickable.current = false
      closeAlert()
      gameID.current = createRoomID()
      // gameID.current = '12345'
      setHostText('Creating game...')
      const loggedIn = await logIn(gameID.current, true)
      if (loggedIn) {
        setIsHost(true)
        setIsJoin(false)
        clickable.current = true
      } else {
        setHostText('Could not create game!')
        setTimeout(() => {
          setHostText('Host')
          clickable.current = true
        }, 3000);
      }
    }
  }

  const joinRoom = async (id: string) => {
    if (clickable.current) {
      clickable.current = false
      closeAlert()
      gameID.current = id
      setJoinText('Joining game...')
      const loggedIn = await logIn(gameID.current, false)
      if (loggedIn) {
        setJoinText('Join')
        setIsHost(false)
        setIsJoin(true)
        clickable.current = true
      } else {
        setJoinText('Could not connect!')
        setTimeout(() => {
          setJoinText('Join')
          clickable.current = true
        }, 3000);
      }
    }
  }
  const handleCancel = () => {
    setIsHost(false)
    setIsJoin(false)
  }
  const closeAlert = () => {
    setShowAlert(false)
  }
  const [code, setCode] = useState('')
  const handleSubmit = (e: any) => {
    e.preventDefault()
    joinRoom(code)
    console.log('joined room:', code)
    // submit
  }

  return (
    <div className="wrapper">
      {gameRunning ? (
        <></>
        // <TowerGame numSymbols={size.symbol} socket={socket.current}></TowerGame>
      ) : isHost ? (
        <HostLobbyRoom
          socket={socket.current}
          gameID={gameID.current}
          onCancel={() => handleCancel()}>
        </HostLobbyRoom>
      ) : isGuest && lobbyFound ? (
        <JoinLobbyRoom
          socket={socket.current}
          gameID={gameID.current}
          onCancel={() => handleCancel()}>
        </JoinLobbyRoom>
      ) : (
        <div className="wrapper">
          <div className="button-wrapper">
            <button
              onClick={() => createRoom()}
              className={`${hostText != 'Host' ? 'gray' : ''} host-btn`}>{hostText}
            </button>
            <div className="or">or</div>
            <div className="join-wrapper">
              <form onSubmit={handleSubmit}>
                <input
                  onChange={(e) => setCode(e.target.value)}
                  type="text"
                  name="join"
                  placeholder='Room Code'
                  value={code}
                  maxLength={5}
                  id="join" />
                {showAlert && (
                  <div className="alert">
                    {/* <button onClick={() => closeAlert()}>X</button> */}
                    <div className="message-wrapper">
                      <div className="message">{alert}</div>
                    </div>
                  </div>
                )}
                <button
                  type="submit"
                  className={`${joinText != 'Join' ? 'gray' : ''} join-btn`}>{joinText}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}