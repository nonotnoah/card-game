import * as React from 'react';
import { useState, useEffect, useRef, memo } from 'react';
import '../styles/Cards.css'
import { Counter } from './Counter';

interface CardProps {
  id: number
  card: (string[] | null | undefined)
  match: (string)
  onGuess: (id: number, guess: string) => void
  selection: string // only update Card if this updates
}

function Card({ id, card, match, selection, onGuess }: CardProps) {
  const isArray = (Array.isArray(card))

  const handleGuess = (id: number, picture: string) => {
    // deselect logic
    if (selection == picture) {
      onGuess(id, '')
      // select logic
    } else {
      onGuess(id, picture)
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
                    ${selection == picture ? 'selected' : ''}
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

export default memo(Card)