import { useEffect, useState, useRef, MutableRefObject } from 'react'
import '../styles/App.css'
import { io, Socket } from 'socket.io-client'
import ClientGame from './ClientGame'
import Lobbies from './Lobbies'

const URL: string = 'http://localhost:5000'

function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const socket = useRef(io(URL, { autoConnect: false }))

  const sessionID = sessionStorage.getItem('sessionID')
  if (sessionID) {
    if (!loggedIn) {
      const gameID = sessionStorage.getItem('gameID')
      console.log('reconnecting')
      socket.current.auth = { sessionID, gameID }
      socket.current.connect()
      setLoggedIn(true)
    }
  }

  if (!sessionID && loggedIn) {
    // if game ended and client refreshes
    setLoggedIn(false)
  }

  return (
    <div className="wrapper">
      {loggedIn ? (
        <ClientGame socket={socket.current}></ClientGame>
      ) : (
        <Lobbies />
      )}
    </div>
  )
}
export default App
