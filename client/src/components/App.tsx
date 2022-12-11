import { useEffect, useState, useRef, MutableRefObject } from 'react'
import '../styles/App.css'
import { io, Socket } from 'socket.io-client'
import Card from './Cards'

interface drawPayload {
    card1: string[],
    card2: string[],
    match: string
}

function App() {
    const [showCard, setShowCard] = useState<Boolean>(false)
    // connect client
    // const socket: MutableRefObject<Socket>['current'] = useRef(io('http://localhost:5000'))
    const socket: MutableRefObject<Socket> = useRef(io('http://localhost:5000'))
    // const socket: any = useRef(io('http://localhost:5000'))

    let card1
    let card2
    let match

    socket.current.on('draw', (val: drawPayload) => {
        card1 = val.card1
        card2 = val.card2
        match = val.match
        setShowCard(true)
        console.log(val)
        console.log(showCard)
    })

    return (
        <div className="wrapper">
            {showCard ? (
                <>
                    <Card card={card1} />
                    <Card card={card2} />
                    <div className="match">{match}</div>
                </>
            ) : (
                <>
                    <h1>Nothing here!</h1>
                </>
            )}
        </div>
    );
}
export default App
