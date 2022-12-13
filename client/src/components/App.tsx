import { useEffect, useState, useRef, MutableRefObject } from 'react'
import '../styles/App.css'
import { io, Socket } from 'socket.io-client'
import ClientGame from './ClientGame'

const socket = io('http://localhost:5000')

function App() {
    return (
        <ClientGame socket={socket} />
    )
}
export default App
