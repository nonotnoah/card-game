import * as React from 'react';
import { useState, useEffect } from 'react';
import '../styles/Cards.css'

interface Card {
    id: number
    card: (string[] | null | undefined)
    match: (string)
    onGuess: (id: number, guess: string) => void
}

function Card({ id, card, match, onGuess }: Card) {
    const isArray = (Array.isArray(card))
    const [currentGuess, setCurrentGuess] = useState<string>('')
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