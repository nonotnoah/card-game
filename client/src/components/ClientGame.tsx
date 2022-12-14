import { createContext, useEffect, useState, useRef, MutableRefObject } from 'react'
import '../styles/App.css'
import { io, Socket } from 'socket.io-client'
import Card from './Cards'
import { Counter } from './Counter'

interface DrawPayload {
    card1: string[],
    card2: string[],
    match: string
}
interface SocketProps {
    socket: Socket
}

function ClientGame({ socket }: SocketProps) {
    const [clearGuess, setClearGuess] = useState('')
    const [showCard, setShowCard] = useState(false)
    const [cards, setCards] = useState({
        one: [] as string[],
        two: [] as string[],
        match: ''
    })
    let guessOne = 'None'
    let guessTwo = 'None'
    const handleGuess = (id: number, guess: string) => {
        if (id == 1) {
            guessOne = guess
        }
        if (id == 2) {
            guessTwo = guess
        }
        console.log('Card 1:', guessOne, '\nCard 2:', guessTwo)
        if (guessOne == guessTwo) {
            socket.emit('correct', guess)
            console.log('emitting guess')
        }
    }
    // socket event listeners
    useEffect(() => {
        socket.onAny((event) => {
            console.log('Heard event', event)
        })
        socket.on('draw', (val: DrawPayload) => {
            // console.log('drawing new card', val)
            setClearGuess('')
            setCards({
                one: val.card1,
                two: val.card2,
                match: val.match
            })
            setShowCard(true)
            // console.log(showCard)
        })
        return (): void => {
            socket.removeAllListeners()
        } 
    }, [socket])
    return (
        <div className="wrapper">
            {showCard ? (
                <>
                    <Card clearGuess={clearGuess} id={1} card={cards.one} match={cards.match} onGuess={handleGuess} />
                    <Card clearGuess={clearGuess} id={2} card={cards.two} match={cards.match} onGuess={handleGuess} />
                </>
            ) : (
                <>
                    <h1>Nothing here!</h1>
                </>
            )}
        </div>
    );
}
export default ClientGame
