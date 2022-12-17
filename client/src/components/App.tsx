import { useEffect, useState, useRef, MutableRefObject } from 'react'
import '../styles/App.css'
import { io, Socket } from 'socket.io-client'
import ClientGame from './ClientGame'

const URL: string = 'http://localhost:5000'

function App() {
    const [loggedIn, setLoggedIn] = useState(false)
    const socket = useRef(io(URL, { autoConnect: false }))

    const sessionID = sessionStorage.getItem('sessionID')
    if (sessionID) {
        const room = sessionStorage.getItem('room')
        console.log('reconnecting')
        socket.current.auth = { sessionID, room }
        socket.current.connect()
        if (!loggedIn) {
            setLoggedIn(true)
        }
    }

    const handleClick = (player: number = (1 | 2)) => {
        let username = 'meat'
        if (player == 1) {
            username = 'one'
            console.log(username)
        }
        if (player == 2) {
            username = 'two'
        }
        socket.current.auth = { username }
        socket.current.connect()
        setLoggedIn(true)
        console.log('logging in first time')
    }

    return (
        <div className="wrapper">
            {loggedIn ? (
                <ClientGame socket={socket.current} />
            ) : (
            <>
                <button
                    onClick={() => handleClick(1)}
                    className="player1">Player 1
                </button>
                <button
                    onClick={() => handleClick(2)}
                    className="player2">Player 2
                </button>
            </>
            )}
        </div>
    )
}
export default App
