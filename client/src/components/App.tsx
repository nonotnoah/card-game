import { useEffect, useState, useRef, MutableRefObject } from 'react'
import '../styles/App.css'
import { io, Socket } from 'socket.io-client'
import ClientGame from './ClientGame'

const URL: string = 'http://localhost:5000'

function App() {
    const [loggedIn, setLoggedIn] = useState(false)

    let socket = io(URL, { autoConnect: false })
    const sessionID = sessionStorage.getItem('sessionID')
    // console.log(sessionID)
    console.log(sessionStorage)
    if (sessionID) {
        // this.usernameAlreadySelected = true
        console.log('reconnecting')
        socket.auth = { sessionID }
        socket.connect()
    }

    const connect = (username: string) => {
        socket.auth = { username }
        socket.connect()
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
        connect(username)
        setLoggedIn(true)
    }


    return (
        <div className="wrapper">
            {loggedIn ? (
                <ClientGame socket={socket} />
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
