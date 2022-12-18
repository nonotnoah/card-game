import { useEffect, useState, useRef, MutableRefObject } from 'react'
import '../styles/App.css'
import { io, Socket } from 'socket.io-client'
import ClientGame from './ClientGame'
import { LobbyProps } from '../interfaces/LobbyProps'

const URL: string = 'http://localhost:5000'

function HostLobby({ gameID }: LobbyProps) {
    const socket = useRef(io(URL, { autoConnect: false }))

    const handleClick = (player: number = (1 | 2)) => {
        let username = 'meat'
        if (player == 1) {
            username = 'one'
        }
        if (player == 2) {
            username = 'two'
        }
        socket.current.auth = { username, gameID }
        socket.current.connect()
    }

    return (
        <div className="wrapper">
            <ClientGame socket={socket.current} />
        </div>
    )
}

export default HostLobby