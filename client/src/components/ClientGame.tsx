import { createContext, useEffect, useState, useRef, MutableRefObject } from 'react'
import '../styles/App.css'
import { io, Socket } from 'socket.io-client'
import Card from './Cards'
import { Counter } from './Counter'
import Table from './Table'
import { string } from 'prop-types'

interface DrawPayload {
    card1: string[],
    card2: string[],
    match: string
}
interface MySocket extends Socket {
    [key: string]: any
}
interface SocketProps {
    socket: MySocket
}

function ClientGame({ socket }: SocketProps) {
    const [cards, setCards] = useState<DrawPayload>({
        card1: [],
        card2: [],
        match: ''
    })

    // socket event listeners
    useEffect(() => {
        // // debug
        // socket.onAny((event) => {
        //     console.log('Heard event', event)
        // })

        // save session
        socket.on('session', ({ sessionID, userID }) => {
            // attach the session ID to tab storage
            socket.auth = { sessionID }
            // save the userID
            socket.userID = userID
            // store in sessionStorage. this should implement localStorage in live build
            sessionStorage.setItem('sessionID', sessionID)
            console.log('set sessionID:', sessionID)
        })

        // draw card
        socket.on('draw', (val: DrawPayload) => {
            setCards(val)
            console.log('drawing new card', val)
        })

        // cb
        return (): void => {
            socket.removeAllListeners()
        }
    }, [socket])

    // socket emitters
    const sendGuess = (guess: string) => {
        socket.emit('correct', guess)
        console.log('emitting guess')
    }

    return (
        <div className="wrapper">
            <Table cards={cards} sendGuess={sendGuess}></Table>
        </div>
    );
}
export default ClientGame
