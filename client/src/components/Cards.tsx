import * as React from 'react';
import '../styles/Cards.css'

interface Card {
    card: (string[] | null | undefined)
}

function Card({ card }: Card) {
    const isArray = (Array.isArray(card))
    return (
        <div className="card">
            {isArray ? card.map(
                (picture: string) => (<button key={picture} className="picture">{picture}</button>))
                : <h1>No more cards!</h1>}
        </div>
    )
}

export default Card