import { useEffect, useState, useRef, MutableRefObject } from 'react'
import '../styles/App.css'
import { io, Socket } from 'socket.io-client'
import ClientGame from './ClientGame'
import Lobbies from './Lobby/Lobbies'
import TowerGame from './Game/TowerGame'

// const URL: string = 'http://localhost:5000'
// const URL: string = "https://noahs.website:5000"

// TODO: add thereisnourflevel for secret menu
function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  // const socket = useRef(io(URL, { autoConnect: false }))

  const sessionID = sessionStorage.getItem('sessionID')
  if (!sessionID && loggedIn) {
    // if game ended and client refreshes
    setLoggedIn(false)
  }

  return (
    <div className="wrapper">
      {loggedIn ? (
        // <TowerGame socket={socket.current}></TowerGame>
        <></>
      ) : (
        <Lobbies />
      )}
    </div>
  )
}
export default App
