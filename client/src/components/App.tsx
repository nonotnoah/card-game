import { useEffect, useState, useRef, MutableRefObject } from 'react'
import '../styles/App.css'
import { io, Socket } from 'socket.io-client'
import Card from './Cards'

interface drawPayload {
    card1: string[],
    card2: string[],
    match: string
}

const socket = io('http://localhost:5000')

function App() {
    const [showCard, setShowCard] = useState<Boolean>(false)
    const [cards, setCards] = useState({
        one: [] as string[],
        two: [] as string[],
        match: ''
    })
    let guessOne = ''
    let guessTwo = ''
    const handleGuess = (id: number, guess: string) => {
        if (id == 1) {
            guessOne = guess
        }
        if (id == 2) {
            guessTwo = guess
        }
        console.log(guessOne, guessTwo)
        if (guessOne == guessTwo) {
            socket.emit('correct', guess)
            console.log('emitting guess')
        }
    }
    socket.onAny((event) => {
        console.log('Heard event', event)
    })
    socket.on('draw', (val: drawPayload) => {
        // console.log('drawing new card', val)
        setCards({
            one: val.card1,
            two: val.card2,
            match: val.match
        })
        setShowCard(true)
        // console.log(showCard)
    })

    return (
        <div className="wrapper">
            {showCard ? (
                <>
                    <Card id={1} card={cards.one} match={cards.match} onGuess={handleGuess} />
                    <Card id={2} card={cards.two} match={cards.match} onGuess={handleGuess} />
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
