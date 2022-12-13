import * as React from 'react';
import { useState, useEffect } from 'react';
import '../styles/Cards.css'
import { Counter } from './Counter';

interface Card {
    id: number
    card: (string[] | null | undefined)
    match: (string)
    onGuess: (id: number, guess: string) => void
    clearGuess: boolean
}

function Card({ id, card, match, onGuess, clearGuess }: Card) {
    const isArray = (Array.isArray(card))
    const [currentGuess, setCurrentGuess] = useState<string>('')
    // if (clearGuess) {
    //     setCurrentGuess('')
    // }
    // useEffect(() => {
    //     console.log(currentGuess)
    // }, [currentGuess]) 
    const handleGuess = (id: number, picture: string) => {
        // deselect logic
        if (currentGuess == picture) {
            onGuess(id, '')
            setCurrentGuess('')
        // select logic
        } else {
            onGuess(id, picture)
            setCurrentGuess(picture)
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