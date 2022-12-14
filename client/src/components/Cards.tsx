import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import '../styles/Cards.css'
import { Counter } from './Counter';

interface CardProps {
    id: number
    card: (string[] | null | undefined)
    match: (string)
    onGuess: (id: number, guess: string) => void
    clearGuess: string
}

function Card({ id, card, match, onGuess, clearGuess }: CardProps) {
    const isArray = (Array.isArray(card))
    const [currentGuess, setCurrentGuess] = useState<string>('')
    // const check = useRef(card)
    // if (check.current != card) {
    //     check.current == card
    //     setCurrentGuess('')
    // }
    // const selection = useRef(clearGuess)
    // if (clearGuess == '') {
    //     console.log(id, clearGuess)
    //     selection.current = ''
    // }
    const handleGuess = (id: number, picture: string) => {
        // deselect logic
        if (currentGuess == picture) {
            onGuess(id, '')
            setCurrentGuess('')
            // selection.current = ''
        // select logic
        } else {
            onGuess(id, picture)
            setCurrentGuess(picture)
            // selection.current = picture
        }
    }

    return (
        <div className="card">
            <Counter></Counter>
            {isArray ? card.map((picture: string) => (
                <button
                    key={picture}
                    className={`
                    picture 
                    ${picture == match ? 'match' : ''} 
                    ${currentGuess == picture ? 'selected' : ''}
                    `}
                    onClick={() => { handleGuess(id, picture) }}
                >
                    {picture}
                </button>
            )) : (
                <h1>No more cards!</h1>
            )}
        </div>
    )
}

export default Card